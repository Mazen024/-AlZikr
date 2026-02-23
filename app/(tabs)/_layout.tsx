import { Tabs } from "expo-router";
import { Text } from "react-native";
import Root from "../constants/root";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Root.Colors.white,
          height: 60,
        },
        tabBarActiveTintColor: Root.Colors.accentGreen,
        tabBarInactiveTintColor: Root.Colors.textGray,
      }}
    >
        <Tabs.Screen
          name="setting"
          options={{
            title: "الإعدادات",
            tabBarIcon: () => <Text>⚙️</Text>,
          }}
        />
      <Tabs.Screen
        name="homePage"
        options={{
          title: "الرئيسية",
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />

    </Tabs>
  );
}
