import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import root from "../constants/root.jsx";
import { useRouter } from "expo-router";
const { Colors, Fonts, FontSizes, Spacing, BorderRadius } = root;

const getHijriDate = () => {
  const today = new Date();

  const formatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return formatter.format(today);
};

const eltahiat = () => {
  if (new Date().getHours() < 12) {
    return "صبحك الله بالخير";
  }
  return "مساك الله بالخير";
};

const HomePage = () => {
  const router = useRouter();
  const [hijriDate, setHijriDate] = useState(getHijriDate());
  const [greeting, setGreeting] = useState(eltahiat());

  useEffect(() => {
    const update = () => {
      setGreeting(eltahiat());
      setHijriDate(getHijriDate());
    };

    update();

    const interval = setInterval(update, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.icon}>🔔</Text>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.verseCard}>
          <Text style={styles.verseArabic}>
            ﴿ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُدَّكِرٍ﴾
          </Text>
          <Text style={styles.verseReference}>سورة القمر - الآية ١٧</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ميزات سريعة</Text>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => router.push("/Quran/Quran")}
            activeOpacity={0.8}
          >
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🎙️</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>تسميع القرآن الكريم</Text>
              <Text style={styles.featureSubtitle}>ابدأ التسجيل الآن</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => router.push("/Hadith/HadithHome")}
            activeOpacity={0.8}
          >
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>📖</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle} > جامع كتب الأحاديث </Text>
              <Text style={styles.featureSubtitle}>تصفح الأحاديث</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGray,
  },
  headerCenter: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  headerTextContainer: {
    alignItems: "flex-end",
  },
  headerLogo: {
    width: Spacing.xxl,
    height: Spacing.xxl,
    resizeMode: "contain",
  },
  headerTitle: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Colors.primaryDark,
    fontFamily: Fonts.amiriBold,
  },
  headerSubTitle: {
    fontSize: FontSizes.small,
    color: Colors.textGray,
    fontFamily: Fonts.cairoRegular,
  },
  iconButton: {
    width: Spacing.xl,
    height: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: FontSizes.h3,
  },
  content: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  verseCard: {
    backgroundColor: Colors.primaryDark,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  verseArabic: {
    fontSize: FontSizes.quranText,
    color: Colors.white,
    textAlign: "center",
    marginBottom: Spacing.sm,
    fontFamily: Fonts.amiriRegular,
    lineHeight: Spacing.xl,
  },
  verseReference: {
    fontSize: FontSizes.small,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: Fonts.cairoRegular,
  },
  section: {
    marginTop: Spacing.mdd,
    paddingHorizontal: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.body,
    fontWeight: "700",
    color: Colors.darkGray,
    marginBottom: Spacing.md,
    fontFamily: Fonts.cairoBold,
    alignSelf: "flex-end",
  },
  featureCard: {
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: BorderRadius.md,
    elevation: 3,
  },
  featureIcon: {
    width: Spacing.xxxl,
    height: Spacing.xxxl,
    backgroundColor: Colors.mediumGray,
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
  },
  featureTitle: {
    fontSize: FontSizes.body,
    fontWeight: "700",
    color: Colors.darkGray,
    marginBottom: 4,
    fontFamily: Fonts.cairoBold,
  },
  featureSubtitle: {
    fontSize: FontSizes.small,
    color: Colors.textGray,
    fontFamily: Fonts.cairoRegular,
  },
});

export default HomePage;
