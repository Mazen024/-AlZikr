import db, { BOOKS_AR } from "./database";

const API_KEY = "$2y$10$907VKBKpZIpTYQTVeUBF2OdMEVcl2hgVCjZQ9oKtOqN3ik5OXk2Xe";

const BASE_URL = "https://hadithapi.com/api";

export async function syncBooks() {
  try {
    const response = await fetch(
      `${BASE_URL}/books?apiKey=${encodeURIComponent(API_KEY)}`,
    );

    const data = await response.json();

    if (data.status !== 200) {
      throw new Error(data.message);
    }

    for (const book of data.books) {
      const arabic = BOOKS_AR[book.id];

      if (!arabic) continue;

      db.runSync(
        `
        INSERT OR IGNORE INTO books (
          api_id,
          slug,
          name_ar,
          name_en,
          author_ar,
          author_en,
          title,
          birth,
          birthplace,
          bio,
          description,
          author_death,
          hadiths_count,
          chapters_count
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          book.id,
          book.bookSlug,
          arabic.name,
          book.bookName,
          arabic.author,
          book.writerName,

          arabic.title,
          arabic.birth,
          arabic.birthplace,
          arabic.bio,

          book.aboutWriter,
          book.writerDeath,
          Number(book.hadiths_count),
          Number(book.chapters_count),
        ],
      );
    }

    console.log("✅ Books imported successfully");
  } catch (error) {
    console.error("Books Import Error:", error);
  }
}

export function getBooks() {
  const books = db.getAllSync(`
    SELECT *
    FROM books
    ORDER BY id
  `);
  return books;
}

export function getBookById(bookId) {
  const book = db.getFirstSync(
    `
    SELECT *
    FROM books
    WHERE id = ?
    `,
    [bookId],
  );
  return book;
}
