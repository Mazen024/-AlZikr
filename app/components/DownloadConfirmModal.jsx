import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import root from "../constants/root";

export default function DownloadConfirmModal({
  visible,
  book,
  downloading,
  progress,
  onConfirm,
  onCancel,
}) {
  if (!book) return null;

  const formatDeathYear = (authorDeath) => {
    if (!authorDeath) return "غير معروف";
    if (authorDeath === "October 2, 1999") return "1420 هـ";
    if (/^\d+$/.test(authorDeath)) return `${authorDeath} هـ`;
    return authorDeath.replace("ھ", "هـ");
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{book.name_ar || book.name_en}</Text>
          <Text style={styles.subtitle}>
            {book.author_ar || book.author_en}
          </Text>

          {!!book.bio && (
            <Text style={styles.bio} numberOfLines={4}>
              {book.bio}
            </Text>
          )}

          {!!book.birthplace && (
            <Text style={styles.meta}>
              ولد الإمام في {book.birthplace} سنه{" "}
              {book.birth === "تاريخ الميلاد غير معروف" ? "" : book.birth} و
              توفي سنه {formatDeathYear(book.author_death)}
            </Text>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statVal}>
                {book.hadiths_count?.toLocaleString("ar")}
              </Text>
              <Text style={styles.statKey}>حديث</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statVal}>
                {book.chapters_count?.toLocaleString("ar")}
              </Text>
              <Text style={styles.statKey}>باب</Text>
            </View>
          </View>

          {downloading ? (
            <View style={styles.downloadingBox}>
              <Text style={styles.downloadingText}>جارٍ تحميل الكتاب...</Text>
              {!!progress && (
                <Text style={styles.downloadingProgress}>
                  {progress?.current && progress?.total
                    ? `${Math.round((progress.current / progress.total) * 100)}%`
                    : "0%"}
                </Text>
              )}
            </View>
          ) : (
            <>
              <Text style={styles.question}>
                هذا الكتاب غير محمّل بعد، هل تريد تحميله؟
              </Text>

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonYes]}
                  onPress={onConfirm}
                >
                  <Text style={styles.buttonText}>نعم، تحميل</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonNo]}
                  onPress={onCancel}
                >
                  <Text style={styles.buttonText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  statChip: { alignItems: "center", flex: 1 },
  statVal: {
    fontSize: 15,
    color: root.Tcolors.ACCENT,
    fontFamily: root.Fonts.cairoBold,
  },
  statKey: {
    fontSize: 10,
    color: root.Tcolors.textSub,
    fontFamily: root.Fonts.cairoRegular,
    marginTop: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 18,
    padding: 20,
    backgroundColor: "#101820",
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#cbd5c9",
    textAlign: "center",
    marginBottom: 8,
  },
  meta: {
    fontSize: 11,
    color: "#8ea394",
    textAlign: "center",
    marginBottom: 8,
  },
  bio: {
    fontSize: 12,
    color: "#b8c9bd",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    marginBottom: 18,
  },
  question: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 14,
  },
  buttonsRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  buttonYes: {
    backgroundColor: "#2e7d32",
  },
  buttonNo: {
    backgroundColor: "#555",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  downloadingBox: {
    alignItems: "center",
    paddingVertical: 10,
  },
  downloadingText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 6,
  },
  downloadingProgress: {
    fontSize: 13,
    color: "#8ea394",
  },
});
