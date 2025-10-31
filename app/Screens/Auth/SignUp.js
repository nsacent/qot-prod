import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import CustomButton from "../../components/CustomButton";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { COLORS, FONTS, IMAGES } from "../../constants/theme";
import FeatherIcon from "react-native-vector-icons/Feather";
import { Checkbox, Modal } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { ApiService } from "../../../src/services/api";

const useGetIP = () => {
  const [ipData, setIpData] = useState({
    ip: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await axios.get("https://api.ipify.org?format=json");
        setIpData({
          ip: response.data.ip,
          loading: false,
          error: null,
        });
      } catch (error) {
        setIpData({
          ip: "",
          loading: false,
          error: error.message || "Failed to fetch IP",
        });
      }
    };

    fetchIP();
  }, []);

  return ipData;
};

const SignUp = () => {
  const theme = useTheme();
  const { colors } = theme;
  const navigation = useNavigation();
  const scrollViewRef = useRef();
  const fieldPositions = useRef({});

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: "",
    general: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);

  // Get IP address
  const { ip, loading: ipLoading, error: ipError } = useGetIP();

  // Input focus states
  const [focusStates, setFocusStates] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const handleFocus = (field) => {
    setFocusStates({ ...focusStates, [field]: true });
    // Clear error when field is focused
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field) => {
    setFocusStates({ ...focusStates, [field]: false });
    // Validate field on blur
    validateField(field);
  };

  const validateField = (field) => {
    let error = "";
    const value = formData[field];

    switch (field) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (value.trim().length < 2)
          error = "Name must be at least 2 characters";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email format";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 6)
          error = "Password must be at least 6 characters";
        else if (!/[A-Z]/.test(value))
          error = "Password must contain at least one uppercase letter";
        else if (!/[a-z]/.test(value))
          error = "Password must contain at least one lowercase letter";
        else if (!/[0-9]/.test(value))
          error = "Password must contain at least one number";
        break;
      case "confirmPassword":
        if (!value) error = "Please confirm your password";
        else if (value !== formData.password) error = "Passwords do not match";
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate all fields
    ["name", "email", "password", "confirmPassword"].forEach((field) => {
      validateField(field);
      if (errors[field]) isValid = false;
    });

    // Validate terms checkbox
    if (!isChecked) {
      newErrors.terms = "You must accept terms";
      isValid = false;
    } else {
      newErrors.terms = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    Keyboard.dismiss(); // Dismiss keyboard when submitting

    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fix all errors before submitting"
      );
      return;
    }

    setLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      // Prepare data for registration

      const response = await ApiService.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        accept_terms: isChecked,
        country_code: "UG",
        auth_field: "email",
        password_confirmation: formData.confirmPassword,
        ...(ip && !ipError && { create_from_ip: ip }),
      });

      if (response.data && response.data.success) {
        setShowSuccessSheet(true);
      } else {
        throw new Error(response.data?.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed. Please try again.";

      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = "Invalid registration data";
        } else if (error.response.status === 409) {
          errorMessage = "Email already exists";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.errors) {
          const serverErrors = {};
          Object.entries(error.response.data.errors).forEach(
            ([key, messages]) => {
              const fieldMap = {
                accept_terms: "terms",
                password_confirmation: "confirmPassword",
              };
              const fieldName = fieldMap[key] || key;
              serverErrors[fieldName] = Array.isArray(messages)
                ? messages.join(" ")
                : messages;
            }
          );
          setErrors((prev) => ({ ...prev, ...serverErrors }));
          errorMessage = "Please fix the form errors";
        }
      }

      setErrors((prev) => ({ ...prev, general: errorMessage }));
      Alert.alert("Registration Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSheet = () => {
    setShowSuccessSheet(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "SignIn" }],
    });
  };

  const measureFieldPosition = (fieldName, event) => {
    const { y } = event.nativeEvent.layout;
    fieldPositions.current[fieldName] = y;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Header */}
          <View
            style={{ marginBottom: 30, alignItems: "center", marginTop: 30 }}
          >
            <Image
              style={{
                height: 51,
                width: 162,
                resizeMode: "contain",
                marginBottom: 20,
              }}
              source={theme.dark ? IMAGES.logowhite : IMAGES.logo}
            />
            <Text style={{ ...FONTS.h3, marginBottom: 6, color: colors.title }}>
              Create your account
            </Text>
            <Text style={{ ...FONTS.font, color: colors.text }}>
              Lets get started with your 30 days free trial
            </Text>
          </View>

          {/* Name Field */}
          <View
            style={GlobalStyleSheet.inputGroup}
            onLayout={(e) => measureFieldPosition("name", e)}
          >
            <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>
              Full Name
            </Text>
            <TextInput
              style={[
                GlobalStyleSheet.shadow2,
                {
                  backgroundColor: colors.input,
                  color: colors.title,
                  borderColor: errors.name ? COLORS.danger : colors.border,
                  paddingLeft: 20,
                  height: 48,
                },
                focusStates.name && GlobalStyleSheet.activeInput,
              ]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              onFocus={() => handleFocus("name")}
              onBlur={() => handleBlur("name")}
              placeholder="Type your full name"
              placeholderTextColor={colors.textLight}
            />
            {errors.name && (
              <Text style={{ color: COLORS.danger, ...FONTS.fontXs }}>
                {errors.name}
              </Text>
            )}
          </View>

          {/* Email Field */}
          <View
            style={GlobalStyleSheet.inputGroup}
            onLayout={(e) => measureFieldPosition("email", e)}
          >
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
                },
                focusStates.email && GlobalStyleSheet.activeInput,
              ]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Type your email"
              placeholderTextColor={colors.textLight}
            />
            {errors.email && (
              <Text style={{ color: COLORS.danger, ...FONTS.fontXs }}>
                {errors.email}
              </Text>
            )}
          </View>

          {/* Password Field */}
          <View
            style={GlobalStyleSheet.inputGroup}
            onLayout={(e) => measureFieldPosition("password", e)}
          >
            <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>
              Password
            </Text>
            <View>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
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
                <FeatherIcon
                  name={showPassword ? "eye" : "eye-off"}
                  color={colors.title}
                  size={18}
                />
              </TouchableOpacity>
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
                    height: 48,
                  },
                  focusStates.password && GlobalStyleSheet.activeInput,
                ]}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                onFocus={() => handleFocus("password")}
                onBlur={() => handleBlur("password")}
                secureTextEntry={!showPassword}
                placeholder="Type your password"
                placeholderTextColor={colors.textLight}
              />
            </View>
            {errors.password && (
              <Text style={{ color: COLORS.danger, ...FONTS.fontXs }}>
                {errors.password}
              </Text>
            )}
          </View>

          {/* Confirm Password Field */}
          <View
            style={[GlobalStyleSheet.inputGroup, { marginBottom: 5 }]}
            onLayout={(e) => measureFieldPosition("confirmPassword", e)}
          >
            <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>
              Confirm Password
            </Text>
            <View>
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
                <FeatherIcon
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  color={colors.title}
                  size={18}
                />
              </TouchableOpacity>
              <TextInput
                style={[
                  GlobalStyleSheet.shadow2,
                  {
                    backgroundColor: colors.input,
                    color: colors.title,
                    borderColor: errors.confirmPassword
                      ? COLORS.danger
                      : colors.border,
                    paddingLeft: 20,
                    height: 48,
                  },
                  focusStates.confirmPassword && GlobalStyleSheet.activeInput,
                ]}
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
                onFocus={() => handleFocus("confirmPassword")}
                onBlur={() => handleBlur("confirmPassword")}
                secureTextEntry={!showConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textLight}
              />
            </View>
            {errors.confirmPassword && (
              <Text style={{ color: COLORS.danger, ...FONTS.fontXs }}>
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          {/* Terms Checkbox */}
          <View
            style={{ marginBottom: 15 }}
            onLayout={(e) => measureFieldPosition("terms", e)}
          >
            <Checkbox.Item
              onPress={() => {
                setIsChecked(!isChecked);
                if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
              }}
              position="leading"
              label="I agree to all Term, Privacy Policy and fees"
              color={COLORS.primary}
              uncheckedColor={colors.textLight}
              status={isChecked ? "checked" : "unchecked"}
              style={{
                paddingHorizontal: 0,
                paddingVertical: 5,
              }}
              labelStyle={{
                ...FONTS.font,
                color: colors.title,
                textAlign: "left",
              }}
            />
            {errors.terms && (
              <Text style={{ color: COLORS.danger, ...FONTS.fontXs }}>
                {errors.terms}
              </Text>
            )}
          </View>

          {/* General Error */}
          {errors.general && (
            <Text
              style={{
                color: COLORS.danger,
                textAlign: "center",
                marginBottom: 10,
                ...FONTS.font,
              }}
            >
              {errors.general}
            </Text>
          )}

          {/* Register Button */}
          <CustomButton
            onPress={handleSignUp}
            color={COLORS.primary}
            title={loading ? "Creating Account..." : "Register"}
            disabled={loading || ipLoading}
          />

          {/* Login Link */}
          <View style={{ flexDirection: "row", marginTop: 12 }}>
            <Text style={{ ...FONTS.font, color: colors.text, marginRight: 5 }}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
              <Text
                style={{
                  ...FONTS.font,
                  color: COLORS.primary,
                  marginBottom: 20,
                }}
              >
                Log in
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{
              height: 48,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.dark ? "rgba(255,255,255,.1)" : "#E8ECF2",
            }}
          >
            <Image
              style={{ position: "absolute", left: 25, width: 20, height: 20 }}
              source={IMAGES.google2}
            />
            <Text style={{ ...FONTS.font, fontSize: 15, color: colors.title }}>
              Login with Google
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessSheet}
        onDismiss={handleCloseSheet}
        contentContainerStyle={{
          backgroundColor: colors.card,
          padding: 20,
          margin: 20,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 35,
            paddingVertical: 20,
          }}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 15,
              marginTop: 10,
            }}
          >
            <View
              style={{
                height: 80,
                width: 80,
                opacity: 0.2,
                backgroundColor: COLORS.success,
                borderRadius: 80,
              }}
            />
            <View
              style={{
                height: 65,
                width: 65,
                backgroundColor: COLORS.success,
                borderRadius: 65,
                position: "absolute",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FeatherIcon size={32} color={COLORS.white} name="check" />
            </View>
          </View>
          <Text style={{ ...FONTS.h4, color: colors.title, marginBottom: 8 }}>
            Congratulations!
          </Text>
          <Text
            style={{
              ...FONTS.font,
              color: colors.text,
              textAlign: "center",
              marginBottom: 5,
            }}
          >
            Your account has been created successfully!
          </Text>
          <Text
            style={{
              ...FONTS.font,
              color: colors.text,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Please check your email to verify your account before signing in
          </Text>
          <CustomButton
            onPress={handleCloseSheet}
            title="Continue to Sign In"
            color={COLORS.primary}
            style={{ width: "100%" }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SignUp;
