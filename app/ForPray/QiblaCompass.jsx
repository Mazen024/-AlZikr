import { Magnetometer } from "expo-sensors";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, Vibration, View } from "react-native";

const ACCENT = "#4eca8b";
const BG_DARK = "#0c1520";

function getQiblaBearing(userLat, userLon) {
  const KAABA_LAT = 21.4225;
  const KAABA_LON = 39.8262;
  const φ1 = (userLat * Math.PI) / 180;
  const φ2 = (KAABA_LAT * Math.PI) / 180;
  const Δλ = ((KAABA_LON - userLon) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export default function QiblaCompass({ userLat, userLon }) {
  const [magData, setMagData] = useState(null);
  const [available, setAvailable] = useState(true);
  const ringAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lastRingRef = useRef(0);
  const hasVibrated = useRef(false);

  const qiblaAngle =
    userLat != null && userLon != null
      ? getQiblaBearing(userLat, userLon)
      : null;

  useEffect(() => {
    let sub = null;
    Magnetometer.isAvailableAsync().then((ok) => {
      if (!ok) {
        setAvailable(false);
        return;
      }
      Magnetometer.setUpdateInterval(200);
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
    const target_raw = compassHeading;

    let delta = target_raw - lastRingRef.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const target = lastRingRef.current + delta;
    lastRingRef.current = target;

    Animated.timing(ringAnim, {
      toValue: target,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [compassHeading, ringAnim]);

  const SIZE = 260;
  const CENTER = SIZE / 2;
  const RING_R = CENTER - 2;
  const CARD_R = CENTER - 40;
  const TICK_R = CENTER - 18;
  const KAABA_R = CENTER - 42;

  const kaabaAngleRad = ((qiblaAngle ?? 0) - 90) * (Math.PI / 180);
  const kaabaX = CENTER + KAABA_R * Math.cos(kaabaAngleRad);
  const kaabaY = CENTER + KAABA_R * Math.sin(kaabaAngleRad);
  const KAABA_ICON_SIZE = 30;

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

    if (!isAligned) {
      hasVibrated.current = false;
    }
  }, [isAligned]);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isAligned ? 1.2 : 1,
      useNativeDriver: true,
      friction: 5,
      tension: 80,
    }).start();
  }, [isAligned, scaleAnim]);

  return (
    <View style={styles.qiblaCard}>
      <Text style={styles.qiblaTitle}>Qibla Direction • اتجاه القبلة</Text>

      {!available ? (
        <Text style={styles.qiblaUnavail}>
          المجس المغناطيسي غير متاح في هذا الجهاز
        </Text>
      ) : (
        <>
          <View style={{ width: SIZE, height: SIZE, marginVertical: 16 }}>
            <View
              style={{
                position: "absolute",
                width: SIZE,
                height: SIZE,
                borderRadius: RING_R,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                backgroundColor: "rgba(255,255,255,0.02)",
              }}
            />

            {Array.from({ length: 72 }).map((_, i) => {
              const deg = i * 5;
              const isMaj = i % 3 === 0;
              const isCard = i % 18 === 0;
              const tickH = isCard ? 14 : isMaj ? 9 : 6;
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
                    left: ix + (ox - ix) / 2 - 0.5,
                    top: iy + (oy - iy) / 2 - tickH / 2,
                    width: 1,
                    height: tickH,
                    backgroundColor: isCard
                      ? "rgba(255,255,255,0.55)"
                      : isMaj
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(255,255,255,0.1)",
                    transform: [{ rotate: `${deg}deg` }],
                    transformOrigin: "center center",
                  }}
                />
              );
            })}

            {[
              { label: "N", deg: 0, color: "#e05c5c" },
              { label: "E", deg: 90, color: "rgba(255,255,255,0.5)" },
              { label: "S", deg: 180, color: "rgba(255,255,255,0.5)" },
              { label: "W", deg: 270, color: "rgba(255,255,255,0.5)" },
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
                    top: cy - 8,
                    fontSize: 12,
                    fontWeight: "700",
                    color,
                    width: 14,
                    textAlign: "center",
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
                  left: kaabaX - KAABA_ICON_SIZE / 2,
                  top: kaabaY - KAABA_ICON_SIZE / 2,
                  width: KAABA_ICON_SIZE,
                  height: KAABA_ICON_SIZE,
                  borderRadius: KAABA_ICON_SIZE / 2,
                  backgroundColor: "rgba(78,202,139,0.18)",
                  borderWidth: 1.5,
                  borderColor: ACCENT,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 16 }}>🕋</Text>
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
              <Animated.View
                style={{
                  position: "absolute",
                  left: CENTER - 13,
                  top: isAligned
                    ? CENTER - (KAABA_R - 20)
                    : CENTER - (KAABA_R - 30),
                  width: 0,
                  height: 0,
                  borderLeftWidth: 13,
                  borderRightWidth: 13,
                  borderBottomWidth: KAABA_R - 60,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderBottomColor: isAligned
                    ? ACCENT
                    : "rgba(255,255,255,0.5)",
                  zIndex: 11,
                  transform: [{ scale: scaleAnim }],
                }}
              />
            </Animated.View>

            <View
              style={{
                position: "absolute",
                left: CENTER - 30,
                top: CENTER - 30,
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: BG_DARK,
                zIndex: 10,
              }}
            />

            <View
              style={{
                position: "absolute",
                left: CENTER - 16,
                top: CENTER - 14,
                zIndex: 12,
              }}
            >
              <Text style={styles.qiblaInfoValues}>
                {magData ? `${Math.round(compassHeading)}°` : "—"}
              </Text>
            </View>

            <View
              style={{
                position: "absolute",
                left: CENTER - 5,
                top: 0,
                width: 0,
                height: 0,
                borderLeftWidth: 5,
                borderRightWidth: 5,
                borderTopWidth: 10,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderTopColor: ACCENT,
              }}
            />
          </View>

          <View style={styles.qiblaInfoBox}>
            <Text style={styles.qiblaInfoLabel}>القبلة</Text>
            <Text style={styles.qiblaInfoValue}>
              {qiblaAngle != null ? `${Math.round(qiblaAngle)}°` : "—"}
            </Text>
          </View>

          {!magData && (
            <Text style={styles.qiblaTip}>
              حرّك هاتفك على شكل رقم 8 للمعايرة
            </Text>
          )}

          <Text style={styles.qiblaHint}>
            {qiblaAngle != null
              ? "وجّه الهاتف حتى تصل أيقونة الكعبة إلى المثلث الأخضر"
              : "جارٍ تحديد الموقع…"}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  qiblaCard: {
    margin: 20,
    marginTop: 28,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  qiblaTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.75)",
    marginBottom: 4,
    textAlign: "center",
  },
  qiblaUnavail: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 13,
    textAlign: "center",
    padding: 16,
  },
  qiblaTip: {
    marginTop: 8,
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    textAlign: "center",
  },
  qiblaHint: {
    marginTop: 10,
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 18,
  },

  qiblaInfoBox: { alignItems: "center", paddingVertical: 10 },
  qiblaInfoLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    marginBottom: 3,
  },
  qiblaInfoValue: {
    fontSize: 20,
    fontWeight: "300",
    color: ACCENT,
    letterSpacing: -0.5,
  },
  qiblaInfoValues: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    fontSize: 18,
    color: ACCENT,
  },
});
