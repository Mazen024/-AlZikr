import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  getChaptersByBook,
  getLastChapter,
  saveLastChapter,
} from "../../service/hadithService";
import theme from "../constants/root";

const HadithChapters = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastChapterId, setLastChapterId] = useState(null);
  const router = useRouter();
  const { bookId, bookTitle } = useLocalSearchParams();

  useEffect(() => {
    loadChapters();
  }, []);

  const loadChapters = async () => {
    setLoading(true);
    const data = await getChaptersByBook(parseInt(bookId));
    setChapters(data);
    
    // Get last chapter
    const lastChapter = await getLastChapter(parseInt(bookId));
    setLastChapterId(lastChapter);
    
    setLoading(false);
  };

  const handleChapterPress = async (chapter) => {
    // Save last chapter
    await saveLastChapter(parseInt(bookId), chapter.id);
    
    router.push({
      pathname: "/Hadith/HadithReader",
      params: {
        bookId: bookId,
        bookTitle: bookTitle,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
      },
    });
  };

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
        <Text style={styles.headerTitle}>{bookTitle}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Chapters List */}
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.chapterItem,
              item.id === lastChapterId && styles.lastChapterItem,
            ]}
            onPress={() => handleChapterPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.chapterNumber}>
              <Text style={styles.chapterNumberText}>{item.id}</Text>
            </View>
            <View style={styles.chapterInfo}>
              <Text style={styles.chapterTitle}>{item.title}</Text>
              <Text style={styles.chapterCount}>
                {item.hadithCount} حديث
              </Text>
            </View>
            {item.id === lastChapterId && (
              <View style={styles.continueBadge}>
                <Text style={styles.continueBadgeText}>متابعة</Text>
              </View>
            )}
            <Ionicons
              name="chevron-back"
              size={20}
              color={theme.Colors.textGray}
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  backButton: {
    padding: theme.Spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Colors.primaryLight,
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    padding: theme.Spacing.md,
  },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: theme.Spacing.md,
    marginBottom: theme.Spacing.sm,
    borderRadius: 12,
    gap: theme.Spacing.sm,
  },
  lastChapterItem: {
    borderWidth: 2,
    borderColor: theme.Colors.primaryLight,
  },
  chapterNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  chapterNumberText: {
    fontSize: 18,
    fontFamily: theme.Fonts.amiriBold,
    color: "#fff",
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.black,
    textAlign: "right",
    marginBottom: 4,
  },
  chapterCount: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.textGray,
    textAlign: "right",
  },
  continueBadge: {
    backgroundColor: theme.Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  continueBadgeText: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriBold,
    color: "#fff",
  },
});

export default HadithChapters;