// import React, {
//   useState,
//   useRef,
//   useCallback,
//   useMemo,
//   useEffect,
// } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   Dimensions,
//   FlatList,
//   Animated,
// } from "react-native";
// import quranData from "../assets/quran/quran copy.json";
// import theme from "./constants/root";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";

// const { width } = Dimensions.get("window");

const Quran = () => {
    return (<></>);
};
//   const [isRecording, setIsRecording] = useState(false);
//   const [versesVisible, setVersesVisible] = useState(true);
//   const [bookMark, setBookMark] = useState(false);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [pageMarked, setPageMarked] = useState(null);
//   const flatListRef = useRef(null);
//   const shineAnimation = useRef(new Animated.Value(0)).current;
//   const pulseAnimation = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     const shineLoop = Animated.loop(
//       Animated.sequence([
//         Animated.timing(shineAnimation, {
//           toValue: 1,
//           duration: 2000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(shineAnimation, {
//           toValue: 0,
//           duration: 2000,
//           useNativeDriver: true,
//         }),
//       ]),
//     );

//     shineLoop.start();

//     return () => shineLoop.stop();
//   }, [shineAnimation]);

//   // Pulse effect when recording
//   useEffect(() => {
//     if (isRecording) {
//       const pulseLoop = Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnimation, {
//             toValue: 1.2,
//             duration: 800,
//             useNativeDriver: true,
//           }),
//           Animated.timing(pulseAnimation, {
//             toValue: 1,
//             duration: 800,
//             useNativeDriver: true,
//           }),
//         ]),
//       );
//       pulseLoop.start();
//       return () => pulseLoop.stop();
//     } else {
//       pulseAnimation.setValue(1);
//     }
//   }, [isRecording, pulseAnimation]);

//   // Update bookmark icon based on current page
//   useEffect(() => {
//     setBookMark(pageMarked !== null && currentPage === pageMarked);
//   }, [currentPage, pageMarked]);

//   // Transform surah-based data into page-based data (memoized for performance)
//   const pageBasedData = useMemo(() => {
//     const pages = {};

//     quranData.data.surahs.forEach((surah) => {
//       surah.ayahs.forEach((ayah) => {
//         const pageNum = ayah.page;

//         if (!pages[pageNum]) {
//           pages[pageNum] = {
//             pageNumber: pageNum,
//             ayahs: [],
//             juz: ayah.juz,
//             surahName: surah.name,
//             surahNumber: surah.number,
//           };
//         }

//         pages[pageNum].ayahs.push({
//           text: ayah.text,
//           numberInSurah: ayah.numberInSurah,
//           surahName: surah.name,
//           surahNumber: surah.number,
//           revelationType: surah.revelationType,
//         });
//       });
//     });

//     // Convert to array and sort by page number
//     return Object.values(pages).sort((a, b) => a.pageNumber - b.pageNumber);
//   }, []);

//   const handleStartRecording = useCallback(() => {
//     setIsRecording((prev) => {
//       Alert.alert("تسجيل", !prev ? "بدأ التسجيل لاختبار حفظك" : "توقف التسجيل");
//       return !prev;
//     });
//     // TODO: Implement recording logic
//   }, []);

//   const handleToggleVerses = useCallback(() => {
//     setVersesVisible((prev) => !prev);
//   }, []);
  
//   const handleTogglemark = useCallback(() => {
//     if (pageMarked === currentPage) {
//       // Remove bookmark if clicking on already bookmarked page
//       setPageMarked(null);
//       Alert.alert("علامة مرجعية", "تم إزالة العلامة المرجعية");
//     } else {
//       // Add bookmark to current page
//       setPageMarked(currentPage);
//       Alert.alert("علامة مرجعية", `تم حفظ الصفحة ${currentPage + 1}`);
//     }
//   }, [currentPage, pageMarked]);

//   const onViewableItemsChanged = useRef(({ viewableItems }) => {
//     if (viewableItems.length > 0) {
//       setCurrentPage(viewableItems[0].index);
//     }
//   }).current;

