import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { COLORS, FONTS } from "../../constants/theme";
import { useTheme } from "@react-navigation/native";

const ReportAdOptionsSheet = ({ onSelectReason }) => {
  const { colors } = useTheme();

  const reasons = [
    "Scam or Fraud",
    "Offensive Content",
    "Duplicate Ad",
    "Incorrect Information",
    "Other",
  ];

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
          marginBottom: 15,
        }}
      >
        Why are you reporting this ad?
      </Text>

      {reasons.map((reason, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onSelectReason(reason)}
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: 12,
            borderRadius: 8,
            marginBottom: 10,
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
            {reason}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ReportAdOptionsSheet;
