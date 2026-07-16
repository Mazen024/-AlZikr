import { Asset } from "expo-asset";
import { Directory, File, Paths } from "expo-file-system";
import * as SQLite from "expo-sqlite";

const DB_NAME = "quran.db";

let dbPromise = null;

async function copyDbIfNeeded() {
  const sqliteDir = new Directory(Paths.document, "SQLite");
  if (!sqliteDir.exists) {
    sqliteDir.create({ intermediates: true });
  }

  const dbFile = new File(sqliteDir, DB_NAME);
  if (!dbFile.exists) {
    const asset = Asset.fromModule(require("../../assets/quran/quran.db"));
    await asset.downloadAsync();

    const sourceFile = new File(asset.localUri);
    sourceFile.copy(dbFile);
  }
}

export default function getDb() {
  if (!dbPromise) {
    dbPromise = copyDbIfNeeded().then(() => SQLite.openDatabaseAsync(DB_NAME));
  }
  return dbPromise;
}
