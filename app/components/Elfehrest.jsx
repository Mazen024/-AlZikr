import React, { useState } from "react";
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../constants/root";
import quran from "../../assets/quran/quran copy.json";
import kaaba from "../../assets/images/makkah-kaaba.png";
import madinah from "../../assets/images/madinah.png";
import { useRouter } from "expo-router";

export default function Elfehrest({ onClose, onSelect }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const surahs = quran.data.surahs;

  const filteredSurahs = surahs.filter((surah) => {
    const matchesSearch = surah.name.includes(searchQuery);
    const matchesType =
      filterType === "all" ||
      (filterType === "meccan" && surah.revelationType === "Meccan") ||
      (filterType === "medinan" && surah.revelationType === "Medinan");
    return matchesSearch && matchesType;
  });

  const getFirstPage = (surahNumber) => {
    const surah = surahs.find((s) => s.number === surahNumber);
    if (surah.ayahs[0].page > 0) {
      return surah.ayahs[0].page;
    }
    return 1;
  };

  const handleSurahPress = (surah) => {
    const firstPage = getFirstPage(surah.number);
    return firstPage - 1;
  };

  const renderSeparator = () => <View style={styles.separator} />;

  const AnimatedSurahItem = ({ item, index }) => {
    const scaleValue = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onSelect(handleSurahPress(item))}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.item,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <View
            style={[
              styles.numberBadge,
              item.revelationType === "Meccan"
                ? styles.meccanBadge
                : styles.medinanBadge,
            ]}
          >
            <Text style={styles.surahNumber}>{item.number}</Text>
          </View>

          <View style={styles.centerSection}>
            <Text style={styles.surahName}>{item.name}</Text>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.revelationType,
                  item.revelationType === "Meccan"
                    ? styles.meccanText
                    : styles.medinanText,
                ]}
              >
                {item.revelationType === "Meccan" ? "مكية" : "مدنية"}
              </Text>
              <View style={styles.ayahsBadge}>
                <Ionicons
                  name="book-outline"
                  size={14}
                  color={theme.Colors.textGray}
                />
                <Text style={styles.ayahsCount}>{item.ayahs.length} آية</Text>
              </View>
            </View>
          </View>
          <Image
            source={item.revelationType === "Meccan" ? kaaba : madinah}
            style={styles.image}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-forward"
              size={24}
              color={theme.Colors.primaryLight}
            />
          </TouchableOpacity>
          <Text style={styles.title}>فهرس القرآن الكريم</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.Colors.textGray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن سورة..."
            placeholderTextColor={theme.Colors.textGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.Colors.textGray}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === "all" && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType("all")}
          >
            <Text
              style={[
                styles.filterText,
                filterType === "all" && styles.filterTextActive,
              ]}
            >
              الكل ({surahs.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === "meccan" && styles.filterButtonActiveMeccan,
            ]}
            onPress={() => setFilterType("meccan")}
          >
            <Text
              style={[
                styles.filterText,
                filterType === "meccan" && styles.filterTextActive,
              ]}
            >
              مكية ({surahs.filter((s) => s.revelationType === "Meccan").length}
              )
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === "medinan" && styles.filterButtonActiveMedinan,
            ]}
            onPress={() => setFilterType("medinan")}
          >
            <Text
              style={[
                styles.filterText,
                filterType === "medinan" && styles.filterTextActive,
              ]}
            >
              مدنية (
              {surahs.filter((s) => s.revelationType === "Medinan").length})
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.resultsCount}>{filteredSurahs.length} سورة</Text>
      </View>

      {/* Surahs List */}
      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => item.number.toString()}
        renderItem={({ item, index }) => (
          <AnimatedSurahItem item={item} index={index} />
        )}
        ItemSeparatorComponent={renderSeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="search-outline"
              size={64}
              color={theme.Colors.textGray}
            />
            <Text style={styles.emptyText}>لا توجد نتائج</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Colors.white,
    direction: "rtl",
  },
  header: {
    backgroundColor: theme.Colors.black,
    paddingVertical: theme.Spacing.md,
    paddingHorizontal: theme.Spacing.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.Spacing.md,
  },
  backButton: {
    padding: theme.Spacing.xs,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Colors.primaryLight,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: theme.Spacing.sm,
    paddingVertical: theme.Spacing.xs,
    marginBottom: theme.Spacing.sm,
  },
  searchIcon: {
    marginLeft: theme.Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.white,
    textAlign: "right",
    paddingHorizontal: theme.Spacing.sm,
  },
  filterContainer: {
    flexDirection: "row",
    gap: theme.Spacing.sm,
    marginBottom: theme.Spacing.xs,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.Spacing.xs,
    paddingHorizontal: theme.Spacing.sm,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: theme.Colors.primaryLight,
  },
  filterButtonActiveMeccan: {
    backgroundColor: "#2e7d32",
  },
  filterButtonActiveMedinan: {
    backgroundColor: "#1565c0",
  },
  filterText: {
    fontSize: 13,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.textGray,
  },
  filterTextActive: {
    color: theme.Colors.white,
    fontFamily: theme.Fonts.amiriBold,
  },
  resultsCount: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.textGray,
    textAlign: "center",
    marginTop: theme.Spacing.xs,
  },
  listContent: {
    paddingHorizontal: theme.Spacing.md,
    paddingVertical: theme.Spacing.md,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.Spacing.md,
    paddingHorizontal: theme.Spacing.sm,
    backgroundColor: theme.Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  separator: {
    height: theme.Spacing.sm,
  },
  numberBadge: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderColor: theme.Colors.textGray,
  },
  surahNumber: {
    fontSize: 22,
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Colors.black,
  },
  centerSection: {
    flex: 1,
    marginHorizontal: theme.Spacing.md,
  },
  surahName: {
    fontSize: 20,
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Colors.black,
    marginBottom: theme.Spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.Spacing.sm,
  },
  image: {
    width: 45,
    height: 45,
    resizeMode: "contain",
  },
  revelationType: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriRegular,
    paddingHorizontal: theme.Spacing.sm,
    borderRadius: 12,
  },
  meccanText: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
  },
  medinanText: {
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
  },
  ayahsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ayahsCount: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.textGray,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.Spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.textGray,
    marginTop: theme.Spacing.md,
  },
});
