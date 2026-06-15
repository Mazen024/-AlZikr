import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePrayerContext } from "../../context/PrayerContext";
import QiblaCompass from "./QiblaCompass";
const { width } = Dimensions.get("window");

const PRAYER_META = {
  Fajr: { label: "Dawn prayer", icon: "☽", arabic: "الفجر" },
  Sunrise: { label: "Shuruq", icon: "◎", arabic: "الشروق" },
  Dhuhr: { label: "Midday prayer", icon: "☀", arabic: "الظهر" },
  Asr: { label: "Afternoon prayer", icon: "◑", arabic: "العصر" },
  Maghrib: { label: "Sunset prayer", icon: "◐", arabic: "المغرب" },
  Isha: { label: "Night prayer", icon: "★", arabic: "العشاء" },
};

const PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

const ACCENT = "#4eca8b";
const BG_DARK = "#0c1520";
const HERO_TOP = "#1a3a5c";
const HERO_BTM = "#0d2137";

const CACHE_KEY = "prayer_cache";
const LOCATION_KEY = "prayer_location";

function parseTime(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function getNextPrayer(times) {
  const now = new Date();
  for (const name of PRAYERS) {
    const t = parseTime(times?.[name]);
    if (t && t > now) return { name, time: times[name] };
  }
  const tomorrowFajr = parseTime(times?.[PRAYERS[0]]);
  if (tomorrowFajr) {
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    const hh = String(tomorrowFajr.getHours()).padStart(2, "0");
    const mm = String(tomorrowFajr.getMinutes()).padStart(2, "0");
    return { name: PRAYERS[0], time: `${hh}:${mm}`, isTomorrow: true };
  }
  return { name: PRAYERS[0], time: times?.[PRAYERS[0]] };
}

function getDayProgress() {
  const now = new Date();
  return Math.min((now.getHours() * 60 + now.getMinutes()) / (24 * 60), 1);
}

function getCountdown(timeStr, isTomorrow = false) {
  const t = parseTime(timeStr);
  if (!t) return "";
  if (isTomorrow) t.setDate(t.getDate() + 1);
  const diff = t - new Date();
  if (diff <= 0) return "Now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
}

function formatTo12(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

async function loadCache() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { times, date } = JSON.parse(raw);
    if (date !== new Date().toDateString()) return null; // expired
    return times;
  } catch {
    return null;
  }
}

async function saveCache(times) {
  try {
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ times, date: new Date().toDateString() }),
    );
  } catch {}
}

