import AsyncStorage from '@react-native-async-storage/async-storage';

const bukhari = require("../assets/hadiths/bukhari.json");
const muslim = require("../assets/hadiths/muslim.json");
const abuDawud = require("../assets/hadiths/abudawud.json");
const tirmidhi = require("../assets/hadiths/tirmidhi.json");
const nasai = require("../assets/hadiths/nasai.json");
const ibnMajah = require("../assets/hadiths/ibnmajah.json");
const malik = require("../assets/hadiths/malik.json");
const darimi = require("../assets/hadiths/darimi.json");
const ahmad = require("../assets/hadiths/ahmed.json");

//other books
const aladab_almufrad = require("../assets/hadiths/aladab_almufrad.json");
const bulugh_almaram = require("../assets/hadiths/bulugh_almaram.json");
const mishkat_almasabih = require("../assets/hadiths/mishkat_almasabih.json");
const riyad_assalihin = require("../assets/hadiths/riyad_assalihin.json");
const shamail_muhammadiyah = require("../assets/hadiths/shamail_muhammadiyah.json");

//40 hadiths books
const nawawi40 = require("../assets/hadiths/nawawi40.json");
const qudsi40 = require("../assets/hadiths/qudsi40.json");
const shahwaliullah40 = require("../assets/hadiths/shahwaliullah40.json");

const ALL_BOOKS = [
  bukhari,
  muslim,
  abuDawud,
  tirmidhi,
  nasai,
  ibnMajah,
  malik,
  darimi,
  ahmad,
  aladab_almufrad,
  bulugh_almaram,
  mishkat_almasabih,
  riyad_assalihin,
  shamail_muhammadiyah,
  nawawi40,
  qudsi40,
  shahwaliullah40,
];

// Storage keys
const STORAGE_KEYS = {
  LAST_CHAPTER: '@hadith_last_chapter_',
  LAST_HADITH: '@hadith_last_hadith_',
};

// ============= BOOKS =============

export const getBooks = async () => {
  try {
    const books = ALL_BOOKS.map((book, index) => ({
      id: index + 1,
      original_id: book.id,
      title: book.metadata?.arabic?.title || "",
      author: book.metadata?.arabic?.author || "",
      chapterCount: book.chapters?.length || 0,
      hadithCount: book.hadiths?.length || 0,
    }));
    console.log(`📚 Loaded ${books.length} books`);
    return books;
  } catch (error) {
    console.log("❌ Error getBooks:", error);
    return [];
  }
};

export const getBookById = async (bookId) => {
  try {
    const bookIndex = bookId - 1;
    if (bookIndex < 0 || bookIndex >= ALL_BOOKS.length) {
      return null;
    }

    const book = ALL_BOOKS[bookIndex];
    return {
      id: bookId,
      original_id: book.id,
      title: book.metadata?.arabic?.title || "",
      author: book.metadata?.arabic?.author || "",
      chapterCount: book.chapters?.length || 0,
      hadithCount: book.hadiths?.length || 0,
    };
  } catch (error) {
    console.log("❌ Error getBookById:", error);
    return null;
  }
};

// ============= CHAPTERS =============

export const getChaptersByBook = async (bookId) => {
  try {
    const bookIndex = bookId - 1;
    if (bookIndex < 0 || bookIndex >= ALL_BOOKS.length) {
      return [];
    }

    const book = ALL_BOOKS[bookIndex];
    const chapters = (book.chapters || []).map((chapter) => {
      const hadithCount =
        book.hadiths?.filter((h) => h.chapterId === chapter.id).length || 0;

      return {
        id: chapter.id,
        original_id: chapter.id,
        book_id: bookId,
        title: chapter.arabic || "",
        hadithCount: hadithCount,
      };
    });

    console.log(`📖 Loaded ${chapters.length} chapters for book ${bookId}`);
    return chapters;
  } catch (error) {
    console.log("❌ Error getChaptersByBook:", error);
    return [];
  }
};

// ============= HADITHS =============

export const getHadithsByChapter = async (bookId, chapterId) => {
  try {
    const bookIndex = bookId - 1;
    if (bookIndex < 0 || bookIndex >= ALL_BOOKS.length) {
      return [];
    }

    const book = ALL_BOOKS[bookIndex];
    const hadiths = (book.hadiths || [])
      .filter((h) => h.chapterId === chapterId)
      .map((hadith) => ({
        id: hadith.id,
        original_id: hadith.id,
        book_id: bookId,
        chapter_id: hadith.chapterId,
        number: hadith.idInBook,
        text: hadith.arabic || "",
      }));

    console.log(`📜 Loaded ${hadiths.length} hadiths for chapter ${chapterId}`);
    return hadiths;
  } catch (error) {
    console.log("❌ Error getHadithsByChapter:", error);
    return [];
  }
};

// ============= ASYNC STORAGE =============

export const saveLastChapter = async (bookId, chapterId) => {
  try {
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.LAST_CHAPTER}${bookId}`,
      chapterId.toString()
    );
  } catch (error) {
    console.log("❌ Error saving last chapter:", error);
  }
};

export const getLastChapter = async (bookId) => {
  try {
    const chapterId = await AsyncStorage.getItem(
      `${STORAGE_KEYS.LAST_CHAPTER}${bookId}`
    );
    return chapterId ? parseInt(chapterId) : null;
  } catch (error) {
    console.log("❌ Error getting last chapter:", error);
    return null;
  }
};

export const saveLastHadithIndex = async (bookId, chapterId, index) => {
  try {
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.LAST_HADITH}${bookId}_${chapterId}`,
      index.toString()
    );
  } catch (error) {
    console.log("❌ Error saving last hadith:", error);
  }
};

export const getLastHadithIndex = async (bookId, chapterId) => {
  try {
    const index = await AsyncStorage.getItem(
      `${STORAGE_KEYS.LAST_HADITH}${bookId}_${chapterId}`
    );
    return index ? parseInt(index) : 0;
  } catch (error) {
    console.log("❌ Error getting last hadith:", error);
    return 0;
  }
};