/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../constants/root";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  BOOKMARK: "@quran_bookmark",
  LAST_PAGE: "@quran_last_page",
};

export default function QuranMenu({
  visible,
  onClose,
  onGoToPage,
  onToggleMood,
  isDark,
  currentPage,
}) {
  const handlePress = (action) => {
    action?.();
    onClose();
  };
  const [bookmark, setBookmark] = useState(null);
  const [lastPage, setLastPage] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const bm = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARK);
        const lp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PAGE);
        setBookmark(bm !== null ? Number(bm) : null);
        setLastPage(lp !== null ? Number(lp) : null);
      } catch (err) {
        console.error("Error loading storage:", err);
      }
    };

    loadData();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.menu} onPress={() => {}}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => handlePress(() => onGoToPage("save"))}
          >
            <Ionicons
              name="bookmark"
              size={20}
              color={theme.Colors.primaryLight}
            />
            <Text style={styles.text}>
              {bookmark === currentPage
                ? "إزالة العلامة"
                : "حفظ الصفحة"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => handlePress(() => onGoToPage("bookmark"))}
          >
            <Ionicons
              name="bookmark-outline"
              size={20}
              color={theme.Colors.primaryLight}
            />
            <Text style={styles.text}>اذهب إلى العلامة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => handlePress(() => onGoToPage("index"))}
          >
            <Ionicons
              name="book-outline"
              size={20}
              color={theme.Colors.primaryLight}
            />
            <Text style={styles.text}>الفهرس</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => handlePress(onToggleMood)}
          >
            <Ionicons
              name={isDark ? "sunny-outline" : "moon-outline"}
              size={20}
              color={theme.Colors.primaryLight}
            />
            <Text style={styles.text}>
              {isDark ? "الوضع النهاري" : "الوضع الليلي"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => handlePress()}>
            <Ionicons
              name="settings-outline"
              size={20}
              color={theme.Colors.primaryLight}
            />
            <Text style={styles.text}>الإعدادات</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 16,
  },
  menu: {
    backgroundColor: theme.Colors.white,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 200,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  text: {
    fontSize: 16,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.black,
  },
});
