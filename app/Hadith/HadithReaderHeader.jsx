import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import theme from "../constants/root";

const ChaptersModal = React.memo(({
  visible,
  onClose,
  chapters,
  currentChapterId,
  onSelectChapter,
  onJump,
  totalHadiths,
}) => {
  const [jumpValue, setJumpValue] = useState("");
  const [jumpError, setJumpError] = useState(false);

  const handleJump = useCallback(() => {
    const num = parseInt(jumpValue);
    if (!isNaN(num) && num >= 1 && num <= totalHadiths) {
      onJump(num - 1);
      onClose();
      setJumpValue("");
      setJumpError(false);
    } else {
      setJumpError(true);
      setTimeout(() => setJumpError(false), 1200);
    }
  }, [jumpValue, totalHadiths, onJump, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={modalStyles.overlay}
      >
        <TouchableOpacity style={modalStyles.backdrop} onPress={onClose} activeOpacity={1} />

        <View style={modalStyles.sheet}>
          {/* Handle */}
          <View style={modalStyles.handleWrap}>
            <View style={modalStyles.handle} />
          </View>

          {/* Sheet header */}
          <View style={modalStyles.sheetHeader}>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={18} color="rgba(255,255,255,0.45)" />
            </TouchableOpacity>
            <View style={modalStyles.sheetTitleWrap}>
              <View style={modalStyles.titleAccent} />
              <Text style={modalStyles.sheetTitle}>فهرس الأبواب</Text>
            </View>
          </View>

          {/* Jump to hadith */}
          <View style={modalStyles.jumpSection}>
            <Text style={modalStyles.jumpLabel}>الانتقال إلى حديث</Text>
            <View style={[modalStyles.jumpRow, jumpError && modalStyles.jumpRowError]}>
              <TouchableOpacity style={modalStyles.jumpBtn} onPress={handleJump} activeOpacity={0.8}>
                <Ionicons name="arrow-back" size={14} color="#1a1a2e" style={{ marginLeft: 2 }} />
                <Text style={modalStyles.jumpBtnText}>انتقل</Text>
              </TouchableOpacity>
              <TextInput
                style={modalStyles.jumpInput}
                placeholder={`رقم الحديث (١ – ${totalHadiths.toLocaleString("ar")})`}
                placeholderTextColor="rgba(255,255,255,0.28)"
                keyboardType="number-pad"
                value={jumpValue}
                onChangeText={(v) => { setJumpValue(v); setJumpError(false); }}
                textAlign="right"
                returnKeyType="go"
                onSubmitEditing={handleJump}
              />
            </View>
            {jumpError && (
              <Text style={modalStyles.jumpErrorText}>
                أدخل رقماً بين ١ و {totalHadiths.toLocaleString("ar")}
              </Text>
            )}
          </View>

          {/* Section divider */}
          <View style={modalStyles.sectionLabel}>
            <View style={modalStyles.sectionLine} />
            <View style={modalStyles.sectionDiamond} />
            <Text style={modalStyles.sectionLabelText}>الأبواب</Text>
            <View style={modalStyles.sectionDiamond} />
            <View style={modalStyles.sectionLine} />
          </View>

          {/* Chapter list */}
          <FlatList
            data={chapters}
            keyExtractor={(c) => c?.id?.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 12 }}
            renderItem={({ item }) => {
              const isActive = item.id === currentChapterId;
              return (
                <TouchableOpacity
                  style={[modalStyles.chapterItem, isActive && modalStyles.chapterItemActive]}
                  onPress={() => { onSelectChapter(item); onClose(); }}
                  activeOpacity={0.7}
                >
                  {isActive && <View style={modalStyles.activeAccentBar} />}

                  <View style={[modalStyles.chapterBadge, isActive && modalStyles.chapterBadgeActive]}>
                    <Text style={[modalStyles.chapterBadgeText, isActive && modalStyles.chapterBadgeTextActive]}>
                      {item.id}
                    </Text>
                  </View>

                  <View style={modalStyles.chapterItemBody}>
                    <Text
                      style={[modalStyles.chapterItemName, isActive && modalStyles.chapterItemNameActive]}
                      numberOfLines={2}
                    >
                      {item.arabic || item.title}
                    </Text>
                    {item.hadithCount != null && item.id !== 0 && (
                      <Text style={modalStyles.chapterItemCount}>
                        {item.hadithCount.toLocaleString("ar")} حديث
                      </Text>
                    )}
                  </View>

                  {isActive && (
                    <Ionicons name="checkmark-circle" size={16} color={theme.Tcolors.primaryLight} style={{ flexShrink: 0 }} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});
ChaptersModal.displayName = "ChaptersModal";

const HadithHeader = ({
  bookTitle,
  currentChapterTitle,
  currentIndex,
  totalHadiths,
  chapters,
  currentChapterId,
  lastChapterId,
  onSelectChapter,
  onJump,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const progress = totalHadiths > 0 ? (currentIndex + 1) / totalHadiths : 0;

  return (
    <>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.82}
      >
        {/* Left: list icon */}
        <View style={styles.iconBox}>
          <View style={styles.listLine} />
          <View style={styles.listLine} />
          <View style={[styles.listLine, { width: 9 }]} />
        </View>

        {/* Center: text stack */}
        <View style={styles.textStack}>
          <Text style={styles.bookLabel} numberOfLines={1}>{bookTitle}</Text>
          <Text style={styles.chapterName} numberOfLines={1}>{currentChapterTitle}</Text>
          <View style={styles.counterRow}>
            <Text style={styles.counterText}>
              {(currentIndex + 1).toLocaleString("ar")} / {totalHadiths.toLocaleString("ar")}
            </Text>
            <Text style={styles.counterSuffix}> حديث</Text>
          </View>
        </View>

        {/* Right: chevron */}
        <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.35)" />
      </TouchableOpacity>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ChaptersModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        chapters={chapters}
        currentChapterId={currentChapterId}
        lastChapterId={lastChapterId}
        onSelectChapter={onSelectChapter}
        onJump={onJump}
        totalHadiths={totalHadiths}
      />
    </>
  );
};

export default HadithHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.Tcolors.primaryBackground,
  },

  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: `${theme.Tcolors.primaryLight}22`,
    borderWidth: 0.5,
    borderColor: `${theme.Tcolors.primaryLight}30`,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    flexShrink: 0,
  },
  listLine: {
    width: 13,
    height: 1.8,
    backgroundColor: theme.Tcolors.primaryLight,
    borderRadius: 1,
  },

  textStack: {
    flex: 1,
    alignItems: "flex-end",
    minWidth: 0,
    gap: 1,
  },
  bookLabel: {
    fontSize: 10,
    fontFamily: theme.Fonts.amiriRegular,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 0.4,
  },
  chapterName: {
    fontSize: 14,
    fontFamily: theme.Fonts.amiriBold,
    color: "#e8d9b8",
    marginTop: 1,
  },
  counterRow: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    marginTop: 2,
  },
  counterText: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriBold,
    color: theme.Tcolors.accentGreen,
  },
  counterSuffix: {
    fontSize: 11,
    fontFamily: theme.Fonts.amiriRegular,
    color: `${theme.Tcolors.accentGreen}99`,
    marginRight: 2,
  },

  /* progress */
  progressTrack: {
    height: 2,
    backgroundColor: `${theme.Tcolors.primaryLight}18`,
  },
  progressFill: {
    height: 2,
    backgroundColor: theme.Tcolors.primaryLight,
    borderRadius: 1,
  },
});

