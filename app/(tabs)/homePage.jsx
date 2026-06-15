import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import root from "../constants/root.jsx";

const { Fonts, FontSizes, Spacing, BorderRadius, Tcolors } = root;

const getHijriDate = () =>
  new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

const getGreeting = () =>
  new Date().getHours() < 12 ? "صبحك الله بالخير" : "مساك الله بالخير";

function FeatureCard({ emoji, title, subtitle, onPress, index }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 340,
        delay: 300 + index * 70,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 340,
        delay: 300 + index * 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, index, slide]);

  return (
    <Animated.View
      style={{ opacity: fade, transform: [{ translateY: slide }] }}
    >
      <TouchableOpacity
        style={styles.featureCard}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={styles.featureIcon}>
          <Text style={styles.featureEmoji}>{emoji}</Text>
        </View>
        <View style={styles.featureText}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureSubtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const HomePage = () => {
  const router = useRouter();
  const [hijriDate, setHijriDate] = useState(getHijriDate());
  const [greeting, setGreeting] = useState(getGreeting());
  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const update = () => {
      setGreeting(getGreeting());
      setHijriDate(getHijriDate());
    };
    update();
    const iv = setInterval(update, 60_000);
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
    return () => clearInterval(iv);
  }, [heroAnim]);

  const FEATURES = [
    {
      emoji: "🎙️",
      title: "تسميع القرآن الكريم",
      subtitle: "ابدأ التسجيل الآن",
      route: "/Quran/Quran",
    },
    {
      emoji: "📖",
      title: "جامع كتب الأحاديث",
      subtitle: "تصفح الأحاديث",
      route: "/Hadith/HadithHome",
    },
    {
      emoji: "⏰",
      title: "توقيت الصلاة",
      subtitle: "اعرف أوقات الصلاة",
      route: "/ForPray/prayTimes",
    },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.bellBtn}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.headerLogo}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{greeting}</Text>
            <Text style={styles.headerSubTitle}>{hijriDate}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Tcolors.heroGradientStart, Tcolors.heroGradientEnd]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.hero}
        >
          <Animated.View style={{ opacity: heroAnim }}>
            <View style={styles.verseInner}>
              <Text style={styles.verseArabic}>
                ﴿ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُدَّكِرٍ
                ﴾
              </Text>
              <View style={styles.verseDivider} />
              <Text style={styles.verseReference}>سورة القمر — الآية ١٧</Text>
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ميزات سريعة</Text>

          {FEATURES.map((f, i) => (
            <FeatureCard
              key={f.route}
              emoji={f.emoji}
              title={f.title}
              subtitle={f.subtitle}
              onPress={() => router.push(f.route)}
              index={i}
            />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Tcolors.primaryBackground,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.mdd,
    backgroundColor: Tcolors.secondaryBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: Tcolors.cardBorder,
  },

  headerCenter: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  headerTextContainer: {
    alignItems: "flex-end",
  },

  headerLogo: {
    width: Spacing.xxl,
    height: Spacing.xxl,
    borderRadius: BorderRadius.circular,
    resizeMode: "contain",
  },

  headerTitle: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Tcolors.white,
    fontFamily: Fonts.amiriBold,
  },

  headerSubTitle: {
    fontSize: FontSizes.small,
    color: Tcolors.secondaryText,
    fontFamily: Fonts.cairoRegular,
  },

  bellBtn: {
    width: Spacing.xl,
    height: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Tcolors.pillBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 0.5,
    borderColor: Tcolors.pillBorder,
  },

  bellIcon: {
    fontSize: FontSizes.body,
  },

  scroll: { flex: 1 },

  hero: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    overflow: "hidden",
  },

  verseInner: {
    alignItems: "center",
  },

  verseArabic: {
    fontSize: FontSizes.quranText,
    color: Tcolors.white,
    textAlign: "center",
    fontFamily: Fonts.amiriRegular,
    lineHeight: Spacing.xl + 8,
    marginBottom: Spacing.sm,
  },

  verseDivider: {
    width: 40,
    height: 1,
    backgroundColor: Tcolors.primaryLight,
    borderRadius: 1,
    marginVertical: Spacing.sm,
    opacity: 0.6,
  },

  verseReference: {
    fontSize: FontSizes.small,
    color: Tcolors.primaryLight,
    fontFamily: Fonts.cairoRegular,
  },

  section: {
    marginTop: Spacing.mdd ?? Spacing.md,
    paddingHorizontal: Spacing.md,
  },

  sectionTitle: {
    fontSize: FontSizes.body,
    fontWeight: "700",
    color: Tcolors.tertiaryText,
    marginBottom: Spacing.md,
    fontFamily: Fonts.cairoBold,
    alignSelf: "flex-end",
    letterSpacing: 0.5,
  },

  featureCard: {
    backgroundColor: Tcolors.cardBackground,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 0.5,
    borderColor: Tcolors.cardBorder,
    position: "relative",
    overflow: "hidden",
  },

  featureIcon: {
    width: Spacing.xxxl,
    height: Spacing.xxxl,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },

  featureEmoji: {
    fontSize: FontSizes.h2,
  },

  featureText: {
    flex: 1,
    alignItems: "flex-end",
  },

  featureTitle: {
    fontSize: FontSizes.body,
    fontWeight: "700",
    color: Tcolors.primaryText,
    marginBottom: 3,
    fontFamily: Fonts.cairoBold,
    textAlign: "right",
  },

  featureSubtitle: {
    fontSize: FontSizes.small,
    color: Tcolors.primaryLight,
    fontFamily: Fonts.cairoRegular,
    textAlign: "right",
  },

  chevron: {
    fontSize: 22,
    color: Tcolors.tertiaryText,
    marginLeft: Spacing.sm,
  },
});

export default HomePage;
