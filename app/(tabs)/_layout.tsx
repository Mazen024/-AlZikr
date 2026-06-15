import { Tabs } from "expo-router";
import { Text } from "react-native";
import Root from "../constants/root";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Root.Tcolors.primaryBackground,
          height: 65,
        },
        tabBarActiveTintColor: Root.Tcolors.primaryLight,
        tabBarInactiveTintColor: Root.Tcolors.secondaryText,
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
