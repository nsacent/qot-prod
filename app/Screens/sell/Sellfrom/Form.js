import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  useContext,
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
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "../../../layout/Header";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import { COLORS, FONTS } from "../../../constants/theme";
import Button from "../../../components/Button/Button";
import InlinePicker from "../../Components/InlinePicker";
import DateInput from "../../Components/DateInput";
import { AuthContext } from "../../../context/AuthProvider";
import dayjs from "dayjs";

const API_BASE_URL = "https://qot.ug/api";
const toDate = (s) => (s ? dayjs(s, "YYYY-MM-DD").toDate() : undefined);

// --------- helpers ----------
const toTitleCase = (s = "") =>
  s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const clean = (s = "") => s.trim().replace(/\s+/g, " ");
const isValidTag = (t) => t.length >= 2 && t.length <= 20;

// Build custom fields payload from fetched fields & current values
const buildCfFromValues = (fields, values) => {
  const cf = {};
  fields.forEach((f) => {
    const id = f.id;
    const v = values[id];
    if (v == null) return;

    if (f.type === "checkbox_multiple") {
      const arr = Array.isArray(v) ? v.filter(Boolean) : [];
      if (arr.length) cf[id] = arr; // array
    } else {
      const s = String(v).trim();
      if (s !== "") cf[id] = s; // single value
    }
  });
  return cf;
};

