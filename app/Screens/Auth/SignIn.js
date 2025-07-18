/*import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import CustomButton from "../../components/CustomButton";
import { COLORS, FONTS, IMAGES } from "../../constants/theme";
import FeatherIcon from "react-native-vector-icons/Feather";
import { useTheme } from "@react-navigation/native";
import { GlobalStyleSheet } from "../../constants/StyleSheet";

const SignIn = (props) => {
  const theme = useTheme();
  const { colors } = theme;

  const [isFocused, setisFocused] = useState(false);
  const [isFocused2, setisFocused2] = useState(false);
  const [handlePassword, setHandlePassword] = useState(true);

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
            <Image
              style={{
                height: 51,
                width: 162,
                resizeMode: "contain",
                marginBottom: 20,
              }}
              source={theme.dark ? IMAGES.logowhite : IMAGES.logo}
            />
            <Text style={{ ...FONTS.h3, color: colors.title, marginBottom: 6 }}>
              Welcome back!
            </Text>
            <Text
              style={{ ...FONTS.font, color: colors.text, textAlign: "center" }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor
            </Text>
          </View>

          <View style={GlobalStyleSheet.inputGroup}>
            <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>
              Username
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
                isFocused && GlobalStyleSheet.activeInput,
              ]}
              onFocus={() => setisFocused(true)}
              onBlur={() => setisFocused(false)}
              placeholder="Type Username Here"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={GlobalStyleSheet.inputGroup}>
            <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>
              Password
            </Text>
            <View>
              <TouchableOpacity
                onPress={() => setHandlePassword(!handlePassword)}
                style={{
                  position: "absolute",
                  zIndex: 1,
                  height: 50,
                  width: 50,
                  alignItems: "center",
                  justifyContent: "center",
                  right: 0,
                  opacity: 0.5,
                }}
              >
                {handlePassword ? (
                  <FeatherIcon name="eye-off" color={colors.title} size={18} />
                ) : (
                  <FeatherIcon name="eye" color={colors.title} size={18} />
                )}
              </TouchableOpacity>
              <TextInput
                style={[
                  GlobalStyleSheet.shadow2,
                  {
                    backgroundColor: colors.input,
                    color: colors.title,
                    borderColor: colors.border,
                    paddingLeft: 20,
                    paddingRight: 40,
                    height: 48,
                  },
                  isFocused2 && GlobalStyleSheet.activeInput,
                ]}
                onFocus={() => setisFocused2(true)}
                onBlur={() => setisFocused2(false)}
                secureTextEntry={handlePassword}
                placeholder="Type Password Here"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          <CustomButton
            onPress={() => props.navigation.navigate("DrawerNavigation")}
            color={COLORS.primary}
            title="Login"
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 15,
            }}
          >
            <Text style={{ ...FONTS.font, color: colors.text }}>
              Forgot password?
            </Text>
            <TouchableOpacity>
              <Text
                style={{ ...FONTS.fontLg, color: COLORS.primary }}
                onPress={() => props.navigation.navigate("ForgotPassword")}
                outline
              >
                Reset here
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                ...FONTS.font,
                color: colors.title,
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Don’t have an account?
            </Text>
            <CustomButton
              onPress={() => props.navigation.navigate("SignUp")}
              outline
              color={COLORS.secondary}
              title="Register now"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;*/

import React, { useState, useContext } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import CustomButton from "../../components/CustomButton";
import { COLORS, FONTS, IMAGES } from "../../constants/theme";
import FeatherIcon from "react-native-vector-icons/Feather";
import { useTheme } from "@react-navigation/native";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import api, { ApiService } from "../../../src/services/api";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthProvider";

import { Snackbar } from "react-native-paper";