async function loadLocation() {
  try {
    const raw = await AsyncStorage.getItem(LOCATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function saveLocation(coords, cityName) {
  try {
    await AsyncStorage.setItem(
      LOCATION_KEY,
      JSON.stringify({ coords, cityName }),
    );
  } catch {}
}

function StarField() {
  const stars = Array.from({ length: 30 }, () => ({
    x: Math.random() * width,
    y: Math.random() * 160,
    r: Math.random() * 1.2 + 0.3,
    opacity: Math.random() * 0.5 + 0.1,
  }));
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
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
        <Text style={[styles.iconText, isNext && { color: ACCENT }]}>
          {meta.icon}
        </Text>
      </View>
      <View style={styles.prayerInfo}>
        <Text style={[styles.prayerName, isNext && { color: ACCENT }]}>
          {name}
        </Text>
        <Text style={styles.prayerSub}>{meta.label}</Text>
      </View>
      <View style={styles.prayerRight}>
        <Text style={[styles.prayerTime, isNext && { color: ACCENT }]}>
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
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState("Loading…");
  const [coords, setCoords] = useState(null);
  const heroAnim = useRef(new Animated.Value(0)).current;
  const { setPrayerTime } = usePrayerContext();
  const hasFetched = useRef(false);

  const applyTimes = useCallback(
    (times) => {
      setPrayerTimes(times);
      setPrayerTime(times);
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    },
    [setPrayerTime, heroAnim],
  );

  const fetchFromNetwork = useCallback(
    async (lat, lon, isRefresh = false) => {
      const today = new Date();
      const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lon}&method=5`,
      );
      const data = await res.json();
      if (data.code === 200) {
        await saveCache(data.data.timings);
        applyTimes(data.data.timings);
      } else {
        setError("Failed to fetch prayer times");
      }
    },
    [applyTimes],
  );

  const init = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);

      // 1️⃣ Try cache first (skip network entirely if today's data exists)
      if (!refreshing) {
        const cached = await loadCache();
        if (cached) {
          applyTimes(cached);
          // Still load saved location for city name + Qibla
          const savedLoc = await loadLocation();
          if (savedLoc) {
            setCityName(savedLoc.cityName);
            setCoords(savedLoc.coords);
          }
          setLoading(false);
          return; // ✅ done — no network call
        }
      }

      // 2️⃣ No cache — get location
      let lat, lon, city;
      const savedLoc = await loadLocation();

      if (savedLoc && !refreshing) {
        // Use stored location (no GPS call)
        ({
          coords: { latitude: lat, longitude: lon },
          cityName: city,
        } = savedLoc);
        // Spread properly:
        lat = savedLoc.coords.latitude;
        lon = savedLoc.coords.longitude;
        city = savedLoc.cityName;
      } else {
        // Fresh GPS
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Location permission denied");
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
        console.log("Fetched GPS location:", lat, lon);

        const [place] = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lon,
        });
        city = place
          ? `${place.city || place.subregion}, ${place.country}`
          : "Unknown";

        await saveLocation({ latitude: lat, longitude: lon }, city);
      }

      setCityName(city);
      setCoords({ latitude: lat, longitude: lon });

      // 3️⃣ Fetch prayer times from network
      await fetchFromNetwork(lat, lon);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing, applyTimes, fetchFromNetwork]);

  // ✅ Run only once on mount — no dependency loop
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    init();
  }, [init]);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await init();
  }, [init]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={styles.loadingText}>Locating you…</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            hasFetched.current = false;
            init();
          }}
        >
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );

  const next = prayerTimes ? getNextPrayer(prayerTimes) : null;
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
            onRefresh={onRefresh}
            tintColor={ACCENT}
          />
        }
      >
        <LinearGradient
          colors={[HERO_TOP, HERO_BTM]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
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
            {next && (
              <View style={styles.nextBlock}>
                <Text style={styles.nextLabel}>NEXT PRAYER</Text>
                <Text style={styles.nextName}>{next.name}</Text>
                <Text style={styles.nextTime}>
                  {formatTo12(next.time)} ·{" "}
                  {getCountdown(next.time, next.isTomorrow)}
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[styles.progressFill, { width: `${dayPct * 100}%` }]}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.progressLabel}>
                    Day {Math.round(dayPct * 100)}% complete
                  </Text>
                </View>
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
                isNext={next?.name === name}
                index={i}
                isTomorrow={next?.name === name ? next.isTomorrow : false}
              />
              {i < PRAYERS.length - 1 && <View style={styles.separator} />}
            </React.Fragment>
          ))}
        </View>

        <QiblaCompass userLat={coords?.latitude} userLon={coords?.longitude} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_DARK },
  scroll: { flex: 1 },
  center: {
    flex: 1,
    backgroundColor: BG_DARK,
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
  retryText: { color: ACCENT, fontSize: 14 },

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
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT },
  locationText: { color: "rgba(255,255,255,0.65)", fontSize: 12 },
  dateText: { color: "rgba(255,255,255,0.35)", fontSize: 12 },
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
  progressFill: { height: "100%", backgroundColor: ACCENT, borderRadius: 2 },
  progressLabel: { fontSize: 11, color: ACCENT, letterSpacing: 0.44 },

  list: { backgroundColor: BG_DARK, paddingTop: 12 },
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
    backgroundColor: ACCENT,
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
    color: ACCENT,
    marginTop: 2,
    letterSpacing: 0.4,
  },
  separator: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
  },
});
