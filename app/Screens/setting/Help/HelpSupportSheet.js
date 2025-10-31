import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { COLORS, FONTS } from "../../../constants/theme";
import { useTheme, useNavigation } from "@react-navigation/native";

const HelpSupportSheet = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const options = [
    { id: "1", title: "Account Issues" },
    { id: "2", title: "Contact Admin" },
    { id: "3", title: "Report a User" },
    { id: "4", title: "Support" },
    { id: "5", title: "Other" },
  ];

  const goToAdminChat = (topic) => {
    navigation.navigate("SingleChat", {
      threadId: "1",
      username: "Admin",
      initialMessage: `Hi, I need help with ${topic}`,
    });
  };

  return (
    <View>
      <Text
        style={{
          ...FONTS.fontLg,
          ...FONTS.fontMedium,
          color: colors.title,
          marginBottom: 15,
        }}
      >
        Select an issue
      </Text>
      {options.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={goToAdminChat}
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
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default HelpSupportSheet;
