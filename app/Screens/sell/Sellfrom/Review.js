// screens/Sell/Steps/Review.js
import React, { useEffect, useMemo, useState, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../../layout/Header";
import Button from "../../../components/Button/Button";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import { COLORS, FONTS, SIZES } from "../../../constants/theme";
import { AuthContext } from "../../../context/AuthProvider";

const API_BASE_URL = "https://qot.ug/api";
const HEADERS_BASE = {
  Accept: "application/json",
  "Content-Language": "en",
  "X-AppApiToken": "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=",
  "X-AppType": "docs",
};

const STORAGE_KEYS = {
  selectedCity: "selectedCity",
};

// -------- helpers --------
const unwrapBaseForm = (maybe) => {
  let cur = maybe || {};
  let hops = 0;
  while (cur && cur.baseForm && hops < 5) {
    cur = cur.baseForm;
    hops++;
  }
  return cur || {};
};

const labelForPostType = (id) =>
  id === 2 ? "Professional" : id === 1 ? "Individual" : "—";

const Chip = ({ text, colors }) => (
  <View
    style={{
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
    <Text style={{ color: colors.title, fontSize: 13 }}>{text}</Text>
  </View>
);

const guessMimeFromName = (name = "") => {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "heic":
      return "image/heic";
    case "webp":
      return "image/webp";
    default:
      return "image/*";
  }
};

const Review = ({ navigation, route }) => {
  const { colors } = useTheme();
  const {
    userData,
    token: ctxToken,
    authToken,
    userToken,
  } = useContext(AuthContext);
  const token = ctxToken || authToken || userToken || userData?.token || "";

  // -------- read params (and unwrap) --------
  const baseForm = route?.params?.baseForm || {};
  //  const baseForm = unwrapBaseForm(params.baseForm || {});
  // Also accept route-level fallbacks
  const routeDynamicValues = baseForm.dynamicValues || {};
  const routeFieldsMeta = baseForm.fieldsMeta || [];
  const routePhotos = baseForm.photos;
  const routePrimary = baseForm.primary;

  // Prefer baseForm versions; fall back to route-level if missing
  const fieldsMeta =
    (Array.isArray(baseForm.dynamicFields) && baseForm.dynamicFields) ||
    routeFieldsMeta ||
    [];

  const dynamicValues =
    (baseForm.dynamicValues &&
      typeof baseForm.dynamicValues === "object" &&
      baseForm.dynamicValues) ||
    routeDynamicValues ||
    {};

  // Photos strictly from navigation (no AsyncStorage)
  const initialPhotos =
    (Array.isArray(baseForm.photos) && baseForm.photos) ||
    (Array.isArray(routePhotos) && routePhotos) ||
    [];

  const initialPrimary =
    baseForm.primary || routePrimary || initialPhotos[0]?.uri || null;

  const [photos, setPhotos] = useState(initialPhotos);
  const [primaryUri, setPrimaryUri] = useState(initialPrimary);

  // Location resolve: prefer params/baseForm; else AsyncStorage selectedCity
  const [selectedCity, setSelectedCity] = useState(
    baseForm.city_id && (baseForm.city_name || baseForm.city)
      ? {
          id: baseForm.city_id,
          name: baseForm.city_name || baseForm.city,
          country_code: baseForm.country_code || "UG",
        }
      : baseForm.city_id && (baseForm.city_name || baseForm.city_name)
      ? {
          id: baseForm.city_id,
          name: baseForm.city_name || baseForm.city_name,
          country_code: baseForm.country_code || baseForm.country_code || "UG",
        }
      : null
  );

  useEffect(() => {
    (async () => {
      if (!selectedCity) {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEYS.selectedCity);
          console.log("BASE FORMULA", route?.params?.baseForm);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.id && parsed?.name) setSelectedCity(parsed);
          }
        } catch {}
      }
    })();
  }, [selectedCity]);

  // Tags: accept CSV or array, from baseForm or route
  const tags = useMemo(() => {
    const raw = baseForm.tags;
    if (Array.isArray(raw)) {
      return raw
        .filter(Boolean)
        .map((t) => String(t).trim())
        .slice(0, 10);
    }
    if (typeof raw === "string") {
      return raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10);
    }
    return [];
  }, [baseForm.tags]);

  // Everything to display
  const composed = useMemo(() => {
    const price = Number.isFinite(+baseForm.price) ? +baseForm.price : 0;
    return {
      title: baseForm.title || "",
      description: baseForm.description || "",
      price,
      negotiable: !!baseForm.negotiable,
      postTypeId: baseForm.post_type_id,
      postTypeLabel: labelForPostType(baseForm.post_type_id),
      contact_name: baseForm.contact_name || userData?.name || "",
      email: baseForm.email || userData?.email || "",
      phone: baseForm.phone || "",
      auth_field: (baseForm.auth_field || "email").toLowerCase(),
      cityName: selectedCity?.name,
      countryCode: selectedCity?.country_code || baseForm.country_code || "UG",
    };
  }, [baseForm, selectedCity, userData]);

  const hasPhotos = photos.length > 0;
  const thumb = useMemo(() => Math.min((SIZES.width - 40 - 6 * 3) / 4, 90), []);

  // ---------- submit ----------
  const onSubmit = async () => {
    if (!token) {
      Alert.alert("Login required", "You must be logged in to post.");
      return;
    }
    if (!baseForm.category_id) {
      Alert.alert("Missing info", "Category is required.");
      return;
    }
    if (!baseForm.post_type_id) {
      Alert.alert("Missing info", "Post type is required.");
      return;
    }
    if (!selectedCity?.id) {
      Alert.alert("Missing location", "Please choose a city.");
      return;
    }
    if (!hasPhotos) {
      Alert.alert("No photos", "Please add at least one photo.");
      return;
    }

    try {
      const fd = new FormData();
      const add = (k, v) => {
        if (v !== undefined && v !== null && String(v) !== "") {
          fd.append(k, String(v));
        }
      };

      // Core
      add("category_id", baseForm.category_id);
      add("post_type_id", baseForm.post_type_id);
      add("title", baseForm.title);
      add("description", baseForm.description);
      add("contact_name", baseForm.contact_name || userData?.name);
      const authField = (baseForm.auth_field || "email").toLowerCase();
      add("auth_field", authField);
      if (authField === "phone") {
        add("phone", baseForm.phone);
        add("phone_country", baseForm.phone_country);
      } else {
        add("email", baseForm.email || userData?.email);
      }
      add("city_id", selectedCity.id);
      add("country_code", composed.countryCode);
      add("price", baseForm.price ?? 0);
      add("negotiable", baseForm.negotiable ? 1 : 0);
      fd.append("accept_terms", "1");

      // Tags
      if (tags.length) add("tags", tags.join(","));

      // Package/payment if present
      if (baseForm.package_id != null) add("package_id", baseForm.package_id);
      if (baseForm.payment_method_id != null)
        add("payment_method_id", baseForm.payment_method_id);

      // Custom fields:
      // Prefer fully-built cf from baseForm if present,
      // else build from dynamicValues (labels shown below).
      if (baseForm.cf && typeof baseForm.cf === "object") {
        Object.entries(baseForm.cf).forEach(([k, v]) => {
          if (Array.isArray(v)) {
            v.forEach((x) => add(`cf[${k}][]`, x));
          } else {
            add(`cf[${k}]`, v);
          }
        });
      } else if (dynamicValues && typeof dynamicValues === "object") {
        Object.entries(dynamicValues).forEach(([fieldId, v]) => {
          if (Array.isArray(v)) {
            v.forEach((x) => add(`cf[${fieldId}][]`, x));
          } else {
            add(`cf[${fieldId}]`, v);
          }
        });
      }

      // Pictures
      photos.forEach((p, idx) => {
        const name = p.name || `photo_${idx + 1}.jpg`;
        const type = p.type || guessMimeFromName(name);
        fd.append("pictures[]", { uri: p.uri, name, type });
      });

      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          ...HEADERS_BASE,
          Authorization: `Bearer ${token}`,
          // ⚠️ Don't set Content-Type for RN FormData
        },
        body: fd,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json?.success === false) {
        const lines = [];
        if (json?.message) lines.push(json.message);
        if (json?.errors && typeof json.errors === "object") {
          Object.entries(json.errors).forEach(([k, arr]) => {
            const msg = Array.isArray(arr) ? arr.join(", ") : String(arr);
            lines.push(`• ${k}: ${msg}`);
          });
        }
        throw new Error(lines.join("\n") || "Failed to post");
      }

      Alert.alert("Success", "Your listing has been posted.", [
        {
          text: "OK",
          onPress: () =>
            navigation.navigate("DrawerNavigation", {
              screen: "BottomNavigation",
              params: { screen: "Home" },
            }),
        },
      ]);
    } catch (err) {
      console.log("Create listing failed:", err);
      Alert.alert("Create listing failed", String(err?.message || err));
    }
  };

  // --------- UI ---------
  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <Header title="Review your details" leftIcon={"back"} titleLeft />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[GlobalStyleSheet.container, { paddingHorizontal: 20 }]}>
          {/* Title */}
          <Text style={[FONTS.fontLg, { color: colors.title, marginTop: 10 }]}>
            {composed.title || "Untitled"}
          </Text>

          {/* Price + Negotiable */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 6,
              gap: 10,
            }}
          >
            <Text
              style={[FONTS.fontMedium, { color: colors.title, fontSize: 18 }]}
            >
              UGX {Number(composed.price || 0).toLocaleString()}
            </Text>
            {composed.negotiable ? (
              <Chip text="Negotiable" colors={colors} />
            ) : null}
          </View>

          {/* Tags */}
          {!!tags.length && (
            <View
              style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap" }}
            >
              {tags.map((t, i) => (
                <Chip key={`${t}-${i}`} text={t} colors={colors} />
              ))}
            </View>
          )}

          {/* Post type / Location */}
          <View style={{ marginTop: 14 }}>
            <Text style={[FONTS.font, { color: colors.text }]}>
              Post type: {composed.postTypeLabel}
            </Text>
            <Text style={[FONTS.font, { color: colors.text, marginTop: 2 }]}>
              Location:{" "}
              {selectedCity?.name
                ? `${selectedCity.name} · ${composed.countryCode}`
                : "—"}
            </Text>
          </View>

          {/* Contact */}
          <View style={{ marginTop: 14 }}>
            <Text style={[FONTS.font, { color: colors.text }]}>
              Contact: {composed.contact_name || "—"}
            </Text>
            <Text style={[FONTS.font, { color: colors.text, marginTop: 2 }]}>
              {composed.auth_field === "phone"
                ? composed.phone || "—"
                : composed.email || "—"}
            </Text>
          </View>

          {/* Description */}
          {composed.description ? (
            <View style={{ marginTop: 16 }}>
              <Text
                style={[
                  FONTS.fontMedium,
                  { color: colors.title, marginBottom: 6 },
                ]}
              >
                Description
              </Text>
              <Text style={{ color: colors.text }}>{composed.description}</Text>
            </View>
          ) : null}

          {/* Dynamic fields */}
          <View style={{ marginTop: 20 }}>
            <Text
              style={[
                FONTS.fontMedium,
                { color: colors.title, marginBottom: 8 },
              ]}
            >
              Item details
            </Text>

            {/* Prefer labeled output when fieldsMeta is present */}
            {Array.isArray(fieldsMeta) && fieldsMeta.length > 0 ? (
              fieldsMeta.map((f) => {
                const raw =
                  dynamicValues?.[f.id] ??
                  dynamicValues?.[String(f.id)] ??
                  (baseForm.cf ? baseForm.cf[f.id] : undefined);
                if (
                  raw == null ||
                  (Array.isArray(raw) && raw.filter(Boolean).length === 0)
                )
                  return null;
                const display = Array.isArray(raw)
                  ? raw.join(", ")
                  : String(raw);
                return (
                  <View
                    key={String(f.id)}
                    style={{
                      paddingVertical: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text style={{ color: colors.title }}>
                      <Text style={{ fontWeight: "600" }}>
                        {f.name || f.id}:
                      </Text>{" "}
                      <Text style={{ color: colors.text }}>{display}</Text>
                    </Text>
                  </View>
                );
              })
            ) : // If no meta, fall back to raw cf/dynamicValues keys
            baseForm.cf && Object.keys(baseForm.cf).length ? (
              Object.entries(baseForm.cf).map(([k, v]) => {
                const display = Array.isArray(v) ? v.join(", ") : String(v);
                return (
                  <View
                    key={String(k)}
                    style={{
                      paddingVertical: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text style={{ color: colors.title }}>
                      <Text style={{ fontWeight: "600" }}>Field {k}:</Text>{" "}
                      <Text style={{ color: colors.text }}>{display}</Text>
                    </Text>
                  </View>
                );
              })
            ) : Object.keys(dynamicValues).length ? (
              Object.entries(dynamicValues).map(([k, v]) => {
                const display = Array.isArray(v) ? v.join(", ") : String(v);
                return (
                  <View
                    key={String(k)}
                    style={{
                      paddingVertical: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text style={{ color: colors.title }}>
                      <Text style={{ fontWeight: "600" }}>Field {k}:</Text>{" "}
                      <Text style={{ color: colors.text }}>{display}</Text>
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={{ color: colors.text }}>—</Text>
            )}
          </View>

          {/* Photos */}
          <View style={{ marginTop: 20 }}>
            <Text
              style={[
                FONTS.fontMedium,
                { color: colors.title, marginBottom: 8 },
              ]}
            >
              Photos ({photos.length})
            </Text>

            {hasPhotos ? (
              <>
                {/* Primary preview */}
                <View
                  style={{
                    backgroundColor: "rgba(71,90,119,.15)",
                    paddingVertical: 10,
                    marginBottom: 10,
                  }}
                >
                  {primaryUri ? (
                    <Image
                      source={{ uri: primaryUri }}
                      style={{
                        width: "100%",
                        height:
                          SIZES.width > SIZES.container
                            ? SIZES.container
                            : SIZES.width -
                              Math.min(
                                SIZES.width * 0.2,
                                SIZES.container * 0.2
                              ),
                        resizeMode: "contain",
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: "100%",
                        height:
                          SIZES.width > SIZES.container
                            ? SIZES.container
                            : SIZES.width -
                              Math.min(
                                SIZES.width * 0.2,
                                SIZES.container * 0.2
                              ),
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: colors.text }}>
                        No primary photo
                      </Text>
                    </View>
                  )}
                </View>

                {/* Thumbnails */}
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}
                >
                  {photos.map((p, i) => {
                    const isPrimary = p.uri === primaryUri;
                    return (
                      <TouchableOpacity
                        key={p.id || p.uri || String(i)}
                        onPress={() => setPrimaryUri(p.uri)}
                        style={{ width: "24%", height: thumb }}
                      >
                        <View
                          style={{
                            flex: 1,
                            borderWidth: isPrimary ? 2 : 0,
                            borderColor: isPrimary
                              ? COLORS.primary
                              : "transparent",
                            borderRadius: 6,
                            overflow: "hidden",
                          }}
                        >
                          <Image
                            source={{ uri: p.uri }}
                            style={{ width: "100%", height: "100%" }}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={{ color: colors.text, marginTop: 6 }}>
                  Tap a thumbnail to set the primary photo (first one sent).
                </Text>
              </>
            ) : (
              <Text style={{ color: colors.text }}>No photos added.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          GlobalStyleSheet.container,
          { paddingBottom: 20, paddingHorizontal: 20 },
        ]}
      >
        <Button title="Post Now" onPress={onSubmit} />
      </View>
    </SafeAreaView>
  );
};

export default Review;
