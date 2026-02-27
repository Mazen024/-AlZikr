import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getBookById,
  getChaptersByBook,
  getLastChapter,
  saveLastChapter,
} from "../../service/hadithService";
import theme from "../constants/root";

const HadithChapters = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastChapterId, setLastChapterId] = useState(null);
  const [bookDetails, setBookDetails] = useState({
    bookTitle: "",
    bookAuthor: "",
    birthDate: "",
  });
  const router = useRouter();
  const { bookId } = useLocalSearchParams();

  useEffect(() => {
    const loadBookDetails = async () => {
      if (!bookId) return;
      try {
        const parsedBookId = parseInt(bookId);
        const bookData = await getBookById(parsedBookId);
        if (bookData) {
          setBookDetails({
            bookTitle: bookData.title || "",
            bookAuthor: bookData.author || "",
            birthDate: bookData.birthDate || "",
          });
        }
      } catch (error) {
        console.log("Error loading book details:", error);
      }
    };
    loadBookDetails();
  }, [bookId]);

  useFocusEffect(
    useCallback(() => {
      if (!bookId) return;
      const load = async () => {
        try {
          setLoading(true);
          const parsedBookId = parseInt(bookId);
          const data = await getChaptersByBook(parsedBookId);
          setChapters(data || []);
          const lastChapter = await getLastChapter(parsedBookId);
          setLastChapterId(lastChapter);
        } catch (error) {
          console.log("Error loading chapters:", error);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [bookId]),
  );

  const handleChapterPress = async (chapter) => {
    await saveLastChapter(parseInt(bookId), chapter.id);

    router.push({
      pathname: "/Hadith/HadithReader",
      params: {
        bookId: bookId,
        bookTitle: bookDetails.bookTitle,
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{bookDetails.bookTitle}</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.headerSubtitle}>{bookDetails.bookAuthor}</Text>
          <Text style={styles.headerBirthDate}>{bookDetails.birthDate}</Text>
        </View>
      </View>

      <FlatList
        data={chapters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.chapterItem,
              item.id === lastChapterId && item.id !== 0 && styles.lastChapterItem,
            ]}
            onPress={() => handleChapterPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.chapterNumber}>
              <Text style={styles.chapterNumberText}>{item.id}</Text>
            </View>
            <View style={styles.chapterInfo}>
              <Text style={styles.chapterTitle}>{item.title}</Text>
              {item.id !== 0 && (
                <Text style={styles.chapterCount}>{item.hadithCount} حديث</Text>
              )}
            </View>
            {item.id === lastChapterId && item.id !== 0 && (
              <View style={styles.continueBadge}>
                <Text style={styles.continueBadgeText}>متابعة</Text>
              </View>
            )}
            <Ionicons
              name="chevron-forward"
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
    paddingVertical: theme.Spacing.md,
    paddingHorizontal: theme.Spacing.md,
    borderBottomColor: theme.Colors.mediumGray,
    borderBottomWidth: 1,
    direction: "rtl",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Colors.primaryLight,
  },
  headerInfo: {
    marginTop: theme.Spacing.xs,
    flexDirection: "row",
    gap: theme.Spacing.sm,
    justifyContent: "space-between",
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.textGray,
  },
  headerBirthDate: {
    backgroundColor: theme.Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 14,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.white,
  },
  listContent: {
    padding: theme.Spacing.md,
  },
  chapterItem: {
    flexDirection: "row-reverse",
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