//   const viewabilityConfig = useRef({
//     itemVisiblePercentThreshold: 50,
//   }).current;

//   // Memoized page component
//   const QuranPage = React.memo(({ page, versesVisible }) => {
//     // Group consecutive ayahs from the same surah
//     const groupedAyahs = useMemo(() => {
//       const groups = [];
//       let currentGroup = null;

//       page.ayahs.forEach((ayah) => {
//         if (!currentGroup || currentGroup.surahNumber !== ayah.surahNumber) {
//           currentGroup = {
//             surahNumber: ayah.surahNumber,
//             surahName: ayah.surahName,
//             revelationType: ayah.revelationType,
//             ayahs: [],
//           };
//           groups.push(currentGroup);
//         }
//         currentGroup.ayahs.push(ayah);
//       });

//       return groups;
//     }, [page.ayahs]);

//     return (
//       <View style={styles.page}>
//         <View style={styles.versesContainer}>
//           {groupedAyahs.map((group, groupIndex) => (
//             <View key={`group-${groupIndex}`}>
//               {/* Show Bismillah if first ayah and not Al-Fatiha or At-Tawbah */}
//               {group.ayahs[0].numberInSurah === 1 &&
//                 group.surahNumber !== 1 &&
//                 group.surahNumber !== 9 && (
//                   <View style={styles.bismillahContainer}>
//                     <Text style={styles.bismillah}>
//                       بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
//                     </Text>
//                   </View>
//                 )}

//               {/* Render ayahs */}
//               <Text
//                 style={styles.verseText}
//                 selectable={false}
//                 allowFontScaling={false}
//               >
//                 {group.ayahs.map((ayah, index) => (
//                   <Text
//                     key={`${group.surahNumber}-${ayah.numberInSurah}`}
//                     style={versesVisible ? {} : styles.hiddenVerseText}
//                   >
//                     {ayah.text}
//                     <Text style={styles.verseNumber}>
//                       ﴿{ayah.numberInSurah}﴾
//                     </Text>
//                     {index < group.ayahs.length - 1 ? " " : ""}
//                   </Text>
//                 ))}
//               </Text>
//             </View>
//           ))}
//         </View>
//       </View>
//     );
//   });

//   QuranPage.displayName = "QuranPage";

//   const renderPage = useCallback(
//     ({ item: page }) => {
//       return <QuranPage page={page} versesVisible={versesVisible} />;
//     },
//     [versesVisible],
//   );

//   // Memoize current page data
//   const currentPageData = useMemo(
//     () => pageBasedData[currentPage],
//     [currentPage, pageBasedData],
//   );

//   // getItemLayout for better scroll performance
//   const getItemLayout = useCallback(
//     (data, index) => ({
//       length: width,
//       offset: width * index,
//       index,
//     }),
//     [],
//   );

//   // Animated shine position
//   const shineTranslateX = shineAnimation.interpolate({
//     inputRange: [0, 1],
//     outputRange: [-5, 5],
//   });

//   const shineOpacity = shineAnimation.interpolate({
//     inputRange: [0, 0.5, 1],
//     outputRange: [0.3, 0.8, 0.3],
//   });

//   return (
//     <>
//       <StatusBar
//         style="light"
//         translucent={false}
//         backgroundColor={theme.Colors.black}
//       />
//       <View style={styles.container}>
//         <View style={styles.header}>
          
//           <View style={styles.headerRight}>
//             <Text style={styles.juzNumber}>
//               {/* الجزء {currentPageData?.juz || 1} */}
//             </Text>
//             <View style={styles.headerCenter}>
//               <Text style={styles.pageNumberText}>
//                 {currentPageData?.surahName || ""}
//               </Text>
//             </View>
//             <Text style={styles.pageCounter}>
//               {currentPage + 1} / {pageBasedData.length}
//             </Text>
//           </View>
//           <TouchableOpacity
//             // onPress={handleOpenMenu}
//             activeOpacity={0.7}
//           >
//             <Ionicons
//               name={bookMark ? "menu" : "menu-outline"}
//               size={26}
//               color={theme.Colors.primaryLight}
//             />
//           </TouchableOpacity>

