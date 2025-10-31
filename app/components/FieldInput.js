// components/FieldInput.js

import React from "react";
import { Text, TextInput, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { GlobalStyleSheet } from "../constants/StyleSheet";
import { COLORS, FONTS } from "../constants/theme";

const Field = ({
  label,
  value,
  onChangeText,
  error,
  editable = true,
  keyboardType = "default",
  onBlur,
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          ...FONTS.fontSm,
          color: colors.title,
          opacity: 0.6,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        editable={editable}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={`Enter your ${label.toLowerCase()}`}
        keyboardType={keyboardType}
        style={[
          GlobalStyleSheet.shadow2,
          {
            borderColor: error ? COLORS.danger : colors.border,
            padding: 10,
            backgroundColor: colors.card,
            color: colors.title,
            height: 48,
            opacity: editable ? 1 : 0.6,
            borderRadius: 8,
          },
        ]}
        placeholderTextColor={colors.textLight}
      />
      {error && <Text style={{ color: COLORS.danger }}>{error}</Text>}
    </View>
  );
};

export default Field;
