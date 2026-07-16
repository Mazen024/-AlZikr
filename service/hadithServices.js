import AsyncStorage from "@react-native-async-storage/async-storage";
import { getBookById } from "./bookService";
import { getChaptersByBook } from "./chapterService";
import db from "./database";

const API_KEY = "$2y$10$907VKBKpZIpTYQTVeUBF2OdMEVcl2hgVCjZQ9oKtOqN3ik5OXk2Xe";
const BASE_URL = "https://hadithapi.com/api";
const PAGE_SIZE = 100;
const MAX_RETRIES = 5;
const RETRY_BASE_DELAY_MS = 1500;
const TARGET_REQUESTS_PER_MINUTE = 30;
const MIN_REQUEST_SPACING_MS = Math.ceil(60000 / TARGET_REQUESTS_PER_MINUTE);

const STORAGE_KEYS = {
  LAST_CHAPTER: "@hadith_last_chapter_",
  LAST_HADITH: "@hadith_last_hadith_",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(ms) {
  const spread = ms * 0.3;
  return Math.round(ms + (Math.random() * 2 - 1) * spread);
}

let queueTail = Promise.resolve();
let lastRequestAt = 0;

function enqueueRequest(fn) {
  const run = async () => {
    const now = Date.now();
    const wait = Math.max(0, lastRequestAt + MIN_REQUEST_SPACING_MS - now);
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
    return fn();
  };
  const result = queueTail.then(run, run);
  queueTail = result.catch(() => {});
  return result;
}

const inFlightSyncs = new Map();

async function fetchHadithPage(book, page) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { response, text } = await enqueueRequest(async () => {
        const res = await fetch(
          `${BASE_URL}/hadiths?apiKey=${API_KEY}&book=${book.slug}&paginate=${PAGE_SIZE}&page=${page}`,
        );
        const body = await res.text();
        return { response: res, text: body };
      });

      const contentLength = Number(response.headers.get("content-length")) || 0;
      const bytes = contentLength || text.length;

      if (response.status === 429) {
        const retryAfterHeader = Number(response.headers.get("retry-after"));
        const delay = retryAfterHeader
          ? retryAfterHeader * 1000
          : jitter(RETRY_BASE_DELAY_MS * 2 ** attempt);
        console.log(
          `⚠️ Rate limited on page ${page} (attempt ${attempt + 1}/${MAX_RETRIES + 1}). Waiting ${delay}ms...`,
        );
        if (attempt < MAX_RETRIES) {
          await sleep(delay);
          continue;
        }
        throw new Error(`Still rate-limited on page ${page} after retries`);
      }

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status} on page ${page}: ${text.slice(0, 200)}`,
        );
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(
          `Non-JSON response on page ${page}. First 200 chars: ${text.slice(0, 200)} Error: ${e.message}`,
        );
      }

      if (data.status !== 200) {
        throw new Error(data.message || `API error on page ${page}`);
      }

      return { data, bytes };
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        const delay = jitter(RETRY_BASE_DELAY_MS * 2 ** attempt);
        console.log(
          `⚠️ Page ${page} failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${err.message}. Retrying in ${delay}ms...`,
        );
        await sleep(delay);
      }
    }
  }

  throw new Error(
    `Failed to fetch page ${page} after ${MAX_RETRIES + 1} attempts: ${lastError.message}`,
  );
}

let bookSyncQueueTail = Promise.resolve();

function enqueueBookSync(fn) {
  const run = () => fn();
  const result = bookSyncQueueTail.then(run, run);
  bookSyncQueueTail = result.catch(() => {});
  return result;
}

export async function syncBookHadiths(bookId, onProgress) {
  if (inFlightSyncs.has(bookId)) {
    return inFlightSyncs.get(bookId);
  }
  const syncPromise = enqueueBookSync(() =>
    syncBookHadithsInner(bookId, onProgress),
  ).finally(() => {
    inFlightSyncs.delete(bookId);
  });
  inFlightSyncs.set(bookId, syncPromise);
  return syncPromise;
}

function ensureProgressTable() {
  db.runSync(`
    CREATE TABLE IF NOT EXISTS hadith_sync_progress (
      book_id INTEGER PRIMARY KEY,
      last_page INTEGER NOT NULL DEFAULT 0,
      total_pages INTEGER,
      completed INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER
    )
  `);
}

function getSyncProgress(bookId) {
  return (
    db.getFirstSync(`SELECT * FROM hadith_sync_progress WHERE book_id = ?`, [
      bookId,
    ]) ?? null
  );
}

function upsertSyncProgress(bookId, { lastPage, totalPages, completed }) {
  db.runSync(
    `
    INSERT INTO hadith_sync_progress (book_id, last_page, total_pages, completed, updated_at)
    VALUES (?, ?, ?, ?, strftime('%s','now'))
    ON CONFLICT(book_id)
    DO UPDATE SET
      last_page = excluded.last_page,
      total_pages = excluded.total_pages,
      completed = excluded.completed,
      updated_at = excluded.updated_at
    `,
    [bookId, lastPage, totalPages ?? null, completed ? 1 : 0],
  );
}

async function syncBookHadithsInner(bookId, onProgress) {
  const book = getBookById(bookId);
  if (!book) throw new Error("Book not found");

  ensureProgressTable();

  const { count } = db.getFirstSync(
    `
    SELECT COUNT(*) AS count
    FROM hadiths h
    JOIN chapters c ON h.chapter_id = c.id
    WHERE c.book_id = ?
    `,
    [bookId],
  );

  const progress = getSyncProgress(bookId);

  if (progress?.completed && count > 0) {
    return;
  }

  if (!progress && count > 0) {
    upsertSyncProgress(bookId, {
      lastPage: 0,
      totalPages: null,
      completed: true,
    });
    return;
  }

  const chapters = getChaptersByBook(bookId);
  const chapterMap = new Map(
    chapters.map((c) => [String(c.chapter_number), c.id]),
  );

  const estimatedTotal = book.hadiths_count || 0;
  let bytesDownloaded = 0;
  onProgress?.({
    phase: "downloading",
    current: count,
    total: estimatedTotal,
    bytes: 0,
  });

  let page = (progress?.last_page ?? 0) + 1;
  let lastPage = progress?.total_pages ?? 1;
  let inserted = count;

  function getLastKnownHeading(bookId) {
    const row = db.getFirstSync(
      `
    SELECT h.section_heading_ar
    FROM hadiths h
    JOIN chapters c ON h.chapter_id = c.id
    WHERE c.book_id = ?
    ORDER BY h.id DESC
    LIMIT 1
    `,
      [bookId],
    );
    return row?.section_heading_ar ?? "";
  }

  let bab = progress ? getLastKnownHeading(bookId) : "";
  do {
    const { data, bytes } = await fetchHadithPage(book, page);
    bytesDownloaded += bytes;

    const { data: hadithsList, last_page, current_page, total } = data.hadiths;
    lastPage = last_page ?? 1;
    const totalForProgress = total || estimatedTotal;

    db.withTransactionSync(() => {
      for (const h of hadithsList) {
        const localChapterId = chapterMap.get(String(h.chapterId));
        if (!localChapterId) {
          continue;
        }
        if (h.headingArabic != null) {
          bab = h.headingArabic;
        }
        db.runSync(
          `
          INSERT OR IGNORE INTO hadiths (
            chapter_id, api_hadith_id, api_chapter_id, hadith_number,
            narrator_en, hadith_ar, section_heading_ar, grade, volume
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            localChapterId,
            h.id,
            Number(h.chapterId),
            h.hadithNumber ? Number(h.hadithNumber) : null,
            h.englishNarrator ?? null,
            h.hadithArabic,
            bab || null,
            h.status ?? null,
            h.volume ?? null,
          ],
        );
        inserted++;
      }
    });

    upsertSyncProgress(bookId, {
      lastPage: current_page,
      totalPages: lastPage,
      completed: false,
    });

    onProgress?.({
      phase: "importing",
      current: inserted,
      total: totalForProgress,
      bytes: bytesDownloaded,
    });

    page = current_page + 1;
  } while (page <= lastPage);

  upsertSyncProgress(bookId, {
    lastPage: lastPage,
    totalPages: lastPage,
    completed: true,
  });

  onProgress?.({
    phase: "done",
    current: inserted,
    total: inserted,
    bytes: bytesDownloaded,
  });
  console.log(
    `✅ ${book.slug}: ${inserted} hadiths imported (${formatBytes(bytesDownloaded)})`,
  );
}

