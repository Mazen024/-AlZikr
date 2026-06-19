import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";

const PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
const getCacheKey = (methodId) => `prayer_cache_${methodId}`;
const LOCATION_KEY = "prayer_location";

async function loadFreshCache(methodId) {
  try {
    const raw = await AsyncStorage.getItem(getCacheKey(methodId));
    if (!raw) return null;
    const { times, date } = JSON.parse(raw);
    if (date !== new Date().toDateString()) return null;
    return times;
  } catch {
    return null;
  }
}

async function loadAnyCache(methodId) {
  try {
    const raw = await AsyncStorage.getItem(getCacheKey(methodId));
    if (!raw) return null;
    const { times, date } = JSON.parse(raw);
    if (!times) return null;
    return { times, isStale: date !== new Date().toDateString(), date };
  } catch {
    return null;
  }
}

async function saveCache(times, methodId) {
  try {
    await AsyncStorage.setItem(
      getCacheKey(methodId),
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

async function fetchPrayerTimesFromNetwork(lat, lon, methodId = 5) {
  const today = new Date();
  const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
  const res = await fetch(
    `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lon}&method=${methodId}`,
  );
  const data = await res.json();
  if (data.code === 200) return data.data.timings;
  throw new Error("Failed to fetch prayer times from server");
}

export function parseTime(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export function getNextPrayer(times) {
  if (!times) return null;
  const now = new Date();
  for (const name of PRAYERS) {
    const t = parseTime(times[name]);
    if (t && t > now) return { name, time: times[name] };
  }
  const tomorrowFajr = parseTime(times[PRAYERS[0]]);
  if (tomorrowFajr) {
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    const hh = String(tomorrowFajr.getHours()).padStart(2, "0");
    const mm = String(tomorrowFajr.getMinutes()).padStart(2, "0");
    return { name: PRAYERS[0], time: `${hh}:${mm}`, isTomorrow: true };
  }
  return { name: PRAYERS[0], time: times[PRAYERS[0]] };
}

export function getCountdown(timeStr, isTomorrow = false) {
  const t = parseTime(timeStr);
  if (!t) return "";
  if (isTomorrow) t.setDate(t.getDate() + 1);
  const diff = t - new Date();
  if (diff <= 0) return "Now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatTo12(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function getDayProgress() {
  const now = new Date();
  return Math.min((now.getHours() * 60 + now.getMinutes()) / (24 * 60), 1);
}

export function usePrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [cityName, setCityName] = useState("Loading…");
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);

  const hasFetched = useRef(false);

  const applyTimes = useCallback((times, stale = false) => {
    setPrayerTimes(times);
    setIsStale(stale);
  }, []);

  const fallbackToOfflineCache = useCallback(async (methodId = 5) => {
    const anyCache = await loadAnyCache(methodId);
    if (!anyCache) return false;

    applyTimes(anyCache.times, anyCache.isStale);

    const savedLoc = await loadLocation();
    if (savedLoc) {
      setCityName(savedLoc.cityName);
      setCoords(savedLoc.coords);
    }
    return true;
  }, [applyTimes]);

  const init = useCallback(
    async (forceRefresh = false) => {
      try {
        setError(null);

        const raw = await AsyncStorage.getItem("calc_method");
        const methodId = raw ? JSON.parse(raw).id : 5;

        if (!forceRefresh) {
          const cached = await loadFreshCache(methodId);
          if (cached) {
            applyTimes(cached, false);
            const savedLoc = await loadLocation();
            if (savedLoc) {
              setCityName(savedLoc.cityName);
              setCoords(savedLoc.coords);
            }
            setLoading(false);
            return;
          }
        }

        let lat, lon, city;
        const savedLoc = await loadLocation();

        if (savedLoc && !forceRefresh) {
          lat = savedLoc.coords.latitude;
          lon = savedLoc.coords.longitude;
          city = savedLoc.cityName;
        } else {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            const usedFallback = await fallbackToOfflineCache(methodId);
            if (!usedFallback) setError("Location permission denied");
            setLoading(false);
            return;
          }
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lon = loc.coords.longitude;

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

        const times = await fetchPrayerTimesFromNetwork(lat, lon, methodId);
        await saveCache(times, methodId);
        applyTimes(times, false);
      } catch (err) {
        const usedFallback = await fallbackToOfflineCache(5);
        if (!usedFallback) setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [applyTimes, fallbackToOfflineCache],
  );

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    init(false);
  }, [init]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    hasFetched.current = false;
    await init(true);
  }, [init]);

  const nextPrayer = getNextPrayer(prayerTimes);

  return {
    prayerTimes,
    nextPrayer,
    cityName,
    coords,
    loading,
    refreshing,
    error,
    isStale,
    refresh,
    retry: () => {
      hasFetched.current = false;
      setLoading(true);
      init(false);
    },
  };
}
