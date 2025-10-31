import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { Snackbar } from "react-native-paper";

import { AuthContext } from "../../context/AuthProvider";
import Header from "../../layout/Header";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { FONTS, IMAGES, COLORS } from "../../constants/theme";
import Button from "../../components/Button/Button";
import api from "../../../src/services/api";
import * as ImagePicker from "expo-image-picker";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Field from "../../components/FieldInput";

// 👤 gender helpers
const genderMap = { 1: "male", 2: "female" };
const reverseGenderMap = { male: 1, female: 2 };

const EditProfile = ({ navigation }) => {
  const { colors } = useTheme();
  const { userData, updateUserData } = useContext(AuthContext);
  const userId = userData?.id;

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    username: userData?.username || "",
    phone: userData?.phone || "",
    email: userData?.email || "",
    gender: genderMap[userData?.gender_id] || "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackText, setSnackText] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);

  const showSnackbar = (text, type = "success") => {
    setSnackText(text);
    setSnackbarType(type);
    setSnackVisible(true);
  };

  const onDismissSnackBar = () => setSnackVisible(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateField = (field) => {
    const value = formData[field]?.trim();
    let error = "";
    if (field === "name" && (!value || value.length < 2))
      error = "Name must be at least 2 characters";
    if (field === "username" && (!value || value.length < 3))
      error = "Username must be at least 3 characters";
    if (field === "phone" && value && !/^[0-9+]{7,15}$/.test(value))
      error = "Invalid phone number";
    if (field === "gender" && !value) error = "Gender is required";
    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateForm = () =>
    ["name", "username", "phone", "gender"].every(validateField);

  const uploadWithProgress = async (formData) => {
    try {
      const response = await api.post(`/users/${userId}/photo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-AppType": "docs", // Optional override, handled by interceptor if set globally
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent); // this must be in scope
          }
        },
      });

      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status,
        data: error.response?.data,
        message:
          error.response?.data?.error || error.message || "Upload failed",
      };
    }
  };

  const handleImageSelect = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      let localUri = asset.uri.startsWith("file://")
        ? asset.uri
        : `file://${asset.uri}`;

      // 👉 Instant preview update
      setLocalPreview(localUri);

      const formData = new FormData();
      formData.append("photo_path", {
        uri: localUri,
        name: `user_${userId}_photo.jpg`,
        type: "image/jpeg",
      });
      formData.append("latest_update_ip", "127.0.0.1");
      formData.append("_method", "PUT");

      setIsUploading(true);
      const response = await uploadWithProgress(formData);
      updateUserData(response.result);
      showSnackbar("Profile photo updated successfully!");
    } catch (error) {
      showSnackbar(error.message || "Upload failed", "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUpdateProfile = async () => {
    Keyboard.dismiss();
    if (!validateForm()) return showSnackbar("Please fix the errors", "error");
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        phone: formData.phone,
        phone_country: "UG",
        gender_id: reverseGenderMap[formData.gender] || "",
      };

      const response = await api.put(`/users/${userId}`, payload);
      if (response.data?.success) {
        updateUserData(response.data?.result);
        showSnackbar("Profile updated!");
        setTimeout(() => navigation.goBack(), 1500);
      } else throw new Error("Update failed");
    } catch (error) {
      showSnackbar(error.response?.data?.message || error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
      <Header title="Edit Profile" leftIcon="back" titleLeft />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, padding: 20 }}
        >
          {/* Profile Photo */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <View>
              <AnimatedCircularProgress
                size={140}
                width={3}
                fill={uploadProgress}
                tintColor={COLORS.primary}
                backgroundColor="#e0e0e0"
              >
                {() => (
                  <Image
                    source={{
                      uri: localPreview || userData?.photo_url || IMAGES.Small5,
                    }}
                    style={{ width: 140, height: 140, borderRadius: 30 }}
                  />
                )}
              </AnimatedCircularProgress>

              <TouchableOpacity
                // TODO: handleImageSelect
                onPress={handleImageSelect}
                style={{ position: "absolute", bottom: 0, right: 0 }}
              >
                <View
                  style={{
                    backgroundColor: colors.card,
                    width: 36,
                    height: 36,
                    borderRadius: 50,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: COLORS.primary,
                      width: 30,
                      height: 30,
                      borderRadius: 50,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      style={{
                        width: 18,
                        height: 18,
                        resizeMode: "contain",
                        tintColor: "#fff",
                      }}
                      source={IMAGES.camera}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Name */}
          <Field
            label="Name"
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
            error={errors.name}
          />
          {/* Username */}
          <Field
            label="Username"
            value={formData.username}
            onChangeText={(text) => handleChange("username", text)}
            error={errors.username}
          />
          {/* Phone */}
          <Field
            label="Phone"
            value={formData.phone}
            onChangeText={(text) => handleChange("phone", text)}
            error={errors.phone}
            keyboardType="phone-pad"
          />
          {/* Email (Read-only) */}
          <Field label="Email" value={formData.email} editable={false} />
          {/* Gender */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                ...FONTS.fontSm,
                color: colors.title,
                opacity: 0.6,
                marginBottom: 8,
              }}
            >
              Gender
            </Text>
            <TouchableOpacity
              onPress={() => setGenderModalVisible(true)}
              style={[
                GlobalStyleSheet.shadow2,
                {
                  backgroundColor: colors.card,
                  borderColor: errors.gender ? COLORS.danger : colors.border,
                  height: 48,
                  justifyContent: "center",
                  paddingHorizontal: 15,
                  borderRadius: 8,
                },
              ]}
            >
              <Text
                style={{
                  color: formData.gender ? colors.title : colors.textLight,
                }}
              >
                {formData.gender
                  ? formData.gender[0].toUpperCase() + formData.gender.slice(1)
                  : "Select gender"}
              </Text>
            </TouchableOpacity>
            {errors.gender && (
              <Text style={{ color: COLORS.danger }}>{errors.gender}</Text>
            )}
          </View>

          <Button
            onPress={handleUpdateProfile}
            title={loading ? "Updating..." : "Update"}
            disabled={loading}
          />
        </ScrollView>

        {/* Gender Modal */}
        <Modal
          visible={genderModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setGenderModalVisible(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "flex-end",
            }}
            activeOpacity={1}
            onPressOut={() => setGenderModalVisible(false)}
          >
            <View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                padding: 20,
                paddingBottom: Platform.OS === "ios" ? 30 : 20,
              }}
            >
              <Text
                style={{
                  ...FONTS.h6,
                  color: colors.title,
                  textAlign: "center",
                  marginBottom: 15,
                }}
              >
                Select Gender
              </Text>
              {["male", "female"].map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    handleChange("gender", option);
                    setGenderModalVisible(false);
                  }}
                  style={{
                    backgroundColor: COLORS.primary,
                    borderRadius: 8,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    marginBottom: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ ...FONTS.fontMedium, color: "#fff", fontSize: 16 }}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setGenderModalVisible(false)}
                style={{
                  alignItems: "center",
                  marginTop: 10,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ ...FONTS.font, color: colors.text }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfile;