const SignIn = () => {
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

  const theme = useTheme();
  const { colors } = theme;
  const navigation = useNavigation();
  const { signIn } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const validateForm = () => {
    const newErrors = { email: "", password: "", general: "" };
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!validateForm()) return;

    setLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const response = await ApiService.login(
        (credentials = {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        })
      );

      const token = response.data?.extra?.authToken;
      const tokenType = response.data?.extra?.tokenType || "Bearer";
      const userProfile = response.data?.result;

      if (!token || !userProfile?.id) {
        throw new Error("Missing token or user ID from login response");
      }

      const fullToken = `${tokenType} ${token}`;

      // ✅ This sets the user and token → triggers Routes.js to show AppStack
      await signIn(fullToken, userProfile);

      // ✅ NO NEED to reset navigation manually here
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message === "Network Error") {
        errorMessage = "Network connection failed";
      } else if (error.message) {
        errorMessage = error.message;
      }

      //Alert.alert('Error', errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));
    if (
      field === "email" &&
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email" }));
    }
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
          {/* Logo */}
          <View style={{ marginBottom: 30, alignItems: "center" }}>
            <Image
              style={{
                height: 51,
                width: 162,
                resizeMode: "contain",
                marginBottom: 20,
              }}
              source={theme.dark ? IMAGES.logowhite : IMAGES.logo}
            />
            <Text style={{ ...FONTS.h3, color: colors.title, marginBottom: 6 }}>
              Welcome back!
            </Text>
            <Text
              style={{
                ...FONTS.font,
                color: colors.text,
                textAlign: "center",
                maxWidth: "80%",
              }}
            >
              Sign in to access your account and continue browsing
            </Text>
          </View>

          {/* Email Input */}
          <View style={GlobalStyleSheet.inputGroup}>
            <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>
              Email
            </Text>
            <TextInput
              style={[
                GlobalStyleSheet.shadow2,
                {
                  backgroundColor: colors.input,
                  color: colors.title,
                  borderColor: errors.email ? COLORS.danger : colors.border,
                  paddingLeft: 20,
                  height: 48,
                  borderRadius: 8,
                },
                isFocused.email && GlobalStyleSheet.activeInput,
              ]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email")}
              placeholder="Enter your email"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            {errors.email && (
              <Text
                style={{ color: COLORS.danger, ...FONTS.fontXs, marginTop: 4 }}
              >
                {errors.email}
              </Text>
            )}
          </View>

          {/* Password Input */}
          <View style={[GlobalStyleSheet.inputGroup, { marginBottom: 10 }]}>
            <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>
              Password
            </Text>
            <View style={{ position: "relative" }}>
              <TextInput
                style={[
                  GlobalStyleSheet.shadow2,
                  {
                    backgroundColor: colors.input,
                    color: colors.title,
                    borderColor: errors.password
                      ? COLORS.danger
                      : colors.border,
                    paddingLeft: 20,
                    paddingRight: 50,
                    height: 48,
                    borderRadius: 8,
                  },
                  isFocused.password && GlobalStyleSheet.activeInput,
                ]}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                onFocus={() => handleFocus("password")}
                onBlur={() => handleBlur("password")}
                secureTextEntry={!showPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.textLight}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 15, top: 15 }}
              >
                <FeatherIcon
                  name={showPassword ? "eye-off" : "eye"}
                  color={colors.textLight}
                  size={18}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text
                style={{ color: COLORS.danger, ...FONTS.fontXs, marginTop: 4 }}
              >
                {errors.password}
              </Text>
            )}
          </View>

          {/* Login Button */}
          <View style={{ marginTop: 20 }}>
            <CustomButton
              onPress={handleLogin}
              color={COLORS.primary}
              title={loading ? "Authenticating..." : "Login"}
              disabled={loading || !formData.email || !formData.password}
            />
            {loading && (
              <ActivityIndicator
                color={COLORS.primary}
                style={{ marginTop: 15 }}
              />
            )}
          </View>

          {/* Forgot Password */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 15,
            }}
          >
            <Text style={{ ...FONTS.font, color: colors.text }}>
              Forgot password?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={{ ...FONTS.fontLg, color: COLORS.primary }}>
                Reset here
              </Text>
            </TouchableOpacity>
          </View>

          {/* Register Section */}
          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                ...FONTS.font,
                color: colors.title,
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Don’t have an account?
            </Text>
            <CustomButton
              onPress={() => navigation.navigate("SignUp")}
              outline
              color={COLORS.secondary}
              title="Register now"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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

export default SignIn;
