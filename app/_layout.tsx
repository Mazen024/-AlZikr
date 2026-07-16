import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
// import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrayerProvider } from "../context/PrayerContext";
// import { resetDatabase } from "../service/database";

export default function RootLayout() {
  // useEffect(() => {
  //   resetDatabase();
  // }, []);

  return (
    <PrayerProvider>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#0c1520",
        }}
        edges={["top"]}
      >
        <StatusBar style="light" backgroundColor="#111e2d" />

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "#0c1520",
            },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaView>
    </PrayerProvider>
  );
}
