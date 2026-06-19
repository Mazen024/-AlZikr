import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import azkarData from "../../assets/azkar/azkar.json";
import root from "../constants/root.jsx";

const { Fonts, FontSizes, Spacing, BorderRadius, Tcolors } = root;

function SegmentedTabs({ sections, activeIndex, onChange }) {
  return (
    <View style={styles.segmentWrap}>
      <View style={styles.segmentTrack}>
        {sections.map((section, idx) => {
          const isActive = activeIndex === idx;
          return (
            <TouchableOpacity
              key={section.title}
              style={[styles.segment, isActive && styles.segmentActive]}
              onPress={() => onChange(idx)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentText,
                  isActive && styles.segmentTextActive,
                ]}
                numberOfLines={1}
              >
                {section.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function ProgressBar({ done, total }) {
  const pct = total > 0 ? Math.min(done / total, 1) : 0;
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>
        {done}/{total}
      </Text>
    </View>
  );
}

function ZikrCard({ item, index, isDone, count, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const target = item.repeat ?? 1;
  const remaining = Math.max(target - count, 0);

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  }, [onPress, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.card, isDone && styles.cardDone]}
        activeOpacity={0.85}
        onPress={handlePress}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.countBadge, isDone && styles.countBadgeDone]}>
            {isDone ? (
              <Ionicons
                name="checkmark"
                size={14}
                color={Tcolors.BG_DARK ?? "#0c1410"}
              />
            ) : (
              <Text style={styles.countBadgeText}>
                {!isDone && remaining > 0 && target >= 1 && (
                  <Text style={styles.remainingTag}>
                    باقي {remaining} من {target}
                  </Text>
                )}
              </Text>
            )}
          </View>
        </View>

        <Text style={[styles.zikrText, isDone && styles.zikrTextDone]}>
          {item.zekr}
        </Text>

        <View style={styles.cardFooter}>
          {!!item.bless && (
            <Text style={styles.zikrSource} numberOfLines={2}>
              {item.bless}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const AzkarPage = () => {
  const sections = useMemo(() => azkarData || [], []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressBySection, setProgressBySection] = useState({});

  const activeSection = useMemo(
    () => sections[activeIndex] ?? { title: "", content: [] },
    [sections, activeIndex],
  );

  const activeProgress = useMemo(
    () => progressBySection[activeIndex] ?? {},
    [progressBySection, activeIndex],
  );

  const doneCount = useMemo(
    () =>
      activeSection.content?.filter((item, idx) => {
        const target = item.repeat ?? 1;
        return (activeProgress[idx] ?? 0) >= target;
      }).length ?? 0,
    [activeSection, activeProgress],
  );

  const handleTabChange = useCallback((idx) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveIndex(idx);
  }, []);

  const handleTapZikr = useCallback(
    (idx, target) => {
      setProgressBySection((prev) => {
        const sectionProgress = prev[activeIndex] ?? {};
        const current = sectionProgress[idx] ?? 0;
        const next = current >= target ? 0 : current + 1;
        return {
          ...prev,
          [activeIndex]: { ...sectionProgress, [idx]: next },
        };
      });
    },
    [activeIndex],
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>الأذكار</Text>
          <Text style={styles.headerSubTitle}>{activeSection.title}</Text>
        </View>
        <ProgressBar
          done={doneCount}
          total={activeSection.content?.length ?? 0}
        />
      </View>

      <SegmentedTabs
        sections={sections}
        activeIndex={activeIndex}
        onChange={handleTabChange}
      />

      <FlatList
        data={activeSection.content}
        keyExtractor={(item, index) => `${activeIndex}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const target = item.repeat ?? 1;
          const count = activeProgress[index] ?? 0;
          return (
            <ZikrCard
              item={item}
              index={index}
              count={count}
              isDone={count >= target}
              onPress={() => handleTapZikr(index, target)}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons
              name="book-outline"
              size={32}
              color="rgba(255,255,255,0.25)"
            />
            <Text style={styles.emptyText}>لا توجد أذكار متاحة الآن</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Tcolors.primaryBackground,
  },

  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Tcolors.secondaryBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: Tcolors.cardBorder,
  },

  headerTitle: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Tcolors.white,
    fontFamily: Fonts.amiriBold,
    textAlign: "right",
  },

  headerSubTitle: {
    fontSize: FontSizes.small,
    color: Tcolors.secondaryText,
    fontFamily: Fonts.cairoRegular,
    marginTop: 2,
    textAlign: "right",
  },

  progressWrap: {
    alignItems: "flex-end",
    gap: 5,
    minWidth: 72,
  },

  progressTrack: {
    width: 72,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: Tcolors.ACCENT,
    borderRadius: 3,
  },

  progressLabel: {
    fontSize: 11,
    color: Tcolors.secondaryText,
    fontWeight: "600",
  },

  segmentWrap: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  segmentTrack: {
    flexDirection: "row-reverse",
    backgroundColor: Tcolors.secondaryBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 0.5,
    borderColor: Tcolors.cardBorder,
    padding: 4,
    gap: 4,
  },

  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: BorderRadius.sm ?? 8,
    gap: 5,
  },

  segmentActive: {
    backgroundColor: Tcolors.ACCENT,
  },

  segmentIcon: {
    marginTop: 1,
  },

  segmentText: {
    fontSize: 11.5,
    color: Tcolors.secondaryText,
    fontFamily: Fonts.cairoBold,
    fontWeight: "700",
  },

  segmentTextActive: {
    color: Tcolors.BG_DARK ?? "#0c1410",
  },

  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },

  card: {
    backgroundColor: Tcolors.secondaryBackground,
    borderRadius: BorderRadius.lg,
    borderWidth: 0.5,
    borderColor: Tcolors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },

  cardDone: {
    borderColor: "rgba(78,202,139,0.35)",
    backgroundColor: "rgba(78,202,139,0.06)",
  },

  cardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },

  countBadge: {
    backgroundColor: "rgba(78,202,139,0.12)",
    borderRadius: BorderRadius.circular,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 30,
    alignItems: "center",
  },

  countBadgeDone: {
    backgroundColor: Tcolors.ACCENT,
    width: 24,
    height: 24,
    borderRadius: 12,
    padding: 0,
  },

  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Tcolors.primaryLight,
  },

  zikrText: {
    fontSize: FontSizes.quranText ?? 20,
    color: Tcolors.white,
    fontFamily: Fonts.amiriRegular,
    textAlign: "right",
    lineHeight: 32,
  },

  zikrTextDone: {
    color: "rgba(255,255,255,0.55)",
  },

  cardFooter: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },

  zikrSource: {
    flex: 1,
    fontSize: 12,
    color: Tcolors.secondaryText,
    fontFamily: Fonts.cairoRegular,
    textAlign: "right",
    lineHeight: 17,
  },

  remainingTag: {
    fontSize: 11,
    color: Tcolors.ACCENT,
    fontWeight: "700",
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.xl * 2,
    gap: Spacing.sm,
  },

  emptyText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    fontFamily: Fonts.cairoRegular,
  },
});

export default AzkarPage;
