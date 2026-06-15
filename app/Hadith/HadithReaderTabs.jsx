import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    <View style={styles.tabBar}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabItem,
            activeTab === tab.key && styles.tabItemActive,
          ]}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.75}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === tab.key && styles.tabLabelActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

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
    flexDirection: "row",
    maxHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fafafa",
  },
  tabItem: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 2,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: theme.Tcolors.primaryLight,
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Tcolors.textGray,
  },
  tabLabelActive: {
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Tcolors.primaryLight,
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
    color: theme.Tcolors.textGray,
  },
  tabContentSub: {
    fontSize: 13,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Tcolors.textGray,
    marginTop: 6,
  },
});
