import { StyleSheet, Switch, Text, View } from "react-native";

const ACCENT = "#4eca8b";

export default function NotificationToggle({
  enabled,
  onToggle,
  scheduledCount,
}) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>🔔</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>Prayer notifications</Text>
        <Text style={styles.sub}>
          {enabled ? `${scheduledCount} prayers scheduled` : "Tap to enable"}
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: "rgba(255,255,255,0.12)", true: ACCENT }}
        thumbColor="#fff"
        ios_backgroundColor="rgba(255,255,255,0.12)"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(78,202,139,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: { fontSize: 16 },
  info: { flex: 1 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.82)",
  },
  sub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
    marginTop: 2,
  },
});
