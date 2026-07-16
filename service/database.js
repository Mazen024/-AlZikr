import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("alzikr.db");

export function resetDatabase() {
  db.execSync("PRAGMA foreign_keys = OFF;");

  db.execSync("DROP TABLE IF EXISTS hadiths;");
  db.execSync("DROP TABLE IF EXISTS chapters;");
  db.execSync("DROP TABLE IF EXISTS books;");
  db.execSync("DROP TABLE IF EXISTS last_read_chapters;");
  db.execSync("DROP TABLE IF EXISTS hadith_sync_progress;");

  db.execSync("DELETE FROM sqlite_sequence;");

  db.execSync("PRAGMA foreign_keys = ON;");

  initDatabase();

  console.log("✅ Database reset successfully");
}

export const BOOKS_AR = {
  1: {
    name: "صحيح البخاري",
    author: "الإمام محمد بن إسماعيل البخاري",
    birth: "194 هـ",
    birthplace: "بخارى",
    title: "أمير المؤمنين في الحديث",
    bio: "من أعظم أئمة الحديث، جمع كتاب «الجامع الصحيح» المعروف بصحيح البخاري، وهو أصح الكتب بعد القرآن الكريم عند جمهور أهل السنة.",
  },

  2: {
    name: "صحيح مسلم",
    author: "الإمام مسلم بن الحجاج النيسابوري",
    birth: "206 هـ",
    birthplace: "نيسابور",
    title: "إمام المحدثين",
    bio: "من كبار حفاظ الحديث، وصاحب صحيح مسلم، أحد أصح كتب السنة النبوية، وتتلمذ على الإمام البخاري وغيره.",
  },

  4: {
    name: "جامع الترمذي",
    author: "الإمام محمد بن عيسى الترمذي",
    birth: "209 هـ",
    birthplace: "ترمذ",
    title: "الإمام الحافظ",
    bio: "من كبار علماء الحديث، وصاحب جامع الترمذي، امتاز كتابه ببيان درجة الأحاديث وذكر أقوال الفقهاء.",
  },

  5: {
    name: "سنن أبي داود",
    author: "الإمام سليمان بن الأشعث السجستاني",
    birth: "202 هـ",
    birthplace: "سجستان",
    title: "الإمام الحافظ",
    bio: "صاحب سنن أبي داود، أحد الكتب الستة، اعتنى بجمع أحاديث الأحكام بعد رحلة طويلة في طلب العلم.",
  },

  6: {
    name: "سنن ابن ماجه",
    author: "الإمام محمد بن يزيد القزويني",
    birth: "209 هـ",
    birthplace: "قزوين",
    title: "الإمام الحافظ",
    bio: "صاحب سنن ابن ماجه، أحد الكتب الستة، وكان من كبار المحدثين والرحالة في طلب الحديث.",
  },

  7: {
    name: "سنن النسائي",
    author: "الإمام أحمد بن شعيب النسائي",
    birth: "215 هـ",
    birthplace: "نَسَا (خراسان)",
    title: "الإمام الحافظ",
    bio: "من كبار أئمة الحديث، وصاحب السنن الكبرى والمجتبى، ويعد من أدق المحدثين في نقد الأسانيد.",
  },

  8: {
    name: "مشكاة المصابيح",
    author: "الإمام محمد بن عبد الله الخطيب التبريزي",
    birth: "تاريخ الميلاد غير معروف",
    birthplace: "تبريز",
    title: "الإمام الخطيب",
    bio: "صاحب كتاب مشكاة المصابيح، وهو ترتيب وتهذيب لكتاب مصابيح السنة مع إضافة أحاديث جديدة وبيان مصادرها.",
  },

  9: {
    name: "مسند أحمد",
    author: "الإمام أحمد بن محمد بن حنبل",
    birth: "164 هـ",
    birthplace: "بغداد",
    title: "إمام أهل السنة",
    bio: "أحد الأئمة الأربعة، وصاحب المسند الذي يعد من أكبر دواوين السنة، عُرف بثباته في محنة خلق القرآن.",
  },

  10: {
    name: "السلسلة الصحيحة",
    author: "العلامة محمد ناصر الدين الألباني",
    birth: "1333 هـ",
    // death: "1420 هـ",
    birthplace: "شكودرة - ألبانيا",
    title: "محدث العصر",
    bio: "من أبرز علماء الحديث في العصر الحديث، اشتهر بتحقيق كتب السنة والحكم على الأحاديث، ومن أشهر مؤلفاته «السلسلة الصحيحة».",
  },
};

export function initDatabase() {
  db.execSync("PRAGMA foreign_keys = ON;");

  db.execSync(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_id INTEGER UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      author_ar TEXT NOT NULL,
      author_en TEXT NOT NULL,
      title TEXT,
      birth TEXT,
      birthplace TEXT,
      bio TEXT,
      description TEXT,
      author_death TEXT,
      hadiths_count INTEGER DEFAULT 0,
      chapters_count INTEGER DEFAULT 0
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      api_chapter_id INTEGER,
      chapter_number INTEGER NOT NULL,
      heading_ar TEXT NOT NULL,
      heading_en TEXT,
      hadiths_count INTEGER DEFAULT 0,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS hadiths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      chapter_id INTEGER NOT NULL,

      api_hadith_id INTEGER UNIQUE NOT NULL,
      api_chapter_id INTEGER NOT NULL,

      hadith_number INTEGER,

      narrator_en TEXT,

      hadith_ar TEXT NOT NULL,

      section_heading_ar TEXT,

      grade TEXT,
      volume TEXT,

      FOREIGN KEY (chapter_id)
            REFERENCES chapters(id)
            ON DELETE CASCADE
    );
  `);
  db.execSync(`
    CREATE TABLE IF NOT EXISTS last_read_chapters (
      book_id INTEGER PRIMARY KEY,
      chapter_id INTEGER NOT NULL,
      hadith_index INTEGER DEFAULT 0,
      updated_at INTEGER
    );
  `);
}
export default db;
