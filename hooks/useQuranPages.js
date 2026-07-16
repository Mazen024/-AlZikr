import { useEffect, useState } from "react";
import getDb from "../app/db/database";

export function useQuranPages() {
  const [pageBasedData, setPageBasedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadPages = async () => {
      try {
        const db = await getDb();
        const rows = await db.getAllAsync(
          `SELECT
             ayahs.text AS text,
             ayahs.ayah_number AS numberInSurah,
             ayahs.page AS page,
             ayahs.juz AS juz,
             surahs.name AS surahName,
             surahs.id AS surahNumber,
             surahs.revelation_type AS revelationType
           FROM ayahs
           JOIN surahs ON surahs.id = ayahs.surah_id
           ORDER BY ayahs.id ASC`,
        );

        const pages = {};

        for (const ayah of rows) {
          const pageNum = ayah.page;

          if (!pages[pageNum]) {
            pages[pageNum] = {
              pageNumber: pageNum,
              ayahs: [],
              juz: ayah.juz,
              surahName: ayah.surahName,
              surahNumber: ayah.surahNumber,
            };
          }

          pages[pageNum].ayahs.push({
            text: ayah.text,
            numberInSurah: ayah.numberInSurah,
            surahName: ayah.surahName,
            surahNumber: ayah.surahNumber,
            revelationType: ayah.revelationType,
          });
        }

        const sorted = Object.values(pages).sort(
          (a, b) => a.pageNumber - b.pageNumber,
        );

        if (isMounted) {
          setPageBasedData(sorted);
        }
      } catch (e) {
        console.error("Error loading Quran pages:", e);
        if (isMounted) setError(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPages();

    return () => {
      isMounted = false;
    };
  }, []);

  return { pageBasedData, loading, error };
}