const { height: SCREEN_HEIGHT } = require("react-native").Dimensions.get("window");

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  sheet: {
    backgroundColor: theme.Tcolors.primaryBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.84,
    paddingBottom: Platform.OS === "ios" ? 34 : 22,
  },

  handleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 36,
    height: 3.5,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 2,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  sheetTitleWrap: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  titleAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: theme.Tcolors.primaryLight,
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: theme.Fonts.amiriBold,
    color: "#e8d9b8",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* jump section */
  jumpSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.06)",
    gap: 8,
  },
  jumpLabel: {
    fontSize: 11,
    fontFamily: theme.Fonts.amiriRegular,
    color: "rgba(255,255,255,0.35)",
    textAlign: "right",
    letterSpacing: 0.5,
  },
  jumpRow: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  jumpRowError: {
    opacity: 0.85,
  },
  jumpInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
    fontFamily: theme.Fonts.amiriRegular,
    color: "#e8d9b8",
  },
  jumpBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    backgroundColor: theme.Tcolors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  jumpBtnText: {
    fontSize: 15,
    fontFamily: theme.Fonts.amiriBold,
    color: "#1a1a2e",
  },
  jumpErrorText: {
    fontSize: 11,
    fontFamily: theme.Fonts.amiriRegular,
    color: "#e06060",
    textAlign: "right",
  },

  /* section divider */
  sectionLabel: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  sectionDiamond: {
    width: 4,
    height: 4,
    backgroundColor: `${theme.Tcolors.primaryLight}60`,
    transform: [{ rotate: "45deg" }],
  },
  sectionLabelText: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriBold,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 0.6,
  },

  /* chapter items */
  chapterItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 2,
    gap: 10,
    overflow: "hidden",
  },
  chapterItemActive: {
    backgroundColor: `${theme.Tcolors.primaryLight}18`,
    borderWidth: 0.5,
    borderColor: `${theme.Tcolors.primaryLight}30`,
  },
  activeAccentBar: {
    position: "absolute",
    right: 0,
    top: 8,
    bottom: 8,
    width: 2.5,
    borderRadius: 2,
    backgroundColor: theme.Tcolors.primaryLight,
  },
  chapterBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    paddingHorizontal: 6,
  },
  chapterBadgeActive: {
    backgroundColor: `${theme.Tcolors.primaryLight}22`,
    borderColor: `${theme.Tcolors.primaryLight}50`,
  },
  chapterBadgeText: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriBold,
    color: "rgba(255,255,255,0.45)",
  },
  chapterBadgeTextActive: {
    color: theme.Tcolors.primaryLight,
  },
  chapterItemBody: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },
  chapterItemName: {
    fontSize: 14,
    fontFamily: theme.Fonts.amiriRegular,
    color: "#c8b99a",
    textAlign: "right",
    lineHeight: 22,
  },
  chapterItemNameActive: {
    fontFamily: theme.Fonts.amiriBold,
    color: "#e8d9b8",
  },
  chapterItemCount: {
    fontSize: 11,
    fontFamily: theme.Fonts.amiriRegular,
    color: "rgba(255,255,255,0.28)",
    textAlign: "right",
  },
});