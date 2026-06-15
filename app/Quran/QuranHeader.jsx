import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import theme from "../constants/root";

const QuranHeader = React.memo(
  ({ currentPage, pageData, totalPages, bookmarked, onMenuPress, onSearchPress  }) => {
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={onSearchPress} activeOpacity={0.7}>
          <Ionicons
            name={"search"}
            size={30}
            color={theme.Tcolors.primaryLight}
          />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Text style={styles.juzNumber}>الجزء {pageData?.juz || 1}</Text>
          <View style={styles.headerCenter}>
            <Text style={styles.pageNumberText}>
              {pageData?.surahName || ""}
            </Text>
          </View>
          <Text style={styles.pageCounter}>
            {currentPage + 1} / {totalPages}
          </Text>
        </View>

        <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7}>
          <Ionicons name={"menu"} size={30} color={theme.Tcolors.primaryLight} />
        </TouchableOpacity>

        {bookmarked && (
          <View style={styles.bookmarkRibbon}>
            <View style={styles.ribbonTriangle} />
          </View>
        )}
      </View>
    );
  },
);

QuranHeader.displayName = "QuranHeader";

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.Tcolors.black,
    paddingVertical: theme.Spacing.sm,
    paddingHorizontal: theme.Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.Spacing.xs,
    position: "relative",
    overflow: "visible",
  },
  headerRight: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: theme.Spacing.xs,
    paddingVertical: theme.Spacing.xs,
    borderWidth: 1,
    borderColor: theme.Tcolors.textGray,
    borderRadius: 8,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  pageNumberText: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Tcolors.primaryLight,
    textAlign: "center",
  },
  juzNumber: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Tcolors.primaryDark,
    backgroundColor: theme.Tcolors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pageCounter: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Tcolors.primaryDark,
    backgroundColor: theme.Tcolors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bookmarkRibbon: {
    position: "absolute",
    right: 20,
    bottom: -150,
    width: 35,
    height: 150,
    backgroundColor: "#d32f2f",
    opacity: 0.3,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  ribbonTriangle: {
    position: "absolute",
    bottom: -12,
    left: 0,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 17.5,
    borderRightWidth: 17.5,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#d32f2f",
    opacity: 1,
  },
});

export default QuranHeader;
