import { Magnetometer } from "expo-sensors";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { usePrayerContext } from "../../context/PrayerContext";
import { getQiblaBearing } from "../constants/homeConstants";
import root from "../constants/root";
const { Tcolors } = root;

function CalibrationModal({ visible, onDismiss }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fadeAnim, slideAnim, visible]);

  function handleDismiss() {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 40,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(onDismiss);
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.modalBackdrop, { opacity: fadeAnim }]}>
        <Animated.View
          style={[styles.modalCard, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.modalIconRing}>
            <Text style={styles.modalIcon}>🧭</Text>
          </View>

          <Text style={styles.modalTitle}>معايرة البوصلة</Text>

          <Text style={styles.modalBody}>
            للحصول على نتائج دقيقة، حرّك هاتفك على شكل{" "}
            <Text style={styles.modalBodyAccent}>رقم 8</Text> في الهواء عدة مرات
            قبل الاستخدام.
          </Text>

          <View style={styles.figure8Wrapper}>
            <Text style={styles.figure8}>∞</Text>
            <Text style={styles.figure8Label}>حرّك هاتفك هكذا</Text>
          </View>

          <TouchableOpacity
            style={styles.modalBtn}
            onPress={handleDismiss}
            activeOpacity={0.85}
          >
            <Text style={styles.modalBtnText}>فهمت، ابدأ</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export default function QiblaCompass() {
  const [magData, setMagData] = useState(null);
  const [available, setAvailable] = useState(true);
  const [showCalibration, setShowCalibration] = useState(false);
  const ringAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const lastRingRef = useRef(0);
  const hasVibrated = useRef(false);
  const { coords } = usePrayerContext();

  const qiblaAngle =
    coords?.latitude != null && coords?.longitude != null
      ? getQiblaBearing(coords.latitude, coords.longitude)
      : null;

  useEffect(() => {
    const timer = setTimeout(() => setShowCalibration(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let sub = null;
    Magnetometer.isAvailableAsync().then((ok) => {
      if (!ok) {
        setAvailable(false);
        return;
      }
      Magnetometer.setUpdateInterval(100);
      sub = Magnetometer.addListener(setMagData);
    });
    return () => sub?.remove();
  }, []);

  let compassHeading = 0;
  if (magData) {
    const { x, y } = magData;
    const raw = Math.atan2(-x, y) * (180 / Math.PI);
    compassHeading = (raw + 360) % 360;
  }

  useEffect(() => {
    let delta = compassHeading - lastRingRef.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const target = lastRingRef.current + delta;
    lastRingRef.current = target;
    Animated.timing(ringAnim, {
      toValue: target,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [compassHeading, ringAnim]);

  function angleDifference(a, b) {
    let diff = Math.abs(a - b);
    return diff > 180 ? 360 - diff : diff;
  }
  const isAligned =
    qiblaAngle != null && angleDifference(compassHeading, qiblaAngle) < 4;

  useEffect(() => {
    if (isAligned && !hasVibrated.current) {
      Vibration.vibrate(200);
      hasVibrated.current = true;
    }
    if (!isAligned) hasVibrated.current = false;
  }, [isAligned]);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isAligned ? 1.15 : 1,
      useNativeDriver: true,
      friction: 6,
      tension: 100,
    }).start();

    if (isAligned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
    }
  }, [glowAnim, isAligned, scaleAnim]);

  const SIZE = 350;
  const CENTER = SIZE / 2;
  const CARD_R = CENTER - 38;
  const TICK_R = CENTER - 16;
  const NEEDLE_R = CENTER - 48;

  const kaabaAngleRad = ((qiblaAngle ?? 0) - 90) * (Math.PI / 180);
  const kaabaX = CENTER + NEEDLE_R * Math.cos(kaabaAngleRad);
  const kaabaY = CENTER + NEEDLE_R * Math.sin(kaabaAngleRad);

  return (
    <View style={styles.root}>
      <CalibrationModal
        visible={showCalibration}
        onDismiss={() => setShowCalibration(false)}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>اتجاه القبلة</Text>
          <Text style={styles.headerTitle}>Qibla Direction</Text>
        </View>
        {qiblaAngle != null && (
          <View style={styles.qiblaBadge}>
            <Text style={styles.qiblaBadgeValue}>
              {Math.round(qiblaAngle)}°
            </Text>
            <Text style={styles.qiblaBadgeLabel}>Qibla</Text>
          </View>
        )}
      </View>

      {!available ? (
        <View style={styles.unavailBox}>
          <Text style={styles.unavailIcon}>⚠️</Text>
          <Text style={styles.unavailText}>
            المجس المغناطيسي غير متاح في هذا الجهاز
          </Text>
        </View>
      ) : (
        <View style={styles.compassWrapper}>
          {isAligned && (
            <Animated.View
              style={[
                styles.alignGlowRing,
                { opacity: glowAnim, width: SIZE + 24, height: SIZE + 24 },
              ]}
            />
          )}

          <View style={{ width: SIZE, height: SIZE }}>
            <View
              style={[
                styles.bezel,
                { width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
              ]}
            />

            {Array.from({ length: 72 }).map((_, i) => {
              const deg = i * 5;
              const isMaj = i % 6 === 0;
              const isCard = i % 18 === 0;
              const tickH = isCard ? 16 : isMaj ? 10 : 5;
              const rad = (deg - 90) * (Math.PI / 180);
              const ox = CENTER + TICK_R * Math.cos(rad);
              const oy = CENTER + TICK_R * Math.sin(rad);
              const ix = CENTER + (TICK_R - tickH) * Math.cos(rad);
              const iy = CENTER + (TICK_R - tickH) * Math.sin(rad);
              return (
                <View
                  key={i}
                  style={{
                    position: "absolute",
                    left: ix + (ox - ix) / 2 - 0.75,
                    top: iy + (oy - iy) / 2 - tickH / 2,
                    width: isCard ? 1.5 : 1,
                    height: tickH,
                    backgroundColor: isCard
                      ? "rgba(255,255,255,0.6)"
                      : isMaj
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.08)",
                    transform: [{ rotate: `${deg}deg` }],
                  }}
                />
              );
            })}

            {[
              { label: "N", deg: 0, color: "#e05c5c" },
              { label: "E", deg: 90, color: Tcolors.secondaryText },
              { label: "S", deg: 180, color: Tcolors.secondaryText },
              { label: "W", deg: 270, color: Tcolors.secondaryText },
            ].map(({ label, deg, color }) => {
              const rad = (deg - 90) * (Math.PI / 180);
              const cx = CENTER + CARD_R * Math.cos(rad);
              const cy = CENTER + CARD_R * Math.sin(rad);
              return (
                <Text
                  key={label}
                  style={{
                    position: "absolute",
                    left: cx - 7,
                    top: cy - 9,
                    fontSize: label === "N" ? 13 : 11,
                    fontWeight: "700",
                    color,
                    width: 14,
                    textAlign: "center",
                    letterSpacing: 0.5,
                  }}
                >
                  {label}
                </Text>
              );
            })}

            {qiblaAngle != null && (
              <View
                style={{
                  position: "absolute",
                  left: kaabaX - 18,
                  top: kaabaY - 18,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: Tcolors.primaryLightTransparent,
                  borderWidth: 1.5,
                  borderColor: Tcolors.ACCENT,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: Tcolors.ACCENT,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 8,
                }}
              >
                <Text style={{ fontSize: 18 }}>🕋</Text>
              </View>
            )}

            <Animated.View
              style={{
                position: "absolute",
                width: SIZE,
                height: SIZE,
                transform: [
                  {
                    rotate: ringAnim.interpolate({
                      inputRange: [-7200, 7200],
                      outputRange: ["-7200deg", "7200deg"],
                    }),
                  },
                ],
              }}
            >
              <View
                style={{
                  position: "absolute",
                  left: CENTER - 3,
                  top: CENTER + 12,
                  width: 6,
                  height: CENTER - 62,
                  borderRadius: 3,
                  backgroundColor: "rgba(255,255,255,0.12)",
                }}
              />
              <Animated.View
                style={{
                  position: "absolute",
                  left: CENTER - 4,
                  top: CENTER - (CENTER - 62) - 12,
                  width: 8,
                  height: CENTER - 62,
                  borderRadius: 4,
                  backgroundColor: isAligned ? Tcolors.ACCENT : "#e05c5c",
                  shadowColor: isAligned ? Tcolors.ACCENT : "#e05c5c",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 6,
                  transform: [{ scale: scaleAnim }],
                }}
              />
            </Animated.View>

            <View style={styles.hub}>
              <Text style={styles.hubDeg}>
                {magData ? `${Math.round(compassHeading)}°` : "—"}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.hintText}>
          {qiblaAngle != null
            ? "وجّه الهاتف حتى يتطابق رأس الإبرة مع أيقونة الكعبة"
            : "جارٍ تحديد الموقع…"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Tcolors.secondaryBackground
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Tcolors.ACCENT,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "300",
    color: Tcolors.white,
    letterSpacing: -0.3,
  },
  qiblaBadge: {
    alignItems: "center",
    backgroundColor: Tcolors.primaryLightTransparent,
    borderWidth: 1,
    borderColor: "rgba(78,202,139,0.25)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  qiblaBadgeValue: {
    fontSize: 18,
    fontWeight: "300",
    color: Tcolors.ACCENT,
    letterSpacing: -0.5,
  },
  qiblaBadgeLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "rgba(78,202,139,0.6)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 1,
  },
  compassWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  alignGlowRing: {
    position: "absolute",
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: Tcolors.borderBright,
    zIndex: -1,
  },
  bezel: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  hub: {
    position: "absolute",
    left: 350 / 2 - 22,
    top: 350 / 2 - 22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0c1520",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  hubDeg: {
    fontSize: 13,
    fontWeight: "500",
    color: Tcolors.secondaryText,
    letterSpacing: 0.5,
  },
  footer: {
    width: "100%",
    alignItems: "center",
    gap: 10,
  },
  headingReadout: {
    fontSize: 32,
    fontWeight: "200",
    color: Tcolors.white,
    letterSpacing: -1,
  },
  hintText: {
    fontSize: 12,
    color: Tcolors.tertiaryText,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
    marginBottom: 15,
  },
  unavailBox: {
    alignItems: "center",
    gap: 10,
  },
  unavailIcon: { fontSize: 28 },
  unavailText: {
    fontSize: 13,
    color: Tcolors.secondaryText,
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  modalCard: {
    backgroundColor: "#0f1f30",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  modalIconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(78,202,139,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(78,202,139,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalIcon: { fontSize: 32 },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255,255,255,0.92)",
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 20,
  },
  modalBodyAccent: {
    color: Tcolors.ACCENT,
    fontWeight: "700",
  },
  figure8Wrapper: {
    alignItems: "center",
    marginBottom: 24,
    gap: 4,
  },
  figure8: {
    fontSize: 56,
    color: Tcolors.ACCENT,
    lineHeight: 64,
    opacity: 0.8,
  },
  figure8Label: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 0.5,
  },
  modalBtn: {
    width: "100%",
    backgroundColor: Tcolors.ACCENT,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0c1520",
  },
});
