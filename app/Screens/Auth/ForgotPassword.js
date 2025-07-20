import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import CustomButton from "../../components/CustomButton";
import { COLORS, FONTS } from "../../constants/theme";
import { useTheme } from "@react-navigation/native";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { ApiService } from "../../../src/services/api";
import SuccessModal from "../../components/Modal/SuccessModal";

const ForgotPassword = ({ navigation }) => {
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Invalid email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await ApiService.forgot({
        email: email,
        auth_field: "email",
        phone: null,
        phone_country: "UG",
        captcha_key: "alias",
      });

      setLoading(false);

      if (response.data && response.data.success) {
        setSuccessMessage(
          response.data?.message || "Reset link sent successfully"
        );
        setShowSuccess(true);
      } else {
        Alert.alert("Error", response.data?.message || "Something went wrong");
      }
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", "Network error. Please try again later.");
    }
  };

  const handleSuccessDismiss = () => {
    setShowSuccess(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingVertical: 40,
            paddingBottom: 80,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 60 }}>
            <Text style={{ ...FONTS.h3, color: colors.title, marginBottom: 6 }}>
              Forgot Password
            </Text>
            <Text
              style={{ ...FONTS.font, color: colors.text, textAlign: "center" }}
            >
              Enter your email and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Email Input */}
          <View style={GlobalStyleSheet.inputGroup}>
            <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>
              Email Address
            </Text>
            <TextInput
              style={[
                GlobalStyleSheet.shadow2,
                {
                  backgroundColor: colors.input,
                  color: colors.title,
                  borderColor: colors.border,
                  paddingLeft: 20,
                  height: 48,
                },
              ]}
              placeholder="Type Email Here"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
            {error && (
              <Text style={{ color: "red", marginTop: 5 }}>{error}</Text>
            )}
          </View>

          {/* Submit Button */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{ marginVertical: 20 }}
            />
          ) : (
            <CustomButton
              onPress={handleSubmit}
              color={COLORS.primary}
              title="Send Reset Link"
            />
          )}

          {/* Back to Login */}
          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                ...FONTS.font,
                color: colors.text,
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              Remembered your password?
            </Text>
            <CustomButton
              onPress={() => navigation.goBack()}
              outline
              color={COLORS.secondary}
              title="Back to Login"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* Success Modal */}
      <SuccessModal
        visible={showSuccess}
        onDismiss={handleSuccessDismiss}
        title="Success!"
        message={successMessage}
        confirmText="OK"
      />
    </SafeAreaView>
  );
};

export default ForgotPassword;
