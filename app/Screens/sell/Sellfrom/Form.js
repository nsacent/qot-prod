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
  ActivityIndicator,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "../../../layout/Header";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import { COLORS, FONTS } from "../../../constants/theme";
import Button from "../../../components/Button/Button";
import InlinePicker from "../../Components/InlinePicker";
import DateInput from "../../Components/DateInput";
import dayjs from "dayjs";
import { AuthContext } from "../../../context/AuthProvider";

// 👉 our draft context (wrap your app with ListingDraftProvider)
import { useListingDraft } from "../../../context/ListingDraftContext";

const API_BASE_URL = "https://qot.ug/api";
const HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "X-AppApiToken": "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=",
  "Content-Language": "en",
  "X-AppType": "docs",
};

// ---------- helpers ----------
const toTitleCase = (s = "") =>
  s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const toDate = (s) => (s ? dayjs(s, "YYYY-MM-DD").toDate() : undefined);

// ------- UI bits -------
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

const OlxRadioGroup = ({ value, options = [], onChange, colors }) => (
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

// Inline radio pills for Post Type
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

// Tag chip
const TagChip = ({ label, onRemove, colors }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: colors.card,
    }}
  >
    <Text style={{ color: colors.title, fontSize: 13 }}>{label}</Text>
    <Pressable
      onPress={onRemove}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={{ marginLeft: 6 }}
      accessibilityRole="button"
      accessibilityLabel={`Remove tag ${label}`}
    >
      <Text style={{ color: COLORS.primary, fontSize: 14 }}>×</Text>
    </Pressable>
  </View>
);

