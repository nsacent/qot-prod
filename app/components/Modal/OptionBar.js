import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import CustomButton from "../CustomButton";

const OptionBar = ({
  visible = true, // optionally control visibility if you want
  iconName = "information-circle-sharp",
  iconColor = COLORS.primary,
  iconSize = 60,
  title = "Are You Sure?",
  message = "Do you want to proceed with this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm = () => {},
  onCancel = () => {},
  containerStyle = {},
  titleStyle = {},
  messageStyle = {},
  buttonsContainerStyle = {},
  confirmButtonProps = {},
  cancelButtonProps = {},
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <View
      style={{
        alignItems: "center",
        paddingHorizontal: 30,
        paddingVertical: 30,
        backgroundColor: colors.card,
        marginHorizontal: 30,
        maxWidth: 340,
        borderRadius: SIZES.radius,
        ...containerStyle,
      }}
    >
      <Ionicons
        name={iconName}
        style={{ marginBottom: 8 }}
        color={iconColor}
        size={iconSize}
      />
      <Text
        style={{
          ...FONTS.h5,
          color: colors.title,
          marginBottom: 5,
          ...titleStyle,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          ...FONTS.font,
          color: colors.text,
          textAlign: "center",
          ...messageStyle,
        }}
      >
        {message}
      </Text>

      <View
        style={{
          flexDirection: "row",
          marginTop: 25,
          ...buttonsContainerStyle,
        }}
      >
        <CustomButton
          onPress={onCancel}
          style={{ marginRight: 10 }}
          outline
          color={COLORS.secondary}
          btnSm
          title={cancelText}
          {...cancelButtonProps}
        />
        <CustomButton
          onPress={onConfirm}
          btnSm
          title={confirmText}
          {...confirmButtonProps}
        />
      </View>
    </View>
  );
};

export default OptionBar;