// ---- OLX-like radio row/group (vertical) ----
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

      <Text
        style={{
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

// ---- Inline "radio pills" (horizontal) — used for Post Type ----
const InlineRadioPills = ({ value, options = [], onChange, colors }) => (
  <View
    accessibilityRole="radiogroup"
    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
  >
    {options.map((opt) => {
      const selected = value === opt.id;
      return (
        <Pressable
          key={String(opt.id)}
          onPress={() => onChange(opt.id)}
          accessibilityRole="radio"
          accessibilityState={{ checked: selected }}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: selected ? COLORS.primary : colors.border,
            backgroundColor: colors.card,
            marginRight: 8,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: selected ? COLORS.primary : colors.title,
              fontSize: 14,
              fontWeight: selected ? "600" : "400",
            }}
          >
            {opt.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

// ---- Chip-style TagInput (like Select2 tags) ----
const TagInput = ({
  value = [], // array of strings
  onChange, // (nextArray) => void
  placeholder = "Enter tags (e.g., work, personal, urgent) — press ↵ after each tag",
  colors,
  FONTS,
  maxTags = 10,
}) => {
  const [draft, setDraft] = useState("");

  const normalized = useMemo(
    () => (Array.isArray(value) ? value.map((t) => clean(t)) : []),
    [value]
  );

  const addTag = (raw) => {
    const t = clean(raw);
    if (!t) return;
    if (!isValidTag(t)) return;
    const exists = normalized.some((x) => x.toLowerCase() === t.toLowerCase());
    if (exists) return;
    if (normalized.length >= maxTags) return;
    onChange([...normalized, t]);
    setDraft("");
  };

  const removeTag = (t) => {
    onChange(normalized.filter((x) => x !== t));
  };

  const trySplitAndAdd = (text) => {
    // split on comma or newline (Select2-like)
    const parts = text.split(/[,\n]/);
    if (parts.length === 1) return setDraft(text);
    const lastHadSep = /[,\n]$/.test(text);
    const toAdd = lastHadSep ? parts : parts.slice(0, -1);
    toAdd.map(clean).filter(Boolean).forEach(addTag);
    setDraft(lastHadSep ? "" : parts[parts.length - 1]);
  };

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        backgroundColor: colors.card,
        paddingVertical: 8,
        paddingHorizontal: 10,
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      {normalized.map((t) => (
        <View
          key={t}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            marginRight: 8,
            marginBottom: 8,
            gap: 8,
          }}
        >
          <Text style={[FONTS.fontSm, { color: colors.title }]}>{t}</Text>
          <Pressable
            onPress={() => removeTag(t)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[FONTS.fontSm, { color: COLORS.primary }]}>×</Text>
          </Pressable>
        </View>
      ))}

      <TextInput
        value={draft}
        onChangeText={trySplitAndAdd}
        onSubmitEditing={() => draft && addTag(draft)}
        blurOnSubmit={false}
        placeholder={placeholder}
        placeholderTextColor={colors.text}
        style={{
          minWidth: 120,
          flexGrow: 1,
          paddingVertical: 6,
          paddingHorizontal: 6,
          color: colors.title,
        }}
        returnKeyType="done"
      />
    </View>
  );
};

// ------------- FORM -------------
const Form = ({ navigation, route }) => {
  const { colors } = useTheme();

  // Expect at least { subCategoryId, subCategorySlug }, optionally pass { cityId, countryCode }
  const {
    subCategoryId,
    subCategorySlug,
    cityId: routeCityId,
    countryCode: routeCountryCode,
  } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]); // API fields array
  const [values, setValues] = useState({}); // { [fieldId]: value | value[] }
  const [errors, setErrors] = useState({}); // { [fieldId or _title/_description/_post_type_id/_tags]: message }
  const [headerH, setHeaderH] = useState(0);
  const scrollRef = useRef(null);
  const fieldY = useRef({}); // { [key]: y }
  const [kbH, setKbH] = useState(0);

  const { userData } = useContext(AuthContext);

  // Post type options & state (1 = Individual, 2 = Professional)
  const POST_TYPE_OPTIONS = useMemo(
    () => [
      { id: 1, label: "Individual" },
      { id: 2, label: "Professional" },
    ],
    []
  );
  const [postTypeId, setPostTypeId] = useState(null);

  // Tags state (array of strings)
  const [tagsArr, setTagsArr] = useState([]);

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

      const init = {};
      list.forEach((f) => {
        const id = f.id;
        if (f.type === "checkbox_multiple") {
          init[id] = [];
        } else if (f.type === "number") {
          init[id] = f.default_value ? String(f.default_value) : "";
        } else if (f.type === "select" || f.type === "radio") {
          init[id] = f.default_value || "";
        } else {
          init[id] = f.default_value || "";
        }
      });

      setFields(list);
      setValues((prev) => ({ ...init, ...prev }));
    } catch (e) {
      // ignore
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

    // Dynamic required fields
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

    // NEW: Post type required
    if (!postTypeId) {
      next["_post_type_id"] = "Post type is required";
    }

    // Tags rules (max 10; each 2-20 chars)
    if (tagsArr.length > 10) {
      next["_tags"] = "You can add up to 10 tags.";
    } else if (tagsArr.some((t) => !isValidTag(t))) {
      next["_tags"] = "Each tag must be 2–20 characters long.";
    }

    // Start/End date range consistency
    try {
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
    } catch (_) {}

    setErrors(next);

    if (Object.keys(next).length > 0) {
      const firstKey =
        Object.keys(next).find((k) => fieldY.current[k] != null) ||
        (next["_post_type_id"] ? "_post_type_id" : "_title");
      scrollToField(firstKey);
    }
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    // Build custom fields payload
    const cf = buildCfFromValues(fields, values);

    const baseForm = {
      category_id: subCategoryId, // category / subcategory id
      post_type_id: postTypeId, // 1 or 2
      title: values["_title"],
      description: values["_description"],
      contact_name: userData?.name || "User",
      auth_field: "email", // or "phone" based on your flow
      email: userData?.email,
      phone: userData?.phone || "",
      phone_country: "UG",
      city_id: Number(routeCityId) || 8, // set actual city from your Location flow
      country_code: routeCountryCode || "UG",
      price: 0, // to be set on Setprice
      tags: tagsArr.join(","), // 👈 CSV as API expects
      cf, // 👈 custom fields payload
    };

    navigation.navigate("Setprice", {
      draft: {
        baseForm,
        dynamicFields: fields,
        dynamicValues: values,
        tags: tagsArr,
      },
    });
  };

  // ----------- UI -----------
  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
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
          keyboardVerticalOffset={Platform.OS === "ios" ? headerH : 0}
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
              {/* ---- Post Type (inline radios) ---- */}
              <View
                onLayout={(e) =>
                  (fieldY.current["_post_type_id"] = e.nativeEvent.layout.y)
                }
                style={{ marginBottom: 16 }}
              >
                <Text
                  style={[FONTS.font, { color: colors.title, marginBottom: 8 }]}
                >
                  Post Type *
                </Text>

                <InlineRadioPills
                  value={postTypeId}
                  options={[
                    { id: 1, label: "Individual" },
                    { id: 2, label: "Professional" },
                  ]}
                  onChange={(val) => {
                    setPostTypeId(val);
                    setErrors((p) => ({ ...p, _post_type_id: undefined }));
                  }}
                  colors={colors}
                />

                {!!errors["_post_type_id"] && (
                  <Text style={{ color: "crimson", marginTop: 6 }}>
                    {errors["_post_type_id"]}
                  </Text>
                )}
              </View>

              {/* ---- Dynamic fields from API ---- */}
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
                      {/* Reuse pills as checkboxes */}
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 12,
                          backgroundColor: colors.card,
                          padding: 10,
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        {(Array.isArray(f.options) ? f.options : []).map(
                          (opt) => {
                            const checked = selected.includes(opt.value);
                            return (
                              <Pressable
                                key={String(opt.id)}
                                onPress={() => toggleCheckbox(key, opt.value)}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked }}
                                style={{
                                  paddingVertical: 10,
                                  paddingHorizontal: 14,
                                  borderRadius: 999,
                                  borderWidth: 1,
                                  borderColor: checked
                                    ? COLORS.primary
                                    : colors.border,
                                  backgroundColor: colors.card,
                                  marginRight: 8,
                                  marginBottom: 8,
                                }}
                              >
                                <Text
                                  style={{
                                    color: checked
                                      ? COLORS.primary
                                      : colors.title,
                                    fontSize: 14,
                                    fontWeight: checked ? "600" : "400",
                                  }}
                                >
                                  {opt.value}
                                </Text>
                              </Pressable>
                            );
                          }
                        )}
                      </View>
                      {!!errors[key] && (
                        <Text style={{ color: "crimson", marginTop: 6 }}>
                          {errors[key]}
                        </Text>
                      )}
                    </View>
                  );
                }

                if (f.type === "date") {
                  const isStart = startDateField?.id === key;
                  const isEnd = endDateField?.id === key;

                  const minDate = isEnd
                    ? toDate(values[startDateField?.id])
                    : undefined;
                  const maxDate = isStart
                    ? toDate(values[endDateField?.id])
                    : undefined;

                  return (
                    <DateInput
                      key={key}
                      label={toTitleCase(f.name || "")}
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

              {/* ---- Tags (chip input like Select2) ---- */}
              <View
                onLayout={(e) =>
                  (fieldY.current["_tags"] = e.nativeEvent.layout.y)
                }
                style={{ marginTop: 16, marginBottom: 4 }}
              >
                <Text
                  style={[FONTS.font, { color: colors.title, marginBottom: 8 }]}
                >
                  Tags
                </Text>
                <TagInput
                  value={tagsArr}
                  onChange={setTagsArr}
                  colors={colors}
                  FONTS={FONTS}
                  maxTags={10}
                />
                {!!errors["_tags"] ? (
                  <Text style={{ color: "crimson", marginTop: 6 }}>
                    {errors["_tags"]}
                  </Text>
                ) : (
                  <Text
                    style={[FONTS.font, { color: colors.text, marginTop: 6 }]}
                  >
                    Enter tags separated by commas or press ↵ after each tag.
                    Max 10 tags, 2–20 characters each.
                  </Text>
                )}
              </View>

              <Text style={[FONTS.font, { color: colors.text, marginTop: 12 }]}>
                * Required Fields
              </Text>
            </View>

            {/* CTA */}
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
