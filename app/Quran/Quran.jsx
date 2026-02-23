import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { View, StyleSheet, Alert, Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import quranData from "../../assets/quran/quran copy.json";
import theme from "../constants/root";
import { useQuranPages } from "../../hooks/useQuranPages";
import QuranHeader from "./QuranHeader";
import QuranPager from "./QuranPager";
import QuranControls from "./QuranControls";
import QuranMenu from "../components/QuranMenu";
import { useLocalSearchParams } from "expo-router";
import Elfehrest from "../components/Elfehrest";

// Storage keys
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
  const [openIndexModal, setOpenIndexModal] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef(null);
  const pageBasedData = useQuranPages(quranData);
  const { initialPage } = useLocalSearchParams();

  const loadSavedData = React.useCallback(async () => {
    try {
      const savedBookmark = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARK);
      if (savedBookmark !== null) {
        setPageMarked(Number(savedBookmark));
      }

      if (initialPage === undefined) {
        const savedPage = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PAGE);
        if (savedPage !== null) {
          const pageIndex = Number(savedPage);
          setCurrentPage(pageIndex);

          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: pageIndex,
              animated: false,
            });
          }, 100);
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

  // Handle initialPage from params
  useEffect(() => {
    if (initialPage !== undefined && !isLoading) {
      const pageIndex = Number(initialPage);
      setCurrentPage(pageIndex);

      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: pageIndex,
          animated: true,
        });
      }, 100);
    }
  }, [initialPage, isLoading]);

  // Save bookmark when it changes
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

  // Save current page when it changes (with debouncing)
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
      // Debounce the save operation
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
      try {
        flatListRef.current?.scrollToIndex({
          index: pageMarked,
          animated: true,
        });
      } catch (error) {
        console.warn("Error scrolling to bookmark:", error);
        Alert.alert("خطأ", "حدث خطأ أثناء الانتقال إلى العلامة المرجعية");
      }
    } else {
      Alert.alert("علامة مرجعية", "لم يتم حفظ أي صفحة بعد");
    }
  }, [pageMarked]);

  return (
    <>
      <StatusBar
        style="light"
        translucent={false}
        backgroundColor={theme.Colors.black}
      />
      <View style={styles.container}>
        <QuranHeader
          currentPage={currentPage}
          pageData={currentPageData}
          totalPages={pageBasedData.length}
          bookmarked={bookMark}
          onMenuPress={handleMenuPress}
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

        <QuranPager
          ref={flatListRef}
          data={pageBasedData}
          onPageChange={setCurrentPage}
          versesVisible={versesVisible}
          isDark={isDark}
        />

        <QuranControls
          isRecording={isRecording}
          onRecord={handleStartRecording}
          versesVisible={versesVisible}
          onToggleVerses={handleToggleVerses}
        />

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

              setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                  index: pageNumber,
                  animated: true,
                });
              }, 100);
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
    backgroundColor: theme.Colors.white,
    overflow: "visible",
  },
});

export default Quran;
