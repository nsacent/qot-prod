import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import CustomButton from "../../components/CustomButton";
import { COLORS, FONTS } from "../../constants/theme";
import { useTheme } from "@react-navigation/native";
import { GlobalStyleSheet } from "../../constants/StyleSheet";

const ForgotPassword = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Invalid email address");
      return;
    }

    setError("");
    Alert.alert("Success", "Password reset link has been sent to your email");
    // navigation.goBack();
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
          <View style={{ alignItems: "center", marginBottom: 60 }}>
            <Text style={{ ...FONTS.h3, color: colors.title, marginBottom: 6 }}>
              Forgot Password
            </Text>
            <Text
              style={{
                ...FONTS.font,
                color: colors.text,
                textAlign: "center",
              }}
            >
              Enter your email and we'll send you a link to reset your password.
            </Text>
          </View>

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
            {error ? (
              <Text style={{ color: "red", marginTop: 5 }}>{error}</Text>
            ) : null}
          </View>

          <CustomButton
            onPress={handleSubmit}
            color={COLORS.primary}
            title="Send Reset Link"
          />

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
    </SafeAreaView>
  );
};

export default ForgotPassword;
