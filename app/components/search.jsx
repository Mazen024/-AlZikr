import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../constants/root";
import getDb from "../db/database";

const removeTashkeel = (text) =>
  text
    ?.replace(
      /[\u064B-\u065F\u0670\u0610-\u061A\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g,
      "",
    )
    .replace(/ـ/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim() ?? "";

const MAX_RESULTS = 100;

export default function QuranSearch({ onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = removeTashkeel(query.trim());
    if (!q || q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const db = await getDb();
        const rows = await db.getAllAsync(
          `SELECT
             ayahs.id AS globalNumber,
             ayahs.ayah_number AS ayahNumber,
             ayahs.text AS text,
             ayahs.page AS page,
             surahs.name AS surahName
           FROM ayahs
           JOIN surahs ON surahs.id = ayahs.surah_id
           ORDER BY ayahs.id ASC`,
        );

        const matches = [];
        for (const row of rows) {
          if (removeTashkeel(row.text).includes(q)) {
            matches.push(row);
            if (matches.length >= MAX_RESULTS) break;
          }
        }
        setResults(matches);
      } catch (e) {
        console.error("Search error:", e);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = useCallback(
    (item) => {
      onSelect(item.page - 1);
      onClose();
    },
    [onSelect, onClose],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.resultMeta}>
          <Text style={styles.metaText}>
            الآية {item.ayahNumber} • صفحة {item.page}
          </Text>
          <Text style={styles.pageText}>{item.surahName}</Text>
        </View>
        <Text style={styles.ayahText}>{item.text}</Text>
      </TouchableOpacity>
    ),
    [handleSelect],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="اكتب كلمة أو جزءاً من آية..."
          placeholderTextColor="#aaa"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          textAlign="right"
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => setQuery("")}
            style={styles.clearBtn}
          >
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {query.length >= 2 && (
        <Text style={styles.countText}>
          {searching
            ? "جارِ البحث..."
            : results.length === 0
              ? "لا توجد نتائج"
              : `${results.length} نتيجة`}
        </Text>
      )}

      {searching && results.length === 0 ? (
        <ActivityIndicator
          size="small"
          color={theme.Tcolors.white}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.globalNumber.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            query.length >= 2 ? null : (
              <Text style={styles.emptyText}>
                ابدأ الكتابة للبحث في آيات القرآن
              </Text>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Tcolors.primaryBackground,
    paddingVertical: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontFamily: theme.Fonts.amiriRegular,
    fontSize: 16,
    color: "#222",
  },
  clearBtn: {
    padding: 4,
    marginLeft: 6,
  },
  clearBtnText: {
    fontSize: 13,
    color: "#aaa",
  },
  countText: {
    textAlign: "right",
    paddingHorizontal: 16,
    marginBottom: 6,
    fontSize: 13,
    color: theme.Tcolors.white,
    fontFamily: theme.Fonts.amiriRegular,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  resultItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: theme.Tcolors.pillBorder,
    gap: 4,
  },
  resultMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  metaText: {
    fontFamily: theme.Fonts.amiriRegular,
    fontSize: 13,
    color: theme.Tcolors.secondaryText,
  },
  pageText: {
    fontFamily: theme.Fonts.amiriRegular,
    fontSize: 20,
    color: theme.Tcolors.primaryLight,
  },
  ayahText: {
    fontFamily: theme.Fonts.amiriRegular,
    fontSize: 17,
    color: theme.Tcolors.primaryText,
    textAlign: "right",
    lineHeight: 30,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 60,
    fontFamily: theme.Fonts.amiriRegular,
    fontSize: 15,
    color: "#bbb",
  },
});
