import React, { useMemo, useState, useContext, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "../../../layout/Header";
import Button from "../../../components/Button/Button";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import { COLORS, FONTS, IMAGES, SIZES } from "../../../constants/theme";
import { useListingDraft } from "../../../context/ListingDraftContext";
import { AuthContext } from "../../../context/AuthProvider";

// 👇 helper to clear AsyncStorage cache set in Uploadphoto

import { clearPendingPhotosCache } from "./Uploadphoto";

const API_BASE_URL = "https://qot.ug/api";
const HEADERS_BASE = {
  Accept: "application/json",
  "Content-Language": "en",
  "X-AppApiToken": "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=",
  "X-AppType": "docs",
};

const labelForPostType = (id) =>
  id === 2 ? "Professional" : id === 1 ? "Individual" : undefined;

const Chip = ({ text, colors, variant = "default", style }) => {
  const styles =
    variant === "solid"
      ? { bg: COLORS.primary, border: COLORS.primary, text: "#fff" }
      : { bg: colors.card, border: colors.border, text: colors.title };

  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderColor: styles.border,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 6,
          marginRight: 8,
          marginBottom: 8,
          backgroundColor: styles.bg,
        },
        style,
      ]}
    >
      <Text style={{ color: styles.text, fontSize: 13 }}>{text}</Text>
    </View>
  );
};

