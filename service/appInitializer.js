import { getBookById, getBooks, syncBooks } from "./bookService";
import { syncBookChapters } from "./chapterService";
import db, { initDatabase } from "./database";
import { syncBookHadiths } from "./hadithServices";

export async function initializeHadith() {
  try {
    initDatabase();
    const count = db.getFirstSync("SELECT COUNT(*) AS count FROM books");
    if (count.count === 0) {
      await syncBooks();
      console.log("✅ Books synchronized successfully.");
    }
    return getBooks();
  } catch (error) {
    console.error("Initialization Error:", error);
  }
}

export async function initializeHadithBook(bookId, onProgress) {
  if (!bookId) {
    throw new Error("Book ID is required.");
  }

  const { count: chapterCount } = db.getFirstSync(
    `SELECT COUNT(*) AS count FROM chapters WHERE book_id = ?`,
    [bookId],
  );

  if (chapterCount === 0) {
    await syncBookChapters(bookId, onProgress);
  }

  const { count: hadithCount } = db.getFirstSync(
    `
    SELECT COUNT(*) AS count
    FROM hadiths h
    JOIN chapters c ON h.chapter_id = c.id
    WHERE c.book_id = ?
    `,
    [bookId],
  );
  const book = getBookById(bookId);

  if (hadithCount !== book.hadiths_count) {
    await syncBookHadiths(bookId, onProgress);
  }
}
