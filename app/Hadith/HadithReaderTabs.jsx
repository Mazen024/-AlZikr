import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import theme from "../constants/root";

const TABS = [
  { key: "header not complete", label: "Test 1" },
  { key: "test2", label: "Test 2" },
  { key: "test3", label: "Test 3" },
  { key: "test4", label: "Test 4" },
  { key: "test5", label: "Test 5" },
];

const TabContent = ({ tabKey }) => (
  <View style={styles.tabContent}>
    <Text style={styles.tabContentText}>{tabKey.toUpperCase()}</Text>
    <Text style={styles.tabContentSub}>قريباً</Text>
  </View>
);

const HadithTabs = ({ activeTab, onTabChange, height }) => (
  <View style={[styles.container, { height }]}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabBar}
      contentContainerStyle={styles.tabBarContent}
    >
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.75}
        >
          <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>

    <View style={styles.tabContentArea}>
      <TabContent tabKey={activeTab} />
    </View>
  </View>
);

export { TABS };
export default HadithTabs;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  tabBar: {
    maxHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fafafa",
  },
  tabBarContent: {
    paddingHorizontal: theme.Spacing.sm,
    alignItems: "center",
  },
  tabItem: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 2,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: theme.Colors.primaryLight,
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.textGray,
  },
  tabLabelActive: {
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Colors.primaryLight,
  },
  tabContentArea: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContentText: {
    fontSize: 18,
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Colors.textGray,
  },
  tabContentSub: {
    fontSize: 13,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.textGray,
    marginTop: 6,
  },
});