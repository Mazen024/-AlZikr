import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../constants/root";

const QuranControls = React.memo(
  ({ isRecording, onRecord, versesVisible, onToggleVerses }) => {
    const shineAnimation = useRef(new Animated.Value(0)).current;
    const pulseAnimation = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const shineLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shineAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      );

      shineLoop.start();

      return () => shineLoop.stop();
    }, [shineAnimation]);

    useEffect(() => {
      if (isRecording) {
        const pulseLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimation, {
              toValue: 1.2,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnimation, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        );
        pulseLoop.start();
        return () => pulseLoop.stop();
      } else {
        pulseAnimation.setValue(1);
      }
    }, [isRecording, pulseAnimation]);

    // Animated shine position
    const shineTranslateX = shineAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-5, 5],
    });

    const shineOpacity = shineAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 0.8, 0.3],
    });

    return (
      <View style={styles.bottomControls}>
        <View style={styles.controlsRow}>
          <View style={styles.leftControl}>
            <TouchableOpacity>
              <Text style={styles.errorText}>الأخطاء</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onToggleVerses} activeOpacity={0.7}>
              <Ionicons
                name={versesVisible ? "eye" : "eye-off"}
                size={25}
                color={theme.Colors.textGray}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.micPlaceholder} />
        </View>

        <TouchableOpacity
          style={styles.recordButtonContainer}
          onPress={onRecord}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.shiningLight,
              {
                opacity: shineOpacity,
                transform: [{ translateX: shineTranslateX }],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.recordButton,
              {
                transform: [{ scale: pulseAnimation }],
              },
            ]}
          >
            <View
              style={[styles.micGlow, isRecording && styles.recordingGlow]}
            >
              <Ionicons
                name={isRecording ? "stop-circle" : "mic-circle"}
                size={75}
                color={isRecording ? "#d32f2f" : theme.Colors.primaryLight}
              />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  },
);

QuranControls.displayName = "QuranControls";

const styles = StyleSheet.create({
  bottomControls: {
    backgroundColor: theme.Colors.black,
    paddingHorizontal: theme.Spacing.md,
    paddingVertical: theme.Spacing.sm,
    position: "relative",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  leftControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  errorText: {
    padding: 2,
    fontSize: 16,
    fontFamily: theme.Fonts.amiriRegular,
    color: theme.Colors.textGray,
    textDecorationStyle: "solid",
    textDecorationColor: theme.Colors.recordingRed,
    textDecorationLine: "underline",
  },
  micPlaceholder: {
    height: 65,
  },
  recordButtonContainer: {
    position: "absolute",
    right: theme.Spacing.md,
    bottom: theme.Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  recordButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  shiningLight: {
    position: "absolute",
    bottom: 15,
    width: 50,
    height: 50,
    backgroundColor: "#00ffb3",
    borderRadius: 60,
    shadowColor: theme.Colors.primaryLight,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 10,
    zIndex: -1,
  },
  micGlow: {
    shadowColor: theme.Colors.primaryLight,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 15,
  },
  recordingGlow: {
    shadowColor: "#d32f2f",
    shadowOpacity: 1,
    shadowRadius: 25,
  },
});

export default QuranControls;