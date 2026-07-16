import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Modal, StyleSheet, View } from "react-native";
import { useQuranPages } from "../../hooks/useQuranPages";
import Elfehrest from "../components/Elfehrest";
import QuranMenu from "../components/QuranMenu";
import QuranSearch from "../components/search";
import QuranControls from "./QuranControls";
import QuranHeader from "./QuranHeader";
import QuranPager from "./QuranPager";

const STORAGE_KEYS = {
  BOOKMARK: "@quran_bookmark",
  LAST_PAGE: "@quran_last_page",
};

const Quran = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [versesVisible, setVersesVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageMarked, setPageMarked] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [openIndexModal, setOpenIndexModal] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef(null);
  const { pageBasedData, loading: pagesLoading } = useQuranPages();
  const { initialPage } = useLocalSearchParams();

  const loadSavedData = useCallback(async () => {
    try {
      const savedBookmark = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARK);
      if (savedBookmark !== null) {
        setPageMarked(Number(savedBookmark));
      }

      if (initialPage !== undefined) {
        setCurrentPage(Number(initialPage));
      } else {
        const savedPage = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PAGE);
        if (savedPage !== null) {
          setCurrentPage(Number(savedPage));
        }
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [initialPage]);

  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  useEffect(() => {
    const saveBookmark = async () => {
      try {
        if (pageMarked !== null) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.BOOKMARK,
            pageMarked.toString(),
          );
        } else {
          await AsyncStorage.removeItem(STORAGE_KEYS.BOOKMARK);
        }
      } catch (error) {
        console.error("Error saving bookmark:", error);
      }
    };

    if (!isLoading) {
      saveBookmark();
    }
  }, [pageMarked, isLoading]);

  useEffect(() => {
    const saveCurrentPage = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.LAST_PAGE,
          currentPage.toString(),
        );
      } catch (error) {
        console.error("Error saving current page:", error);
      }
    };

    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        saveCurrentPage();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [currentPage, isLoading]);

  const bookMark = useMemo(
    () => pageMarked !== null && currentPage === pageMarked,
    [currentPage, pageMarked],
  );

  const currentPageData = useMemo(
    () => pageBasedData[currentPage],
    [currentPage, pageBasedData],
  );

  const isReady = !isLoading && !pagesLoading && pageBasedData.length > 0;

  const startIndex = useMemo(() => {
    if (!isReady) return 0;
    return Math.min(Math.max(currentPage, 0), pageBasedData.length - 1);
  }, [isReady, currentPage, pageBasedData.length]);

  const safeScrollToIndex = useCallback(
    (index, animated) => {
      if (index == null || index < 0 || index >= pageBasedData.length) {
        return;
      }
      try {
        flatListRef.current?.scrollToIndex({ index, animated });
      } catch (error) {
        console.warn("scrollToIndex failed:", error);
      }
    },
    [pageBasedData.length],
  );

  const handleStartRecording = useCallback(() => {
    setIsRecording((prev) => {
      Alert.alert("تسجيل", !prev ? "بدأ التسجيل لاختبار حفظك" : "توقف التسجيل");
      return !prev;
    });
    // TODO: Implement recording logic
  }, []);

  const handleToggleVerses = useCallback(() => {
    setVersesVisible((prev) => !prev);
  }, []);

  const handleToggleMark = useCallback(() => {
    if (pageMarked === currentPage) {
      setPageMarked(null);
    } else {
      setPageMarked(currentPage);
    }
  }, [currentPage, pageMarked]);

  const handleMenuPress = useCallback(() => {
    setOpenMenu(true);
  }, []);

  const handleGoToBookmark = useCallback(() => {
    if (pageMarked !== null) {
      safeScrollToIndex(pageMarked, true);
    } else {
      Alert.alert("علامة مرجعية", "لم يتم حفظ أي صفحة بعد");
    }
  }, [pageMarked, safeScrollToIndex]);

  return (
    <>
      <View style={[styles.container, isDark && styles.containerDark]}>
        <QuranHeader
          currentPage={currentPage}
          pageData={currentPageData}
          totalPages={pageBasedData.length}
          bookmarked={bookMark}
          onMenuPress={handleMenuPress}
          onSearchPress={() => setOpenSearchModal(true)}
          isDark={isDark}
        />

        <QuranMenu
          visible={openMenu}
          onClose={() => setOpenMenu(false)}
          isDark={isDark}
          onToggleMood={() => setIsDark((prev) => !prev)}
          onGoToPage={(action) => {
            if (action === "save") {
              handleToggleMark();
            }
            if (action === "bookmark") {
              handleGoToBookmark();
            }
            if (action === "index") {
              setOpenIndexModal(true);
            }
          }}
          currentPage={currentPage}
        />

        <View
          style={{ flex: 1, opacity: openSearchModal ? 0 : 1 }}
          pointerEvents={openSearchModal ? "none" : "auto"}
        >
          {isReady ? (
            <QuranPager
              ref={flatListRef}
              data={pageBasedData}
              onPageChange={setCurrentPage}
              versesVisible={versesVisible}
              isDark={isDark}
              initialScrollIndex={startIndex}
            />
          ) : (
            <View
              style={[styles.placeholder, isDark && styles.placeholderDark]}
            />
          )}

          <QuranControls
            isRecording={isRecording}
            onRecord={handleStartRecording}
            versesVisible={versesVisible}
            onToggleVerses={handleToggleVerses}
            isDark={isDark}
          />
        </View>

        <Modal
          visible={openIndexModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setOpenIndexModal(false)}
        >
          <Elfehrest
            onClose={() => setOpenIndexModal(false)}
            onSelect={(pageNumber) => {
              setCurrentPage(pageNumber);
              setOpenIndexModal(false);
              safeScrollToIndex(pageNumber, true);
            }}
          />
        </Modal>
        <Modal
          visible={openSearchModal}
          animationType="slide"
          transparent
          onRequestClose={() => setOpenSearchModal(false)}
        >
          <QuranSearch
            data={pageBasedData}
            onClose={() => setOpenSearchModal(false)}
            onSelect={(pageIndex) => {
              setCurrentPage(pageIndex);
              setOpenSearchModal(false);
              safeScrollToIndex(pageIndex, true);
            }}
          />
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "visible",
    backgroundColor: "#fdfaf3",
  },
  containerDark: {
    backgroundColor: "#121212",
  },
  placeholder: {
    flex: 1,
    backgroundColor: "#fdfaf3",
  },
  placeholderDark: {
    backgroundColor: "#121212",
  },
});

export default Quran;
