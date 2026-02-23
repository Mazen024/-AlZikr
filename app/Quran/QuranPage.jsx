import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import theme from "../constants/root";

const { width } = Dimensions.get("window");

const QuranPage = React.memo(({ page, versesVisible, isDark }) => {
  // Group consecutive ayahs from the same surah
  const groupedAyahs = useMemo(() => {
    const groups = [];
    let currentGroup = null;

    page.ayahs.forEach((ayah) => {
      if (!currentGroup || currentGroup.surahNumber !== ayah.surahNumber) {
        currentGroup = {
          surahNumber: ayah.surahNumber,
          surahName: ayah.surahName,
          revelationType: ayah.revelationType,
          ayahs: [],
        };
        groups.push(currentGroup);
      }
      currentGroup.ayahs.push(ayah);
    });

    return groups;
  }, [page.ayahs]);

  return (
    <View style={[styles.page, isDark && styles.darkPage]}>
      <View style={styles.versesContainer}>
        {groupedAyahs.map((group, groupIndex) => (
          <View key={`group-${groupIndex}`}>
            {group.ayahs[0].numberInSurah === 1 && (
              <View style={styles.headerImageContainer}>
                <Image
                  source={require("../../assets/images/header.png")}
                  style={styles.headerImage}
                />
                <Text style={styles.surahNameOverlay}>{group.surahName}</Text>
              </View>
            )}
            {group.ayahs[0].numberInSurah === 1 &&
              group.surahNumber !== 1 &&
              group.surahNumber !== 9 && (
                <View style={styles.bismillahContainer}>
                  <Text style={styles.bismillah}>
                    بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
                  </Text>
                </View>
              )}

            <Text
              style={[styles.verseText, isDark && styles.darkVerseText]}
              selectable={false}
              allowFontScaling={false}
            >
              {group.ayahs.map((ayah, index) => (
                <Text
                  key={`${group.surahNumber}-${ayah.numberInSurah}`}
                  style={versesVisible ? {} : styles.hiddenVerseText}
                >
                  {ayah.text}
                  <Text style={styles.verseNumber}>﴿{ayah.numberInSurah}﴾</Text>
                  {index < group.ayahs.length - 1 ? " " : ""}
                </Text>
              ))}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});

QuranPage.displayName = "QuranPage";

const styles = StyleSheet.create({
  page: {
    width: width,
    justifyContent: "center",
    paddingHorizontal: theme.Spacing.xs,
    paddingVertical: theme.Spacing.sm,
  },
  darkPage: {
    backgroundColor: theme.Colors.black,
  },
  bismillahContainer: {
    alignItems: "center",
    marginBottom: theme.Spacing.xs,
  },
  headerImageContainer: {
    width: "100%",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  headerImage: {
    resizeMode: "contain",
    width: "100%",
    height: 55,
    backgroundColor: "transparent",
  },
  surahNameOverlay: {
    position: "absolute",
    fontSize: 23,
    fontFamily: theme.Fonts.quranText,
    color: "#1a4d2e",
    textAlign: "center",
    top: "50%",
    transform: [{ translateY: -15 }],
  },
  bismillah: {
    fontSize: 24,
    fontFamily: theme.Fonts.quranText,
    color: "#1a4d2e",
    textAlign: "center",
  },
  versesContainer: {
    flex: 1,
    justifyContent: "center",
  },
  verseText: {
    fontSize: 23,
    // fontFamily: theme.Fonts.quranText,
    color: theme.Colors.black,
    letterSpacing: 0.3,
    textAlign: "justify",
    lineHeight: 35,
    direction: "rtl",
  },
  darkVerseText: {
    color: theme.Colors.white,
  },
  hiddenVerseText: {
    color: theme.Colors.transparent,
  },
  verseNumber: {
    color: theme.Colors.primaryLight,
    fontFamily: theme.Fonts.amiriBold,
    fontSize: 22,
  },
});

export default QuranPage;
