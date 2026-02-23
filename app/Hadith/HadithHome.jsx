import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getBooks } from "../../service/hadithService";
import theme from "../constants/root";

const HadithHome = () => {
  const [books, setBooks] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    const data = await getBooks();
    setBooks(data);
  };

  const handleBookPress = (book) => {
    router.push({
      pathname: "/Hadith/HadithChapters",
      params: {
        bookId: book.id,
        bookTitle: book.title,
      },
    });
  };

  const renderBookItem = ({ item, index }) => {
    // Different colors for different books
    const colors = [
      "#1e88e5", "#43a047", "#e53935", "#fb8c00",
      "#8e24aa", "#00acc1", "#6d4c41", "#546e7a",
      "#c0ca33", "#5e35b1", "#00897b", "#d81b60",
      "#039be5", "#7cb342", "#f4511e", "#fdd835", "#9c27b0"
    ];
    
    const color = colors[index % colors.length];

    return (
      <TouchableOpacity
        style={[styles.bookCard, { borderLeftColor: color }]}
        onPress={() => handleBookPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.bookIcon, { backgroundColor: color }]}>
          <Ionicons name="book" size={32} color="#fff" />
        </View>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          <Text style={styles.bookAuthor}>{item.author}</Text>
          <View style={styles.bookStats}>
            <View style={styles.stat}>
              <Ionicons name="albums-outline" size={14} color={color} />
              <Text style={[styles.statText, { color }]}>
                {item.chapterCount} باب
              </Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="document-text-outline" size={14} color={color} />
              <Text style={[styles.statText, { color }]}>
                {item.hadithCount} حديث
              </Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-back" size={20} color={theme.Colors.textGray} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons
            name="library"
            size={32}
            color={theme.Colors.primaryLight}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>جامع الأحاديث</Text>
            <Text style={styles.headerSubtitle}>
              {books.length} كتاب حديثي
            </Text>
          </View>
        </View>
      </View>

      {/* Books Grid */}
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id.toString()}
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
  header: {
    backgroundColor: theme.Colors.black,
    paddingVertical: theme.Spacing.lg,
    paddingHorizontal: theme.Spacing.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Colors.primaryLight,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.textGray,
  },
  listContent: {
    padding: theme.Spacing.md,
  },
  bookCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: theme.Spacing.md,
    marginBottom: theme.Spacing.md,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.Spacing.sm,
  },
  bookInfo: {
    flex: 1,
    marginRight: theme.Spacing.md,
  },
  bookTitle: {
    fontSize: 18,
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Colors.black,
    marginBottom: 4,
    textAlign: "right",
  },
  bookAuthor: {
    fontSize: 13,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.textGray,
    marginBottom: 8,
    textAlign: "right",
  },
  bookStats: {
    flexDirection: "row",
    gap: theme.Spacing.md,
    justifyContent: "flex-end",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriRegular,
  },
});

export default HadithHome;