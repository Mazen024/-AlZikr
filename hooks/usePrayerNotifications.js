import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useRef, useState } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function parseTime(timeStr, baseDate = new Date()) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
}

const PRAYER_ARABIC = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

const PRAYER_MESSAGES = {
  الفجر: "﴿ وَقُرْآنَ الْفَجْرِ ۖ إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا ﴾",
  الشروق: "﴿ وَجَعَلْنَا النَّهَارَ مَعَاشًا ﴾",
  الظهر: "﴿ وَأَقِمِ الصَّلَاةَ لِذِكْرِي ﴾",
  العصر: "﴿ حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَى ﴾",
  المغرب: "﴿ فَسُبْحَانَ اللَّهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ ﴾",
  العشاء: "قال ﷺ: مَن صلَّى العشاءَ في جماعةٍ فكأنما قام نصفَ الليلِ",
};

const NOTIF_ENABLED_KEY = "notif_enabled";

export function usePrayerNotifications(prayerTimes) {
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [isScheduling, setIsScheduling] = useState(false);
  const [lastScheduledFor, setLastScheduledFor] = useState(null);
  const [enabled, setEnabledState] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const scheduledRef = useRef(false);

  const setEnabled = useCallback(async (value) => {
    setEnabledState(value);
    try {
      await AsyncStorage.setItem(NOTIF_ENABLED_KEY, JSON.stringify(value));
    } catch (e) {
      console.warn("Failed to save notif enabled:", e.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
        if (raw !== null) setEnabledState(JSON.parse(raw));
      } catch (e) {
        console.warn("Failed to load notif enabled:", e.message);
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status: existing } = await Notifications.getPermissionsAsync();
      if (existing === "granted") {
        setPermissionStatus("granted");
        return;
      }
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
    })();
  }, []);

  const cancelAll = useCallback(async () => {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    const prayerIds = pending.filter((n) => n.content.data?.isPrayerNotification);
    await Promise.all(
      prayerIds.map((n) =>
        Notifications.cancelScheduledNotificationAsync(n.identifier)
      )
    );
    setScheduledCount(0);
  }, []);

  const scheduleAll = useCallback(
    async (times = prayerTimes) => {
      if (!times || permissionStatus !== "granted") return;
      if (isScheduling) return;

      setIsScheduling(true);
      try {
        const pending = await Notifications.getAllScheduledNotificationsAsync();
        const prayerIds = pending.filter((n) => n.content.data?.isPrayerNotification);
        await Promise.all(
          prayerIds.map((n) =>
            Notifications.cancelScheduledNotificationAsync(n.identifier)
          )
        );

        const now = new Date();
        let count = 0;
        const PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

        for (const name of PRAYERS) {
          const t = parseTime(times[name]);
          if (!t || t <= now) continue;

          await Notifications.scheduleNotificationAsync({
            content: {
              title: `🕌 ${name} — ${PRAYER_ARABIC[name]}`,
              body: PRAYER_MESSAGES[name],
              sound: true,
              data: { isPrayerNotification: true, prayerName: name },
            },
            trigger: { type: "date", date: t },
          });
          count++;
        }

        setScheduledCount(count);
        setLastScheduledFor(now.toLocaleDateString());
        scheduledRef.current = true;
        return count;
      } finally {
        setIsScheduling(false);
      }
    },
    [prayerTimes, permissionStatus, isScheduling]
  );

  const toggle = useCallback(async () => {
    if (enabled) {
      await cancelAll();
      await setEnabled(false);
    } else {
      await setEnabled(true);
      scheduledRef.current = false;
      await scheduleAll(prayerTimes);
    }
  }, [enabled, cancelAll, scheduleAll, setEnabled, prayerTimes]);

  useEffect(() => {
    if (
      isHydrated &&
      enabled &&
      prayerTimes &&
      permissionStatus === "granted" &&
      !scheduledRef.current
    ) {
      scheduledRef.current = true;
      scheduleAll(prayerTimes);
    }
  }, [isHydrated, enabled, prayerTimes, permissionStatus, scheduleAll]);

  const scheduleTest = useCallback(
    async (prayerName = "Dhuhr", delaySeconds = 5) => {
      if (permissionStatus !== "granted") return null;
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🕌 [TEST] ${prayerName} — ${PRAYER_ARABIC[prayerName] ?? ""}`,
          body: PRAYER_MESSAGES[prayerName] ?? "Prayer time!",
          sound: true,
          data: { isPrayerNotification: true, isTest: true },
        },
        trigger: { type: "timeInterval", seconds: delaySeconds },
      });
      return id;
    },
    [permissionStatus]
  );

  const getPending = useCallback(async () => {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    return all.filter((n) => n.content.data?.isPrayerNotification);
  }, []);

  return {
    permissionStatus,
    scheduledCount,
    isScheduling,
    lastScheduledFor,
    enabled,
    isHydrated,
    toggle,
    scheduleAll,
    scheduleTest,
    cancelAll,
    getPending,
  };
}