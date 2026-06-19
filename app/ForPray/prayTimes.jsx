import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePrayerContext } from "../../context/PrayerContext";
import {
  formatTo12,
  getCountdown,
  getDayProgress,
} from "../../hooks/usePrayerTimes";
import StarField from "../constants/homeConstants";
import root from "../constants/root";

const PRAYER_META = {
  Fajr: { label: "Dawn prayer", icon: "☽", arabic: "الفجر" },
  Sunrise: { label: "Shuruq", icon: "◎", arabic: "الشروق" },
  Dhuhr: { label: "Midday prayer", icon: "☀", arabic: "الظهر" },
  Asr: { label: "Afternoon prayer", icon: "◑", arabic: "العصر" },
  Maghrib: { label: "Sunset prayer", icon: "◐", arabic: "المغرب" },
  Isha: { label: "Night prayer", icon: "★", arabic: "العشاء" },
};

const PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

function PrayerRow({ name, time, isNext, index, isTomorrow }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const meta = PRAYER_META[name] || {};

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, index, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.prayerRow,
        isNext && styles.prayerRowActive,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {isNext && <View style={styles.activeBar} />}
      <View style={[styles.iconBox, isNext && styles.iconBoxActive]}>
        <Text
          style={[styles.iconText, isNext && { color: root.Tcolors.ACCENT }]}
        >
          {meta.icon}
        </Text>
      </View>
      <View style={styles.prayerInfo}>
        <Text
          style={[styles.prayerName, isNext && { color: root.Tcolors.ACCENT }]}
        >
          {name}
        </Text>
        <Text style={styles.prayerSub}>{meta.label}</Text>
      </View>
      <View style={styles.prayerRight}>
        <Text
          style={[styles.prayerTime, isNext && { color: root.Tcolors.ACCENT }]}
        >
          {formatTo12(time)}
        </Text>
        {isNext && (
          <Text style={styles.prayerCountdown}>
            {getCountdown(time, isTomorrow)}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

export default function PrayTimes() {
  const {
    prayerTimes,
    nextPrayer,
    cityName,
    loading,
    refreshing,
    error,
    isStale,
    refresh,
    retry,
  } = usePrayerContext();

  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!prayerTimes) return;
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [prayerTimes, heroAnim]);

  if (loading)
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={root.Tcolors.ACCENT} />
        <Text style={styles.loadingText}>Locating you…</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={retry}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );

  const dayPct = getDayProgress();
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={root.Tcolors.ACCENT}
          />
        }
      >
        <LinearGradient
          colors={[
            root.Tcolors.secondaryBackground,
            root.Tcolors.heroGradientStart,
          ]}
          style={styles.hero}
        >
          <StarField />
          <Animated.View style={[styles.heroInner, { opacity: heroAnim }]}>
            <View style={styles.heroTop}>
              <View style={styles.locationPill}>
                <View style={styles.dot} />
                <Text style={styles.locationText}>{cityName}</Text>
              </View>
              <Text style={styles.dateText}>{dateStr}</Text>
            </View>

            {isStale && (
              <View style={styles.staleBanner}>
                <Text style={styles.staleText}>
                  ⚠ Offline — showing last saved prayer times, may be outdated
                </Text>
              </View>
            )}

            {nextPrayer && (
              <View style={styles.nextBlock}>
                <Text style={styles.nextLabel}>NEXT PRAYER</Text>
                <Text style={styles.nextName}>{nextPrayer.name}</Text>
                <Text style={styles.nextTime}>
                  {formatTo12(nextPrayer.time)} ·{" "}
                  {getCountdown(nextPrayer.time, nextPrayer.isTomorrow)}
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[styles.progressFill, { width: `${dayPct * 100}%` }]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  Day {Math.round(dayPct * 100)}% complete
                </Text>
              </View>
            )}
          </Animated.View>
        </LinearGradient>

        <View style={styles.list}>
          {PRAYERS.map((name, i) => (
            <React.Fragment key={name}>
              <PrayerRow
                name={name}
                time={prayerTimes?.[name]}
                isNext={nextPrayer?.name === name}
                index={i}
                isTomorrow={
                  nextPrayer?.name === name ? nextPrayer.isTomorrow : false
                }
              />
              {i < PRAYERS.length - 1 && <View style={styles.separator} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: root.Tcolors.BG_DARK },
  scroll: { flex: 1 },
  center: {
    flex: 1,
    backgroundColor: root.Tcolors.BG_DARK,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 8 },
  errorIcon: { fontSize: 32, color: "#e05c5c", marginBottom: 4 },
  errorText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  retryText: { color: root.Tcolors.ACCENT, fontSize: 14 },

  hero: {
    paddingTop: 56,
    paddingBottom: 36,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  heroInner: {},
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: root.Tcolors.ACCENT,
  },
  locationText: { color: "rgba(255,255,255,0.65)", fontSize: 12 },
  dateText: { color: "rgba(255,255,255,0.35)", fontSize: 12 },

  staleBanner: {
    backgroundColor: "rgba(224,92,92,0.12)",
    borderWidth: 0.5,
    borderColor: "rgba(224,92,92,0.3)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 18,
  },
  staleText: {
    fontSize: 11.5,
    color: "#e8a3a3",
    lineHeight: 16,
  },

  nextBlock: {},
  nextLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: "rgba(255,255,255,0.38)",
    marginBottom: 2,
  },
  nextName: {
    fontSize: 38,
    fontWeight: "300",
    color: "#fff",
    letterSpacing: -1,
    lineHeight: 44,
  },
  nextTime: {
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 18,
    marginTop: 2,
  },
  progressTrack: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: root.Tcolors.ACCENT,
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 11,
    color: root.Tcolors.ACCENT,
    letterSpacing: 0.44,
  },

  list: { backgroundColor: root.Tcolors.BG_DARK, paddingTop: 12 },
  prayerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 13,
    position: "relative",
  },
  prayerRowActive: { backgroundColor: "rgba(78,202,139,0.06)" },
  activeBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: root.Tcolors.ACCENT,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconBoxActive: { backgroundColor: "rgba(78,202,139,0.1)" },
  iconText: { fontSize: 16, color: "rgba(255,255,255,0.35)" },
  prayerInfo: { flex: 1 },
  prayerName: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.82)",
    marginBottom: 2,
  },
  prayerSub: { fontSize: 11, color: "rgba(255,255,255,0.28)" },
  prayerRight: { alignItems: "flex-end" },
  prayerTime: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 0.2,
  },
  prayerCountdown: {
    fontSize: 10,
    color: root.Tcolors.ACCENT,
    marginTop: 2,
    letterSpacing: 0.4,
  },
  separator: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
  },
});
