import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import root from "../constants/root.jsx";
const { width } = Dimensions.get("window");

const { Fonts, FontSizes, Spacing, BorderRadius, Tcolors } = root;

export function ErrorBanner({ error, onDismiss, onRetry }) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -80,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error, translateY, opacity]);

  if (!error) return null;

  const isLocation =
    error.toLowerCase().includes("location") ||
    error.toLowerCase().includes("permission");
  const isNetwork =
    error.toLowerCase().includes("network") ||
    error.toLowerCase().includes("fetch") ||
    error.toLowerCase().includes("failed");

  const icon = isLocation
    ? "location-outline"
    : isNetwork
      ? "wifi-outline"
      : "alert-circle-outline";

  const message = isLocation
    ? "تعذّر الوصول إلى الموقع"
    : isNetwork
      ? "لا يوجد اتصال بالإنترنت"
      : "حدث خطأ غير متوقع";

  const sub = isLocation
    ? "سيتم عرض آخر مواقيت الصلاة المحفوظة."
    : isNetwork
      ? "سيتم عرض آخر مواقيت الصلاة المحفوظة."
      : "اسحب لأسفل لإعادة المحاولة.";

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY }], opacity }]}
      pointerEvents="box-none"
    >
      <View style={styles.bannerInner}>
        <View style={styles.bannerIconWrap}>
          <Ionicons name={icon} size={18} color={Tcolors.recordingRed} />
        </View>

        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>{message}</Text>
          <Text style={styles.bannerSub} numberOfLines={1}>
            {sub}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bannerClose}
          onPress={onDismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={16} color={Tcolors.secondaryText} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 90,
    left: Spacing.xl,
    right: Spacing.xl,
    width: "80%",
    zIndex: 99,
  },
  bannerInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0c1520",
    borderWidth: 1,
    borderColor: "rgba(245, 23, 11, 0.35)",
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bannerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(245, 85, 11, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
    flexShrink: 0,
  },
  bannerText: {
    flex: 1,
    alignItems: "center",
  },
  bannerTitle: {
    fontFamily: Fonts.cairoBold,
    fontSize: FontSizes.small + 1,
    color: Tcolors.recordingRed,
    textAlign: "right",
  },
  bannerSub: {
    fontFamily: Fonts.cairoRegular,
    fontSize: FontSizes.small - 1,
    color: Tcolors.secondaryText,
    marginTop: 2,
    textAlign: "right",
  },
  bannerClose: {
    padding: 2,
    flexShrink: 0,
  },
});

export const PRAYERS = [
  {
    key: "Fajr",
    arabic: "الفجر",
    icon: "sunny-outline",
  },
  {
    key: "Dhuhr",
    arabic: "الظهر",
    icon: "sunny",
  },
  {
    key: "Asr",
    arabic: "العصر",
    icon: "partly-sunny-outline",
  },
  {
    key: "Maghrib",
    arabic: "المغرب",
    icon: "sunny-outline",
  },
  {
    key: "Isha",
    arabic: "العشاء",
    icon: "moon-outline",
  },
];

export const getHijriDate = () =>
  new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

export const getGreeting = () =>
  new Date().getHours() < 12 ? "صبحك الله بالخير" : "مساك الله بالخير";

export const FEATURES = [
  {
    icon: require("../../assets/images/quran.png"),
    title: "القرآن الكريم",
    route: "/Quran/Quran",
  },
  {
    icon: require("../../assets/images/library.png"),
    title: "كتب الأحاديث",
    route: "/Hadith/HadithHome",
  },
  {
    icon: require("../../assets/images/mosque.png"),
    title: "الصلاة",
    route: "/ForPray/prayTimes",
  },
  {
    icon: require("../../assets/images/compass.png"),
    title: "القبلة",
    route: "/ForPray/QiblaCompass",
  },
  {
    icon: require("../../assets/images/beads.png"),
    title: "الأذكار",
    route: "/components/azkar",
  },
  {
    icon: require("../../assets/images/application.png"),
    title: "المزيد",
    route: "/MorePage/more",
  },
];

export default function StarField() {
  const stars = Array.from({ length: 30 }, () => ({
    x: Math.random() * width,
    y: Math.random() * 160,
    r: Math.random() * 1.2 + 0.3,
    opacity: Math.random() * 0.5 + 0.1,
  }));
  return (
    <View pointerEvents="none">
      {stars.map((s, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.r * 2,
            height: s.r * 2,
            borderRadius: s.r,
            backgroundColor: `rgba(255,255,255,${s.opacity})`,
          }}
        />
      ))}
    </View>
  );
}

/////////////////////////////////////// Qibla page ///////////////////////////////////////

export const KAABA_LAT = 21.4225;
export const KAABA_LON = 39.8262;