export function getHadithsByBook(bookId) {
  const result = db.getAllSync(
    `
    SELECT h.*
    FROM hadiths h
    JOIN chapters c ON h.chapter_id = c.id
    WHERE c.book_id = ?
    ORDER BY h.api_hadith_id
    `,
    [bookId],
  );
  return result;
}

export function getHadithById(hadithId) {
  return db.getFirstSync(`SELECT * FROM hadiths WHERE id = ?`, [hadithId]);
}

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "٠ ك.ب";
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Math.round(kb).toLocaleString("ar")} ك.ب`;
  }
  return `${Number((kb / 1024).toFixed(1)).toLocaleString("ar")} م.ب`;
}

export function saveLastReading(bookId, chapterId, hadithIndex) {
  db.runSync(
    `
    INSERT INTO last_read_chapters (
      book_id,
      chapter_id,
      hadith_index,
      updated_at
    )
    VALUES (?, ?, ?, strftime('%s','now'))
    ON CONFLICT(book_id)
    DO UPDATE SET
      chapter_id = excluded.chapter_id,
      hadith_index = excluded.hadith_index,
      updated_at = excluded.updated_at;
    `,
    [bookId, chapterId, hadithIndex],
  );
}

export function getLastReading(bookId) {
  return (
    db.getFirstSync(
      `
      SELECT chapter_id, hadith_index
      FROM last_read_chapters
      WHERE book_id = ?
      `,
      [bookId],
    ) ?? null
  );
}

export const saveLastHadithIndex = async (bookId, chapterId, index) => {
  try {
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.LAST_HADITH}${bookId}_${chapterId}`,
      index.toString(),
    );
  } catch (error) {
    console.log("❌ Error saving last hadith:", error);
  }
};

export const getLastHadithIndex = async (bookId, chapterId) => {
  try {
    const index = await AsyncStorage.getItem(
      `${STORAGE_KEYS.LAST_HADITH}${bookId}_${chapterId}`,
    );
    return index !== null ? parseInt(index) : null;
  } catch (error) {
    console.log("❌ Error getting last hadith:", error);
    return null;
  }
};
