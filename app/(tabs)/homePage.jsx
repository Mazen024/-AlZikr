import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePrayerContext } from "../../context/PrayerContext.jsx";
import { formatTo12, getCountdown } from "../../hooks/usePrayerTimes";
import {
  ErrorBanner,
  FEATURES,
  getGreeting,
  getHijriDate,
  PRAYERS,
} from "../constants/homeConstants";
import root from "../constants/root.jsx";
const { Fonts, FontSizes, Spacing, BorderRadius, Tcolors } = root;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const GRID_GAP = Spacing.sm;
const GRID_COLUMNS = 3;
const GRID_CARD_SIZE =
  (SCREEN_WIDTH - Spacing.md * 2 - GRID_GAP * (GRID_COLUMNS - 1)) /
  GRID_COLUMNS;

function FeatureCard({ icon, title, onPress, index }) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 300,
        delay: 250 + index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay: 250 + index * 50,
        useNativeDriver: true,
        friction: 7,
        tension: 80,
      }),
    ]).start();
  }, [fade, index, scale]);

  return (
    <Animated.View
      style={[styles.gridItem, { opacity: fade, transform: [{ scale }] }]}
    >
      <TouchableOpacity
        style={styles.featureCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image source={icon} style={styles.featureIcon} />
        <Text style={styles.featureTitle} numberOfLines={2}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const HomePage = () => {
  const router = useRouter();
  const [hijriDate, setHijriDate] = useState(getHijriDate());
  const [greeting, setGreeting] = useState(getGreeting());
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const heroAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const {
    prayerTimes,
    nextPrayer,
    loading,
    error,
    refreshing,
    refresh,
    retry,
  } = usePrayerContext();

  const current = nextPrayer?.name;

  const isDayTime = ["Sunrise", "Dhuhr", "Asr"].includes(current);

  const heroBackground = isDayTime
    ? require("../../assets/images/praymorning.png")
    : require("../../assets/images/praynight.png");

  useEffect(() => {
    if (error) setBannerDismissed(false);
  }, [error]);

  useEffect(() => {
    const update = () => {
      setGreeting(getGreeting());
      setHijriDate(getHijriDate());
    };
    update();
    const iv = setInterval(update, 60_000);

    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => clearInterval(iv);
  }, [heroAnim, pulseAnim]);

  const nextPrayerInfo = PRAYERS.find(
    (prayer) => prayer.key === nextPrayer?.name,
  );

  if (loading && !prayerTimes) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Tcolors.ACCENT} />
        <Text style={styles.loadingText}>Locating you…</Text>
      </View>
    );
  }

  const showBanner = !!error && !bannerDismissed;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.headerLogo}
          />
          <View>
            <Text style={styles.headerTitle}>{greeting}</Text>
            <Text style={styles.headerSubTitle}>{hijriDate}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
          <Ionicons
            name="notifications-outline"
            size={20}
            color={Tcolors.primaryText}
          />
        </TouchableOpacity>
      </View>

      <ErrorBanner
        error={showBanner ? error : null}
        onDismiss={() => setBannerDismissed(true)}
        onRetry={() => {
          setBannerDismissed(true);
          retry();
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={Tcolors.ACCENT}
          />
        }
      >
        <Animated.View style={{ opacity: heroAnim }}>
          <ImageBackground
            source={heroBackground}
            resizeMode="cover"
            imageStyle={styles.heroImage}
            style={styles.hero}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroTopRow}>
                <View style={styles.livePill}>
                  <Animated.View
                    style={[
                      styles.liveDot,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  />
                  <Text style={styles.livePillText}>الصلاة القادمة</Text>
                </View>
              </View>

              {nextPrayer && (
                <View style={styles.nextRow}>
                  <View>
                    <Text style={styles.nextName}>
                      {nextPrayerInfo?.arabic || nextPrayer.name}
                    </Text>
                    <Text style={styles.nextTime}>
                      {formatTo12(nextPrayer.time)}
                    </Text>
                  </View>
                  <View style={styles.countdownChip}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={Tcolors.primaryLight}
                    />
                    <Text style={styles.remaining}>
                      {getCountdown(nextPrayer.time, nextPrayer.isTomorrow)}
                    </Text>
                  </View>
                </View>
              )}

              {!nextPrayer && (
                <View style={styles.heroPlaceholder}>
                  <Ionicons
                    name="time-outline"
                    size={28}
                    color="rgba(255,255,255,0.2)"
                  />
                  <Text style={styles.heroPlaceholderText}>
                    أوقات الصلاة غير متاحة
                  </Text>
                </View>
              )}

              <View style={styles.verseDivider} />
              <Text style={styles.verseArabic}>
                وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُدَّكِرٍ
              </Text>
            </View>
          </ImageBackground>
        </Animated.View>

        <Animated.View style={{ opacity: heroAnim }}>
          <View style={styles.prayerRow}>
            {PRAYERS.map((prayer, i) => {
              const isActive = nextPrayer?.name === prayer.key;
              return (
                <React.Fragment key={prayer.key}>
                  {i > 0 && <View style={styles.prayerDivider} />}
                  <View style={styles.prayerItem}>
                    <Ionicons
                      name={prayer.icon}
                      size={18}
                      color={
                        isActive
                          ? Tcolors.primaryLight
                          : "rgba(255,255,255,0.35)"
                      }
                    />
                    <Text
                      style={[
                        styles.prayerItemName,
                        isActive && styles.prayerItemActive,
                      ]}
                    >
                      {prayer.arabic}
                    </Text>
                    <Text
                      style={[
                        styles.prayerItemTime,
                        isActive && styles.prayerItemActive,
                      ]}
                    >
                      {prayerTimes
                        ? formatTo12(prayerTimes[prayer.key])
                        : "––:––"}
                    </Text>
                  </View>
                </React.Fragment>
              );
            })}
          </View>
        </Animated.View>

        <View style={styles.section}>
          <View style={styles.grid}>
            {FEATURES.map((f, i) => (
              <FeatureCard
                key={f.route}
                icon={f.icon}
                title={f.title}
                onPress={() => router.push(f.route)}
                index={i}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Tcolors.primaryBackground,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    direction: "rtl",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Tcolors.secondaryBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: Tcolors.cardBorder,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    backgroundColor: Tcolors.cardBorder,
    borderRadius: BorderRadius.md,
    borderWidth: 0.5,
    borderColor: Tcolors.pillBorder,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xl },

  center: {
    flex: 1,
    backgroundColor: Tcolors.BG_DARK,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 8 },
  errorIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(224,92,92,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  errorText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  retryBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  retryText: {
    color: Tcolors.ACCENT,
    fontSize: 14,
    fontWeight: "600",
  },

  hero: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    height: 230,
  },

  heroContent: {
    flex: 1,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },

  heroImage: {
    height: "100%",
    width: "100%",
  },

  heroTopRow: {
    flexDirection: "row-reverse",
    marginBottom: Spacing.sm,
  },

  livePill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.circular,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Tcolors.ACCENT,
  },

  livePillText: {
    fontSize: 12,
    color: Tcolors.white,
    fontFamily: Fonts.cairoRegular,
  },

  nextRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  nextName: {
    fontSize: 34,
    fontWeight: "300",
    color: "#fff",
    letterSpacing: -1,
    textAlign: "right",
  },

  nextTime: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    marginTop: 2,
    textAlign: "right",
  },

  countdownChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },

  remaining: {
    fontSize: 13,
    color: Tcolors.primaryLight,
    fontWeight: "600",
  },

  verseDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: Spacing.md,
  },

  verseArabic: {
    fontSize: FontSizes.quranText,
    color: Tcolors.white,
    textAlign: "center",
    fontFamily: Fonts.amiriRegular,
    lineHeight: Spacing.xl,
  },

  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridItem: {
    width: GRID_CARD_SIZE,
    marginBottom: GRID_GAP + 15,
  },

  featureCard: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: Tcolors.secondaryBackground,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 0.5,
    borderColor: Tcolors.cardBorder,
    gap: 6,
  },

  featureIcon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },

  featureTitle: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Tcolors.primaryLight,
    fontFamily: Fonts.cairoBold,
    textAlign: "center",
  },
  prayerRow: {
    flexDirection: "row",
    alignItems: "center",
    direction: "rtl",
    backgroundColor: Tcolors.secondaryBackground,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  prayerItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  prayerDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  prayerItemName: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontFamily: Fonts.cairoRegular,
  },
  prayerItemTime: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  prayerItemActive: {
    color: Tcolors.primaryLight,
  },
  heroPlaceholder: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  heroPlaceholderText: {
    fontFamily: Fonts.cairoRegular,
    fontSize: FontSizes.small,
    color: "rgba(255,255,255,0.25)",
  },
});
