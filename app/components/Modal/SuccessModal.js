import React from "react";
import { Modal, View, Platform } from "react-native";
import { useTheme } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Text } from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import CustomButton from "../CustomButton";
import ModalStyles from "../../constants/ModalStyles";

const SuccessModal = ({
  visible = true,
  onRequestClose = () => {},
  iconName = "checkmark",
  iconColor = COLORS.success,
  iconSize = 60,
  title = "Congratulations!",
  message = "Your action was successful.",
  confirmText = "OK",
  containerStyle = {},
  titleStyle = {},
  messageStyle = {},
  buttonsContainerStyle = {},
  confirmButtonProps = {},
  onDismiss = () => {},
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onRequestClose}
    >
      <View style={ModalStyles.modalOverlay}>
        <View
          style={[
            ModalStyles.modalContent,
            { backgroundColor: colors.card },
            containerStyle,
          ]}
        >
          <Ionicons
            name={iconName}
            style={{ marginBottom: 8 }}
            color={iconColor}
            size={iconSize}
          />
          <Text style={[FONTS.h5, { color: colors.title }, titleStyle]}>
            {title}
          </Text>
          <Text
            style={[
              FONTS.font,
              { color: colors.text, textAlign: "center", marginTop: 5 },
              messageStyle,
            ]}
          >
            {message}
          </Text>

          <View style={[ModalStyles.buttonsRow, buttonsContainerStyle]}>
            <CustomButton
              onPress={onDismiss}
              btnSm
              title={confirmText}
              {...confirmButtonProps}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SuccessModal;
