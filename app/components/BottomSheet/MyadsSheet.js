import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { FONTS, IMAGES } from "../../constants/theme";
import { GlobalStyleSheet } from "../../constants/StyleSheet";

const MyadsSheet = (props, ref) => {
  const bottomSheetRef = useRef(null);
  const theme = useTheme();
  const { colors } = theme;

  const snapPoints = useMemo(() => [210], []);

  const handleSheetChanges = useCallback((index) => {
    // Optionally remove log on production
    console.log("BottomSheet index changed to", index);
  }, []);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  const openSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  useImperativeHandle(ref, () => ({
    openSheet,
  }));

  const renderAction = (icon, label, color, onPress) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => {
        bottomSheetRef.current?.close(); // hide sheet
        setTimeout(() => {
          onPress?.(); // then perform the action
        }, 100); // short delay ensures animation is smooth
      }}
    >
      <Image style={[styles.icon, { tintColor: color }]} source={icon} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enablePanDownToClose
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      handleStyle={styles.handle}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 92 }}
      backgroundStyle={{ backgroundColor: colors.card }}
    >
      <BottomSheetScrollView
        contentContainerStyle={[GlobalStyleSheet.container, styles.scrollView]}
      >
        {renderAction(IMAGES.delete, "Delete", "red", props.onDelete)}
        {renderAction(IMAGES.disable, "Archive", colors.title, props.onArchive)}
        {renderAction(IMAGES.write, "Edit", colors.title, props.onEdit)}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 12,
    resizeMode: "contain",
  },
  label: {
    ...FONTS.font,
    fontSize: 15,
  },
  scrollView: {
    paddingVertical: 12,
  },
  handle: {
    top: 0,
  },
});

export default forwardRef(MyadsSheet);
