import React from "react";
import { Modal, View, Platform } from "react-native";
import { useTheme } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Text } from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import CustomButton from "../CustomButton";
import ModalStyles from "../../constants/ModalStyles";

const ConfirmModal = ({
  visible = true,
  onRequestClose = () => {},
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
      </View>
    </Modal>
  );
};

export default ConfirmModal;
