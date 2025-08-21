import React, { useState, useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "../../../layout/Header";
import { COLORS, FONTS, SIZES } from "../../../constants/theme";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import Button from "../../../components/Button/Button";
import { AuthContext } from "../../../context/AuthProvider";
import { updatePostFields } from "../../../../src/services/postApi";

// tiny checkbox
const Checkbox = ({ checked, onToggle, colors }) => (
  <Pressable
    onPress={onToggle}
    accessibilityRole="checkbox"
    accessibilityState={{ checked }}
    style={{
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: checked ? COLORS.primary : colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: checked ? COLORS.primary : "transparent",
    }}
  >
    {checked ? (
      <Text style={{ color: "#fff", fontSize: 14, lineHeight: 16 }}>✓</Text>
    ) : null}
  </Pressable>
);

const Setprice = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { userToken } = useContext(AuthContext);

  const { postId, baseForm } = route?.params || {};
  const [price, setPrice] = useState(
    baseForm?.price != null ? String(baseForm.price) : ""
  );
  // 1 (yes) / 0 (no)
  const [negotiable, setNegotiable] = useState(
    baseForm?.negotiable === 1 || baseForm?.negotiable === true ? 1 : 0
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onChangePrice = (t) => {
    // allow digits and a single decimal point
    const cleaned = t.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    const normalized =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
    setPrice(normalized);
  };

  const validate = () => {
    setError("");
    if (price === "" || isNaN(Number(price))) {
      setError("Enter a valid price (numbers only).");
      return false;
    }
    if (Number(price) < 0) {
      setError("Price cannot be negative.");
      return false;
    }
    return true;
  };

  const onNext = async () => {
    Keyboard.dismiss();
    if (!validate()) return;

    const payload = {
      price: Number(price),
      negotiable: negotiable === 1,
    };

    try {
      setSaving(true);
      if (postId && userToken) {
        await updatePostFields(userToken, postId, payload);
      }
      navigation.navigate("Review", {
        postId,
        baseForm: { ...(baseForm || {}), ...payload },
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message || "Could not save price. Please try again.";
      Alert.alert("Save failed", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <Header title="Set a price for your item" leftIcon={"back"} titleLeft />

      {/* Tap anywhere to dismiss keyboard */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          <View style={[GlobalStyleSheet.container, { flex: 1 }]}>
            <Text
              style={[
                FONTS.fontMedium,
                { color: colors.title, marginBottom: 6 },
              ]}
            >
              Price <Text style={{ color: "crimson" }}>*</Text>
            </Text>

            {/* INPUT GROUP */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: SIZES.radius,
                backgroundColor: colors.card,
                overflow: "hidden",
              }}
            >
              {/* left addon: UGX */}
              <View
                style={{
                  paddingHorizontal: 12,
                  height: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRightWidth: 1,
                  borderRightColor: colors.border,
                }}
              >
                <Text style={[FONTS.fontMedium, { color: colors.title }]}>
                  UGX
                </Text>
              </View>

              {/* middle: price input */}
              <TextInput
                value={price}
                onChangeText={onChangePrice}
                placeholder="eg 15000"
                placeholderTextColor={colors.text}
                keyboardType={Platform.select({
                  ios: "decimal-pad",
                  android: "numeric",
                })}
                inputMode="decimal"
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
                style={{
                  flex: 1,
                  height: 48,
                  paddingHorizontal: 12,
                  color: colors.title,
                }}
              />

              {/* right addon: Negotiable checkbox */}
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setNegotiable((v) => (v === 1 ? 0 : 1));
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  height: 48,
                  borderLeftWidth: 1,
                  borderLeftColor: colors.border,
                  gap: 8,
                }}
              >
                <Checkbox
                  checked={negotiable === 1}
                  onToggle={() => {
                    Keyboard.dismiss();
                    setNegotiable((v) => (v === 1 ? 0 : 1));
                  }}
                  colors={colors}
                />
                <Text style={[FONTS.font, { color: colors.title }]}>
                  Negotiable
                </Text>
              </Pressable>
            </View>

            {!!error && (
              <Text style={{ color: "crimson", marginTop: 8 }}>{error}</Text>
            )}

            <Text style={{ color: colors.text, fontSize: 12, marginTop: 8 }}>
              Toggle negotiable if you’re open to offers.
            </Text>
          </View>

          <View
            style={[
              GlobalStyleSheet.container,
              { paddingBottom: 20, paddingHorizontal: 20 },
            ]}
          >
            <Button
              onPress={onNext}
              title={saving ? "Saving…" : "Next"}
              disabled={saving}
            />
            {saving && (
              <View style={{ marginTop: 8, alignItems: "center" }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default Setprice;
