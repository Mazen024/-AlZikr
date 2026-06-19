import { createContext, useContext } from "react";
import { usePrayerTimes } from "../hooks/usePrayerTimes";

const PrayerContext = createContext(null);

export function PrayerProvider({ children }) {
  const prayer = usePrayerTimes();

  return (
    <PrayerContext.Provider value={prayer}>{children}</PrayerContext.Provider>
  );
}

export function usePrayerContext() {
  const ctx = useContext(PrayerContext);
  if (!ctx) {
    throw new Error("usePrayerContext must be used within a PrayerProvider");
  }
  return ctx;
}
