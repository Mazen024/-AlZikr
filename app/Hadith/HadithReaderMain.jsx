import React, { useCallback } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import theme from "../constants/root";

const { width } = Dimensions.get("window");

const HadithPage = React.memo(({ item, height }) => (
  <View style={[styles.hadithPage, { height }]}>
    <ScrollView
      style={styles.hadithScrollArea}
      contentContainerStyle={styles.hadithScrollContent}
      showsVerticalScrollIndicator
      nestedScrollEnabled
    >
      <Text style={styles.hadithText}>{item.text}</Text>
    </ScrollView>
  </View>
));
HadithPage.displayName = "HadithPage";

const HadithMain = ({
  hadiths,
  height,
  flatListRef,
  onViewableItemsChanged,
  viewabilityConfig,
}) => {
  const getItemLayout = useCallback(
    (_, index) => ({ length: width, offset: width * index, index }),
    [],
  );

  const renderHadith = useCallback(
    ({ item, index }) => (
      <HadithPage item={item} index={index} total={hadiths.length} height={height} />
    ),
    [hadiths.length, height],
  );

  const onScrollToIndexFailed = useCallback((info) => {
    flatListRef.current?.scrollToOffset({
      offset: width * info.index,
      animated: false,
    });
  }, [flatListRef]);

  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        ref={flatListRef}
        data={hadiths}
        renderItem={renderHadith}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        inverted
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
};

export default HadithMain;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
  },
  hadithPage: {
    width,
    paddingHorizontal: theme.Spacing.sm,
  },
  hadithScrollArea: {
    flex: 1,
    direction: "rtl",
  },
  hadithScrollContent: {
    paddingVertical: theme.Spacing.md,
  },
  hadithText: {
    fontSize: 22,
    fontFamily: theme.Fonts.amiriRegular,
    color: "#1a1a1a",
    lineHeight: 40,
    textAlign: "justify",
  },
});