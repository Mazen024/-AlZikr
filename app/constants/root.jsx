// eslint-disable-next-line no-unused-vars
const fontAssets = {
  UthmanicHafs: require("../../assets/fonts/uthmanic_hafs_v22.ttf"),
};

const BOOK_PALETTES = [
  ["#1a2e4a", "#0d1a2e"],
  ["#2a1a0e", "#160d06"],
  ["#1a2a1a", "#0e160e"],
  ["#2e1a2e", "#1a0d1a"],
  ["#2e2a0e", "#1a160a"],
  ["#0e2a2e", "#06161a"],
  ["#2e1a1a", "#1a0d0d"],
  ["#1a1a2e", "#0d0d1a"],
  ["#1e2a1a", "#10160e"],
  ["#2a1e0e", "#160f06"],
];

const Tcolors = {
  quranbackground: "#F8F1E4",

  ACCENT: "#4eca8b",
  BG_DARK: "#0c1520",

  // ===== Background Colors =====
  primaryBackground: "#0c1520", // الخلفية الرئيسية الداكنة
  secondaryBackground: "#111e2d", // خلفية ثانوية للعناصر الداخلية
  heroGradientStart: "#1a3a5c", // بداية التدرج اللوني للهيدر
  heroGradientEnd: "#0d2137", // نهاية التدرج اللوني للهيدر

  // ===== Primary Brand Colors =====
  primaryLight: "#2d9c7a", // اللون الأساسي الأخضر الفاتح
  primaryDark: "#0a4d3c",
  accentGreen: "#1a7a5e",
  primaryLightTransparent: "rgba(78,202,139,0.10)", // نسخة شفافة من اللون الأساسي

  // ===== Basic Colors =====
  white: "#ffffff",
  black: "#000000",
  transparent: "#ffffff00",

  // ===== Text Colors =====
  primaryText: "rgba(255,255,255,0.85)", // النص الرئيسي
  secondaryText: "rgba(255,255,255,0.45)", // النص الثانوي
  tertiaryText: "rgba(255,255,255,0.25)", // النص الخافت

  // ===== Card Colors =====
  cardBackground: "rgba(255,255,255,0.05)", // خلفية البطاقات
  cardBorder: "rgba(255,255,255,0.08)", // حدود البطاقات

  // ===== Pill / Badge Colors =====
  pillBorder: "rgba(255,255,255,0.12)", // حدود العناصر الصغيرة

  // ===== Status Colors =====
  recordingRed: "#dc2626",
  warningYellow: "#f59e0b",
  successGreen: "#10b981",

  // ===== Other Existing App Colors =====
  lightGray: "#f7fafc",
  mediumGray: "#e2e8f0",
  darkGray: "#2d3748",
  textGray: "#718096",

  border: "rgba(78,202,139,0.12)",
  borderBright: "rgba(78,202,139,0.35)",
  goldLight: "#7edba8",
  goldDim: "rgba(78,202,139,0.45)",
  textSub: "rgba(255, 255, 255, 0.38)",
  textMid: "rgba(255,255,255,0.65)",
};

const Fonts = {
  cairoLight: "Cairo-Light",
  cairoRegular: "Cairo-Regular",
  cairoBold: "Cairo-Bold",

  amiriRegular: "Amiri-Regular",
  amiriBold: "Amiri-Bold",
  quranText: "UthmanicHafs",
};

const FontSizes = {
  h1: 40,
  h2: 28,
  h3: 22,
  body: 18,
  small: 12,
  quranText: 20,
};

const Spacing = {
  xs: 8,
  sm: 12,
  md: 18,
  mdd: 24,
  lg: 30,
  xl: 36,
  xxl: 50,
  xxxl: 56,
};

const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  circular: 50,
};

export default {
  Fonts,
  FontSizes,
  Spacing,
  BorderRadius,
  Tcolors,
  BOOK_PALETTES,
};
