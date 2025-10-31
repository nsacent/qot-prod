// components/sheets/MakeOfferSheet.jsx
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { COLORS, FONTS } from "../../constants/theme";

const MakeOfferSheet = forwardRef(
  ({ onSubmit, currency = "$", min = 1, max }, ref) => {
    const sheetRef = useRef(null);
    const { colors } = useTheme();
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.open(),
      close: () => sheetRef.current?.close(),
      reset: () => {
        setAmount("");
        setNote("");
      },
    }));

    const parsedAmount = useMemo(() => {
      const n = Number(String(amount).replace(/[^0-9.]/g, ""));
      return Number.isFinite(n) ? n : NaN;
    }, [amount]);

    const amountError = useMemo(() => {
      if (amount === "") return null;
      if (Number.isNaN(parsedAmount)) return "Enter a valid number";
      if (parsedAmount <= 0) return "Amount must be greater than 0";
      if (min && parsedAmount < min) return `Minimum is ${currency}${min}`;
      if (max && parsedAmount > max) return `Maximum is ${currency}${max}`;
      return null;
    }, [amount, parsedAmount, min, max, currency]);

    const canSubmit = !amountError && parsedAmount > 0 && !submitting;

    const handleSubmit = async () => {
      if (!canSubmit) return;
      try {
        setSubmitting(true);
        await onSubmit?.({
          amount: parsedAmount,
          message: note?.trim() || "",
        });
        // success -> close & reset
        setAmount("");
        setNote("");
        sheetRef.current?.close();
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <RBSheet
        ref={sheetRef}
        height={Platform.select({ ios: 420, android: 440 })}
        openDuration={250}
        closeOnDragDown
        closeOnPressMask
        customStyles={{
          container: {
            backgroundColor: colors.card,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
          draggableIcon: { backgroundColor: colors.border },
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1, padding: 20 }}>
            <Text
              style={{
                ...FONTS.fontLg,
                ...FONTS.fontMedium,
                color: colors.title,
                marginBottom: 4,
              }}
            >
              Make an Offer
            </Text>
            <Text
              style={{ ...FONTS.fontSm, color: colors.text, marginBottom: 16 }}
            >
              Enter your price and an optional message to the seller.
            </Text>

            <Text
              style={{ ...FONTS.fontSm, color: colors.text, marginBottom: 6 }}
            >
              Offer Amount
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: amountError ? COLORS.danger : colors.border,
                backgroundColor: colors.card,
                borderRadius: 10,
                paddingHorizontal: 12,
                height: 48,
              }}
            >
              <Text
                style={{ ...FONTS.fontLg, color: colors.text, marginRight: 6 }}
              >
                {currency}
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.text}
                style={{ flex: 1, ...FONTS.fontLg, color: colors.text }}
              />
            </View>
            {!!amountError && (
              <Text
                style={{ ...FONTS.fontXs, color: COLORS.danger, marginTop: 6 }}
              >
                {amountError}
              </Text>
            )}

            <Text
              style={{
                ...FONTS.fontSm,
                color: colors.text,
                marginTop: 16,
                marginBottom: 6,
              }}
            >
              Message (optional)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              multiline
              placeholder="Add a note for the seller…"
              placeholderTextColor={colors.text}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                color: colors.text,
                borderRadius: 10,
                padding: 12,
                height: 110,
                textAlignVertical: "top",
              }}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={{
                marginTop: 18,
                backgroundColor: canSubmit
                  ? COLORS.primary
                  : COLORS.primary + "80",
                height: 50,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ ...FONTS.fontLg, ...FONTS.fontMedium, color: "#fff" }}
              >
                {submitting ? "Sending…" : "Send Offer"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </RBSheet>
    );
  }
);

export default MakeOfferSheet;
