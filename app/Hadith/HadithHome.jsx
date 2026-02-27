import { Ionicons } from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getBooks } from "../../service/hadithService";
import theme from "../constants/root";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const HadithHome = () => {
  const [books, setBooks] = useState([]);
  const [currentHadithIndex, setCurrentHadithIndex] = useState(0);
  const slideAnim = useState(new Animated.Value(30))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];
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

  const famousHadiths = [
    {
      text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
      ref: "رواه البخاري ومسلم",
    },
    {
      text: "الدِّينُ النَّصِيحَةُ",
      ref: "رواه مسلم",
    },
    {
      text: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
      ref: "رواه البخاري ومسلم",
    },
    {
      text: "مَنْ صَمَتَ نَجَا",
      ref: "رواه البخاري ومسلم",
    },
  ];

  useEffect(() => {
    slideAnim.setValue(30);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      slideAnim.setValue(30);
      fadeAnim.setValue(0);

      setCurrentHadithIndex((prev) =>
        prev === famousHadiths.length - 1 ? 0 : prev + 1,
      );

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 5000);

    return () => clearInterval(interval);
  }, [fadeAnim, famousHadiths.length, slideAnim]);

  function darkenColor(hex, percent = 20) {
    const num = parseInt(hex.replace("#", ""), 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;

    r = Math.max(0, r - (r * percent) / 100);
    g = Math.max(0, g - (g * percent) / 100);
    b = Math.max(0, b - (b * percent) / 100);

    return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g)
      .toString(16)
      .padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
  }

  const renderBookItem = ({ item, index }) => {
    const bookColors = [
      { main: "#243b6b" },
      { main: "#1f4a36" },
      { main: "#6b2a2a" },
      { main: "#7a3e1d" },
      { main: "#4b2c5e" },
      { main: "#255e6b" },
      { main: "#5a3a1a" },
      { main: "#3e4a56" },
      { main: "#42561e" },
      { main: "#3f2a6b" },
      { main: "#1f5a55" },
      { main: "#6b243a" },
      { main: "#1f4a6b" },
      { main: "#42561e" },
      { main: "#7a3e1d" },
      { main: "#6b5a1f" },
      { main: "#5a2a5e" },
    ];

    const colors = bookColors[index % bookColors.length];
    const mainColor = colors.main;
    const spineStart = darkenColor(mainColor, 45);
    const spineEnd = darkenColor(mainColor, 5);

    return (
      <TouchableOpacity
        style={styles.bookWrapper}
        onPress={() => handleBookPress(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.bookCover, { backgroundColor: mainColor }]}>
          <View style={styles.bookContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.bookTitle} numberOfLines={3}>
                {item.title}
              </Text>
            </View>

            <View style={styles.authorContainer}>
              <Text style={styles.bookAuthor} numberOfLines={2}>
                {item.author}
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statBadge}>
                <Ionicons name="list" size={14} color="#fff" />
                <Text style={styles.statText}>{item.chapterCount} باب</Text>
              </View>
              <View style={styles.statBadge}>
                <Ionicons name="book" size={14} color="#fff" />
                <Text style={styles.statText}>{item.hadithCount}</Text>
              </View>
            </View>
          </View>
        </View>
        <LinearGradient
          colors={[spineStart, spineEnd]}
          style={styles.bookSpine}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
        >
          <Text style={styles.spineText} numberOfLines={3}>
            {item.title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons
            name="library"
            size={32}
            color={theme.Colors.primaryLight}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>جامع الأحاديث</Text>
            <Text style={styles.headerSubtitle}>{books.length} كتاب حديثي</Text>
          </View>
        </View>
      </View>

      <Animated.View
        style={[
          styles.verseCard,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Text style={styles.verseIntro}>قال رسول الله ﷺ</Text>
        <Text style={styles.verseArabic}>
          {famousHadiths[currentHadithIndex]?.text}
        </Text>
        <Text style={styles.verseReference}>
          {famousHadiths[currentHadithIndex]?.ref}
        </Text>
      </Animated.View>

      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Colors.lightGray,
  },
  header: {
    direction: "rtl",
    paddingVertical: theme.Spacing.xs,
    paddingHorizontal: theme.Spacing.md,
    borderBottomWidth: 1,
    borderColor: "#ddd",
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
  verseCard: {
    marginHorizontal: theme.Spacing.md,
    marginTop: theme.Spacing.md,
    marginBottom: theme.Spacing.sm,
    padding: theme.Spacing.md,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderRightWidth: 4,
    borderRightColor: "#6b5a1f", // ذهبي هادئ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  verseIntro: {
    fontSize: 16,
    fontFamily: theme.Fonts.amiriBold,
    color: "#6b5a1f",
    textAlign: "right",
  },
  verseArabic: {
    fontSize: 18,
    fontFamily: theme.Fonts.amiriBold,
    color: "#333",
    textAlign: "center",
    lineHeight: 32,
  },

  verseReference: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: theme.Fonts.amiriRegular,
    color: "#777",
    textAlign: "center",
  },
  listContent: {
    padding: theme.Spacing.md,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: theme.Spacing.md,
  },
  bookWrapper: {
    width: CARD_WIDTH,
    height: 240,
    flexDirection: "row",
    marginBottom: theme.Spacing.sm,
  },
  bookSpine: {
    width: 24,
    height: "100%",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  spineText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: theme.Fonts.amiriBold,
    transform: [{ rotate: "90deg" }],
    width: 200,
    textAlign: "center",
  },
  bookCover: {
    flex: 1,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: theme.Spacing.sm,
    justifyContent: "space-between",
  },
  bookContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: 18,
    fontFamily: theme.Fonts.amiriBold,
    color: "#fff",
    textAlign: "center",
    lineHeight: 28,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  authorContainer: {
    marginTop: theme.Spacing.xs,
    paddingTop: theme.Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
  },
  bookAuthor: {
    fontSize: 11,
    fontFamily: theme.Fonts.amiriRegular,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: theme.Spacing.sm,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  statText: {
    fontSize: 11,
    fontFamily: theme.Fonts.amiriBold,
    color: "#fff",
  },
});

export default HadithHome;
