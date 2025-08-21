import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTheme } from "@react-navigation/native";
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

const labelForPostType = (id) =>
  id === 2 ? "Professional" : id === 1 ? "Individual" : undefined;

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

function appendDynamicFields(fd, dynamicValues = {}, fieldsMeta = []) {
  const metaById =
    Array.isArray(fieldsMeta) &&
    fieldsMeta.reduce((acc, f) => {
      acc[f.id] = f;
      return acc;
    }, {});

  Object.entries(dynamicValues || {}).forEach(([fieldId, value]) => {
    if (value === undefined || value === null || value === "") return;
    const metaType = metaById?.[fieldId]?.type;
    if (Array.isArray(value) || metaType === "checkbox_multiple") {
      (Array.isArray(value) ? value : [value]).forEach((v) => {
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          fd.append(`cf[${fieldId}][]`, String(v));
        }
      });
    } else {
      fd.append(`cf[${fieldId}]`, String(value));
    }
  });
}

const Review = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { token, userData } = React.useContext(AuthContext);

  const {
    baseForm: baseFormFromRoute = {},
    dynamicValues = {},
    fieldsMeta = [],
    tags: tagsFromRoute,
    photos: photosFromRoute = [], // required now
    primary: primaryUriFromRoute,
  } = route?.params || {};

  const [photos, setPhotos] = useState(
    Array.isArray(photosFromRoute) ? photosFromRoute : []
  );
  const [primaryUri, setPrimaryUri] = useState(
    primaryUriFromRoute || photosFromRoute?.[0]?.uri || null
  );
  const [submitting, setSubmitting] = useState(false);

  const tags = useMemo(() => {
    if (Array.isArray(tagsFromRoute)) return tagsFromRoute;
    if (typeof tagsFromRoute === "string" && tagsFromRoute.trim().length) {
      return tagsFromRoute
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (typeof baseFormFromRoute?.tags === "string") {
      return baseFormFromRoute.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (Array.isArray(baseFormFromRoute?.tags)) return baseFormFromRoute.tags;
    return [];
  }, [tagsFromRoute, baseFormFromRoute]);

  const composed = useMemo(() => {
    const price = baseFormFromRoute?.price ?? 0;
    const negotiable = !!baseFormFromRoute?.negotiable;
    const postTypeId = baseFormFromRoute?.post_type_id;
    return {
      title: baseFormFromRoute?.title || "",
      description: baseFormFromRoute?.description || "",
      price,
      negotiable,
      postTypeId,
      postTypeLabel: labelForPostType(postTypeId),
      contact_name: baseFormFromRoute?.contact_name || userData?.name || "",
      email: baseFormFromRoute?.email || userData?.email || "",
      cityName: baseFormFromRoute?.city_name, // if you passed it
      countryCode: baseFormFromRoute?.country_code,
    };
  }, [baseFormFromRoute, userData]);

  const thumbnailSize = useMemo(() => {
    return SIZES.width / 4 > SIZES.container
      ? SIZES.container / 4
      : SIZES.width / 4;
  }, []);

  const onSubmit = async () => {
    if (!token) {
      Alert.alert("Login required", "You must be logged in to post.");
      return;
    }
    const bf = baseFormFromRoute || {};
    if (!bf.category_id)
      return Alert.alert("Missing info", "Category is required.");
    if (!bf.post_type_id)
      return Alert.alert("Missing info", "Post type is required.");
    if (!bf.city_id)
      return Alert.alert("Missing location", "Please choose a city.");
    if (!photos?.length)
      return Alert.alert("No photos", "Please add at least one photo.");

    setSubmitting(true);
    try {
      const fd = new FormData();
      const appendIf = (k, v) => {
        if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
      };

      appendIf("category_id", bf.category_id);
      appendIf("post_type_id", bf.post_type_id);
      appendIf("title", bf.title);
      appendIf("description", bf.description);
      appendIf("contact_name", bf.contact_name || userData?.name);
      appendIf("auth_field", bf.auth_field || "email");

      if ((bf.auth_field || "email") === "email") {
        appendIf("email", bf.email || userData?.email);
      } else {
        appendIf("phone", bf.phone);
        appendIf("phone_country", bf.phone_country);
      }

      appendIf("city_id", bf.city_id);
      appendIf("country_code", bf.country_code || "UG");
      appendIf("price", bf.price ?? 0);
      if (bf.negotiable !== undefined) {
        fd.append("negotiable", bf.negotiable ? "1" : "0");
      }
      fd.append("accept_terms", "1");

      if (bf?.phone_hidden != null)
        fd.append("phone_hidden", bf.phone_hidden ? "1" : "0");
      if (bf?.is_permanent != null)
        fd.append("is_permanent", bf.is_permanent ? "1" : "0");

      if (Array.isArray(tags) && tags.length) {
        fd.append("tags", tags.join(","));
      }

      if (bf?.package_id) fd.append("package_id", String(bf.package_id));
      if (bf?.payment_method_id)
        fd.append("payment_method_id", String(bf.payment_method_id));

      // dynamic fields
      appendDynamicFields(fd, dynamicValues, fieldsMeta);

      // ensure primary first
      const ordered = primaryUri
        ? [
            ...photos.filter((p) => p.uri === primaryUri),
            ...photos.filter((p) => p.uri !== primaryUri),
          ]
        : photos;

      ordered.forEach((p) => {
        const file = {
          uri: p.uri,
          name: p.name || "photo.jpg",
          type: p.type || "image/jpeg",
        };
        fd.append("pictures[]", file);
      });

      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          ...HEADERS_BASE,
          Authorization: `Bearer ${token}`,
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
      console.log("POST failed:", err);
      Alert.alert("Create listing failed", String(err?.message || err));
    } finally {
      setSubmitting(false);
    }
  };

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
          {!!tags?.length && (
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
            {!!composed.postTypeLabel && (
              <Text style={[FONTS.font, { color: colors.text }]}>
                Post type: {composed.postTypeLabel}
              </Text>
            )}
            {!!baseFormFromRoute?.city_name && (
              <Text style={[FONTS.font, { color: colors.text, marginTop: 2 }]}>
                Location: {baseFormFromRoute.city_name}
              </Text>
            )}
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

          {/* Dynamic Fields */}
          {Array.isArray(fieldsMeta) && fieldsMeta.length > 0 ? (
            <View style={{ marginTop: 20 }}>
              <Text
                style={[
                  FONTS.fontMedium,
                  { color: colors.title, marginBottom: 8 },
                ]}
              >
                Item details
              </Text>
              {fieldsMeta.map((f) => {
                const val = dynamicValues?.[f.id];
                if (val == null || (Array.isArray(val) && val.length === 0))
                  return null;
                const valueLabel = Array.isArray(val)
                  ? val.join(", ")
                  : String(val);
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
                      <Text style={{ color: colors.text }}>{valueLabel}</Text>
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          {/* Images */}
          <View style={{ marginTop: 20 }}>
            <Text
              style={[
                FONTS.fontMedium,
                { color: colors.title, marginBottom: 8 },
              ]}
            >
              Photos ({photos.length})
            </Text>

            {photos.length ? (
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
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {photos.map((p) => {
                    const isPrimary = p.uri === primaryUri;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => setPrimaryUri(p.uri)}
                        style={{
                          width: "25%",
                          height: thumbnailSize,
                          padding: 2,
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            borderWidth: isPrimary ? 2 : 0,
                            borderColor: isPrimary
                              ? COLORS.primary
                              : "transparent",
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
        <Button
          title={submitting ? "Posting…" : "Post Now"}
          onPress={onSubmit}
          disabled={submitting}
          loading={submitting}
        />
      </View>
    </SafeAreaView>
  );
};

export default Review;
