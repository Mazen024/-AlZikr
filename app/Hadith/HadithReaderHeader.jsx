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
          <View style={modalStyles.handle} />

          <View style={modalStyles.sheetHeader}>
            <Text style={modalStyles.sheetTitle}>فهرس الأبواب</Text>
          </View>

          <View style={[modalStyles.jumpRow, jumpError && modalStyles.jumpRowError]}>
            <TouchableOpacity style={modalStyles.jumpBtn} onPress={handleJump} activeOpacity={0.8}>
              <Text style={modalStyles.jumpBtnText}>انتقل</Text>
            </TouchableOpacity>
            <TextInput
              style={modalStyles.jumpInput}
              placeholder={`رقم الحديث (١ - ${totalHadiths})`}
              placeholderTextColor="rgba(255,255,255,0.3)"
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
              أدخل رقماً بين ١ و {totalHadiths}
            </Text>
          )}

          <View style={modalStyles.sectionLabel}>
            <View style={modalStyles.sectionLine} />
            <Text style={modalStyles.sectionLabelText}>الأبواب</Text>
            <View style={modalStyles.sectionLine} />
          </View>

          <FlatList
            data={chapters}
            keyExtractor={(c) => c?.id?.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
            renderItem={({ item }) => {
              const isActive = item.id === currentChapterId;
              return (
                <TouchableOpacity
                  style={[modalStyles.chapterItem, isActive && modalStyles.chapterItemActive]}
                  onPress={() => { onSelectChapter(item); onClose(); }}
                  activeOpacity={0.7}
                >
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
                      <Text style={modalStyles.chapterItemCount}>{item.hadithCount} حديث</Text>
                    )}
                  </View>

                  <View style={modalStyles.chapterItemRight}>
                    {isActive && <View style={modalStyles.activeDot} />}
                  </View>
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

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.counterPill}>
            <Text style={styles.counterText}>
              {currentIndex + 1}
              <Text style={styles.counterSep}> / </Text>
              {totalHadiths}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.chapterBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.75}
        >
          <View style={styles.chapterIconBox}>
            <View style={styles.listIconLine} />
            <View style={styles.listIconLine} />
            <View style={[styles.listIconLine, { width: 9 }]} />
          </View>

          <View style={styles.chapterTexts}>
            <Text style={styles.bookLabel} numberOfLines={1}>{bookTitle}</Text>
            <Text style={styles.chapterName} numberOfLines={1}>{currentChapterTitle}</Text>
          </View>

          <Ionicons name="chevron-down" size={13} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
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
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
    backgroundColor: "#12122a",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  headerLeft: {
    flexShrink: 0,
  },
  counterPill: {
    backgroundColor: theme.Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  counterText: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriBold,
    color: "#fff",
    letterSpacing: 0.3,
  },
  counterSep: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: theme.Fonts.amiriRegular,
  },
  chapterBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.13)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chapterIconBox: {
    width: 22,
    height: 22,
    backgroundColor: `${theme.Colors.primaryLight}30`,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    flexShrink: 0,
  },
  listIconLine: {
    width: 13,
    height: 1.8,
    backgroundColor: theme.Colors.primaryLight,
    borderRadius: 1,
  },
  chapterTexts: {
    flex: 1,
    alignItems: "flex-end",
    minWidth: 0,
  },
  bookLabel: {
    fontSize: 10,
    fontFamily: theme.Fonts.amiriRegular,
    color: "rgba(255,255,255,0.38)",
    letterSpacing: 0.3,
  },
  chapterName: {
    fontSize: 13,
    fontFamily: theme.Fonts.amiriBold,
    color: "#e8d9b8",
    marginTop: 1,
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
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: SCREEN_HEIGHT * 0.82,
    paddingBottom: Platform.OS === "ios" ? 32 : 20,
  },
  handle: {
    width: 38,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  sheetTitle: {
    fontSize: 16,
    fontFamily: theme.Fonts.amiriBold,
    color: "#e8d9b8",
  },
  jumpRow: {
    flexDirection: "row-reverse",
    gap: 8,
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  jumpRowError: {
    borderBottomColor: "rgba(220,80,80,0.4)",
  },
  jumpInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: theme.Fonts.amiriRegular,
    color: "#e8d9b8",
  },
  jumpBtn: {
    alignItems: "center",
    backgroundColor: theme.Colors.primaryLight,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
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
    paddingHorizontal: 16,
    marginTop: -8,
    marginBottom: 6,
  },
  sectionLabel: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  sectionLabelText: {
    fontSize: 11,
    fontFamily: theme.Fonts.amiriRegular,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 0.5,
  },
  chapterItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 1,
    borderRadius: 10,
    gap: 10,
  },
  chapterItemActive: {
    backgroundColor: `${theme.Colors.primaryLight}20`,
  },
  chapterBadge: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    paddingHorizontal: 6,
  },
  chapterBadgeActive: {
    backgroundColor: `${theme.Colors.primaryLight}25`,
    borderColor: `${theme.Colors.primaryLight}60`,
  },
  chapterBadgeText: {
    fontSize: 12,
    fontFamily: theme.Fonts.amiriBold,
    color: "rgba(255,255,255,0.5)",
  },
  chapterBadgeTextActive: {
    color: theme.Colors.primaryLight,
  },
  chapterItemBody: {
    flex: 1,
    alignItems: "flex-end",
  },
  chapterItemName: {
    fontSize: 14,
    fontFamily: theme.Fonts.amiriRegular,
    color: "#c8b99a",
    textAlign: "right",
  },
  chapterItemNameActive: {
    fontFamily: theme.Fonts.amiriBold,
    color: "#e8d9b8",
  },
  chapterItemCount: {
    fontSize: 11,
    fontFamily: theme.Fonts.amiriRegular,
    color: "rgba(255,255,255,0.3)",
    marginTop: 2,
    textAlign: "right",
  },
  chapterItemRight: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.Colors.primaryLight,
  },
});