import { useMemo } from "react";

export function useQuranPages(quranData) {
  const pageBasedData = useMemo(() => {
    const pages = {};

    quranData.data.surahs.forEach((surah) => {
      surah.ayahs.forEach((ayah) => {
        const pageNum = ayah.page;

        if (!pages[pageNum]) {
          pages[pageNum] = {
            pageNumber: pageNum,
            ayahs: [],
            juz: ayah.juz,
            surahName: surah.name,
            surahNumber: surah.number,
          };
        }

        pages[pageNum].ayahs.push({
          text: ayah.text,
          numberInSurah: ayah.numberInSurah,
          surahName: surah.name,
          surahNumber: surah.number,
          revelationType: surah.revelationType,
        });
      });
    });

    return Object.values(pages).sort((a, b) => a.pageNumber - b.pageNumber);
  }, [quranData]);

  return pageBasedData;
};