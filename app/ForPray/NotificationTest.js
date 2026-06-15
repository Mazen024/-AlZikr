/**
 * NotificationTest.js
 * Drop this screen anywhere in your app to test prayer notifications.
 * Pass `prayerTimes` from your existing PrayTimes fetch, or leave it
 * undefined to use the built-in test-only buttons.
 *
 * Usage:
 *   import NotificationTest from "./NotificationTest";
 *   <NotificationTest prayerTimes={prayerTimes} />
 */

import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePrayerNotifications } from "../../hooks/usePrayerNotifications";

const ACCENT = "#4eca8b";
const BG = "#0c1520";
const CARD = "#112030";
const BORDER = "rgba(255,255,255,0.08)";

const PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

function StatusBadge({ status }) {
  const map = {
    granted: { color: ACCENT, label: "✓ Granted" },
    denied: { color: "#e05c5c", label: "✗ Denied" },
    undetermined: { color: "#f0a500", label: "⏳ Pending" },
  };
  const s = map[status] ?? { color: "gray", label: status ?? "Unknown" };
  return (
    <View style={[badge.wrap, { borderColor: s.color }]}>
      <Text style={[badge.text, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  text: { fontSize: 12, fontWeight: "600" },
});

export default function NotificationTest({ prayerTimes }) {
  const {
    permissionStatus,
    scheduledCount,
    isScheduling,
    lastScheduledFor,
    scheduleAll,
    scheduleTest,
    cancelAll,
    getPending,
  } = usePrayerNotifications(prayerTimes);

  const [pending, setPending] = useState([]);
  const [testLog, setTestLog] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);

  function log(msg) {
    const ts = new Date().toLocaleTimeString();
    setTestLog((prev) => [`[${ts}] ${msg}`, ...prev].slice(0, 20));
  }

  const refreshPending = useCallback(async () => {
    setLoadingPending(true);
    const list = await getPending();
    setPending(list);
    setLoadingPending(false);
  }, [getPending]);

  useEffect(() => {
    refreshPending();
  }, [refreshPending, scheduledCount]);

  async function handleScheduleAll() {
    if (!prayerTimes) {
      log("⚠️ No prayer times provided — fetch them first");
      return;
    }
    log("Scheduling all remaining prayers for today…");
    const n = await scheduleAll();
    log(`✓ Scheduled ${n} prayer notification${n !== 1 ? "s" : ""}`);
    refreshPending();
  }

  async function handleTest(name, delay) {
    log(`Sending test notification for ${name} in ${delay}s…`);
    const id = await scheduleTest(name, delay);
    if (id) log(`✓ Test fired — ID: ${id.slice(0, 8)}…`);
    else log("✗ Failed (check permissions)");
    setTimeout(refreshPending, (delay + 1) * 1000);
  }

  async function handleCancelAll() {
    await cancelAll();
    log("🗑 Cancelled all prayer notifications");
    refreshPending();
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {/* Header */}
      <Text style={s.title}>Notification Test Panel</Text>
      <Text style={s.subtitle}>Manage and test prayer time notifications</Text>

      {/* Permission status */}
      <View style={s.card}>
        <Text style={s.cardLabel}>Permission Status</Text>
        <StatusBadge status={permissionStatus} />
        {permissionStatus === "denied" && (
          <Text style={s.hint}>
            Open Settings → Notifications → enable for this app.
          </Text>
        )}
      </View>

      {/* Scheduled summary */}
      <View style={s.card}>
        <Text style={s.cardLabel}>Scheduled Today</Text>
        <Text style={s.bigNum}>{scheduledCount}</Text>
        {lastScheduledFor && (
          <Text style={s.hint}>Last scheduled: {lastScheduledFor}</Text>
        )}
      </View>

      {/* Actions */}
      <View style={s.card}>
        <Text style={s.cardLabel}>Actions</Text>

        <TouchableOpacity
          style={[s.btn, isScheduling && s.btnDisabled]}
          onPress={handleScheduleAll}
          disabled={isScheduling}
        >
          {isScheduling ? (
            <ActivityIndicator color={BG} size="small" />
          ) : (
            <Text style={s.btnText}>📅 Schedule All Remaining Prayers</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.btn, s.btnDanger]}
          onPress={handleCancelAll}
        >
          <Text style={s.btnText}>🗑 Cancel All Prayer Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.btnSecondary} onPress={refreshPending}>
          <Text style={s.btnSecondaryText}>🔄 Refresh Pending List</Text>
        </TouchableOpacity>
      </View>

      {/* Quick test — send individual test notifications */}
      <View style={s.card}>
        <Text style={s.cardLabel}>Quick Tests (fires in 5 s)</Text>
        <View style={s.grid}>
          {PRAYERS.map((name) => (
            <TouchableOpacity
              key={name}
              style={s.chipBtn}
              onPress={() => handleTest(name, 5)}
            >
              <Text style={s.chipText}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[s.cardLabel, { marginTop: 14 }]}>
          Instant Test (fires in 3 s)
        </Text>
        <TouchableOpacity
          style={[s.btn, { backgroundColor: "#2a6a9e" }]}
          onPress={() => handleTest("Fajr", 3)}
        >
          <Text style={s.btnText}>⚡ Send Instant Test (Fajr)</Text>
        </TouchableOpacity>
      </View>

      {/* Pending list */}
      <View style={s.card}>
        <Text style={s.cardLabel}>
          Pending Notifications ({pending.length})
        </Text>
        {loadingPending ? (
          <ActivityIndicator color={ACCENT} />
        ) : pending.length === 0 ? (
          <Text style={s.hint}>None scheduled.</Text>
        ) : (
          pending.map((n, i) => {
            const triggerDate = n.trigger?.value
              ? new Date(n.trigger.value).toLocaleTimeString()
              : n.trigger?.dateComponents
                ? `${n.trigger.dateComponents.hour}:${String(
                    n.trigger.dateComponents.minute,
                  ).padStart(2, "0")}`
                : "—";
            return (
              <View key={i} style={s.pendingRow}>
                <Text style={s.pendingName}>{n.content.title}</Text>
                <Text style={s.pendingTime}>{triggerDate}</Text>
              </View>
            );
          })
        )}
      </View>

      {/* Log */}
      <View style={s.card}>
        <Text style={s.cardLabel}>Log</Text>
        {testLog.length === 0 ? (
          <Text style={s.hint}>Actions will appear here.</Text>
        ) : (
          testLog.map((line, i) => (
            <Text key={i} style={s.logLine}>
              {line}
            </Text>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  content: { padding: 20, paddingBottom: 60 },

  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.38)",
    marginBottom: 20,
  },

  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 14,
    gap: 10,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    marginBottom: 2,
  },

  bigNum: {
    fontSize: 40,
    fontWeight: "200",
    color: ACCENT,
    letterSpacing: -1,
    lineHeight: 44,
  },
  hint: { fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 18 },

  btn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnDanger: { backgroundColor: "#9e2a2a" },
  btnText: { color: BG, fontSize: 14, fontWeight: "600" },

  btnSecondary: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  btnSecondaryText: { color: "rgba(255,255,255,0.5)", fontSize: 14 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipBtn: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(78,202,139,0.12)",
    borderWidth: 0.5,
    borderColor: "rgba(78,202,139,0.3)",
  },
  chipText: { color: ACCENT, fontSize: 13, fontWeight: "500" },

  pendingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  pendingName: { color: "rgba(255,255,255,0.7)", fontSize: 12, flex: 1 },
  pendingTime: { color: ACCENT, fontSize: 12 },

  logLine: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    fontFamily: "monospace",
    lineHeight: 18,
  },
});
