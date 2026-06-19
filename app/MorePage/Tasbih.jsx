import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import root from "../constants/root.jsx";

const { Fonts, FontSizes, Spacing, BorderRadius, Tcolors } = root;
const PHRASES = [
  { key: "subhanallah", arabic: "سُبْحَانَ اللهِ" },
  { key: "alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ" },
  { key: "allahuakbar", arabic: "اللهُ أَكْبَرُ" },
  { key: "astaghfirullah", arabic: "أَسْتَغْفِرُ اللهَ" },
  { key: "lailahaillallah", arabic: "لَا إِلَهَ إِلَّا اللهُ" },
];

function PhraseChip({ phrase, isActive, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
        {phrase.arabic}
      </Text>
    </TouchableOpacity>
  );
}

const TasbihCounter = () => {
  const [activePhraseKey, setActivePhraseKey] = useState(PHRASES[0].key);
  const activePhrase = PHRASES.find((p) => p.key === activePhraseKey);
  const [counts, setCounts] = useState({
    subhanallah: 0,
    alhamdulillah: 0,
    allahuakbar: 0,
    astaghfirullah: 0,
    lailahaillallah: 0,
  });
  const count = counts[activePhraseKey];
  const scale = useRef(new Animated.Value(1)).current;
  const ringProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTasbih();
  }, []);

  const loadTasbih = async () => {
    try {
      const saved = await AsyncStorage.getItem("tasbih_data");

      if (saved) {
        const data = JSON.parse(saved);

        setActivePhraseKey(data.activePhraseKey);
        setCounts(data.counts);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveTasbih = async (newCounts, phraseKey) => {
    try {
      await AsyncStorage.setItem(
        "tasbih_data",
        JSON.stringify({
          activePhraseKey: phraseKey,
          counts: newCounts,
        }),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setCounts((prev) => {
      const updated = {
        ...prev,
        [activePhraseKey]: prev[activePhraseKey] + 1,
      };

      saveTasbih(updated, activePhraseKey);

      return updated;
    });

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activePhraseKey, scale]);

  const handlePhraseChange = (key) => {
    setActivePhraseKey(key);

    saveTasbih(counts, key);
  };

  const handleReset = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    setCounts((prev) => {
      const updated = {
        ...prev,
        [activePhraseKey]: 0,
      };

      saveTasbih(updated, activePhraseKey);

      return updated;
    });
  }, [activePhraseKey]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>السبحة</Text>
      </View>

      <View style={styles.chipRow}>
        {PHRASES.map((phrase) => (
          <PhraseChip
            key={phrase.key}
            phrase={phrase}
            isActive={activePhraseKey === phrase.key}
            onPress={() => handlePhraseChange(phrase.key)}
          />
        ))}
      </View>

      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.tapArea}>
          <Animated.View
            style={[
              styles.ring,
              {
                borderColor: ringProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [Tcolors.cardBorder, Tcolors.ACCENT],
                }),
              },
            ]}
          >
            <Animated.View
              style={[styles.countWrap, { transform: [{ scale }] }]}
            >
              <Text style={styles.phraseLabel}>{activePhrase.arabic}</Text>
              <Text style={styles.countText}>{count}</Text>
              <Text style={styles.tapHint}>اضغط للعد</Text>
            </Animated.View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      <TouchableOpacity
        style={styles.resetBtn}
        onPress={handleReset}
        activeOpacity={0.75}
      >
        <Ionicons name="refresh" size={16} color={Tcolors.secondaryText} />
        <Text style={styles.resetBtnText}>إعادة التصفير</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Tcolors.primaryBackground,
    alignItems: "center",
  },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  headerTitle: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Tcolors.white,
    fontFamily: Fonts.amiriBold,
  },

  cyclesPill: {
    backgroundColor: "rgba(78,202,139,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.circular,
  },

  cyclesPillText: {
    fontSize: 12,
    color: Tcolors.primaryLight,
    fontWeight: "700",
  },

  chipRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.circular,
    backgroundColor: Tcolors.secondaryBackground,
    borderWidth: 0.5,
    borderColor: Tcolors.cardBorder,
  },

  chipActive: {
    backgroundColor: Tcolors.ACCENT,
    borderColor: Tcolors.ACCENT,
  },

  chipText: {
    fontSize: 12.5,
    color: Tcolors.secondaryText,
    fontFamily: Fonts.cairoRegular,
  },

  chipTextActive: {
    color: Tcolors.BG_DARK ?? "#0c1410",
    fontFamily: Fonts.cairoBold,
    fontWeight: "700",
  },

  tapArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  ring: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Tcolors.secondaryBackground,
  },

  countWrap: {
    alignItems: "center",
    gap: 6,
  },

  phraseLabel: {
    fontSize: FontSizes.body,
    color: Tcolors.primaryLight,
    fontFamily: Fonts.amiriRegular,
  },

  countText: {
    fontSize: 64,
    fontWeight: "200",
    color: Tcolors.white,
    letterSpacing: -1,
  },

  tapHint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    fontFamily: Fonts.cairoRegular,
  },

  resetBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 0.5,
    borderColor: Tcolors.cardBorder,
    marginBottom: Spacing.xl,
  },

  resetBtnText: {
    fontSize: 13,
    color: Tcolors.secondaryText,
    fontFamily: Fonts.cairoRegular,
  },
});

export default TasbihCounter;
