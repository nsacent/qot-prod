import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import ImageViewing from "react-native-image-viewing";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Dot = ({ active }) => (
  <View
    style={{
      width: active ? 8 : 6,
      height: active ? 8 : 6,
      borderRadius: 999,
      marginHorizontal: 4,
      backgroundColor: active ? "white" : "rgba(255,255,255,0.3)",
    }}
  />
);

export default function AdImageCarousel({ images = [], colors, fallback }) {
  // Normalize to [{uri}] and keep placeholders for pager length
  const slides = useMemo(
    () => (images && images.length ? images : [{ uri: null }]),
    [images]
  );

  // Build viewer dataset (only real URIs) + map slide index -> viewer index
  const { viewerImages, slideToViewerIndex } = useMemo(() => {
    const v = [];
    const map = [];
    let j = 0;
    slides.forEach((img) => {
      if (img?.uri) {
        v.push({ uri: img.uri });
        map.push(j++);
      } else {
        map.push(null);
      }
    });
    return { viewerImages: v, slideToViewerIndex: map };
  }, [slides]);

  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length) {
      setIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 51 });

  const openViewer = (slideIdx) => {
    const vi = slideToViewerIndex[slideIdx];
    if (vi == null || !viewerImages.length) return;
    setViewerIndex(vi);
    setViewerVisible(true);
  };

  return (
    <View
      style={{ height: SCREEN_HEIGHT / 2.8, backgroundColor: colors?.card }}
    >
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item, index: i }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => openViewer(i)}
            style={{ width: SCREEN_WIDTH, height: "100%" }}
          >
            <Image
              source={item?.uri ? { uri: item.uri } : fallback}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />

      {/* Dots */}
      <View
        style={{
          position: "absolute",
          bottom: 12,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {slides.map((_, i) => (
          <Dot key={i} active={i === index} />
        ))}
      </View>

      {/* Fullscreen viewer */}
      <ImageViewing
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
        images={viewerImages}
        imageIndex={Math.min(
          viewerIndex,
          Math.max(0, (viewerImages.length || 1) - 1)
        )}
        backgroundColor="rgba(0,0,0,0.95)"
        swipeToCloseEnabled
        doubleTapToZoomEnabled
        presentationStyle="fullScreen"
      />
    </View>
  );
}
