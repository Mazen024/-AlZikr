import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrayerProvider } from "../context/PrayerContext";

export default function RootLayout() {
  return (
    <PrayerProvider>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#0c1520",
        }}
        edges={["top"]}
      >
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
