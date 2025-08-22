import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  Keyboard,
  Platform,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "../../../layout/Header";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import { COLORS, FONTS, SIZES } from "../../../constants/theme";
import Button from "../../../components/Button/Button";

const Setprice = ({ navigation, route }) => {
  const { colors } = useTheme();

  // Expecting: { baseForm, nextScreen? }
  const baseForm = route?.params?.draft || {};
  const nextScreen = route?.params?.nextScreen || "Location"; // change if your flow differs

  const [priceText, setPriceText] = useState(
    baseForm?.price != null ? String(baseForm.price) : ""
  );
  const [negotiable, setNegotiable] = useState(!!baseForm?.negotiable);
  const [error, setError] = useState("");

  const priceInt = useMemo(() => {
    // API expects integer (UGX). Strip non-digits and parse.
    const cleaned = (priceText || "").replace(/[^\d]/g, "");
    return cleaned ? parseInt(cleaned, 10) : NaN;
  }, [priceText]);

  const validate = () => {
    if (!priceText.trim()) {
      setError("Price is required.");
      return false;
    }
    if (!Number.isFinite(priceInt) || priceInt <= 0) {
      setError("Enter a valid price (positive number).");
      return false;
    }
    setError("");
    return true;
  };

  const onNext = () => {
    if (!validate()) return;

    navigation.navigate(nextScreen, {
      baseForm: {
        ...baseForm,
        // integer UGX for API
        price: priceInt,
        // many Laravel APIs accept 1/0 in form-data for booleans
        negotiable: negotiable ? 1 : 0,
      },
    });
  };

  // tap anywhere to dismiss keyboard
  const dismiss = () => Keyboard.dismiss();

  return (
    <Pressable
      style={{ flex: 1, backgroundColor: colors.card }}
      onPress={dismiss}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
        <Header title="Set a price for your item" leftIcon="back" titleLeft />

        <View
          style={[
            GlobalStyleSheet.container,
            { flex: 1, paddingHorizontal: 20 },
          ]}
        >
          <Text
            style={[
              FONTS.fontMedium,
              {
                color: colors.title,
                marginTop: 14,
                marginBottom: 8,
                fontSize: 18,
              },
            ]}
          >
            Price
          </Text>

          {/* Input group: [ UGX | ________ | Negotiable ] */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              borderRadius: SIZES.radius,
              shadowColor: "rgba(0,0,0,.5)",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.2,
              shadowRadius: 6.27,
              elevation: 8,
              paddingLeft: 12,
              paddingRight: 6,
              height: 52,
            }}
          >
            {/* Prefix */}
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRightWidth: 1,
                borderRightColor: colors.border,
                marginRight: 8,
              }}
            >
              <Text style={[FONTS.fontMedium, { color: colors.title }]}>
                UGX
              </Text>
            </View>

            {/* Numeric input */}
            <TextInput
              value={priceText}
              onChangeText={(t) => {
                setPriceText(t);
                if (error) setError("");
              }}
              placeholder="eg 150000"
              placeholderTextColor={colors.text}
              keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
              returnKeyType="done"
              onSubmitEditing={dismiss}
              style={{
                flex: 1,
                color: colors.title,
                paddingVertical: 10,
                paddingRight: 8,
              }}
            />

            {/* Negotiable toggle (acts like input-group addon) */}
            <Pressable
              onPress={() => setNegotiable((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderLeftWidth: 1,
                borderLeftColor: colors.border,
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: SIZES.radius,
              }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  borderWidth: 1.5,
                  borderColor: negotiable ? COLORS.primary : colors.border,
                  backgroundColor: negotiable ? COLORS.primary : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                {negotiable ? (
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 12,
                      lineHeight: 12,
                      fontWeight: "700",
                    }}
                  >
                    ✓
                  </Text>
                ) : null}
              </View>
              <Text
                style={[
                  FONTS.font,
                  {
                    color: negotiable ? COLORS.primary : colors.title,
                    fontWeight: negotiable ? "600" : "400",
                  },
                ]}
              >
                Negotiable
              </Text>
            </Pressable>
          </View>

          {!!error && (
            <Text style={{ color: "crimson", marginTop: 8 }}>{error}</Text>
          )}

          <Text style={[FONTS.font, { color: colors.text, marginTop: 10 }]}>
            Tip: You can mark the price as negotiable. Serious buyers may still
            ask for a better deal—pricing realistically improves conversions.
          </Text>
        </View>

        {/* Footer CTA */}
        <View
          style={[
            GlobalStyleSheet.container,
            { paddingBottom: 20, paddingHorizontal: 20 },
          ]}
        >
          <Button title="Next" onPress={onNext} />
        </View>
      </SafeAreaView>
    </Pressable>
  );
};

export default Setprice;
