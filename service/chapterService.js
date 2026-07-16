import { getBookById } from "./bookService";
import db from "./database";

const API_KEY = "$2y$10$907VKBKpZIpTYQTVeUBF2OdMEVcl2hgVCjZQ9oKtOqN3ik5OXk2Xe";

const BASE_URL = "https://hadithapi.com/api";

export async function syncBookChapters(bookId, onProgress) {
  const book = getBookById(bookId);
  if (!book) throw new Error("Book not found");

  const { count } = db.getFirstSync(
    `SELECT COUNT(*) AS count FROM chapters WHERE book_id = ?`,
    [bookId],
  );
  if (count > 0) return;

  onProgress?.({ phase: "downloading", current: 0, total: 0 });

  const response = await fetch(
    `${BASE_URL}/${book.slug}/chapters?apiKey=${API_KEY}`,
  );
  const data = await response.json();

  if (data.status !== 200) {
    throw new Error(data.message);
  }

  const chapters = data.chapters;
  const total = chapters.length;

  onProgress?.({ phase: "importing", current: 0, total });

  db.withTransactionSync(() => {
    chapters.forEach((chapter, i) => {
      db.runSync(
        `
        INSERT OR IGNORE INTO chapters (
          book_id, api_chapter_id, chapter_number, heading_ar
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          book.id,
          chapter.id,
          Number(chapter.chapterNumber),
          chapter.chapterArabic,
        ],
      );
      onProgress?.({ phase: "importing", current: i + 1, total });
    });
  });

  onProgress?.({ phase: "done", current: total, total });
  console.log(`✅ ${book.slug}: ${total} chapters imported`);
}

export function getChaptersByBook(bookId) {
  return db.getAllSync(
    `SELECT * FROM chapters WHERE book_id = ? ORDER BY chapter_number`,
    [bookId],
  );
}

export function getChapterById(chapterId) {
  return db.getFirstSync(`SELECT * FROM chapters WHERE id = ?`, [chapterId]);
}

// export function saveLastChapter(bookId, chapterId) {
//   db.runSync(
//     `
//     INSERT INTO last_read_chapters (book_id, chapter_id, updated_at)
//     VALUES (?, ?, ?)
//     ON CONFLICT(book_id)
//     DO UPDATE SET
//       chapter_id = excluded.chapter_id,
//       updated_at = excluded.updated_at
//     `,
//     [bookId, chapterId, Date.now()],
//   );
// }

export function getLastChapter(bookId) {
  const lastChapter = db.getFirstSync(
    `
    SELECT c.*
    FROM last_read_chapters l
    JOIN chapters c
      ON c.book_id = l.book_id
     AND c.chapter_number = l.chapter_id
    WHERE l.book_id = ?
    `,
    [bookId],
  );
  return lastChapter;
}
