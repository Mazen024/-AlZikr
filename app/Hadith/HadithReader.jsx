import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getHadithsByBook,
  getLastHadithIndex,
  saveLastHadithIndex,
} from "../../service/hadithService";
import theme from "../constants/root";

const { width, height } = Dimensions.get("window");

const HEADER_HEIGHT = 60;
const UPPER_HEIGHT = (height - HEADER_HEIGHT) * 0.5;
const LOWER_HEIGHT = (height - HEADER_HEIGHT) * 0.5;

const TABS = [
  { key: "test1", label: "Test 1" },
  { key: "test2", label: "Test 2" },
  { key: "test3", label: "Test 3" },
  { key: "test4", label: "Test 4" },
  { key: "test5", label: "Test 5" },
];

const HadithPage = React.memo(({ item, index, total }) => (
  <View style={styles.hadithPage}>
    <ScrollView
      style={styles.hadithScrollArea}
      contentContainerStyle={styles.hadithScrollContent}
      showsVerticalScrollIndicator
      nestedScrollEnabled
    >
      <Text style={styles.hadithText}>{item.text}</Text>
    </ScrollView>
  </View>
));

HadithPage.displayName = "HadithPage";

const TabContent = ({ tabKey }) => (
  <View style={styles.tabContent}>
    <Text style={styles.tabContentText}>{tabKey.toUpperCase()}</Text>
    <Text style={styles.tabContentSub}>قريباً</Text>
  </View>
);

const HadithReader = () => {
  const [hadiths, setHadiths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(TABS[0].key);

  const flatListRef = useRef(null);
  const { bookId, bookTitle, chapterId, chapterTitle } = useLocalSearchParams();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const parsedBookId = parseInt(bookId);
        const parsedChapterId = parseInt(chapterId);

        const data = await getHadithsByBook(parsedBookId);
        setHadiths(data || []);

        const savedIndex = await getLastHadithIndex(
          parsedBookId,
          parsedChapterId,
        );

        let targetIndex = 0;
        if (savedIndex != null && savedIndex > 0) {
          targetIndex = savedIndex;
        } else {
          const firstOfChapter = (data || []).findIndex(
            (h) => h.chapter_id === parsedChapterId,
          );
          if (firstOfChapter !== -1) targetIndex = firstOfChapter;
        }

        setCurrentIndex(targetIndex);

        setTimeout(() => {
          if ((data || []).length > 0 && targetIndex > 0) {
            flatListRef.current?.scrollToIndex({
              index: targetIndex,
              animated: false,
            });
          }
        }, 150);
      } catch (e) {
        console.log("Error loading hadiths:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookId, chapterId]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setCurrentIndex(idx);
      saveLastHadithIndex(parseInt(bookId), parseInt(chapterId), idx);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 51,
  }).current;

  const getItemLayout = useCallback(
    (_, index) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [],
  );

  const renderHadith = useCallback(
    ({ item, index }) => (
      <HadithPage item={item} index={index} total={hadiths.length} />
    ),
    [hadiths.length],
  );

  const onScrollToIndexFailed = useCallback((info) => {
    flatListRef.current?.scrollToOffset({
      offset: width * info.index,
      animated: false,
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.Colors.primaryLight} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {chapterTitle}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {bookTitle}
          </Text>
        </View>
        <View style={styles.headerCounter}>
          <Text style={styles.headerCounterText}>
            {currentIndex + 1} / {hadiths.length}
          </Text>
        </View>
      </View>

      <View style={styles.upperPanel}>
        <FlatList
          ref={flatListRef}
          data={hadiths}
          renderItem={renderHadith}
          keyExtractor={(item) => item.id.toString()}
          horizontal // left/right swipe
          pagingEnabled // snap to each hadith
          inverted // RTL: swipe right = next hadith
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={onScrollToIndexFailed}
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          windowSize={7}
          removeClippedSubviews
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.lowerPanel}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabBarContent}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                activeTab === tab.key && styles.tabItemActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.key && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Active Tab Body */}
        <View style={styles.tabContentArea}>
          <TabContent tabKey={activeTab} />
        </View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Colors.quranbackground,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.Colors.quranbackground,
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.Colors.darkGray,
    backgroundColor: theme.Colors.quranbackground,
  },
  headerInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Colors.primaryLight,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.textGray,
    marginTop: 2,
  },
  headerCounter: {
    backgroundColor: theme.Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: theme.Spacing.sm,
  },
  headerCounterText: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriBold,
    color: "#fff",
  },
  upperPanel: {
    height: UPPER_HEIGHT,
  },
  hadithPage: {
    width: width,
    height: UPPER_HEIGHT,
    paddingHorizontal: theme.Spacing.sm,
  },
  hadithScrollArea: {
    flex: 1,
    direction: "rtl",
  },
  hadithScrollContent: {
    paddingVertical: theme.Spacing.md,
  },
  hadithText: {
    fontSize: 20,
    fontFamily: theme.Fonts.amiriRegular,
    color: "#1a1a1a",
    lineHeight: 40,
    textAlign: "justify",
    writingDirection: "rtl",
  },
  divider: {
    height: 2,
    backgroundColor: theme.Colors.primaryLight,
  },

  // Lower panel
  lowerPanel: {
    height: LOWER_HEIGHT,
    backgroundColor: "#fff",
  },
  tabBar: {
    maxHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fafafa",
  },
  tabBarContent: {
    paddingHorizontal: theme.Spacing.sm,
    alignItems: "center",
  },
  tabItem: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 2,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: theme.Colors.primaryLight,
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.textGray,
  },
  tabLabelActive: {
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Colors.primaryLight,
  },
  tabContentArea: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContentText: {
    fontSize: 18,
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Colors.textGray,
  },
  tabContentSub: {
    fontSize: 13,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.textGray,
    marginTop: 6,
  },
});

export default HadithReader;
