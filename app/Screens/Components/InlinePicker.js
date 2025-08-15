import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  Modal,
  KeyboardAvoidingView,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { COLORS, FONTS } from "../../constants/theme";

const InlinePicker = ({
  value,
  options = [],
  placeholder,
  onSelect,
  colors,
  // Behavior
  minSearchCount = 8,
  searchable = true,
  // UI
  modalTitle,
  itemHeight = 48,
  maxModalHeightPct = 0.75,
  minModalHeight = 50,
  maxVisibleItems = 6, // 🔹 how many items to show before scrolling
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [headerH, setHeaderH] = useState(0);
  const [searchH, setSearchH] = useState(0);
  const { height: screenH } = useWindowDimensions();

  const showSearch = searchable && options.length > minSearchCount;

  const filtered = useMemo(() => {
    if (!showSearch || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((opt) => String(opt.value).toLowerCase().includes(q));
  }, [options, query, showSearch]);

  const handleSelect = (optVal) => {
    onSelect(optVal);
    setOpen(false);
    setQuery("");
  };

  const renderItem = ({ item }) => {
    const isSelected = String(item.value) === String(value);
    return (
      <Pressable
        onPress={() => handleSelect(item.value)}
        android_ripple={{ color: "transparent" }}
        style={({ pressed }) => [
          {
            paddingHorizontal: 14,
            height: itemHeight,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            borderColor: isSelected ? COLORS.primary : colors.border,
            borderWidth: isSelected ? 1.5 : 0,
            borderRadius: 8,
            opacity: pressed ? 0.95 : 1,
          },
        ]}
      >
        <Text
          style={[
            FONTS.font,
            {
              color: isSelected ? COLORS.primary : colors.title,
              fontWeight: isSelected ? "600" : "400",
            },
          ]}
          numberOfLines={1}
        >
          {item.value}
        </Text>
        {isSelected ? (
          <Text style={[FONTS.font, { color: COLORS.primary, fontSize: 12 }]}>
            Selected
          </Text>
        ) : null}
      </Pressable>
    );
  };

  // 🔹 Compute container & list heights:
  const desiredItemRows = Math.min(filtered.length, maxVisibleItems);
  const desiredListH = desiredItemRows * itemHeight;

  // First, try to size container to just fit header + (optional) search + desired list rows
  const naturalContainerH = headerH + (showSearch ? searchH : 0) + desiredListH;

  // Clamp container height between min and screen-based max
  const maxContainerH = screenH * maxModalHeightPct;
  const containerH = Math.max(
    minModalHeight,
    Math.min(naturalContainerH + 20 || minModalHeight, maxContainerH)
  );

  // The space actually available for the list (after header/search)
  const availableListH = Math.max(
    0,
    containerH - headerH - (showSearch ? searchH : 0)
  );

  // Enable scrolling only if items exceed the available space
  const shouldScroll = filtered.length * itemHeight > availableListH;

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Trigger */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        style={[
          GlobalStyleSheet.shadow2,
          {
            borderColor: colors.border,
            padding: 12,
            backgroundColor: colors.card,
            minHeight: 48,
            justifyContent: "center",
            borderRadius: 12,
          },
        ]}
      >
        <Text
          style={[FONTS.font, { color: value ? colors.title : colors.text }]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            top: "12%",
            alignSelf: "center",
          }}
        >
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: colors.card,
              height: containerH,
              ...GlobalStyleSheet.shadow2,
            }}
          >
            {/* Header */}
            <View
              onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: colors.card,
              }}
            >
              <Text
                style={[FONTS.font, { color: colors.title, fontWeight: "700" }]}
              >
                {modalTitle || placeholder || "Select"}
              </Text>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text
                  style={[
                    FONTS.font,
                    { color: COLORS.primary, fontWeight: "600" },
                  ]}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            {showSearch && (
              <View
                onLayout={(e) => setSearchH(e.nativeEvent.layout.height)}
                style={{
                  padding: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  backgroundColor: colors.card,
                }}
              >
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search…"
                  placeholderTextColor={colors.text}
                  autoCorrect={false}
                  autoCapitalize="none"
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: Platform.OS === "ios" ? 10 : 8,
                    backgroundColor: colors.card,
                    color: colors.title,
                    ...GlobalStyleSheet.shadow2,
                  }}
                />
              </View>
            )}

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={(item, idx) => String(item.id ?? item.value ?? idx)}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              getItemLayout={(_, index) => ({
                length: itemHeight,
                offset: itemHeight * index,
                index,
              })}
              ListEmptyComponent={
                <View style={{ padding: 16, alignItems: "center" }}>
                  <Text style={[FONTS.font, { color: colors.text }]}>
                    {showSearch ? "No matches" : "No options"}
                  </Text>
                </View>
              }
              // 🔹 Height & scrolling logic
              style={{ height: availableListH }}
              scrollEnabled={shouldScroll}
              contentContainerStyle={{
                paddingHorizontal: 5,
                paddingVertical: 8,
                paddingBottom: 20, // 🔹 extra space after last item
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default InlinePicker;
