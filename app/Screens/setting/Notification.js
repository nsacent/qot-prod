import React, { useState, useContext, useEffect, useMemo } from "react";
import { useTheme } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  TextInput,
  Keyboard,
} from "react-native";
import Header from "../../layout/Header";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { FONTS, COLORS } from "../../constants/theme";
import { AuthContext } from "../../context/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Snackbar } from "react-native-paper";
import axios from "axios";
import getUserIpAddress from "../../../src/utils/getUserIpAddress";
import DropDownPicker from "react-native-dropdown-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const API_BASE_URL = "https://qot.ug/api";
const STORAGE_KEY = "userPreferences"; // local cache (includes local-only fields too)

const Notification = () => {
  const { colors } = useTheme();
  const { userData, userToken } = useContext(AuthContext);

  // Snackbar
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackText, setSnackText] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
  const showSnackbar = (text, type = "success") => {
    setSnackText(text);
    setSnackbarType(type);
    setSnackVisible(true);
  };
  const onDismissSnackBar = () => setSnackVisible(false);

  // Server-backed prefs
  const [disableComments, setDisableComments] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [acceptMarketingOffers, setAcceptMarketingOffers] = useState(false);
  const [timeZone, setTimeZone] = useState("");

  //State for dropdown time zone
  const [tzOpen, setTzOpen] = useState(false);
  const [tzItems, setTzItems] = useState([]);

  // Local-only (kept from your original screen)
  const [recommendations, setRecommendations] = useState(false);

  // Derived/device
  const deviceTimeZone =
    (Intl && Intl.DateTimeFormat().resolvedOptions().timeZone) ||
    "Africa/Kampala";
  const [userIpAddress, setUserIpAddress] = useState("127.0.0.1");

  const regionEmoji = (tz = "") => {
    const region = tz.split("/")[0];
    switch (region) {
      case "Africa":
        return "🌍";
      case "America":
        return "🌎";
      case "Europe":
        return "🇪🇺";
      case "Asia":
        return "🌏";
      case "Australia":
        return "🦘";
      case "Pacific":
        return "🌊";
      case "Indian":
        return "🧭";
      case "Atlantic":
        return "⚓️";
      case "Etc":
        return "⏱️";
      default:
        return "🕒";
    }
  };

  // build pretty items once zones are known
  useEffect(() => {
    let zones = [];
    try {
      if (Intl?.supportedValuesOf) zones = Intl.supportedValuesOf("timeZone");
    } catch {}
    if (!zones?.length) {
      zones = [
        "Africa/Kampala",
        "Africa/Nairobi",
        "Europe/London",
        "Europe/Paris",
        "America/New_York",
        "America/Los_Angeles",
        "Asia/Dubai",
        "Asia/Tokyo",
        "Etc/UTC",
      ];
    }
    zones.sort((a, b) => a.localeCompare(b));
    setTzItems(
      zones.map((z) => ({
        label: z,
        value: z,
        emoji: regionEmoji(z),
      }))
    );
  }, []);

  // Load local cache on mount
  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEY);
        if (cached) {
          const p = JSON.parse(cached);
          if (typeof p.disable_comments === "boolean")
            setDisableComments(p.disable_comments);
          if (typeof p.accept_terms === "boolean")
            setAcceptTerms(p.accept_terms);
          if (typeof p.accept_marketing_offers === "boolean")
            setAcceptMarketingOffers(p.accept_marketing_offers);
          if (typeof p.recommendations === "boolean")
            setRecommendations(p.recommendations);
          if (typeof p.time_zone === "string") setTimeZone(p.time_zone);
        } else {
          // first run: default time zone to device zone
          setTimeZone(deviceTimeZone);
        }
      } catch {}
    })();
  }, []);

  // Get IP once
  useEffect(() => {
    (async () => {
      try {
        const ip = (await getUserIpAddress()) || "127.0.0.1";
        setUserIpAddress(ip);
        console.log("User IP address:", ip);
      } catch {
        setUserIpAddress("127.0.0.1");
      }
    })();
  }, []);

  // Helpers
  const persistLocal = async () => {
    const snapshot = {
      disable_comments: disableComments,
      accept_terms: acceptTerms,
      accept_marketing_offers: acceptMarketingOffers,
      time_zone: timeZone,
      recommendations, // local-only
      latest_update_ip: userIpAddress,
    };
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {}
  };

  // Validate IANA time zone by attempting to format a date with it
  const isValidTimeZone = (tz) => {
    if (!tz || typeof tz !== "string") return false;
    try {
      // Will throw on invalid TZ
      new Date().toLocaleString("en-US", { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  };

  // Preview current time in selected zone (if valid)
  const tzPreview = useMemo(() => {
    if (!isValidTimeZone(timeZone)) return null;
    try {
      return new Date().toLocaleString(undefined, {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        weekday: "short",
        day: "2-digit",
        month: "short",
      });
    } catch {
      return null;
    }
  }, [timeZone]);

  // PUT /users/{id}/preferences
  const syncServer = async (payloadOverrides = {}) => {
    if (!userData?.id || !userToken) return;

    const body = {
      disable_comments: disableComments,
      accept_terms: acceptTerms,
      accept_marketing_offers: acceptMarketingOffers,
      time_zone: timeZone || deviceTimeZone,
      latest_update_ip: userIpAddress,
      ...payloadOverrides,
    };

    try {
      const res = await axios.put(
        `${API_BASE_URL}/users/${userData.id}/preferences`,
        body,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            "Content-Language": "en",
            "X-AppApiToken": "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=",
            "X-AppType": "mobile",
          },
        }
      );

      if (res?.data?.success === false) {
        throw new Error(res?.data?.message || "Failed to update preferences");
      }

      showSnackbar("Preferences updated", "success");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error syncing preferences";
      showSnackbar(msg, "error");
    }
  };

  // Toggle handlers (save local + sync server immediately)
  const onToggleDisableComments = async (v) => {
    setDisableComments(v);
    await persistLocal();
    syncServer({ disable_comments: v });
  };
  const onToggleAcceptTerms = async (v) => {
    setAcceptTerms(v);
    await persistLocal();
    syncServer({ accept_terms: v });
  };
  const onToggleMarketing = async (v) => {
    setAcceptMarketingOffers(v);
    await persistLocal();
    syncServer({ accept_marketing_offers: v });
  };
  const onToggleRecommendations = async (v) => {
    // local-only
    setRecommendations(v);
    await persistLocal();
    // not sent to server
  };

  const applyDeviceTimeZone = async () => {
    setTimeZone(deviceTimeZone);
    Keyboard.dismiss();
    await persistLocal();
    syncServer({ time_zone: deviceTimeZone });
  };

  const onTimeZoneSubmit = async () => {
    Keyboard.dismiss();
    if (!isValidTimeZone(timeZone)) {
      showSnackbar(
        "Invalid time zone. Example: Africa/Kampala, America/New_York",
        "error"
      );
      return;
    }
    await persistLocal();
    syncServer({ time_zone: timeZone });
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <Header title="Preferences" leftIcon="back" titleLeft />
      <View style={[GlobalStyleSheet.container, { marginTop: 10 }]}>
        {/* Local-only: Recommendations */}
        <RowToggle
          title="Recommendations"
          description="Receive recommendations based on your activity (local preference)"
          value={recommendations}
          onChange={onToggleRecommendations}
          colors={colors}
        />

        {/* Server: Marketing offers */}
        <RowToggle
          title="Receive updates & offers"
          description="Get notified for special offers and updates"
          value={acceptMarketingOffers}
          onChange={onToggleMarketing}
          colors={colors}
        />

        {/* Server: Disable comments */}
        <RowToggle
          title="Disable comments"
          description="Prevent others from commenting on your listings"
          value={disableComments}
          onChange={onToggleDisableComments}
          colors={colors}
        />

        {/* Server: Accept terms */}
        <RowToggle
          title="Accept terms"
          description="Agree to the website terms and conditions"
          value={acceptTerms}
          onChange={onToggleAcceptTerms}
          colors={colors}
        />

        {/* Server: Time zone (selectable + viewable) */}
        <View
          style={{
            paddingHorizontal: 15,
            paddingBottom: 16,
            marginBottom: 24,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            zIndex: 1000,
          }}
        >
          <Text
            style={{
              ...FONTS.fontSm,
              ...FONTS.fontSemiBold,
              fontSize: 15,
              color: colors.title,
              marginBottom: 8,
            }}
          >
            Time zone
          </Text>

          {/* Quick picks */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {["Asia/Dubai", "Africa/Nairobi", "Etc/UTC", deviceTimeZone]
              .filter(Boolean)
              .map((tz, idx) => (
                <TouchableOpacity
                  key={tz + idx}
                  onPress={async () => {
                    setTimeZone(tz);
                    await persistLocal();
                    syncServer({ time_zone: tz });
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor:
                      timeZone === tz
                        ? "rgba(110,78,212,0.12)"
                        : colors.background,
                    borderWidth: 1,
                    borderColor: timeZone === tz ? "#6E4ED4" : colors.border,
                  }}
                >
                  <Text
                    style={{
                      ...FONTS.fontSm,
                      color: timeZone === tz ? "#6E4ED4" : colors.title,
                    }}
                  >
                    {regionEmoji(tz)} {tz}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>

          <DropDownPicker
            open={tzOpen}
            value={timeZone}
            items={tzItems.map((i) => ({
              label: `${i.emoji}  ${i.label}`,
              value: i.value,
            }))}
            setOpen={setTzOpen}
            setValue={(cb) => {
              const next = cb(timeZone);
              setTimeZone(next);
              persistLocal().then(() => syncServer({ time_zone: next }));
            }}
            setItems={setTzItems}
            searchable
            searchPlaceholder="Search time zones…"
            placeholder="Select your time zone"
            listMode="MODAL"
            modalTitle="Select Time Zone"
            modalContentContainerStyle={{ backgroundColor: colors.card }}
            modalProps={{ animationType: "slide" }}
            // sexy styles
            style={{
              borderColor: colors.border,
              backgroundColor: colors.card,
              borderRadius: 14,
              minHeight: 52,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
            dropDownContainerStyle={{
              borderColor: colors.border,
              backgroundColor: colors.card,
              borderRadius: 16,
            }}
            listItemContainerStyle={{
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              paddingVertical: 12,
              paddingHorizontal: 14,
            }}
            listItemLabelStyle={{
              ...FONTS.font,
              fontSize: 15,
              color: colors.title,
            }}
            selectedItemContainerStyle={{
              backgroundColor: "rgba(110,78,212,0.07)",
              borderRadius: 12,
            }}
            selectedItemLabelStyle={{
              color: "#6E4ED4",
              fontWeight: "600",
            }}
            searchContainerStyle={{
              borderBottomWidth: 0,
              padding: 12,
            }}
            searchTextInputStyle={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              paddingHorizontal: 12,
              color: colors.text,
              height: 44,
            }}
            placeholderStyle={{
              color: colors.text,
              opacity: 0.7,
            }}
            textStyle={{
              color: colors.title,
              fontSize: 15,
            }}
            // custom icons
            ArrowDownIconComponent={() => (
              <Ionicons name="chevron-down" size={18} color={colors.title} />
            )}
            TickIconComponent={() => (
              <Ionicons name="checkmark-circle" size={18} color="#6E4ED4" />
            )}
            CloseIconComponent={() => (
              <Ionicons name="close" size={22} color={colors.title} />
            )}
          />

          {/* Validity + preview */}
          <View style={{ marginTop: 12 }}>
            <Text
              style={{
                ...FONTS.fontSm,
                color: isValidTimeZone(timeZone)
                  ? COLORS.success
                  : COLORS.danger,
              }}
            >
              {isValidTimeZone(timeZone)
                ? "Time zone is valid"
                : "Time zone is invalid"}
            </Text>
            {tzPreview && (
              <Text
                style={{ ...FONTS.fontSm, color: colors.text, marginTop: 4 }}
              >
                Current time in {timeZone}: {tzPreview}
              </Text>
            )}
          </View>
        </View>

        {/* Info row: current IP */}
        <View
          style={{
            paddingHorizontal: 15,
            paddingBottom: 10,
            marginBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text
            style={{
              ...FONTS.fontSm,
              ...FONTS.fontSemiBold,
              fontSize: 15,
              color: colors.title,
              marginBottom: 6,
            }}
          >
            Current IP address
          </Text>
          <Text style={{ ...FONTS.font, color: colors.text }}>
            {userIpAddress}
          </Text>
        </View>
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

const RowToggle = ({ title, description, value, onChange, colors }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={() => onChange(!value)}
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 15,
      paddingBottom: 10,
      marginBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
        {title}
      </Text>
      {!!description && (
        <View style={{ paddingRight: 20, marginTop: 2 }}>
          <Text style={{ ...FONTS.font, color: colors.text }}>
            {description}
          </Text>
        </View>
      )}
    </View>
    <Switch
      trackColor={{ false: "#767577", true: "rgba(110, 78, 212, .2)" }}
      thumbColor={value ? "#6E4ED4" : "#f4f3f4"}
      ios_backgroundColor="#3e3e3e"
      onValueChange={onChange}
      value={value}
    />
  </TouchableOpacity>
);

export default Notification;
