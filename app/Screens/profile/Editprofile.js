import React, { useContext, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
  Keyboard,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { Snackbar } from "react-native-paper";

import { AuthContext } from "../../context/AuthProvider";
import Header from "../../layout/Header";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { SIZES, FONTS, IMAGES, COLORS } from "../../constants/theme";
import Button from "../../components/Button/Button";
import api, { ApiService } from "../../../src/services/api";
import * as ImagePicker from "expo-image-picker";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import axios from "axios";

const genderMap = { 1: "male", 2: "female" };
const reverseGenderMap = { male: 1, female: 2 };

const EditProfile = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const { userData, userToken, updateUserData } = useContext(AuthContext);
  const userId = userData?.id;
  const scrollViewRef = useRef();

  const [uploadProgress, setUploadProgress] = useState(0); // 0 to 100
  const [isUploading, setIsUploading] = useState(false);
  const [userImahe, setUserImage] = useState(null);

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    username: userData?.username || "",
    phone: userData?.phone || "",
    email: userData?.email || "",
    gender: genderMap[userData?.gender_id] || "",
  });

  const [errors, setErrors] = useState({
    name: "",
    username: "",
    phone: "",
    gender: "",
    general: "",
  });

  const [loading, setLoading] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);

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

  const validateField = (field) => {
    let error = "";
    const value = formData[field]?.trim();

    switch (field) {
      case "name":
        if (!value) error = "Name is required";
        else if (value.length < 2) error = "Name must be at least 2 characters";
        break;
      case "username":
        if (!value) error = "Username is required";
        else if (value.length < 3)
          error = "Username must be at least 3 characters";
        break;
      case "phone":
        if (value && !/^\+?[0-9]{7,15}$/.test(value))
          error = "Invalid phone number";
        break;
      case "gender":
        if (!value) error = "Please select a gender";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const validateForm = () => {
    let valid = true;
    ["name", "username", "phone", "gender"].forEach((field) => {
      if (!validateField(field)) valid = false;
    });
    return valid;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const uploadWithProgress = async (userId, image) => {
    try {
      const response = await ApiService.uploadPhoto(userId, image, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        },
      });
      console.log(response.data);

      return response.data;
    } catch (error) {
      console.log("ERROR UPLOADINF IMAGE", error);

      throw {
        status: error.response?.status,
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.error || "Upload failed",
      };
    }
  };

  /*const uploadWithProgress = (formData) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", `https://qot.ug/api/users/${userId}/photo`);

      xhr.setRequestHeader(
        "Authorization",
        userToken.startsWith("Bearer ") ? userToken : `Bearer ${userToken}`
      );
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("Content-Language", "en");
      xhr.setRequestHeader(
        "X-AppApiToken",
        "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY="
      );
      xhr.setRequestHeader("X-AppType", "docs");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
        } else {
          reject({
            status: xhr.status,
            data: response,
            message: response.error || "Upload failed",
          });
        }
      };

      xhr.onerror = () => reject({ message: "Network Error" });

      xhr.send(formData);
    });
  };*/

  const getUserIPAddress = async () => {
    try {
      const response = await axios.get("https://api.ipify.org?format=json");
      const ipAddress = response.data.ip;
      return ipAddress;
    } catch (error) {
      console.error("Error fetching IP address:", error);
      return "127.0.0.1";
    }
  };

  async function handleImageSelect() {
    try {
      // 1. Get credentials
      if (!userId || !userToken) {
        throw new Error("Missing authentication credentials");
      }

      // 2. Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaType?.Images || // Newer versions
          ImagePicker.MediaTypeOptions?.Images || // Older versions
          "Images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      // 3. Prepare the file
      const asset = result.assets[0];
      let localUri = asset.uri;

      // Android requires file:// prefix
      if (Platform.OS === "android" && !localUri.startsWith("file://")) {
        localUri = `file://${localUri}`;
      }

      // 4. Create FormData with EXACT structure
      const formData = new FormData();

      // Web implementation
      if (Platform.OS === "web") {
        const response = await fetch(localUri);
        const blob = await response.blob();

        // Verify file size (1500KB max)
        if (blob.size > 1500 * 1024) {
          throw new Error("Image must be smaller than 1.5MB");
        }
        setUserImage(
          formData.append("photo_path", blob, `user_${userId}_photo.jpg`)
        );
      }
      // Mobile implementation
      else {
        setUserImage(
          formData.append("photo_path", {
            uri: localUri,
            name: `user_${userId}_photo.jpg`,
            type: "image/jpeg",
          })
        );
      }

      // Required fields
      formData.append("latest_update_ip", getUserIPAddress() || "127.0.0.1");
      formData.append("_method", "PUT"); // Critical for Laravel-style override

      // 6. Make the POST request with method override
      setIsUploading(true);
      setUploadProgress(0);

      const responseData = await uploadWithProgress(userId, userImage);

      updateUserData(responseData.result);
      showSnackbar("Profile photo updated successfully!", "success");
      setIsUploading(false);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 100);

      //return responseData;

      console.log(responseData);
    } catch (error) {
      showSnackbar(
        error.status === 422
          ? error.data?.error || "Invalid image (max 1.5MB, JPG/PNG)"
          : error.message || "Upload failed",
        "error"
      );
      throw error;
    }
  }

  const handleUpdateProfile = async () => {
    Keyboard.dismiss();

    if (!validateForm()) {
      showSnackbar("Please fix the errors before submitting.", "error");
      return;
    }

    setLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        phone: formData.phone,
        phone_country: "UG",
        gender_id: reverseGenderMap[formData.gender] || "",
      };

      const response = await api.put(`/users/${userId}`, payload, {
        headers: {
          Authorization: userToken.startsWith("Bearer ")
            ? userToken
            : `Bearer ${userToken}`,
          Accept: "application/json",
          "Content-Language": "en",
          "X-AppApiToken": "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=",
          "X-AppType": "docs",
        },
      });

      if (response.data && response.data.success) {
        updateUserData(response.data.result);
        showSnackbar("Profile updated successfully!", "success");

        setTimeout(() => {
          navigation.goBack();
        }, 2000); // 3000 milliseconds = 3 seconds
      } else {
        throw new Error(response.data?.message || "Update failed");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while updating your profile.";
      setErrors((prev) => ({ ...prev, general: message }));
      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGender = (selectedGender) => {
    handleChange("gender", selectedGender);
    setGenderModalVisible(false);
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <Header title="Edit Profile" leftIcon="back" titleLeft />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 20,
        }}
        keyboardShouldPersistTaps="handled"
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
                  source={
                    userData?.photo_url
                      ? { uri: userData.photo_url }
                      : IMAGES.Small5
                  }
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

        {/* Name Field */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              ...FONTS.fontSm,
              color: colors.title,
              opacity: 0.6,
              marginBottom: 8,
            }}
          >
            Name
          </Text>
          <TextInput
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
            onBlur={() => validateField("name")}
            placeholder="Enter your name"
            style={[
              GlobalStyleSheet.shadow2,
              {
                borderColor: errors.name ? COLORS.danger : colors.border,
                padding: 10,
                backgroundColor: colors.card,
                color: colors.title,
                height: 48,
              },
            ]}
            placeholderTextColor={colors.textLight}
          />
          {errors.name && (
            <Text style={{ color: COLORS.danger }}>{errors.name}</Text>
          )}
        </View>

        {/* Username */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              ...FONTS.fontSm,
              color: colors.title,
              opacity: 0.6,
              marginBottom: 8,
            }}
          >
            Username
          </Text>
          <TextInput
            value={formData.username}
            onChangeText={(text) => handleChange("username", text)}
            onBlur={() => validateField("username")}
            placeholder="Enter your username"
            style={[
              GlobalStyleSheet.shadow2,
              {
                borderColor: errors.username ? COLORS.danger : colors.border,
                padding: 10,
                backgroundColor: colors.card,
                color: colors.title,
                height: 48,
              },
            ]}
            placeholderTextColor={colors.textLight}
          />
          {errors.username && (
            <Text style={{ color: COLORS.danger }}>{errors.username}</Text>
          )}
        </View>

        {/* Phone */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              ...FONTS.fontSm,
              color: colors.title,
              opacity: 0.6,
              marginBottom: 8,
            }}
          >
            Phone
          </Text>
          <TextInput
            value={formData.phone}
            onChangeText={(text) => handleChange("phone", text)}
            onBlur={() => validateField("phone")}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            style={[
              GlobalStyleSheet.shadow2,
              {
                borderColor: errors.phone ? COLORS.danger : colors.border,
                padding: 10,
                backgroundColor: colors.card,
                color: colors.title,
                height: 48,
              },
            ]}
            placeholderTextColor={colors.textLight}
          />
          {errors.phone && (
            <Text style={{ color: COLORS.danger }}>{errors.phone}</Text>
          )}
        </View>

        {/* Email (read-only) */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              ...FONTS.fontSm,
              color: colors.title,
              opacity: 0.6,
              marginBottom: 8,
            }}
          >
            Email
          </Text>
          <TextInput
            value={formData.email}
            editable={false}
            style={[
              GlobalStyleSheet.shadow2,
              {
                borderColor: colors.border,
                padding: 10,
                backgroundColor: colors.card,
                color: colors.title,
                height: 48,
                opacity: 0.6,
              },
            ]}
          />
        </View>

        {/* Gender Selector */}
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
                fontSize: 14,
              }}
            >
              {formData.gender
                ? formData.gender.charAt(0).toUpperCase() +
                  formData.gender.slice(1)
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
          activeOpacity={1}
          onPressOut={() => setGenderModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingBottom: Platform.OS === "ios" ? 30 : 20,
              paddingTop: 20,
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                ...FONTS.h6,
                color: colors.title,
                marginBottom: 15,
                textAlign: "center",
              }}
            >
              Select Gender
            </Text>
            {["male", "female"].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => handleSelectGender(option)}
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
              <Text style={{ ...FONTS.font, color: colors.text }}>Cancel</Text>
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
    </SafeAreaView>
  );
};

export default EditProfile;
