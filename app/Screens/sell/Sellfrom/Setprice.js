import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  Keyboard,
  Alert,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "../../../layout/Header";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import { COLORS, FONTS, SIZES } from "../../../constants/theme";
import Button from "../../../components/Button/Button";

// 👉 our draft context (wrap your app with ListingDraftProvider)
import { useListingDraft } from "../../../context/ListingDraftContext";

const Setprice = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { draft, patchBase } = useListingDraft();

  // prefill from draft if any
  const [priceStr, setPriceStr] = useState("");
  const [negotiable, setNegotiable] = useState(!!draft.baseForm?.negotiable);

  // helpers
  const onChangePrice = (text) => {
    // keep only digits
    const digits = text.replace(/[^\d]/g, "");
    setPriceStr(digits);
  };

  const pricePreview = useMemo(() => {
    const n = Number(priceStr || 0);
    return n.toLocaleString();
  }, [priceStr]);

  const validate = () => {
    if (priceStr.trim() === "") {
      Alert.alert("Price required", "Please enter a price (UGX).");
      return false;
    }
    // integer >= 0
    const n = Number(priceStr);
    if (!Number.isFinite(n) || n < 0) {
      Alert.alert("Invalid price", "Price must be a non-negative number.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;

    patchBase({
      price: Number(priceStr),
      negotiable, // we'll convert to 1/0 during final FormData build
    });

    // go to location next (pictures are last step)
    navigation.navigate("Location");
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <Header title="Set a price for your item" leftIcon={"back"} titleLeft />

      {/* Tap anywhere to dismiss keyboard */}
      <Pressable style={{ flex: 1 }} onPress={() => Keyboard.dismiss()}>
        <View
          style={[
            GlobalStyleSheet.container,
            { paddingHorizontal: 20, marginTop: 16 },
          ]}
        >
          <Text
            style={[FONTS.fontMedium, { color: colors.title, marginBottom: 8 }]}
          >
            Price <Text style={{ color: "crimson" }}>*</Text>
          </Text>

          {/* Input group: [ UGX ] [   price input   ] [ ☐ Negotiable ] */}
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: SIZES.radius,
              backgroundColor: colors.card,
              shadowColor: "rgba(0,0,0,.5)",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.34,
              shadowRadius: 6.27,
              elevation: 10,
              flexDirection: "row",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {/* Left addon: UGX */}
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRightWidth: 1,
                borderRightColor: colors.border,
              }}
            >
              <Text style={[FONTS.fontMedium, { color: colors.title }]}>
                UGX
              </Text>
            </View>

            {/* Price input */}
            <TextInput
              value={priceStr}
              onChangeText={onChangePrice}
              placeholder="e.g. 150000"
              placeholderTextColor={colors.text}
              keyboardType="number-pad"
              inputMode="numeric"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              blurOnSubmit
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                color: colors.title,
                height: 48,
              }}
            />

            {/* Right addon: Negotiable checkbox */}
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

          {/* Friendly preview line */}
          <Text style={[FONTS.font, { color: colors.text, marginTop: 8 }]}>
            {priceStr
              ? `You set: UGX ${pricePreview}`
              : "Enter your price in UGX"}
          </Text>

          <Text style={[FONTS.font, { color: colors.text, marginTop: 10 }]}>
            Tip: You can mark the price as negotiable. Serious buyers may still
            ask for a better deal—pricing realistically improves conversions.
          </Text>
        </View>

        {/* Footer CTA */}
        <View
          style={[
            GlobalStyleSheet.container,
            { paddingBottom: 20, paddingHorizontal: 20, marginTop: "auto" },
          ]}
        >
          <Button title="Next" onPress={handleNext} />
        </View>
      </Pressable>
    </SafeAreaView>
  );
};

export default Setprice;
