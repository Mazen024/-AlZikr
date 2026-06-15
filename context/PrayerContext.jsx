import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const PrayerContext = createContext(null);

const STORAGE_KEY = "prayer_cache";

export function PrayerProvider({ children }) {
  const [prayerTime, setPrayerTimeState] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const { times, date } = JSON.parse(raw);
          const isToday = date === new Date().toDateString();
          if (isToday && times) {
            setPrayerTimeState(times);
          }
        }
      } catch (e) {
        console.warn("Failed to load prayer cache:", e.message);
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  const setPrayerTime = async (times) => {
    setPrayerTimeState(times);
    if (times) {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ times, date: new Date().toDateString() }),
        );
      } catch (e) {
        console.warn("Failed to save prayer cache:", e.message);
      }
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <PrayerContext.Provider value={{ prayerTime, setPrayerTime, isHydrated }}>
      {children}
    </PrayerContext.Provider>
  );
}

export function usePrayerContext() {
  return useContext(PrayerContext);
}
