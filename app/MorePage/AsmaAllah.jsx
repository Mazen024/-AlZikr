import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import allahNamesData from "../../assets/names-of-allah/names-of-allah.json";
import root from "../constants/root";

const { Tcolors, Fonts, FontSizes, Spacing, BorderRadius } = root;

const ALLAH_NAME = {
  name: "اللَّهُ",
  description:
    "وهو الاسم الأعظم الذي تفرد به الحق سبحانه وخص به نفسه وجعله أول أسمائه، وأضافها كلها إليه فهو علم على ذاته سبحانه",
};

const removeTashkeel = (text) =>
  text
    ?.replace(
      /[\u064B-\u065F\u0670\u0610-\u061A\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g,
      "",
    ) // إزالة التشكيل
    .replace(/ـ/g, "") // إزالة التطويل
    .replace(/[أإآٱ]/g, "ا") // توحيد الألف
    .replace(/ى/g, "ي") // توحيد الألف المقصورة
    .replace(/\s+/g, " ")
    .trim() ?? "";

const AllahNameCard = ({ item, index, expanded, onPress }) => {
  const animRef = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animRef, {
      toValue: expanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [animRef, expanded]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(item.id)}
      style={[styles.card, expanded && styles.cardExpanded]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.nameText} numberOfLines={1}>
          {item.name}
        </Text>

        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={Tcolors.secondaryText}
        />
      </View>

      {expanded && (
        <Animated.View style={[styles.textContainer, { opacity: animRef }]}>
          <View style={styles.divider} />
          <Text style={styles.descriptionText}>{item.description}</Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

export default function AllahNamesScreen() {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const filteredNames = useMemo(() => {
    if (!query.trim()) return allahNamesData;

    const normalizedQuery = removeTashkeel(query);

    return allahNamesData.filter((item) =>
      removeTashkeel(item.name).includes(normalizedQuery),
    );
  }, [query]);

  const handleToggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderItem = ({ item, index }) => (
    <AllahNameCard
      item={item}
      index={index}
      expanded={expandedId === item.id}
      onPress={handleToggle}
    />
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Tcolors.secondaryBackground, Tcolors.heroGradientStart]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>أسماء الله الحسنى</Text>
        <Text style={styles.headerSubtitle}>
          وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا
        </Text>

        <View style={styles.searchWrapper}>
          <Ionicons
            name="search"
            size={18}
            color={Tcolors.secondaryText}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن اسم..."
            placeholderTextColor={Tcolors.secondaryText}
            value={query}
            onChangeText={setQuery}
            textAlign="right"
          />
        </View>
        <View style={styles.onlyallah}>
          <Text style={styles.allahName} numberOfLines={1}>
            {ALLAH_NAME.name}
          </Text>
          <Text style={styles.allahdesc}>{ALLAH_NAME.description}</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={filteredNames}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="search-outline"
              size={32}
              color={Tcolors.tertiaryText}
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
    backgroundColor: Tcolors.primaryBackground,
  },
  header: {
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTitle: {
    fontFamily: Fonts.cairoBold,
    fontSize: FontSizes.h2,
    color: Tcolors.white,
    textAlign: "right",
  },
  headerSubtitle: {
    fontFamily: Fonts.amiriRegular,
    fontSize: FontSizes.small + 2,
    color: Tcolors.goldLight,
    textAlign: "right",
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  searchWrapper: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: Tcolors.cardBackground,
    borderWidth: 1,
    borderColor: Tcolors.cardBorder,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm,
    height: 44,
  },
  searchIcon: {
    marginLeft: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.cairoRegular,
    fontSize: FontSizes.body - 2,
    color: Tcolors.primaryText,
    height: "100%",
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: Tcolors.cardBackground,
    borderWidth: 1,
    borderColor: Tcolors.cardBorder,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardExpanded: {
    borderColor: Tcolors.borderBright,
    backgroundColor: Tcolors.primaryLightTransparent,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameText: {
    flex: 1,
    fontFamily: Fonts.amiriBold,
    fontSize: FontSizes.h3,
    color: Tcolors.white,
    textAlign: "right",
    marginHorizontal: Spacing.sm,
  },
  textContainer: {
    marginTop: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Tcolors.cardBorder,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    fontFamily: Fonts.cairoRegular,
    fontSize: FontSizes.body - 3,
    lineHeight: 24,
    color: Tcolors.textMid,
    textAlign: "right",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.xxxl,
  },
  emptyText: {
    fontFamily: Fonts.cairoRegular,
    fontSize: FontSizes.body - 2,
    color: Tcolors.tertiaryText,
    marginTop: Spacing.sm,
  },
  onlyallah: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Tcolors.borderBright,
    backgroundColor: Tcolors.primaryLightTransparent,
  },
  allahName: {
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
    color: Tcolors.white,
    fontFamily: Fonts.amiriBold,
    letterSpacing: 1,
  },
  allahdesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    color: "rgba(255,255,255,0.75)",
    fontFamily: Fonts.cairoRegular,
  },
});
