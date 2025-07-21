import React, { useState, useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "../../../layout/Header";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import { IMAGES, COLORS } from "../../../constants/theme";
import Button from "../../../components/Button/Button";
import api from "../../../../src/services/api";
import { AuthContext } from "../../../context/AuthProvider";

import { Snackbar } from "react-native-paper";

const Changepassword = () => {
  // Snackbar state
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackText, setSnackText] = useState("");
  const [snackbarType, setSnackbarType] = useState("success"); // 'success' or 'error'

  const onDismissSnackBar = () => setSnackVisible(false);

  const showSnackbar = (text, type = "success") => {
    setSnackText(text);
    setSnackbarType(type);
    setSnackVisible(true);
  };

  const { colors } = useTheme();
  const { userToken, userData } = useContext(AuthContext);

  const [show2, setShow2] = useState(true);
  const [show3, setShow3] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      // Alert.alert('Error', 'Please fill in all fields.');
      showSnackbar("Please fill in all fields.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showSnackbar("Passwords do not match.", "error");
      return;
    }

    Keyboard.dismiss();

    setLoading(true);

    try {
      const response = await api.put(
        `/users/${userData.id}`,
        {
          password: newPassword,
          password_confirmation: confirmPassword,
          name: userData.name,
          email: userData.email,
        },
        {
          headers: {
            Authorization: userToken,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      showSnackbar("Your password has been updated.", "success");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      let message = "Something went wrong.";

      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        message = errors.join("\n");
      }

      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <Header title="Change Password" leftIcon="back" titleLeft />
      <View style={[GlobalStyleSheet.container, { marginTop: 10, flex: 1 }]}>
        {/* New Password */}
        <View style={{ marginBottom: 20 }}>
          <TextInput
            placeholder="New Password"
            placeholderTextColor={colors.text}
            secureTextEntry={show2}
            value={newPassword}
            onChangeText={setNewPassword}
            style={[
              GlobalStyleSheet.shadow2,
              {
                borderColor: colors.border,
                padding: 10,
                backgroundColor: colors.card,
                paddingRight: 50,
                color: colors.title,
                height: 48,
              },
            ]}
          />
          <TouchableOpacity
            style={{
              position: "absolute",
              right: 15,
              top: 12,
            }}
            onPress={() => setShow2(!show2)}
          >
            <Image
              style={[
                GlobalStyleSheet.inputSecureIcon,
                { tintColor: colors.text },
              ]}
              source={show2 ? IMAGES.eyeClose : IMAGES.eye}
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <View style={{ marginBottom: 20 }}>
          <TextInput
            placeholder="Confirm New Password"
            placeholderTextColor={colors.text}
            secureTextEntry={show3}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={[
              GlobalStyleSheet.shadow2,
              {
                borderColor: colors.border,
                padding: 10,
                backgroundColor: colors.card,
                paddingRight: 50,
                color: colors.title,
                height: 48,
              },
            ]}
          />
          <TouchableOpacity
            style={{
              position: "absolute",
              right: 15,
              top: 12,
            }}
            onPress={() => setShow3(!show3)}
          >
            <Image
              style={[
                GlobalStyleSheet.inputSecureIcon,
                { tintColor: colors.text },
              ]}
              source={show3 ? IMAGES.eyeClose : IMAGES.eye}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Button */}
      <View style={{ paddingHorizontal: 15, paddingBottom: 15 }}>
        <Button
          title={loading ? "Saving..." : "Save"}
          onPress={handleChangePassword}
          disabled={loading}
        />
        {loading && (
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <ActivityIndicator
              size="small"
              color={colors.primary || "#6E4ED4"}
            />
          </View>
        )}
      </View>

      {/* Snackbar */}
      <Snackbar
        visible={snackVisible}
        onDismiss={onDismissSnackBar}
        duration={3000}
        style={{
          backgroundColor:
            snackbarType === "success" ? COLORS.success : COLORS.danger,
          margin: 16,
          borderRadius: 8,
        }}
        action={{
          label: "OK",
          onPress: () => setSnackVisible(false),
          labelStyle: { color: "#fff", fontWeight: "bold" },
        }}
      >
        <Text style={{ color: "#fff" }}>{snackText}</Text>
      </Snackbar>
    </SafeAreaView>
  );
};

export default Changepassword;
