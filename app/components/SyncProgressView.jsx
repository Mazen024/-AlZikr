import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import theme from "../constants/root";

const PHASE_LABELS = {
  downloading: "جارِ التحميل",
  importing: "جارِ الاستيراد",
  done: "اكتمل التحميل",
};

const SyncProgressView = ({ progress }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const percent =
    progress?.total > 0
      ? Math.min((progress.current / progress.total) * 100, 100)
      : 0;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percent,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [percent, widthAnim]);

  useEffect(() => {
    if (progress?.phase !== "downloading") {
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [progress?.phase, pulseAnim]);

  if (!progress) return null;

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const percentLabel = `${Math.round(percent).toLocaleString("ar")}٪`;

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
        <Text style={styles.phaseText}>
          {PHASE_LABELS[progress.phase] ?? PHASE_LABELS.downloading}
        </Text>
      </View>

      {progress.total > 0 && (
        <>
          <View style={styles.track}>
            <Animated.View
              style={[styles.fill, { width: widthInterpolated }]}
            />
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {progress.current.toLocaleString("ar")} /{" "}
              {progress.total.toLocaleString("ar")}
            </Text>
            <Text style={styles.percentText}>{percentLabel}</Text>
          </View>
        </>
      )}

      {progress.bytes > 0 && (
        <Text style={styles.bytesText}>{formatBytesLabel(progress.bytes)}</Text>
      )}
    </View>
  );
};

function formatBytesLabel(bytes) {
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Math.round(kb).toLocaleString("ar")} ك.ب`;
  }
  return `${Number((kb / 1024).toFixed(1)).toLocaleString("ar")} م.ب`;
}

export default SyncProgressView;

const styles = StyleSheet.create({
  wrapper: {
    width: 240,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.BorderRadius.circular,
    backgroundColor: theme.Tcolors.primaryLight,
  },
  phaseText: {
    fontSize: theme.FontSizes.body,
    fontFamily: theme.Fonts.cairoRegular,
    color: theme.Tcolors.primaryText,
  },
  track: {
    width: "100%",
    height: 6,
    borderRadius: theme.BorderRadius.sm,
    backgroundColor: theme.Tcolors.cardBackground,
    borderWidth: 1,
    borderColor: theme.Tcolors.cardBorder,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: theme.BorderRadius.sm,
    backgroundColor: theme.Tcolors.primaryLight,
  },
  metaRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  metaText: {
    fontSize: theme.FontSizes.small,
    fontFamily: theme.Fonts.cairoRegular,
    color: theme.Tcolors.secondaryText,
  },
  percentText: {
    fontSize: theme.FontSizes.small,
    fontFamily: theme.Fonts.cairoBold,
    color: theme.Tcolors.goldLight,
  },
  bytesText: {
    marginTop: 8,
    fontSize: theme.FontSizes.small,
    fontFamily: theme.Fonts.cairoRegular,
    color: theme.Tcolors.goldDim,
  },
});
