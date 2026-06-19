import { useMemo } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  getHijriInfo,
  HIJRI_MONTH_NAMES,
  IMPORTANT_HIJRI_DATES,
  WEEKDAY_LABELS,
} from "../constants/homeConstants";
import root from "../constants/root";

const { Tcolors, Fonts } = root;

export default function HijriModal({ visible, onClose }) {
  const hijri = useMemo(() => (visible ? getHijriInfo() : null), [visible]);

  if (!hijri) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay} />
      </Modal>
    );
  }

  const cells = [];
  for (let i = 0; i < hijri.firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= hijri.daysInMonth; d++) cells.push(d);

  const importantInThisMonth = IMPORTANT_HIJRI_DATES.filter(
    (e) => e.month === hijri.month,
  );
  const importantDayNumbers = new Set(importantInThisMonth.map((e) => e.day));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>التقويم الهجري</Text>
          </View>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.todayCard}>
              <Text style={styles.todayHijri}>
                {hijri.day} {hijri.monthName} {hijri.year}هـ
              </Text>
            </View>

            <View style={styles.weekdayRow}>
              {WEEKDAY_LABELS.map((w) => (
                <Text key={w} style={styles.weekdayLabel}>
                  {w}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((d, idx) => {
                const isToday = d === hijri.day;
                const isImportant = d != null && importantDayNumbers.has(d);
                return (
                  <View
                    key={idx}
                    style={[
                      styles.gridCell,
                      isToday && styles.gridCellToday,
                      isImportant && !isToday && styles.gridCellImportant,
                    ]}
                  >
                    {d != null && (
                      <Text
                        style={[
                          styles.gridCellText,
                          isToday && styles.gridCellTextToday,
                          isImportant &&
                            !isToday &&
                            styles.gridCellTextImportant,
                        ]}
                      >
                        {d}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            {importantInThisMonth.length > 0 && (
              <View style={styles.eventsBlock}>
                <Text style={styles.eventsHeading}>أيام مهمة هذا الشهر</Text>
                {importantInThisMonth.map((e) => (
                  <View key={e.label} style={styles.eventRow}>
                    <Text style={styles.eventDot}>●</Text>
                    <Text style={styles.eventLabel}>{e.label}</Text>
                    <Text style={styles.eventDay}>{e.day}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.eventsBlock}>
              <Text style={styles.eventsHeading}>مناسبات السنة الهجرية</Text>
              {IMPORTANT_HIJRI_DATES.map((e) => (
                <View key={e.label} style={styles.eventRow}>
                  <Text style={styles.eventDot}>●</Text>
                  <Text style={styles.eventLabel}>{e.label}</Text>
                  <Text style={styles.eventDay}>
                    {e.day} {HIJRI_MONTH_NAMES[e.month - 1]}
                  </Text>
                </View>
              ))}
            </View>

            <View style={{ height: 12 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    height: "80%",
    backgroundColor: Tcolors.background || "#0d1117",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Tcolors.primaryText,
    fontFamily: Fonts.arabic,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  todayCard: {
    backgroundColor: Tcolors.primaryBackground,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  todayHijri: {
    fontSize: 20,
    fontWeight: "700",
    color: Tcolors.ACCENT,
    fontFamily: Fonts.arabic,
  },
  weekdayRow: {
    flexDirection: "row-reverse",
    marginBottom: 8,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    color: Tcolors.secondaryText || "rgba(255,255,255,0.4)",
    fontFamily: Fonts.arabic,
  },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  gridCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  gridCellToday: {
    backgroundColor: Tcolors.ACCENT,
    borderRadius: 999,
  },
  gridCellImportant: {
    backgroundColor: "rgba(127,119,221,0.18)",
    borderRadius: 999,
  },
  gridCellText: {
    fontSize: 13,
    color: Tcolors.primaryText,
    fontFamily: Fonts.arabic,
  },
  gridCellTextToday: {
    color: "#0d1117",
    fontWeight: "700",
  },
  gridCellTextImportant: {
    color: "#9B92E8",
    fontWeight: "600",
  },
  eventsBlock: {
    marginTop: 20,
  },
  eventsHeading: {
    fontSize: 13,
    fontWeight: "600",
    color: Tcolors.secondaryText || "rgba(255,255,255,0.55)",
    textAlign: "right",
    marginBottom: 8,
    fontFamily: Fonts.arabic,
  },
  eventRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  eventDot: {
    fontSize: 8,
    color: Tcolors.primaryDark,
  },
  eventLabel: {
    flex: 1,
    fontSize: 13,
    color: Tcolors.primaryText,
    textAlign: "right",
    fontFamily: Fonts.arabic,
  },
  eventDay: {
    fontSize: 12,
    color: Tcolors.secondaryText || "rgba(255,255,255,0.4)",
    fontFamily: Fonts.arabic,
  },
});
