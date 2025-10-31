import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { COLORS, FONTS } from "../../constants/theme";
import { useTheme } from "@react-navigation/native";

const ReportMessageSheet = ({ reason, onSubmit }) => {
  const { colors } = useTheme();
  const [message, setMessage] = useState("");

  return (
    <View
      style={{
        padding: 20,
        backgroundColor: colors.card, // <== themed background
        flex: 1,
        borderRadius: 10,
      }}
    >
      <Text
        style={{
          ...FONTS.fontLg,
          ...FONTS.fontMedium,
          color: colors.title,
          marginBottom: 10,
        }}
      >
        Describe the issue ({reason})
      </Text>

      <TextInput
        multiline
        placeholder="Enter your message..."
        value={message}
        onChangeText={setMessage}
        placeholderTextColor={colors.text}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          padding: 10,
          backgroundColor: colors.card, // <== add this
          height: 100,
          color: colors.text,
          marginBottom: 20,
          textAlignVertical: "top",
        }}
      />

      <TouchableOpacity
        onPress={() => onSubmit(message)}
        style={{
          backgroundColor: COLORS.primary,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            ...FONTS.fontLg,
            ...FONTS.fontMedium,
            color: "#fff",
            textAlign: "center",
          }}
        >
          Submit Report
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReportMessageSheet;
