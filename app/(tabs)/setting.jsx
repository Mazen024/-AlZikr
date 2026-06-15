import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as StoreReview from "expo-store-review";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePrayerContext } from "../../context/PrayerContext";
import { usePrayerNotifications } from "../../hooks/usePrayerNotifications";
import root from "../constants/root";

const { Tcolors, Fonts, FontSizes, Spacing, BorderRadius } = root;
const ACCENT = "#4eca8b";
const METHOD_KEY = "calc_method";

const CALC_METHODS = [
  { id: 1, name: "جامعة العلوم الإسلامية بكراتشي" },
  { id: 2, name: "رابطة العالم الإسلامي" },
  { id: 3, name: "منظمة أمريكا الشمالية" },
  { id: 4, name: "رابطة العالم الإسلامي (مكة)" },
  { id: 5, name: "جمعية أم القرى" },
  { id: 7, name: "المجلس الإسلامي لأمريكا الشمالية" },
  { id: 8, name: "خليج الكويت" },
  { id: 9, name: "وزارة الأوقاف المصرية" },
];

function SectionLabel({ label }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function SettingRow({ icon, title, sub, right, onPress, danger, loading }) {
  const Wrap = onPress ? TouchableOpacity : View;
  return (
    <Wrap
      style={[styles.row, danger && styles.rowDanger]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
          {loading ? (
            <ActivityIndicator size="small" color={ACCENT} />
          ) : (
            <Text style={{ fontSize: 15 }}>{icon}</Text>
          )}
        </View>
      )}
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, danger && { color: "#e4312b" }]}>
          {title}
        </Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      {right}
    </Wrap>
  );
}

function Group({ children }) {
  return <View style={styles.group}>{children}</View>;
}

