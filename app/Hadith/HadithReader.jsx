import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { initializeHadithBook } from "../../service/appInitializer";
import { getBookById } from "../../service/bookService";
import { getChaptersByBook } from "../../service/chapterService";
import {
  getHadithsByBook,
  getLastReading,
  saveLastReading,
} from "../../service/hadithServices";
import SyncProgressView from "../components/SyncProgressView";
import theme from "../constants/root";
import HadithHeader from "./HadithReaderHeader";
import HadithMain from "./HadithReaderMain";
import HadithTabs from "./HadithReaderTabs";

const { height } = Dimensions.get("window");

const HEADER_HEIGHT = 64;
const DIVIDER_HEIGHT = 2;
const CONTENT_HEIGHT = height - HEADER_HEIGHT - DIVIDER_HEIGHT;
const UPPER_HEIGHT = CONTENT_HEIGHT * 0.6;
const LOWER_HEIGHT = CONTENT_HEIGHT * 0.4;

const DEFAULT_TAB = "info";

const HadithReader = () => {
  const params = useLocalSearchParams();
  const rawBookId = Array.isArray(params.bookId)
    ? params.bookId[0]
    : params.bookId;
  const bookId = Number(rawBookId);

  const [bookTitle, setBookTitle] = useState("");
  const [hadiths, setHadiths] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentChapterTitle, setCurrentChapterTitle] = useState("");
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lastChapterId, setLastChapterId] = useState(null);
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);
  const [syncProgress, setSyncProgress] = useState(null);

  const flatListRef = useRef(null);
  const bookIdRef = useRef(bookId);
  const chaptersRef = useRef(chapters);
  const hadithsRef = useRef(hadiths);

  useEffect(() => {
    bookIdRef.current = bookId;
  }, [bookId]);

  useEffect(() => {
    chaptersRef.current = chapters;
  }, [chapters]);

  useEffect(() => {
    hadithsRef.current = hadiths;
  }, [hadiths]);

  useEffect(() => {
    if (!bookId || Number.isNaN(bookId)) {
      setError("رقم الكتاب غير صالح");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setSyncProgress(null);

      try {
        await initializeHadithBook(bookId, (progress) => {
          if (!cancelled) setSyncProgress(progress);
        });

        if (cancelled) return;

        const book = getBookById(bookId);
        const bookChapters = getChaptersByBook(bookId);
        const bookHadiths = getHadithsByBook(bookId);

        if (cancelled) return;

        setBookTitle(book?.name_ar ?? book?.name_en ?? "");
        setChapters(bookChapters);
        setHadiths(bookHadiths);

        const last = getLastReading(bookId);
        if (last) {
          setLastChapterId(last.chapter_id);
          const resumeIndex = Math.max(
            0,
            Math.min(last.hadith_index ?? 0, bookHadiths.length - 1),
          );
          setCurrentIndex(resumeIndex);

          const resumeChapter = bookChapters.find(
            (c) => c.id === last.chapter_id,
          );
          setCurrentChapterId(resumeChapter?.id ?? null);
          setCurrentChapterTitle(resumeChapter?.heading_ar ?? "");

          requestAnimationFrame(() => {
            if (!cancelled && resumeIndex > 0) {
              flatListRef.current?.scrollToIndex({
                index: resumeIndex,
                animated: false,
              });
            }
          });
        } else if (bookChapters.length > 0) {
          setCurrentChapterId(bookChapters[0].id);
          setCurrentChapterTitle(bookChapters[0].heading_ar ?? "");
        }
      } catch (err) {
        if (!cancelled) {
          console.log("❌ Error loading hadith book:", err);
          setError("حدث خطأ أثناء تحميل الكتاب");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (!viewableItems?.length) return;

    const top = viewableItems[0];
    const index = top.index ?? 0;
    const hadith = top.item;

    setCurrentIndex(index);

    const chapter = chaptersRef.current.find(
      (c) => c.id === hadith?.chapter_id,
    );
    if (chapter) {
      setCurrentChapterId(chapter.id);
      setCurrentChapterTitle(chapter.heading_ar ?? "");
    }

    if (hadith) {
      saveLastReading(bookIdRef.current, hadith.chapter_id, index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 51 }).current;

  const handleSelectChapter = useCallback((chapter) => {
    const idx = hadithsRef.current.findIndex(
      (h) => h.chapter_id === chapter.id,
    );
    if (idx > -1) {
      flatListRef.current?.scrollToIndex({ index: idx, animated: true });
    }
  }, []);

  const handleJumpToHadith = useCallback((index) => {
    const safeIndex = Math.max(
      0,
      Math.min(index, hadithsRef.current.length - 1),
    );
    flatListRef.current?.scrollToIndex({ index: safeIndex, animated: true });
  }, []);

  const handleScrollToIndexFailed = useCallback((info) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
      });
    }, 100);
  }, []);

  const resolvedChapters = useMemo(() => chapters, [chapters]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <SyncProgressView progress={syncProgress} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.syncText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HadithHeader
        bookTitle={bookTitle}
        currentChapterTitle={currentChapterTitle}
        currentIndex={currentIndex}
        Hadiths={hadiths}
        chapters={resolvedChapters}
        currentChapterId={currentChapterId}
        lastChapterId={lastChapterId}
        onSelectChapter={handleSelectChapter}
        onJump={handleJumpToHadith}
      />

      <HadithMain
        hadiths={hadiths}
        height={UPPER_HEIGHT}
        flatListRef={flatListRef}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollToIndexFailed={handleScrollToIndexFailed}
      />

      <View style={styles.divider} />

      <HadithTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        height={LOWER_HEIGHT}
      />
    </View>
  );
};

export default HadithReader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Tcolors.quranbackground,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.Tcolors.primaryBackground,
  },
  divider: {
    height: DIVIDER_HEIGHT,
    backgroundColor: theme.Tcolors.primaryLight,
  },
  syncText: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: theme.Fonts.amiriRegular,
    color: "#b8e8c9",
  },
});