//           {bookMark && (
//             <View style={styles.bookmarkRibbon}>
//               <View style={styles.ribbonTriangle} />
//             </View>
//           )}
//         </View>

//         <FlatList
//           ref={flatListRef}
//           data={pageBasedData}
//           renderItem={renderPage}
//           keyExtractor={(item) => `page-${item.pageNumber}`}
//           horizontal
//           pagingEnabled
//           showsHorizontalScrollIndicator={false}
//           onViewableItemsChanged={onViewableItemsChanged}
//           viewabilityConfig={viewabilityConfig}
//           inverted
//           style={styles.pagesContainer}
//           initialNumToRender={1}
//           maxToRenderPerBatch={1}
//           windowSize={3}
//           removeClippedSubviews={true}
//           getItemLayout={getItemLayout}
//           updateCellsBatchingPeriod={100}
//         />

//         <View style={styles.bottomControls}>
//           <View style={styles.controlsRow}>
//             <View style={styles.leftControl}>
//               <TouchableOpacity>
//                 <Text style={styles.errorText}>أخطاء</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={handleToggleVerses}
//                 activeOpacity={0.7}
//               >
//                 <Ionicons
//                   name={versesVisible ? "eye" : "eye-off"}
//                   size={25}
//                   color={theme.Colors.textGray}
//                 />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.micPlaceholder} />
//           </View>

//           {/* Right side - Large mic button with glow (Absolutely positioned) */}
//           <TouchableOpacity
//             style={styles.recordButtonContainer}
//             onPress={handleStartRecording}
//             activeOpacity={0.7}
//           >
//             {/* Animated shining light effect */}
//             <Animated.View
//               style={[
//                 styles.shiningLight,
//                 {
//                   opacity: shineOpacity,
//                   transform: [{ translateX: shineTranslateX }],
//                 },
//               ]}
//             />