function CalcMethodModal({ visible, selected, onSelect, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>طريقة الحساب</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {CALC_METHODS.map((method, i) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodRow,
                  i < CALC_METHODS.length - 1 && styles.methodDivider,
                ]}
                onPress={() => {
                  onSelect(method);
                  onClose();
                }}
              >
                <Text style={styles.methodName}>{method.name}</Text>
                {selected?.id === method.id && (
                  <Text style={styles.methodCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>إغلاق</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function SettingsPage() {
  const { prayerTime, setPrayerTime } = usePrayerContext();
  const [isFetching, setIsFetching] = useState(false);
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [calcMethod, setCalcMethodState] = useState(CALC_METHODS[4]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(METHOD_KEY);
        if (raw) setCalcMethodState(JSON.parse(raw));
      } catch (e) {
        console.warn("Failed to load calc method:", e.message);
      }
    })();
  }, []);

  const setCalcMethod = async (method) => {
    setCalcMethodState(method);
    try {
      await AsyncStorage.setItem(METHOD_KEY, JSON.stringify(method));
    } catch (e) {
      console.warn("Failed to save calc method:", e.message);
    }
  };

  const fetchIfNeeded = useCallback(async () => {
    if (prayerTime || isFetching) return;
    setIsFetching(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      const today = new Date();
      const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=${calcMethod.id}`,
      );
      const data = await res.json();
      if (data.code === 200) setPrayerTime(data.data.timings);
    } catch (e) {
      console.warn("Settings fetch failed:", e.message);
    } finally {
      setIsFetching(false);
    }
  }, [prayerTime, isFetching, setPrayerTime, calcMethod]);

  useEffect(() => {
    fetchIfNeeded();
  }, [fetchIfNeeded]);

  const { enabled, toggle, scheduledCount, isScheduling } =
    usePrayerNotifications(prayerTime);

  const isLoading = isFetching || isScheduling;

  function notifSubLabel() {
    if (isFetching) return "جاري تحميل الأوقات…";
    if (isScheduling) return "جاري الجدولة…";
    if (!prayerTime) return "لم يتم تحميل الأوقات";
    if (enabled) return `${scheduledCount} صلوات مجدولة اليوم`;
    return "معطّل";
  }

  const handleRate = async () => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();

      if (isAvailable) {
        await StoreReview.requestReview();
      } else {
        Linking.openURL("https://apps.apple.com/app/idYOUR_APP_ID");
      }
    } catch (e) {
      console.log(e);
      Linking.openURL("https://apps.apple.com/app/idYOUR_APP_ID");
    }
  };

  const handleContact = () => {
    Linking.openURL(
      "mailto:adelmazen@gmail.com?subject=تواصل معنا - تطبيق الصلاة",
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <View style={{ width: 32 }} />
      </View>

      <CalcMethodModal
        visible={showMethodPicker}
        selected={calcMethod}
        onSelect={(m) => {
          setCalcMethod(m);
          setPrayerTime(null);
        }}
        onClose={() => setShowMethodPicker(false)}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <SectionLabel label="الإشعارات" />
        <Group>
          <SettingRow
            icon="🔔"
            title="إشعارات الصلاة"
            sub={notifSubLabel()}
            loading={isLoading}
            right={
              <Switch
                value={enabled}
                onValueChange={toggle}
                disabled={isLoading || !prayerTime}
                trackColor={{ false: "rgba(255,255,255,0.12)", true: ACCENT }}
                thumbColor={isLoading ? "rgba(255,255,255,0.35)" : "#fff"}
                ios_backgroundColor="rgba(255,255,255,0.12)"
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🕌"
            title="تنبيه الأذان"
            sub="قريباً"
            right={
              <Switch
                value={false}
                disabled
                trackColor={{ false: "rgba(255,255,255,0.08)" }}
                thumbColor="rgba(255,255,255,0.3)"
                ios_backgroundColor="rgba(255,255,255,0.08)"
              />
            }
          />
        </Group>

        <SectionLabel label="حساب الأوقات والقبلة" />
        <Group>
          <SettingRow
            icon="🧮"
            title="طريقة الحساب"
            sub={calcMethod.name}
            onPress={() => setShowMethodPicker(true)}
            right={<Text style={styles.chevron}>›</Text>}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="📍"
            title="الموقع"
            sub="تلقائي عبر GPS"
            right={<Text style={styles.chevron}>›</Text>}
          />
        </Group>

        <SectionLabel label="المظهر" />
        <Group>
          <SettingRow
            icon="🌙"
            title="المظهر"
            sub="داكن"
            right={<Text style={styles.val}>-</Text>}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🌐"
            title="اللغة"
            sub="العربية"
            right={<Text style={styles.val}>-</Text>}
          />
        </Group>

        <SectionLabel label="عن التطبيق" />
        <Group>
          <SettingRow
            icon="📖"
            title="الإصدار"
            sub="النسخة 1.0.0"
            right={<Text style={styles.val}>-</Text>}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="⭐"
            title="قيّم التطبيق"
            sub="شاركنا رأيك"
            onPress={handleRate}
            right={<Text style={styles.chevron}>›</Text>}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="📧"
            title="تواصل معنا"
            onPress={handleContact}
            right={<Text style={styles.chevron}>›</Text>}
          />
        </Group>

        <SectionLabel label="غزة في قلوبنا 🇵🇸" />
        <Group>
          <SettingRow
            icon="🕊"
            title="ادعم غزة"
            sub="تبرع عبر UNRWA"
            danger
            onPress={() => Linking.openURL("https://www.unrwa.org/donate")}
            right={
              <Text style={[styles.chevron, { color: "#e4312b" }]}>›</Text>
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🌍"
            title="منظمة أطباء بلا حدود"
            sub="دعم طبي عاجل لغزة"
            danger
            onPress={() => Linking.openURL("https://www.msf.org/donate")}
            right={
              <Text style={[styles.chevron, { color: "#e4312b" }]}>›</Text>
            }
          />
        </Group>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Tcolors.primaryBackground },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Tcolors.secondaryBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: Tcolors.cardBorder,
  },
  headerTitle: {
    fontSize: FontSizes.body,
    fontWeight: "700",
    color: Tcolors.white,
    fontFamily: Fonts.cairoBold,
  },
  scroll: { flex: 1 },
  sectionLabel: {
    color: "rgba(255,255,255,0.28)",
    fontSize: 10,
    letterSpacing: 0.6,
    textAlign: "right",
    marginTop: 20,
    marginBottom: 6,
    marginHorizontal: Spacing.md,
    fontFamily: Fonts.cairoRegular,
  },
  group: {
    marginHorizontal: Spacing.md,
    backgroundColor: Tcolors.cardBackground,
    borderRadius: BorderRadius.lg,
    borderWidth: 0.5,
    borderColor: Tcolors.cardBorder,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  rowDanger: { borderColor: "rgba(228,49,43,0.2)" },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconDanger: { backgroundColor: "rgba(228,49,43,0.1)" },
  rowText: { flex: 1, alignItems: "flex-end" },
  rowTitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "500",
    fontFamily: Fonts.cairoRegular,
    textAlign: "right",
  },
  rowSub: {
    color: "rgba(255,255,255,0.28)",
    fontSize: 10,
    marginTop: 1,
    textAlign: "right",
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 14,
  },
  chevron: { color: "rgba(255,255,255,0.2)", fontSize: 18 },
  val: { color: "rgba(255,255,255,0.3)", fontSize: 11 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Tcolors.secondaryBackground ?? "#131f2e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: "70%",
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 12,
    fontFamily: Fonts.cairoBold,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  methodDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  methodName: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    textAlign: "right",
    flex: 1,
    fontFamily: Fonts.cairoRegular,
  },
  methodCheck: {
    color: ACCENT,
    fontSize: 16,
    marginLeft: 10,
  },
  modalCancel: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  modalCancelText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontFamily: Fonts.cairoRegular,
  },
});
