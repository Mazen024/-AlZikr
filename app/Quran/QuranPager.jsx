import React, { useRef, useCallback, forwardRef } from "react";
import { FlatList, StyleSheet, Dimensions } from "react-native";
import QuranPage from "./QuranPage";

const { width } = Dimensions.get("window");

const QuranPager = React.memo(
  forwardRef(({ data, onPageChange, versesVisible, isDark }, ref) => {
    const internalRef = useRef(null);
    const flatListRef = ref ?? internalRef;

    const renderPage = useCallback(
      ({ item: page }) => {
        return <QuranPage page={page} versesVisible={versesVisible} isDark={isDark} />;
      },
      [versesVisible, isDark],
    );

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
      if (viewableItems.length > 0) {
        onPageChange(viewableItems[0].index);
      }
    }).current;

    const viewabilityConfig = useRef({
      itemVisiblePercentThreshold: 50,
    }).current;

    const getItemLayout = useCallback(
      (data, index) => ({
        length: width,
        offset: width * index,
        index,
      }),
      [],
    );

    return (
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderPage}
        keyExtractor={(item) => `page-${item.pageNumber}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        inverted
        style={styles.pagesContainer}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={3}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
        updateCellsBatchingPeriod={100}
      />
    );
  }),
);

QuranPager.displayName = "QuranPager";

const styles = StyleSheet.create({
  pagesContainer: {
    flex: 1,
    zIndex: 1,
  },
});

export default QuranPager;
