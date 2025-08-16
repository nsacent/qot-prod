import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  FlatList,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "../../../layout/Header";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import { COLORS, FONTS } from "../../../constants/theme";
import Button from "../../../components/Button/Button";
import InlinePicker from "../../Components/InlinePicker";
import DateInput from "../../Components/DateInput";
import dayjs from "dayjs";

const API_BASE_URL = "https://qot.ug/api";
const toDate = (s) => (s ? dayjs(s, "YYYY-MM-DD").toDate() : undefined);

// --------- helpers ----------
const toTitleCase = (s = "") =>
  s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const Chip = ({ label, active, onPress, colors }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: active ? colors.primary : colors.border,
      backgroundColor: active ? colors.primary + "22" : colors.card,
      marginRight: 10,
      marginBottom: 10,
    }}
  >
    <Text
      style={[
        FONTS.font,
        { color: active ? colors.primary : colors.title, fontSize: 14 },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// OLX-like single row (circle on the left + label)
const OlxRadioRow = ({ label, selected, onPress, colors }) => {
  const RADIO = 22;
  const DOT = 10;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: !!selected }}
      onPress={onPress}
      android_ripple={{ color: colors.border }}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          paddingHorizontal: 14,
          backgroundColor: colors.card,
        },
        Platform.OS === "ios" && pressed ? { opacity: 0.9 } : null,
      ]}
    >
      {/* Left circular indicator */}
      <View
        style={{
          width: RADIO,
          height: RADIO,
          borderRadius: RADIO / 2,
          borderWidth: 2,
          borderColor: selected ? COLORS.primary : colors.border,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
          backgroundColor: colors.card,
        }}
      >
        {selected ? (
          <View
            style={{
              width: DOT,
              height: DOT,
              borderRadius: DOT / 2,
              backgroundColor: COLORS.primary,
            }}
          />
        ) : null}
      </View>

      {/* Label */}
      <Text
        style={{
          // use your typography tokens if you want:
          // ...FONTS.font,
          color: colors.title,
          fontSize: 16,
          fontWeight: selected ? "600" : "400",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
};

// Group with carded container + dividers (very OLX-like)
const OlxRadioGroup = ({ value, options = [], onChange, colors }) => {
  return (
    <View
      accessibilityRole="radiogroup"
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: colors.card,
      }}
    >
      {options.map((opt, i) => {
        const selected = value === opt.value;
        return (
          <View key={String(opt.id)}>
            <OlxRadioRow
              label={opt.value}
              selected={selected}
              onPress={() => onChange(opt.value)}
              colors={colors}
            />
            {i < options.length - 1 ? (
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.border,
                  marginLeft: 14,
                }}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
};
// Replace your existing Pill with this version
const Pill = ({ label, selected, onPress, colors, role }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole={role} // "checkbox" | "radio"
    accessibilityState={{ checked: selected, selected }}
    // no android_ripple, no pressed-style → zero visual change on press
    style={{
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: selected ? COLORS.primary : colors.border,
      backgroundColor: colors.card, // never fills blue/grey
      marginRight: 10,
      marginBottom: 10,
    }}
    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
  >
    <Text
      style={{
        color: selected ? COLORS.primary : colors.title,
        fontSize: 14,
        fontWeight: selected ? "600" : "400",
      }}
    >
      {label}
    </Text>
  </Pressable>
);

const OlxCheckboxInlineGroup = ({
  values = [], // array of selected option values
  options = [], // [{ id, value }]
  onToggle, // (val) => void
  onClear, // () => void
  colors,
  FONTS,
  title = "Features",
}) => {
  const selectedCount = Array.isArray(values) ? values.length : 0;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        backgroundColor: colors.card,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={[FONTS.font, { color: colors.title }]}>
          {title} {selectedCount > 0 ? `· ${selectedCount} selected` : ""}
        </Text>
        {selectedCount > 0 ? (
          <TouchableOpacity
            onPress={onClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[FONTS.font, { color: COLORS.primary }]}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Inline pills */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", padding: 12 }}>
        {options.map((opt) => {
          const checked = values.includes(opt.value);
          return (
            <Pill
              key={String(opt.id)}
              role="checkbox"
              label={opt.value}
              selected={checked}
              onPress={() => onToggle(opt.value)}
              colors={colors}
            />
          );
        })}
      </View>
    </View>
  );
};

// ------------- FORM -------------
const Form = ({ navigation, route }) => {
  const { colors } = useTheme();

  // From Selllist: navigation.navigate("Form", { subCategoryId, subCategorySlug })
  const { subCategoryId, subCategorySlug } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]); // API fields array
  const [values, setValues] = useState({}); // { [fieldId]: value | value[] }
  const [errors, setErrors] = useState({}); // { [fieldId or _title/_description]: message }
  const [headerH, setHeaderH] = useState(0);
  const scrollRef = useRef(null);
  const fieldY = useRef({}); // { [key]: y }
  const [kbH, setKbH] = useState(0);

  useEffect(() => {
    const showEvt =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const s = Keyboard.addListener(showEvt, (e) => {
      setKbH(e.endCoordinates?.height ?? 0);
    });
    const h = Keyboard.addListener(hideEvt, () => setKbH(0));

    return () => {
      s.remove();
      h.remove();
    };
  }, []);

  const scrollToField = (key) => {
    requestAnimationFrame(() => {
      const y = fieldY.current[key] ?? 0;
      // offset so the label + input sit nicely above the keyboard
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 90), animated: true });
    });
  };

  const fetchFields = useCallback(async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/categories/${subCategoryId}/fields`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-AppApiToken": "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=",
          "Content-Language": "en",
          "X-AppType": "docs",
        },
      });
      const json = await res.json();
      const list = Array.isArray(json?.result) ? json.result : [];

      // initialize values by type
      const init = {};
      list.forEach((f) => {
        const id = f.id;
        if (f.type === "checkbox_multiple") {
          init[id] = []; // array of selected option values
        } else if (f.type === "number") {
          init[id] = f.default_value ? String(f.default_value) : "";
        } else if (f.type === "select" || f.type === "radio") {
          init[id] = f.default_value || ""; // a single option value
        } else {
          init[id] = f.default_value || "";
        }
      });

      setFields(list);
      setValues((prev) => ({ ...init, ...prev }));
    } catch (e) {
      // silently ignore for now (you can toast)
    } finally {
      setLoading(false);
    }
  }, [subCategoryId]);

  useEffect(() => {
    if (subCategoryId) fetchFields();
    else setLoading(false);
  }, [subCategoryId, fetchFields]);

  const dynamicRequired = useMemo(
    () => fields.filter((f) => Number(f.required) === 1),
    [fields]
  );

  const setVal = (key, val) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const toggleCheckbox = (key, optionValue) => {
    setValues((p) => {
      const arr = Array.isArray(p[key]) ? p[key] : [];
      const next = arr.includes(optionValue)
        ? arr.filter((v) => v !== optionValue)
        : [...arr, optionValue];
      return { ...p, [key]: next };
    });
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const startDateField = fields.find(
    (f) => f.type === "date" && /start/i.test(f.name || "")
  );

  const endDateField = fields.find(
    (f) => f.type === "date" && /end/i.test(f.name || "")
  );

  const validate = () => {
    const next = {};

    // Required checks by dynamic field type
    dynamicRequired.forEach((f) => {
      const v = values[f.id];

      switch (f.type) {
        case "checkbox_multiple":
          if (!Array.isArray(v) || v.length === 0) {
            next[f.id] = `${f.name} is required`;
          }
          break;

        case "number":
          if (v === undefined || v === null || String(v).trim() === "") {
            next[f.id] = `${f.name} is required`;
          } else if (!/^\d+(\.\d+)?$/.test(String(v))) {
            next[f.id] = `${f.name} must be a number`;
          }
          break;

        case "date":
          if (v === undefined || v === null || String(v).trim() === "") {
            next[f.id] = `${f.name} is required`;
          } else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v))) {
            next[f.id] = `${f.name} must be YYYY-MM-DD`;
          }
          break;

        default:
          if (v === undefined || v === null || String(v).trim() === "") {
            next[f.id] = `${f.name} is required`;
          }
          break;
      }
    });

    // Static fields
    if (!values["_title"] || String(values["_title"]).trim() === "") {
      next["_title"] = "Ad title is required";
    }
    if (
      !values["_description"] ||
      String(values["_description"]).trim() === ""
    ) {
      next["_description"] = "Description is required";
    }

    // Start/End date range consistency (only if both exist)
    try {
      const startField = fields.find(
        (f) => f.type === "date" && /start/i.test(f.name || "")
      );
      const endField = fields.find(
        (f) => f.type === "date" && /end/i.test(f.name || "")
      );

      if (startField && endField) {
        const sv = values[startField.id];
        const ev = values[endField.id];

        // only compare when both are present and formatted correctly
        if (
          sv &&
          ev &&
          /^\d{4}-\d{2}-\d{2}$/.test(String(sv)) &&
          /^\d{4}-\d{2}-\d{2}$/.test(String(ev))
        ) {
          const s = dayjs(sv, "YYYY-MM-DD");
          const e = dayjs(ev, "YYYY-MM-DD");
          if (e.isBefore(s, "day")) {
            next[endField.id] = "End date cannot be before start date";
          }
        }
      }
    } catch (_) {
      // no-op
    }

    // 👉 Add Start/End date range check here
    const startDateField = fields.find(
      (f) => f.type === "date" && /start/i.test(f.name || "")
    );
    const endDateField = fields.find(
      (f) => f.type === "date" && /end/i.test(f.name || "")
    );

    if (startDateField && endDateField) {
      const sv = values[startDateField.id];
      const ev = values[endDateField.id];

      if (
        sv &&
        ev &&
        /^\d{4}-\d{2}-\d{2}$/.test(String(sv)) &&
        /^\d{4}-\d{2}-\d{2}$/.test(String(ev))
      ) {
        const s = dayjs(sv, "YYYY-MM-DD");
        const e = dayjs(ev, "YYYY-MM-DD");
        if (e.isBefore(s, "day")) {
          next[endDateField.id] = "End date cannot be before start date";
        }
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    const payload = {
      subCategoryId,
      subCategorySlug,
      title: values["_title"] || "",
      description: values["_description"] || "",
      dynamicFields: fields.map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        // For checkboxes we keep an array of strings; others are strings
        value: values[f.id],
      })),
    };

    navigation.navigate("Uploadphoto", { postData: payload });
  };

  // ----------- UI -----------
  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      {/* measure header height for iOS offset */}
      <View onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}>
        <Header
          title={toTitleCase(subCategorySlug || "Include some details")}
          leftIcon={"back"}
          titleLeft
        />
      </View>

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[FONTS.font, { color: colors.text, marginTop: 10 }]}>
            Loading fields…
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? headerH : 0} // if you already measure headerH
        >
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{ paddingBottom: Math.max(250, kbH + 40) }}
          >
            <View
              style={[
                GlobalStyleSheet.container,
                { marginTop: 10, paddingHorizontal: 20 },
              ]}
            >
              {/* ---- Dynamic fields ---- */}
              {fields.map((f) => {
                const key = f.id;
                const label = toTitleCase(f.name || "");
                const options = Array.isArray(f.options) ? f.options : [];

                if (f.type === "text" || f.type === "number") {
                  return (
                    <View key={key} style={{ marginBottom: 20 }}>
                      <Text
                        style={[
                          FONTS.font,
                          { color: colors.title, marginBottom: 8 },
                        ]}
                      >
                        {label}
                        {Number(f.required) === 1 ? " *" : ""}
                      </Text>
                      <TextInput
                        value={values[key]}
                        onChangeText={(t) => setVal(key, t)}
                        placeholder={label}
                        placeholderTextColor={colors.text}
                        keyboardType={
                          f.type === "number" ? "numeric" : "default"
                        }
                        inputMode={f.type === "number" ? "numeric" : "text"}
                        style={[
                          GlobalStyleSheet.shadow2,
                          {
                            borderColor: colors.border,
                            padding: 10,
                            backgroundColor: colors.card,
                            height: 48,
                          },
                        ]}
                      />
                      {!!errors[key] && (
                        <Text style={{ color: "crimson", marginTop: 6 }}>
                          {errors[key]}
                        </Text>
                      )}
                    </View>
                  );
                }

                if (f.type === "select") {
                  return (
                    <View key={key} style={{ marginBottom: 10 }}>
                      <Text
                        style={[
                          FONTS.font,
                          { color: colors.title, marginBottom: 8 },
                        ]}
                      >
                        {label}
                        {Number(f.required) === 1 ? " *" : ""}
                      </Text>
                      <InlinePicker
                        value={values[key]}
                        options={options}
                        placeholder={`Select ${label}`}
                        onSelect={(val) => setVal(key, val)}
                        colors={colors}
                        searchable={true}
                        minSearchCount={5}
                      />

                      {!!errors[key] && (
                        <Text style={{ color: "crimson", marginTop: 6 }}>
                          {errors[key]}
                        </Text>
                      )}
                    </View>
                  );
                }

                if (f.type === "radio") {
                  return (
                    <View key={key} style={{ marginBottom: 16 }}>
                      <Text
                        style={[
                          FONTS.font,
                          { color: colors.title, marginBottom: 8 },
                        ]}
                      >
                        {label}
                        {Number(f.required) === 1 ? " *" : ""}
                      </Text>
                      <OlxRadioGroup
                        value={values[key]}
                        options={options}
                        onChange={(val) => setVal(key, val)}
                        colors={colors}
                      />
                      {!!errors[key] && (
                        <Text style={{ color: "crimson", marginTop: 6 }}>
                          {errors[key]}
                        </Text>
                      )}
                    </View>
                  );
                }

                if (f.type === "checkbox_multiple") {
                  const selected = Array.isArray(values[key])
                    ? values[key]
                    : [];
                  return (
                    <View key={key} style={{ marginBottom: 16 }}>
                      <Text
                        style={[
                          FONTS.font,
                          { color: colors.title, marginBottom: 8 },
                        ]}
                      >
                        {label}
                        {Number(f.required) === 1 ? " *" : ""}
                      </Text>
                      <OlxCheckboxInlineGroup
                        values={selected}
                        options={options}
                        onToggle={(val) => toggleCheckbox(key, val)}
                        onClear={() => setVal(key, [])}
                        colors={colors}
                        FONTS={FONTS}
                      />
                      {!!errors[key] && (
                        <Text style={{ color: "crimson", marginTop: 6 }}>
                          {errors[key]}
                        </Text>
                      )}
                    </View>
                  );
                }

                if (f.type === "date") {
                  const key = f.id;
                  const label = toTitleCase(f.name || "");

                  // constrain End >= Start
                  const isStart = startDateField?.id === key;
                  const isEnd = endDateField?.id === key;

                  const minDate = isEnd
                    ? toDate(values[startDateField?.id])
                    : undefined;
                  // (optional) prevent picking a Start after an already chosen End:
                  const maxDate = isStart
                    ? toDate(values[endDateField?.id])
                    : undefined;

                  return (
                    <DateInput
                      key={key}
                      label={label}
                      value={values[key] || ""}
                      onChange={(v) => setVal(key, v)}
                      colors={colors}
                      required={Number(f.required) === 1}
                      errorText={errors[key]}
                      minDate={minDate}
                      maxDate={maxDate}
                    />
                  );
                }

                // Fallback
                return (
                  <View key={key} style={{ marginBottom: 20 }}>
                    <Text
                      style={[
                        FONTS.font,
                        { color: colors.title, marginBottom: 8 },
                      ]}
                    >
                      {label}
                      {Number(f.required) === 1 ? " *" : ""}
                    </Text>
                    <TextInput
                      value={values[key]}
                      onChangeText={(t) => setVal(key, t)}
                      placeholder={label}
                      placeholderTextColor={colors.text}
                      style={[
                        GlobalStyleSheet.shadow2,
                        {
                          borderColor: colors.border,
                          padding: 10,
                          backgroundColor: colors.card,
                          height: 48,
                        },
                      ]}
                    />
                    {!!errors[key] && (
                      <Text style={{ color: "crimson", marginTop: 6 }}>
                        {errors[key]}
                      </Text>
                    )}
                  </View>
                );
              })}

              {/* ---- Static fields ---- */}
              <View style={{ marginBottom: 10 }}>
                <Text
                  style={[FONTS.font, { color: colors.title, marginBottom: 8 }]}
                >
                  Ad Title *
                </Text>
                <TextInput
                  value={values["_title"] || ""}
                  onChangeText={(t) => setVal("_title", t)}
                  placeholder="Ad title *"
                  placeholderTextColor={colors.text}
                  style={[
                    GlobalStyleSheet.shadow2,
                    {
                      borderColor: colors.border,
                      padding: 10,
                      backgroundColor: colors.card,
                      height: 48,
                    },
                  ]}
                />
                {!!errors["_title"] && (
                  <Text style={{ color: "crimson", marginTop: 6 }}>
                    {errors["_title"]}
                  </Text>
                )}
              </View>

              <Text
                style={[FONTS.font, { color: colors.title, marginBottom: 20 }]}
              >
                Mention the key features of your item (e.g. brand, model, age,
                type)
              </Text>

              <View
                onLayout={(e) =>
                  (fieldY.current["_description"] = e.nativeEvent.layout.y)
                }
                style={{ marginBottom: 10 }}
              >
                <Text
                  style={[FONTS.font, { color: colors.title, marginBottom: 8 }]}
                >
                  Description *
                </Text>
                <TextInput
                  value={values["_description"] || ""}
                  onChangeText={(t) => setVal("_description", t)}
                  placeholder="Describe what you are selling *"
                  placeholderTextColor={colors.text}
                  multiline
                  numberOfLines={4}
                  style={[
                    GlobalStyleSheet.shadow2,
                    {
                      borderColor: colors.border,
                      padding: 12,
                      backgroundColor: colors.card,
                      minHeight: 100,
                      textAlignVertical: "top",
                    },
                  ]}
                />
                {!!errors["_description"] && (
                  <Text style={{ color: "crimson", marginTop: 6 }}>
                    {errors["_description"]}
                  </Text>
                )}
              </View>

              <Text
                style={[FONTS.font, { color: colors.text, marginBottom: 10 }]}
              >
                * Required Fields
              </Text>
            </View>

            {/* CTA inside ScrollView so it rises with keyboard */}
            <View
              style={[
                GlobalStyleSheet.container,
                { paddingBottom: 20, paddingHorizontal: 20 },
              ]}
            >
              <Button title="Next" onPress={handleNext} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

export default Form;