// ------------- FORM -------------
const Form = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { userData } = useContext(AuthContext);
  const { draft, patchBase, setFieldsMeta, setDynamicValues, setTags } =
    useListingDraft();

  // From previous screen (eg. Selllist) we expect:
  const { subCategoryId, subCategorySlug } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]); // API dynamic fields
  const [values, setValues] = useState({}); // dynamic answers: { [fieldId]: value | [] }
  const [errors, setErrors] = useState({});
  const [headerH, setHeaderH] = useState(0);
  const [kbH, setKbH] = useState(0);
  const scrollRef = useRef(null);
  const fieldY = useRef({});

  // Static fields (prefill from draft if present)
  const [title, setTitle] = useState(draft.baseForm.title || "");
  const [description, setDescription] = useState(
    draft.baseForm.description || ""
  );
  const [postTypeId, setPostTypeId] = useState(
    draft.baseForm.post_type_id || null
  );

  // Tags state (prefill from draft CSV)
  const initialTags = useMemo(() => {
    const t = draft.baseForm.tags;
    if (!t) return [];
    return String(t)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [draft.baseForm.tags]);
  const [tags, setTagsState] = useState(initialTags);
  const [tagInput, setTagInput] = useState("");

  // Post type options
  const POST_TYPE_OPTIONS = useMemo(
    () => [
      { id: 1, label: "Individual" },
      { id: 2, label: "Professional" },
    ],
    []
  );

  // keyboard listeners for iOS offset
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

  // Fetch dynamic fields for category
  const fetchFields = useCallback(async () => {
    if (!subCategoryId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/categories/${subCategoryId}/fields`;
      const res = await fetch(url, { headers: HEADERS });
      const json = await res.json();

      const list = Array.isArray(json?.result) ? json.result : [];
      setFields(list);

      // init values for each field (prefill from draft.dynamicValues if exists)
      const init = {};
      list.forEach((f) => {
        const id = f.id;
        const dv = draft.dynamicValues?.[id];
        if (dv !== undefined) {
          init[id] = dv;
          return;
        }
        if (f.type === "checkbox_multiple") init[id] = [];
        else if (f.type === "number")
          init[id] = f.default_value ? String(f.default_value) : "";
        else if (f.type === "select" || f.type === "radio")
          init[id] = f.default_value || "";
        else init[id] = f.default_value || "";
      });
      setValues(init);
    } catch (e) {
      // you can toast here
    } finally {
      setLoading(false);
    }
  }, [subCategoryId, draft.dynamicValues]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const dynamicRequired = useMemo(
    () => fields.filter((f) => Number(f.required) === 1),
    [fields]
  );

  // for date range check
  const startDateField = fields.find(
    (f) => f.type === "date" && /start/i.test(f.name || "")
  );
  const endDateField = fields.find(
    (f) => f.type === "date" && /end/i.test(f.name || "")
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

  // ------- tags logic -------
  const commitTag = useCallback(
    (raw) => {
      const t = String(raw || "").trim();
      if (!t) return;
      if (t.length < 2 || t.length > 20) {
        Alert.alert("Tag length", "Each tag must be 2–20 characters.");
        return;
      }
      if (tags.includes(t)) {
        setTagInput("");
        return;
      }
      if (tags.length >= 10) {
        Alert.alert("Tag limit", "You can add up to 10 tags.");
        return;
      }
      setTagsState((prev) => [...prev, t]);
      setTagInput("");
    },
    [tags]
  );

  const onTagInputChange = (text) => {
    // commit on comma or newline
    if (/[,\n]/.test(text)) {
      const cleaned = text.replace(/[,]/g, "").trim();
      if (cleaned) commitTag(cleaned);
      else setTagInput("");
    } else {
      setTagInput(text);
    }
  };

  const removeTag = (t) => {
    setTagsState((prev) => prev.filter((x) => x !== t));
  };

  // -------- validation --------
  const validate = () => {
    const next = {};

    // dynamic required
    dynamicRequired.forEach((f) => {
      const v = values[f.id];
      switch (f.type) {
        case "checkbox_multiple":
          if (!Array.isArray(v) || v.length === 0)
            next[f.id] = `${f.name} is required`;
          break;
        case "number":
          if (v === undefined || v === null || String(v).trim() === "")
            next[f.id] = `${f.name} is required`;
          else if (!/^\d+(\.\d+)?$/.test(String(v)))
            next[f.id] = `${f.name} must be a number`;
          break;
        case "date":
          if (v === undefined || v === null || String(v).trim() === "")
            next[f.id] = `${f.name} is required`;
          else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v)))
            next[f.id] = `${f.name} must be YYYY-MM-DD`;
          break;
        default:
          if (v === undefined || v === null || String(v).trim() === "")
            next[f.id] = `${f.name} is required`;
          break;
      }
    });

    // static required
    if (!title.trim()) next._title = "Ad title is required";
    if (!description.trim()) next._description = "Description is required";
    if (!postTypeId) next._post_type_id = "Post type is required";

    // date range consistency
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
          if (e.isBefore(s, "day"))
            next[endDateField.id] = "End date cannot be before start date";
        }
      }
    } catch (_) {}

    setErrors(next);

    // focus first error
    if (Object.keys(next).length) {
      const firstKey =
        Object.keys(next).find((k) => fieldY.current[k] != null) ||
        (next["_post_type_id"]
          ? "_post_type_id"
          : next["_title"]
          ? "_title"
          : "_description");
      if (firstKey) scrollToField(firstKey);
    }
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    // Save into draft
    patchBase({
      category_id: subCategoryId,
      post_type_id: postTypeId,
      title: title.trim(),
      description: description.trim(),
      contact_name: draft.baseForm.contact_name || userData?.name || "User",
      auth_field: draft.baseForm.auth_field || "email",
      email: draft.baseForm.email || userData?.email || "",
      phone: draft.baseForm.phone || userData?.phone || "",
      phone_country: draft.baseForm.phone_country || "UG",
      country_code: draft.baseForm.country_code || "UG",
      // price handled on Setprice
    });

    setFieldsMeta(fields);
    setDynamicValues(values);
    setTags(tags); // store CSV in draft

    navigation.navigate("Setprice");
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
              {/* Post Type */}
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

              {/* Dynamic fields */}
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
                      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                        {options.map((opt) => {
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
                                marginRight: 10,
                                marginBottom: 10,
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
                        })}
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

                // fallback as text
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

              {/* Static: Title */}
              <View
                onLayout={(e) =>
                  (fieldY.current["_title"] = e.nativeEvent.layout.y)
                }
                style={{ marginBottom: 10 }}
              >
                <Text
                  style={[FONTS.font, { color: colors.title, marginBottom: 8 }]}
                >
                  Ad Title *
                </Text>
                <TextInput
                  value={title}
                  onChangeText={(t) => {
                    setTitle(t);
                    setErrors((p) => ({ ...p, _title: undefined }));
                  }}
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

              {/* Static: Description */}
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
                  value={description}
                  onChangeText={(t) => {
                    setDescription(t);
                    setErrors((p) => ({ ...p, _description: undefined }));
                  }}
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

              {/* Tags */}
              <View style={{ marginTop: 5, marginBottom: 5 }}>
                <Text
                  style={[FONTS.font, { color: colors.title, marginBottom: 5 }]}
                >
                  Tags (comma or ↵ to add)
                </Text>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    backgroundColor: colors.card,
                    padding: 8,
                  }}
                >
                  {/* chips */}
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {tags.map((t) => (
                      <TagChip
                        key={t}
                        label={t}
                        onRemove={() => removeTag(t)}
                        colors={colors}
                      />
                    ))}
                  </View>

                  {/* input */}
                  <TextInput
                    value={tagInput}
                    onChangeText={onTagInputChange}
                    onSubmitEditing={() => commitTag(tagInput)}
                    placeholder="Enter tags (max 10)"
                    placeholderTextColor={colors.text}
                    style={{
                      marginTop: 2,
                      height: 35,
                      color: colors.title,
                    }}
                  />
                </View>

                <Text style={{ color: colors.text, marginTop: 6 }}>
                  Enter tags separated by commas or press Enter. 2–20 chars, up
                  to 10 tags.
                </Text>
              </View>

              <Text style={[FONTS.font, { color: colors.text, marginTop: 6 }]}>
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
