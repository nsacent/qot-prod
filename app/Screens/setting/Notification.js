import React, { useState, useContext, useEffect } from "react";
import { useTheme } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from "react-native";
import Header from "../../layout/Header";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { FONTS, COLORS } from "../../constants/theme";
import { AuthContext } from "../../context/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Snackbar } from "react-native-paper";
import { ApiService } from "../../../src/services/api";

const Notification = () => {
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
  const { userData, userToken } = useContext(AuthContext);

  const [isEnabled, setIsEnabled] = useState(false); // Recommendations
  const [isEnabled2, setIsEnabled2] = useState(false); // Offers

  const STORAGE_KEY = "notificationPrefs";

  // Load preferences from AsyncStorage on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue !== null) {
          const prefs = JSON.parse(jsonValue);
          setIsEnabled(prefs.recommendations || false);
          setIsEnabled2(prefs.offers || false);
        }
      } catch (e) {
        console.error("Failed to load notification prefs:", e);
      }
    };
    loadPreferences();
  }, []);

  const saveToStorage = async (prefs) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.error("Failed to save notification prefs:", e);
    }
  };

  const updatePreferencesToServer = async (prefs) => {
    if (!userData?.id || !userToken) return;

    try {
      const response = await ApiService.updateNotificationSettings(
        userData.id,
        {
          disable_comments: !prefs.recommendations,
          accept_marketing_offers: prefs.offers,
          accept_terms: true,
          latest_update_ip: "127.0.0.1",
        }
      );
      console.log("Updating preferences to server:", prefs);

      if (!response.data && !response.data.success) {
        throw new Error(data?.message || "Failed to update preferences");
      }
    } catch (err) {
      console.error("API sync error:", err);
      showSnackbar(
        err.message ? err.message : "Error syncing preferences",
        "error"
      );
    }
  };

  const toggleSwitch = async () => {
    const newVal = !isEnabled;
    setIsEnabled(newVal);
    const prefs = { recommendations: newVal, offers: isEnabled2 };
    await saveToStorage(prefs);
    updatePreferencesToServer(prefs);
  };

  const toggleSwitch2 = async () => {
    const newVal = !isEnabled2;
    setIsEnabled2(newVal);
    const prefs = { recommendations: isEnabled, offers: newVal };
    await saveToStorage(prefs);
    updatePreferencesToServer(prefs);
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <Header title="Notification" leftIcon="back" titleLeft />
      <View style={[GlobalStyleSheet.container, { marginTop: 10 }]}>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 15,
            borderBottomWidth: 1,
            borderBlockColor: colors.border,
            paddingBottom: 10,
            marginBottom: 20,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                ...FONTS.fontSm,
                ...FONTS.fontSemiBold,
                fontSize: 15,
                color: colors.title,
              }}
            >
              Recommendations
            </Text>
            <View style={{ paddingRight: 20 }}>
              <Text style={{ ...FONTS.font, color: colors.text }}>
                Receive recommendations based on your activity
              </Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "rgba(110, 78, 212, .2)" }}
            thumbColor={isEnabled ? "#6E4ED4" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 15,
            borderBottomWidth: 1,
            borderBlockColor: colors.border,
            paddingBottom: 10,
            marginBottom: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                ...FONTS.fontSm,
                ...FONTS.fontSemiBold,
                fontSize: 15,
                color: colors.title,
              }}
            >
              Receive updates & Offers
            </Text>
            <View style={{ paddingRight: 20 }}>
              <Text style={{ ...FONTS.font, color: colors.text }}>
                Get notified for special offers, updates and more
              </Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "rgba(110, 78, 212, .2)" }}
            thumbColor={isEnabled2 ? "#6E4ED4" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch2}
            value={isEnabled2}
          />
        </TouchableOpacity>
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

export default Notification;
