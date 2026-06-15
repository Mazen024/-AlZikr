import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getBooks } from "../../service/hadithService";
import theme from "../constants/root";

const { width } = Dimensions.get("window");

const BOOK_PALETTES = theme.BOOK_PALETTES;

const FAMOUS_HADITHS = [
  {
    text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
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
    ref: "رواه الترمذي",
  },
  {
    text: "الْحَيَاءُ شُعْبَةٌ مِنَ الإِيْمَانِ",
    ref: "رواه البخاري ومسلم",
  },
];

function BookCard({ item, index, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const palette = BOOK_PALETTES[index % BOOK_PALETTES.length];

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
    }).start();

  const handlePressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[styles.bookCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <LinearGradient
          colors={palette}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bookGradient}
        >
          <Text style={styles.cornerOrnTL}>✦</Text>
          <Text style={styles.cornerOrnBR}>✦</Text>

          <View style={styles.bookTopLine} />

          <View style={styles.bookInner}>
            <Text style={styles.bookIndexNum}>
              {(index + 1).toLocaleString("ar")}
            </Text>
            <Text style={styles.bookTitleCard} numberOfLines={3}>
              {item.title}
            </Text>
            <Text style={styles.bookAuthorCard} numberOfLines={1}>
              {item.author}
            </Text>
          </View>

          <View style={styles.bookStats}>
            <View style={styles.statChip}>
              <Text style={styles.statVal}>
                {item.hadithCount.toLocaleString("ar")}
              </Text>
              <Text style={styles.statKey}>حديث</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statVal}>
                {item.chapterCount.toLocaleString("ar")}
              </Text>
              <Text style={styles.statKey}>باب</Text>
            </View>
          </View>

          {/* Gold border line bottom */}
          <View style={styles.bookBottomLine} />
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function HadithHome() {
  const [books, setBooks] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;
  const headerFade = useRef(new Animated.Value(0)).current;

  const router = useRouter();

  useEffect(() => {
    loadBooks();
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
    animateVerse();
  }, [animateVerse, headerFade]);

  const loadBooks = async () => {
    const data = await getBooks();
    setBooks(data);
  };

  const animateVerse = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(14);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIdx((p) => (p + 1) % FAMOUS_HADITHS.length);
      animateVerse();
    }, 6000);
    return () => clearInterval(id);
  }, [animateVerse]);

  const handleBookPress = (book) =>
    router.push({
      pathname: "/Hadith/HadithReader",
      params: { bookId: book.id },
    });

  const hadith = FAMOUS_HADITHS[currentIdx];

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <Animated.View style={[styles.header, { opacity: headerFade }]}>
          <LinearGradient
            colors={[
              theme.Tcolors.heroGradientStart,
              theme.Tcolors.primaryBackground,
            ]}
            style={styles.headerGrad}
          >
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>ﷺ</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.headerTitle}>جامع كتب الأحاديث</Text>
                <Text style={styles.headerSub}>
                  {books.length.toLocaleString("ar")} كتاب · المكتبة النبوية
                </Text>
              </View>
              <View style={styles.iconCircle}>
                <Ionicons name="library" size={20} color={theme.Tcolors.gold} />
              </View>
            </View>
          </LinearGradient>
          <View style={styles.headerUnderline} />
        </Animated.View>

        <View style={styles.heroWrap}>
          <LinearGradient
            colors={["#0e1825", "#07090f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={[styles.frameCorner, styles.frameTL]} />
            <View style={[styles.frameCorner, styles.frameTR]} />
            <View style={[styles.frameCorner, styles.frameBL]} />
            <View style={[styles.frameCorner, styles.frameBR]} />

            <Animated.View
              style={[
                styles.heroContent,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <Text style={styles.heroIntroLabel}>قال رسول الله</Text>
              <Text style={styles.heroProphetSymbol}>ﷺ</Text>

              <View style={styles.heroDivider} />

              <Text style={styles.heroText}>{hadith.text}</Text>

              <View style={styles.heroDivider} />

              <View style={styles.heroRefRow}>
                <View style={styles.heroRefLine} />
                <Text style={styles.heroRef}>{hadith.ref}</Text>
                <View style={styles.heroRefLine} />
              </View>
            </Animated.View>
          </LinearGradient>
        </View>

        <View style={styles.sectionHead}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionTitle}>الكتب</Text>
          <View style={styles.sectionLine} />
        </View>

        <FlatList
          data={books}
          renderItem={({ item, index }) => (
            <BookCard item={item} index={index} onPress={handleBookPress} />
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.Tcolors.primaryBackground,
  },
  header: {
    marginBottom: 0,
  },
  headerGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 16,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(212,175,90,0.1)",
    borderWidth: 1,
    borderColor: theme.Tcolors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    color: theme.Tcolors.white,
    fontFamily: theme.Fonts.amiriBold,
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 12,
    color: theme.Tcolors.textSub,
    fontFamily: theme.Fonts.cairoRegular,
    marginTop: 2,
  },
  headerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(212,175,90,0.08)",
    borderWidth: 1,
    borderColor: theme.Tcolors.borderBright,
    justifyContent: "center",
    alignItems: "center",
  },
  headerBadgeText: { fontSize: 18, color: theme.Tcolors.gold },
  headerUnderline: {
    height: 1,
    backgroundColor: theme.Tcolors.border,
    marginHorizontal: 20,
  },

  // Hero
  heroWrap: { margin: 16, borderRadius: 20, overflow: "hidden" },
  hero: {
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.Tcolors.border,
    overflow: "hidden",
    minHeight: 200,
    justifyContent: "center",
  },

  frameCorner: {
    position: "absolute",
    width: 16,
    height: 16,
    borderColor: theme.Tcolors.goldDim,
  },
  frameTL: {
    top: 12,
    left: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  frameTR: {
    top: 12,
    right: 12,
    borderTopWidth: 1,
    borderRightWidth: 1,
  },
  frameBL: {
    bottom: 12,
    left: 12,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },
  frameBR: {
    bottom: 12,
    right: 12,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },

  heroContent: { alignItems: "center" },
  heroIntroLabel: {
    fontSize: 12,
    color: theme.Tcolors.textSub,
    fontFamily: theme.Fonts.cairoRegular,
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroProphetSymbol: {
    fontSize: 28,
    color: theme.Tcolors.gold,
    marginBottom: 4,
  },
  heroDivider: {
    width: 48,
    height: 1,
    backgroundColor: theme.Tcolors.borderBright,
    marginVertical: 14,
    borderRadius: 1,
  },
  heroText: {
    fontSize: 18,
    color: theme.Tcolors.white,
    fontFamily: theme.Fonts.amiriBold,
    textAlign: "center",
    lineHeight: 30,
    paddingHorizontal: 8,
  },
  heroRefRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  heroRefLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: theme.Tcolors.borderBright,
    maxWidth: 40,
  },
  heroRef: {
    fontSize: 11,
    color: theme.Tcolors.gold,
    fontFamily: theme.Fonts.cairoRegular,
  },

  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 15,
  },
  sectionLine: { flex: 1, height: 0.5, backgroundColor: theme.Tcolors.border },
  sectionTitle: {
    fontSize: 13,
    color: theme.Tcolors.gold,
    fontFamily: theme.Fonts.cairoBold,
    letterSpacing: 2,
  },

  // Book grid
  gridContent: { paddingHorizontal: 16, paddingBottom: 8 },
  gridRow: { justifyContent: "space-between", marginBottom: 12 },

  bookCard: {
    width: (width - 48) / 2,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.Tcolors.border,
  },
  bookGradient: {
    padding: 16,
    minHeight: 200,
    justifyContent: "space-between",
  },

  cornerOrnTL: {
    position: "absolute",
    top: 8,
    left: 8,
    fontSize: 8,
    color: "rgba(212,175,90,0.2)",
  },
  cornerOrnBR: {
    position: "absolute",
    bottom: 8,
    right: 8,
    fontSize: 8,
    color: "rgba(212,175,90,0.2)",
  },
  bookTopLine: {
    height: 0.5,
    backgroundColor: theme.Tcolors.borderBright,
    marginBottom: 12,
  },
  bookBottomLine: {
    height: 0.5,
    backgroundColor: theme.Tcolors.borderBright,
    marginTop: 10,
  },

  bookInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  bookIndexNum: {
    fontSize: 11,
    color: theme.Tcolors.goldDim,
    fontFamily: theme.Fonts.cairoRegular,
    letterSpacing: 1,
  },
  bookTitleCard: {
    fontSize: 17,
    color: theme.Tcolors.white,
    fontFamily: theme.Fonts.amiriBold,
    textAlign: "center",
    lineHeight: 26,
  },
  bookAuthorCard: {
    fontSize: 11,
    color: theme.Tcolors.textSub,
    fontFamily: theme.Fonts.amiriRegular,
    textAlign: "center",
  },

  bookStats: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 0,
    marginTop: 4,
  },
  statChip: { alignItems: "center", flex: 1 },
  statVal: {
    fontSize: 15,
    color: theme.Tcolors.gold,
    fontFamily: theme.Fonts.cairoBold,
  },
  statKey: {
    fontSize: 10,
    color: theme.Tcolors.textSub,
    fontFamily: theme.Fonts.cairoRegular,
    marginTop: 1,
  },
  statDivider: {
    width: 0.5,
    height: 24,
    backgroundColor: theme.Tcolors.border,
  },
});