//             <Animated.View
//               style={[
//                 styles.recordButton,
//                 {
//                   transform: [{ scale: pulseAnimation }],
//                 },
//               ]}
//             >
//               <View
//                 style={[styles.micGlow, isRecording && styles.recordingGlow]}
//               >
//                 <Ionicons
//                   name={isRecording ? "stop-circle" : "mic-circle"}
//                   size={75}
//                   color={isRecording ? "#d32f2f" : theme.Colors.primaryLight}
//                 />
//               </View>
//             </Animated.View>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: theme.Colors.white,
//     overflow: "visible",
//   },
//   header: {
//     backgroundColor: theme.Colors.black,
//     paddingVertical: theme.Spacing.sm,
//     paddingHorizontal: theme.Spacing.md,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     gap: theme.Spacing.sm,
//     position: "relative",
//     overflow: "visible",
//   },
//   headerRight: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     flex: 1,
//     paddingHorizontal: theme.Spacing.sm,
//     paddingVertical: theme.Spacing.xs,
//     borderWidth: 1,
//     borderColor: theme.Colors.textGray,
//     borderRadius: 8,
//     gap: theme.Spacing.xs,
//   },
//   headerCenter: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//     justifyContent: "center",
//   },
//   pageNumberText: {
//     fontSize: 22,
//     fontWeight: "bold",
//     fontFamily: theme.Fonts.amiriBold,
//     color: theme.Colors.primaryLight,
//     textAlign: "center",
//   },
//   juzNumber: {
//     fontSize: 12,
//     fontFamily: theme.Fonts.amiriRegular,
//     color: theme.Colors.primaryDark,
//     backgroundColor: theme.Colors.primaryLight,
//     paddingHorizontal: 10,
//     paddingVertical: 3,
//     borderRadius: 10,
//   },
//   pageCounter: {
//     fontSize: 12,
//     fontFamily: theme.Fonts.amiriRegular,
//     color: theme.Colors.primaryDark,
//     backgroundColor: theme.Colors.primaryLight,
//     paddingHorizontal: 10,
//     paddingVertical: 3,
//     borderRadius: 10,
//   },
//   pagesContainer: {
//     flex: 1,
//     zIndex: 1,
//   },
//   page: {
//     width: width,
//     justifyContent: "center",
//     paddingHorizontal: theme.Spacing.xs,
//     paddingVertical: theme.Spacing.sm,
//   },
//   bismillahContainer: {
//     alignItems: "center",
//     paddingVertical: theme.Spacing.sm,
//   },
//   bismillah: {
//     fontSize: 24,
//     fontFamily: theme.Fonts.amiriRegular,
//     color: "#1a4d2e",
//     textAlign: "center",
//   },
//   versesContainer: {
//     flex: 1,
//     justifyContent: "center",
//   },
//   verseText: {
//     fontSize: 24,
//     fontFamily: theme.Fonts.cairoBold,
//     color: theme.Colors.black,
//     letterSpacing: 0,
//     textAlign: "center",
//     direction: "rtl",
//   },
//   hiddenVerseText: {
//     color: theme.Colors.transparent,
//   },
//   verseNumber: {
//     color: theme.Colors.primaryLight,
//     fontFamily: theme.Fonts.amiriBold,
//     fontSize: 16,
//   },
//   bottomControls: {
//     backgroundColor: theme.Colors.black,
//     paddingHorizontal: theme.Spacing.md,
//     paddingVertical: theme.Spacing.sm,
//     position: "relative",
//   },
//   controlsRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-end",
//   },
//   leftControl: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "flex-end",
//     gap: 8,
//   },
//   errorText: {
//     padding: 2,
//     fontSize: 16,
//     fontFamily: theme.Fonts.amiriRegular,
//     color: theme.Colors.textGray,
//     textDecorationStyle: "solid",
//     textDecorationColor: theme.Colors.recordingRed,
//     textDecorationLine: "underline",
//   },
//   micPlaceholder: {
//     height: 65,
//   },
//   recordButtonContainer: {
//     position: "absolute",
//     right: theme.Spacing.md,
//     bottom: theme.Spacing.sm,
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "visible",
//   },
//   recordButton: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   shiningLight: {
//     position: "absolute",
//     bottom: 15,
//     width: 50,
//     height: 50,
//     backgroundColor: "#00ffb3",
//     borderRadius: 60,
//     shadowColor: theme.Colors.primaryLight,
//     shadowOffset: {
//       width: 0,
//       height: 0,
//     },
//     shadowOpacity: 0.9,
//     shadowRadius: 25,
//     elevation: 10,
//     zIndex: -1,
//   },
//   micGlow: {
//     shadowColor: theme.Colors.primaryLight,
//     shadowOffset: {
//       width: 0,
//       height: 0,
//     },
//     shadowOpacity: 0.9,
//     shadowRadius: 20,
//     elevation: 15,
//   },
//   recordingGlow: {
//     shadowColor: "#d32f2f",
//     shadowOpacity: 1,
//     shadowRadius: 25,
//   },
//   bookmarkRibbon: {
//     position: "absolute",
//     right: 20,
//     bottom: -150,
//     width: 35,
//     height: 150,
//     backgroundColor: "#d32f2f",
//     opacity: 0.3,
//     zIndex: 10,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 2,
//       height: 2,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//     elevation: 5,
//   },
//   ribbonTriangle: {
//     position: "absolute",
//     bottom: -12,
//     left: 0,
//     width: 0,
//     height: 0,
//     backgroundColor: "transparent",
//     borderStyle: "solid",
//     borderLeftWidth: 17.5,
//     borderRightWidth: 17.5,
//     borderTopWidth: 12,
//     borderLeftColor: "transparent",
//     borderRightColor: "transparent",
//     borderTopColor: "#d32f2f",
//     opacity: 1,
//   },
// });

export default Quran;