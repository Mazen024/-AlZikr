import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  getHadithsByChapter,
  saveLastHadithIndex,
  getLastHadithIndex,
} from "../../service/hadithService";
import theme from "../constants/root";

const { width, height } = Dimensions.get("window");

const HadithReader = () => {
  const [hadiths, setHadiths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const router = useRouter();
  const { bookId, bookTitle, chapterId, chapterTitle } = useLocalSearchParams();

  useEffect(() => {
    loadHadiths();
  }, []);

  const loadHadiths = async () => {
    setLoading(true);
    const data = await getHadithsByChapter(parseInt(bookId), parseInt(chapterId));
    setHadiths(data);
    
    // Get last hadith index
    const lastIndex = await getLastHadithIndex(parseInt(bookId), parseInt(chapterId));
    setCurrentIndex(lastIndex);
    
    // Scroll to last hadith
    setTimeout(() => {
      if (data.length > 0) {
        flatListRef.current?.scrollToIndex({
          index: lastIndex,
          animated: false,
        });
      }
    }, 100);
    
    setLoading(false);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentIndex(index);
      saveLastHadithIndex(parseInt(bookId), parseInt(chapterId), index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderHadith = ({ item, index }) => (
    <View style={styles.hadithPage}>
      <View style={styles.hadithContainer}>
        <View style={styles.hadithHeader}>
          <Text style={styles.hadithNumber}>الحديث رقم {item.number}</Text>
        </View>
        <Text style={styles.hadithText}>{item.text}</Text>
        <View style={styles.pageIndicator}>
          <Text style={styles.pageNumber}>
            {index + 1} / {hadiths.length}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.Colors.primaryLight} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-forward"
            size={24}
            color={theme.Colors.primaryLight}
          />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{chapterTitle}</Text>
          <Text style={styles.headerSubtitle}>{bookTitle}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Horizontal Hadith Reader */}
      <FlatList
        ref={flatListRef}
        data={hadiths}
        renderItem={renderHadith}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        inverted
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5dc",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: theme.Colors.black,
    paddingVertical: theme.Spacing.md,
    paddingHorizontal: theme.Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: theme.Spacing.xs,
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Colors.primaryLight,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.textGray,
    textAlign: "center",
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  hadithPage: {
    width: width,
    height: height - 80,
    padding: theme.Spacing.md,
  },
  hadithContainer: {
    flex: 1,
    backgroundColor: "#fffef0",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d4af37",
    padding: theme.Spacing.lg,
    justifyContent: "center",
  },
  hadithHeader: {
    alignItems: "center",
    marginBottom: theme.Spacing.lg,
    paddingBottom: theme.Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#d4af37",
  },
  hadithNumber: {
    fontSize: 18,
    fontFamily: theme.Fonts.amiriBold,
    color: "#1a4d2e",
  },
  hadithText: {
    fontSize: 20,
    fontFamily: theme.Fonts.amiriRegular,
    color: "#1a1a1a",
    lineHeight: 40,
    textAlign: "justify",
    direction: "rtl",
  },
  pageIndicator: {
    alignItems: "center",
    marginTop: theme.Spacing.lg,
    paddingTop: theme.Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#d4af37",
  },
  pageNumber: {
    fontSize: 14,
    fontFamily: theme.Fonts.amiriBold,
    color: "#1a4d2e",
    backgroundColor: "#d4af37",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
});

export default HadithReader;