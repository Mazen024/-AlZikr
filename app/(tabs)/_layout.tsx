import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import Root from "../constants/root";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 70,
          borderRadius: 22,

          backgroundColor: "#0f1c2a",
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 8,
        },

        tabBarActiveTintColor: Root.Tcolors.primaryLight,
        tabBarInactiveTintColor: Root.Tcolors.secondaryText,

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 8,
        },
      }}
    >
      <Tabs.Screen
        name="homePage"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={30} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: "الإعدادات",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={30} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