function appendDynamicFields(fd, dynamicValues = {}, fieldsMeta = []) {
  if (!dynamicValues || typeof dynamicValues !== "object") return;
  const metaById =
    Array.isArray(fieldsMeta) &&
    fieldsMeta.reduce((acc, f) => ((acc[f.id] = f), acc), {});
  Object.entries(dynamicValues).forEach(([fieldId, value]) => {
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

const Review = ({ navigation }) => {
  const { colors } = useTheme();
  const { token, userData } = useContext(AuthContext);
  const { draft, patchBase } = useListingDraft();

  const base = draft.baseForm || {};
  const fieldsMeta = draft.fieldsMeta || [];
  const dynamicValues = draft.dynamicValues || {};
  const photos = Array.isArray(base.photos) ? base.photos : [];

  // ----- Derived display bits -----
  const priceStr = `UGX ${Number(base.price || 0).toLocaleString()}`;
  const postTypeLabel = labelForPostType(base.post_type_id);
  const displayCity = draft.city_name
    ? draft.city_name
    : base.city_name || undefined;

  const tagsArr = useMemo(() => {
    if (Array.isArray(base.tags)) return base.tags;
    if (typeof base.tags === "string" && base.tags.trim().length) {
      return base.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    return [];
  }, [base.tags]);

  const heroHeight = useMemo(() => {
    const w =
      SIZES.width > SIZES.container
        ? SIZES.container
        : SIZES.width - Math.min(SIZES.width * 0.08, SIZES.container * 0.08);
    return Math.max(260, Math.min(420, w * 0.85));
  }, []);

  // ----- Hero carousel (swipe to set primary) -----
  const screenW = Dimensions.get("window").width;
  const primaryUri = base.primary || (photos[0] && photos[0].uri) || null;

  const startIndex = useMemo(() => {
    const idx = photos.findIndex((p) => p.uri === primaryUri);
    return idx >= 0 ? idx : 0;
  }, [photos, primaryUri]);

  const heroRef = useRef(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Keep hero aligned with current primary
  useEffect(() => {
    if (!heroRef.current) return;
    const idx = photos.findIndex((p) => p.uri === primaryUri);
    if (idx >= 0) {
      heroRef.current.scrollTo({ x: idx * screenW, y: 0, animated: true });
    }
  }, [primaryUri, photos, screenW]);

  const updatePrimary = (uri) => {
    if (!uri || uri === primaryUri) return;
    patchBase({ primary: uri });
  };

  const removePhotoByKey = (key) => {
    const next = photos.filter((p) => (p.id || p.uri) !== key);
    const nextPrimary =
      primaryUri && primaryUri === key ? next[0]?.uri ?? null : primaryUri;
    patchBase({ photos: next, primary: nextPrimary || undefined });
  };

  const onHeroScrollEnd = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / screenW);
    const target = photos[idx]?.uri;
    if (target) updatePrimary(target);
  };

  const openGallery = () => setGalleryOpen(true);
  const closeGallery = () => setGalleryOpen(false);

  // ----- Submit -----
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!token)
      return Alert.alert("Login required", "You must be logged in to post.");
    if (!base.category_id)
      return Alert.alert("Missing info", "Category is required.");
    if (!base.post_type_id)
      return Alert.alert("Missing info", "Post type is required.");
    if (!base.city_id)
      return Alert.alert("Missing location", "Please choose a city.");
    if (!photos.length)
      return Alert.alert("No photos", "Please add at least one photo.");
    if (!base.title || !base.description) {
      return Alert.alert("Missing info", "Title and Description are required.");
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      const appendIf = (k, v) => {
        if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
      };

      appendIf("category_id", base.category_id);
      appendIf("post_type_id", base.post_type_id);
      appendIf("title", base.title);
      appendIf("description", base.description);
      appendIf("contact_name", base.contact_name || userData?.name || "User");
      appendIf("auth_field", base.auth_field || "email");

      if ((base.auth_field || "email") === "email") {
        appendIf("email", base.email || userData?.email);
      } else {
        appendIf("phone", base.phone);
        appendIf("phone_country", base.phone_country || "UG");
      }

      appendIf("city_id", base.city_id);
      appendIf("country_code", base.country_code || "UG");
      appendIf("price", base.price ?? 0);
      fd.append("negotiable", base.negotiable ? "1" : "0");
      fd.append("accept_terms", "1");

      if (tagsArr.length) fd.append("tags", tagsArr.join(","));

      // Dynamic fields
      appendDynamicFields(fd, draft.dynamicValues, draft.fieldsMeta);

      // Photos
      photos.forEach((p) => {
        fd.append("pictures[]", {
          uri: p.uri,
          name: p.name || "photo.jpg",
          type: p.type || "image/jpeg",
        });
      });

      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: { ...HEADERS_BASE, Authorization: `Bearer ${token}` },
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

      // ✅ clear the persisted pending photos cache on success
      await clearPendingPhotosCache();

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

  // ----- Small helpers -----
  const Section = ({ title, right, children, style }) => (
    <View style={[{ marginTop: 18 }, style]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text style={[FONTS.fontMedium, { color: colors.title, fontSize: 16 }]}>
          {title}
        </Text>
        {right}
      </View>

      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          backgroundColor: colors.card,
          padding: 12,
        }}
      >
        {children}
      </View>
    </View>
  );

  const ItemGrid = ({ items }) => {
    const visible = items.filter(
      (i) => i?.value != null && String(i.value).trim().length
    );
    if (!visible.length) return null;

    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {visible.map((it, idx) => (
          <View
            key={`${it.label}-${idx}`}
            style={{ width: "50%", paddingVertical: 8, paddingRight: 8 }}
          >
            <Text style={{ color: colors.title, fontWeight: "600" }}>
              {it.label}
            </Text>
            <Text style={{ color: colors.text, marginTop: 2 }}>
              {Array.isArray(it.value) ? it.value.join(", ") : String(it.value)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <Header title="Review your listing" leftIcon={"back"} titleLeft />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO CAROUSEL */}
        <View style={{ position: "relative" }}>
          <ScrollView
            ref={heroRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: startIndex * screenW, y: 0 }}
            onMomentumScrollEnd={onHeroScrollEnd}
            style={{
              width: "100%",
              height: heroHeight,
              backgroundColor: "rgba(71,90,119,.18)",
            }}
          >
            {photos.length ? (
              photos.map((p) => (
                <TouchableOpacity
                  key={p.id || p.uri}
                  activeOpacity={0.9}
                  onPress={openGallery}
                  style={{ width: screenW, height: heroHeight }}
                >
                  <Image
                    source={{ uri: p.uri }}
                    style={{
                      width: "100%",
                      height: "100%",
                      resizeMode: "cover",
                    }}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View
                style={{
                  width: screenW,
                  height: heroHeight,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={[FONTS.font, { color: colors.text }]}>
                  No photos
                </Text>
              </View>
            )}
          </ScrollView>

          {/* FLOATING DETAILS CARD */}
          <View
            style={{ position: "absolute", left: 20, right: 20, bottom: -56 }}
          >
            <View
              style={{
                borderRadius: 18,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 14,
                shadowColor: "rgba(0,0,0,.25)",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 10,
              }}
            >
              {/* Seller row */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    height: 48,
                    width: 48,
                    borderRadius: 24,
                    overflow: "hidden",
                    borderWidth: 2,
                    borderColor: "rgba(71,90,119,.25)",
                    marginRight: 10,
                  }}
                >
                  <Image
                    source={
                      userData?.photo_url
                        ? { uri: userData.photo_url }
                        : IMAGES.Small5
                    }
                    style={{ width: "100%", height: "100%" }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      FONTS.fontMedium,
                      { color: colors.title, fontSize: 16 },
                    ]}
                    numberOfLines={1}
                  >
                    {userData?.name || base.contact_name || "Your profile"}
                  </Text>
                  <Text
                    style={[FONTS.font, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {userData?.email || base.email || " "}
                  </Text>
                </View>
                <Chip text={priceStr} colors={colors} variant="solid" />
              </View>

              {/* Title + badges */}
              <View style={{ marginTop: 10 }}>
                <Text
                  style={[FONTS.fontLg, { color: colors.title, fontSize: 20 }]}
                  numberOfLines={2}
                >
                  {base.title || "Untitled"}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginTop: 6,
                  }}
                >
                  {base.negotiable ? (
                    <Chip text="Negotiable" colors={colors} />
                  ) : null}
                  {postTypeLabel ? (
                    <Chip text={postTypeLabel} colors={colors} />
                  ) : null}
                  {displayCity ? (
                    <Chip text={displayCity} colors={colors} />
                  ) : null}
                </View>

                {!!tagsArr.length && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      marginTop: 4,
                    }}
                  >
                    {tagsArr.map((t, i) => (
                      <Chip key={`${t}-${i}`} text={t} colors={colors} />
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* spacer for floating card */}
        <View style={{ height: 46 }} />

        <View style={[GlobalStyleSheet.container, { paddingHorizontal: 20 }]}>
          {/* Thumbnails */}
          <View style={{ marginTop: 10 }}>
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
                <Text style={{ color: colors.text, marginBottom: 8 }}>
                  Tap a thumbnail to set the primary photo (sent first).
                  Long-press to remove.
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row" }}>
                    {photos.map((p, idx) => {
                      const isPrimary = p.uri === primaryUri;
                      return (
                        <TouchableOpacity
                          key={p.id ?? `${p.uri}-${idx}`}
                          onPress={() => updatePrimary(p.uri)}
                          onLongPress={() =>
                            Alert.alert(
                              "Remove photo",
                              "Do you want to remove this photo?",
                              [
                                { text: "Cancel", style: "cancel" },
                                {
                                  text: "Remove",
                                  style: "destructive",
                                  onPress: () =>
                                    removePhotoByKey(p.id || p.uri),
                                },
                              ]
                            )
                          }
                          delayLongPress={300}
                          activeOpacity={0.9}
                          style={{
                            width: 84,
                            height: 84,
                            marginRight: 8,
                            borderRadius: 12,
                            overflow: "hidden",
                            borderWidth: isPrimary ? 2 : 1,
                            borderColor: isPrimary
                              ? COLORS.primary
                              : colors.border,
                          }}
                        >
                          <Image
                            source={{ uri: p.uri }}
                            style={{ width: "100%", height: "100%" }}
                          />
                          {isPrimary ? (
                            <View
                              style={{
                                position: "absolute",
                                right: 6,
                                top: 6,
                                backgroundColor: "rgba(0,0,0,.55)",
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 8,
                              }}
                            >
                              <Text style={{ color: "#fff", fontSize: 10 }}>
                                Primary
                              </Text>
                            </View>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  onPress={() => navigation.navigate("Uploadphoto")}
                  style={{ marginTop: 10 }}
                >
                  <Text style={{ color: COLORS.primary }}>Edit photos</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={{ color: colors.text }}>No photos added.</Text>
            )}
          </View>

          {/* Description */}
          {base.description ? (
            <View style={{ marginTop: 18 }}>
              <Text
                style={[
                  FONTS.fontMedium,
                  { color: colors.title, marginBottom: 8 },
                ]}
              >
                Description
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 16,
                  backgroundColor: colors.card,
                  padding: 12,
                }}
              >
                <Text style={{ color: colors.text }}>{base.description}</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("Form")}
                style={{ marginTop: 8 }}
              >
                <Text style={{ color: COLORS.primary }}>Edit description</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Item details (dynamic fields) */}
          {Array.isArray(fieldsMeta) && fieldsMeta.length > 0 ? (
            <View style={{ marginTop: 18 }}>
              <Text
                style={[
                  FONTS.fontMedium,
                  { color: colors.title, marginBottom: 8 },
                ]}
              >
                Item details
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 16,
                  backgroundColor: colors.card,
                  padding: 12,
                }}
              >
                <ItemGrid
                  items={fieldsMeta.map((f) => ({
                    label: f.name || f.id,
                    value: dynamicValues?.[f.id],
                  }))}
                />
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("Form")}
                style={{ marginTop: 8 }}
              >
                <Text style={{ color: COLORS.primary }}>Edit details</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Contact */}
          <View style={{ marginTop: 18 }}>
            <Text
              style={[
                FONTS.fontMedium,
                { color: colors.title, marginBottom: 8 },
              ]}
            >
              Contact
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 16,
                backgroundColor: colors.card,
                padding: 12,
              }}
            >
              <ItemGrid
                items={[
                  {
                    label: "Name",
                    value: base.contact_name || userData?.name || "—",
                  },
                  base.auth_field === "phone"
                    ? { label: "Phone", value: base.phone || "—" }
                    : {
                        label: "Email",
                        value: base.email || userData?.email || "—",
                      },
                  base.auth_field === "phone"
                    ? { label: "Country", value: base.phone_country || "UG" }
                    : null,
                ].filter(Boolean)}
              />
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Form")}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: COLORS.primary }}>Edit contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View
        style={[
          GlobalStyleSheet.container,
          {
            paddingBottom: 20,
            paddingHorizontal: 20,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
      >
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button
              variant="outline"
              title="Back"
              onPress={() => navigation.goBack()}
            />
          </View>
          <View style={{ flex: 2 }}>
            <Button
              title={submitting ? "Posting…" : "Post Now"}
              onPress={onSubmit}
              disabled={submitting}
              loading={submitting}
            />
          </View>
        </View>
      </View>

      {/* Full-screen gallery */}
      <Modal visible={galleryOpen} animationType="fade" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.95)",
            justifyContent: "center",
          }}
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: startIndex * screenW, y: 0 }}
            onMomentumScrollEnd={onHeroScrollEnd}
            style={{ width: "100%", height: "70%" }}
          >
            {photos.map((p) => (
              <View
                key={`full-${p.id || p.uri}`}
                style={{
                  width: screenW,
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={{ uri: p.uri }}
                  style={{
                    width: "92%",
                    height: "100%",
                    resizeMode: "contain",
                  }}
                />
              </View>
            ))}
          </ScrollView>

          <View
            style={{
              position: "absolute",
              top: 40,
              right: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <TouchableOpacity onPress={closeGallery}>
              <Chip
                text="Close"
                colors={{ card: "#000", border: "#666", title: "#fff" }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Review;
