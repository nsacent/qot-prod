import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import dayjs from "dayjs";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { FONTS, COLORS } from "../../constants/theme";
// format helpers
const fmtDate = (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "");
const parseMaybeDate = (v) =>
  v ? dayjs(v, "YYYY-MM-DD").toDate() : new Date();

const DateInput = ({
  label,
  value, // string 'YYYY-MM-DD'
  onChange, // (val: string) => void
  colors,
  required = false,
  minDate,
  maxDate,
  errorText,
}) => {
  const [visible, setVisible] = useState(false);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const onConfirm = (date) => {
    onChange(fmtDate(date));
    close();
  };

  const displayText = value
    ? dayjs(value).format("DD MMM YYYY")
    : `Select ${label}`;

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[FONTS.font, { color: colors.title, marginBottom: 8 }]}>
        {label}
        {required ? " *" : ""}
      </Text>

      <Pressable
        onPress={open}
        style={[
          GlobalStyleSheet.shadow2,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
            minHeight: 48,
            paddingHorizontal: 12,
            justifyContent: "center",
          },
        ]}
      >
        <Text
          style={[
            FONTS.font,
            { color: value ? colors.title : colors.text, fontSize: 14 },
          ]}
        >
          {displayText}
        </Text>
      </Pressable>

      {!!errorText && (
        <Text style={{ color: "crimson", marginTop: 6 }}>{errorText}</Text>
      )}

      <DateTimePickerModal
        isVisible={visible}
        mode="date"
        date={parseMaybeDate(value)}
        minimumDate={minDate}
        maximumDate={maxDate}
        onConfirm={onConfirm}
        onCancel={close}
        textColor={COLORS.primary}
        buttonTextColorIOS={COLORS.primary}
      />
    </View>
  );
};

export default DateInput;