export function getQiblaBearing(userLat, userLon) {
  const φ1 = (userLat * Math.PI) / 180;
  const φ2 = (KAABA_LAT * Math.PI) / 180;
  const Δλ = ((KAABA_LON - userLon) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/////////////////////////////////////// more page ////////////////////////////////////////

export const HIJRI_MONTH_NAMES = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

export function getHijriInfo() {
  const today = new Date();

  const formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  const parts = formatter.formatToParts(today);
  const day = parseInt(parts.find((p) => p.type === "day").value, 10);
  const month = parseInt(parts.find((p) => p.type === "month").value, 10);
  const year = parseInt(parts.find((p) => p.type === "year").value, 10);

  const daysInMonth = (() => {
    let probe = new Date(today);
    probe.setDate(probe.getDate() - (day - 1));
    const firstOfMonth = new Date(probe);

    let count = 0;
    let cursor = new Date(firstOfMonth);
    while (count < 31) {
      const p = formatter.formatToParts(cursor);
      const m = parseInt(p.find((x) => x.type === "month").value, 10);
      if (m !== month) break;
      count++;
      cursor.setDate(cursor.getDate() + 1);
    }
    return count;
  })();

  const firstOfMonthDate = new Date(today);
  firstOfMonthDate.setDate(firstOfMonthDate.getDate() - (day - 1));
  const firstWeekday = firstOfMonthDate.getDay();

  return {
    day,
    month,
    year,
    daysInMonth,
    firstWeekday,
    monthName: HIJRI_MONTH_NAMES[month - 1],
  };
}

export const SECTIONS = [
  {
    label: "العبادات والأذكار",
    items: [
      {
        icon: "🤲",
        iconBg: "#E1F5EE",
        title: "الأدعية",
        // route: "/Dua",
        badge: "قريباً",
      },
      {
        icon: "📱",
        iconBg: "#EEEDFE",
        title: "السبحة ",
        route: "/MorePage/Tasbih",
      },
    ],
  },
  {
    label: "القرآن الكريم",
    items: [
      {
        icon: "📖",
        iconBg: "#FAEEDA",
        title: "ختمة القرآن",
        sub: "تابع تقدمك اليومي ونسبة الإنجاز",
        // route: "/Khatma/Khatma",
        badge: "قريباً",
      },
    ],
  },
  {
    label: "أدوات إسلامية",
    items: [
      {
        icon: "✨",
        iconBg: "#FBEAF0",
        title: "أسماء الله الحسنى",
        sub: "الاسم، المعنى، والشرح مع البحث",
        route: "/MorePage/AsmaAllah",
      },
      {
        icon: "📅",
        iconBg: "#F1EFE8",
        title: "التقويم الهجري",
        sub: "التاريخ، الشهر، والأيام المهمة",
        route: "modal:hijri",
      },
    ],
  },
];

export const DONATIONS = [
  {
    icon: "🌙",
    iconBg: "#FCEBEB",
    title: "الهلال الأحمر المصري",
    sub: "إغاثة إنسانية عاجلة",
    url: "https://egyptianrcs.org/",
  },
  {
    icon: "❤️",
    iconBg: "#FBEAF0",
    title: "الهلال الأحمر الفلسطيني",
    sub: "دعم الطوارئ والإسعاف",
    url: "https://www.palestinercs.org/en/Donate",
  },
  {
    icon: "🇪🇬",
    iconBg: "#E8F3EA",
    title: "بنك الطعام المصري",
    sub: "مساعدات غذائية لغزة",
    url: "https://www.efb.eg/",
  },
  {
    icon: "🕊",
    iconBg: "#FCEBEB",
    title: "الأونروا",
    sub: "تبرع مباشر لدعم الفلسطينيين",
    url: "https://www.unrwa.org/donate",
  },
  {
    icon: "🌍",
    iconBg: "#E1F0FB",
    title: "أطباء بلا حدود",
    sub: "دعم طبي عاجل لغزة",
    url: "https://www.msf.org/donate",
  },
  {
    icon: "🤝",
    iconBg: "#EEEDFE",
    title: "إعانة (Islamic Relief)",
    sub: "إغاثة إنسانية شاملة",
    url: "https://www.islamic-relief.org/donate/",
  },
];

export const IMPORTANT_HIJRI_DATES = [
  { day: 1, month: 1, label: "رأس السنة الهجرية" },
  { day: 10, month: 1, label: "عاشوراء" },
  { day: 1, month: 9, label: "بداية رمضان" },
  { day: 27, month: 9, label: "ليلة القدر (الأرجح)" },
  { day: 1, month: 10, label: "عيد الفطر" },
  { day: 9, month: 12, label: "يوم عرفة" },
  { day: 10, month: 12, label: "عيد الأضحى" },
];

export const WEEKDAY_LABELS = [
  "أحد",
  "إثنين",
  "ثلاثاء",
  "أربعاء",
  "خميس",
  "جمعة",
  "سبت",
];
