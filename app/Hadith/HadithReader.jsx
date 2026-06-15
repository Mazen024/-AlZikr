import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  View,
} from "react-native";
import {
  ALL_BOOKS,
  getBookById,
  getChaptersByBook,
  getHadithsByBook,
  getLastChapter,
  getLastHadithIndex,
  saveLastChapter,
  saveLastHadithIndex,
} from "../../service/hadithService";
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

const HadithReader = () => {
  const { bookId } = useLocalSearchParams();

  const [bookTitle, setBookTitle] = useState("");
  const [hadiths, setHadiths] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentChapterTitle, setCurrentChapterTitle] = useState("");
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lastChapterId, setLastChapterId] = useState(null);
  const [activeTab, setActiveTab] = useState("header not complete");

  const flatListRef = useRef(null);
  const bookIdRef = useRef(bookId);

  useEffect(() => {
    bookIdRef.current = bookId;
  }, [bookId]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const parsedBookId = parseInt(bookId);

        const [data, book, chaptersData, lastCh] = await Promise.all([
          getHadithsByBook(parsedBookId),
          getBookById(parsedBookId),
          getChaptersByBook(parsedBookId),
          getLastChapter(parsedBookId),
        ]);

        const hadithList = data || [];
        const chapterList = chaptersData || [];

        setHadiths(hadithList);
        setChapters(chapterList);
        if (book?.title) setBookTitle(book.title);

        const bookData = ALL_BOOKS[parsedBookId - 1];
        const resolvedLastChapterId = lastCh ?? hadithList[0]?.chapter_id;
        setLastChapterId(resolvedLastChapterId);

        const savedIndex = await getLastHadithIndex(parsedBookId, resolvedLastChapterId);
        const targetIndex =
          savedIndex ?? hadithList.findIndex((h) => h.chapter_id === resolvedLastChapterId);

        const initialChapter = bookData?.chapters?.find((c) => c.id === resolvedLastChapterId);
        if (initialChapter?.arabic) {
          setCurrentChapterTitle(initialChapter.arabic);
          setCurrentChapterId(resolvedLastChapterId);
        }

        const safeIndex = targetIndex > -1 ? targetIndex : 0;
        setCurrentIndex(safeIndex);

        setTimeout(() => {
          if (hadithList.length > 0 && safeIndex > 0) {
            flatListRef.current?.scrollToIndex({ index: safeIndex, animated: false });
          }
        }, 150);
      } catch (e) {
        console.log("Error loading hadiths:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookId]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length === 0) return;
    const idx = viewableItems[0].index ?? 0;
    const currentHadith = viewableItems[0].item;
    setCurrentIndex(idx);

    const realChapterId = currentHadith.chapter_id;
    const parsedBookId = parseInt(bookIdRef.current);
    const book = ALL_BOOKS[parsedBookId - 1];
    const chapter = book?.chapters?.find((c) => c.id === realChapterId);
    if (chapter?.arabic) {
      setCurrentChapterTitle(chapter.arabic);
      setCurrentChapterId(realChapterId);
    }

    saveLastHadithIndex(parsedBookId, realChapterId, idx);
    saveLastChapter(parsedBookId, realChapterId);
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 51 }).current;

  const handleSelectChapter = useCallback(
    (chapter) => {
      const idx = hadiths.findIndex((h) => h.chapter_id === chapter.id);
      if (idx > -1) {
        flatListRef.current?.scrollToIndex({ index: idx, animated: true });
      }
    },
    [hadiths],
  );

  const handleJumpToHadith = useCallback(
    (index) => {
      const safeIndex = Math.max(0, Math.min(index, hadiths.length - 1));
      flatListRef.current?.scrollToIndex({ index: safeIndex, animated: true });
    },
    [hadiths.length],
  );

  const bookData = ALL_BOOKS[parseInt(bookId) - 1];
  const resolvedChapters = chapters.length > 0 ? chapters : (bookData?.chapters || []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.Tcolors.primaryLight} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HadithHeader
        bookTitle={bookTitle}
        currentChapterTitle={currentChapterTitle}
        currentIndex={currentIndex}
        totalHadiths={hadiths.length}
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
    backgroundColor: theme.Tcolors.quranbackground,
  },
  divider: {
    height: DIVIDER_HEIGHT,
    backgroundColor: theme.Tcolors.primaryLight,
  },
});