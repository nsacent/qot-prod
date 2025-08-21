import React, { useEffect, useMemo, useState, useContext } from "react";
import { useTheme } from "@react-navigation/native";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import Header from "../../../layout/Header";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import { COLORS, FONTS, IMAGES } from "../../../constants/theme";
import Button from "../../../components/Button/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../../../context/AuthProvider";

const CITY_CACHE_KEY_PREFIX = "qot:cities:"; // we used "qot:cities:UG" earlier

const formatUGX = (n) => {
  if (n === null || n === undefined || n === "") return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString("en-UG");
};

const postTypeLabel = (id) => {
  if (id === 1) return "Individual";
  if (id === 2) return "Professional";
  return "—";
};

const splitTags = (csv) =>
  (csv || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

// robustly read cached cities (array) regardless of stored shape
const extractCitiesArray = (json) => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.list)) return json.list;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.result?.data)) return json.result.data;
  if (Array.isArray(json?.result)) return json.result;
  return [];
};

const Review = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { userData } = useContext(AuthContext);

  const baseForm = route?.params?.baseForm || {};
  const {
    title,
    description,
    post_type_id,
    price,
    negotiable,
    tags, // CSV string
    city_id,
    country_code = "UG",
    auth_field = "email",
    email,
    phone,
  } = baseForm;

  const [cityName, setCityName] = useState("");

  // Resolve city name from AsyncStorage cache
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const keysToTry = [
          `${CITY_CACHE_KEY_PREFIX}${country_code}`,
          `${CITY_CACHE_KEY_PREFIX}UG`,
        ];
        for (const key of keysToTry) {
          const raw = await AsyncStorage.getItem(key);
          if (!raw) continue;
          const parsed = JSON.parse(raw);
          const arr = extractCitiesArray(parsed);
          const found = arr.find((c) => Number(c?.id) === Number(city_id));
          if (found && mounted) {
            setCityName(found.name || "");
            return;
          }
        }
      } catch (_) {}
      if (mounted) setCityName("");
    })();
    return () => {
      mounted = false;
    };
  }, [city_id, country_code]);

  const tagList = useMemo(() => splitTags(tags), [tags]);

  const verifiedRow = useMemo(() => {
    if (auth_field === "phone" && phone) {
      return { label: "Verified phone number", value: phone };
    }
    return { label: "Verified email", value: email || userData?.email || "—" };
  }, [auth_field, phone, email, userData]);

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <Header title="Review your details" leftIcon={"back"} titleLeft />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          GlobalStyleSheet.container,
          { paddingBottom: 24 },
        ]}
      >
        {/* Profile row */}
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
        >
          <Image
            style={{ width: 70, height: 70, borderRadius: 50 }}
            source={IMAGES.Small5}
          />
          <View
            style={{
              marginLeft: 10,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              flex: 1,
              paddingBottom: 6,
            }}
          >
            <Text style={[FONTS.font, { color: colors.text }]}>Your name</Text>
            <View>
              <TextInput
                style={[FONTS.fontMedium, { padding: 0, color: colors.title }]}
                defaultValue={userData?.name || "—"}
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* Contact verified */}
        <View style={{ marginTop: 24 }}>
          <Text style={[FONTS.fontLg, { color: colors.title }]}>
            {verifiedRow.label}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              marginTop: 10,
            }}
          >
            <Image
              style={{
                width: 20,
                height: 20,
                resizeMode: "contain",
                tintColor: COLORS.success,
              }}
              source={IMAGES.checkbox}
            />
            <Text style={[FONTS.font, { color: colors.title }]}>
              {verifiedRow.value || "—"}
            </Text>
          </View>
        </View>

        {/* Summary cards */}
        <View style={{ marginTop: 24, gap: 12 }}>
          {/* Title */}
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              backgroundColor: colors.card,
              padding: 12,
            }}
          >
            <Text style={[FONTS.fontSm, { color: colors.text }]}>Title</Text>
            <Text style={[FONTS.fontLg, { color: colors.title, marginTop: 4 }]}>
              {title || "—"}
            </Text>
          </View>

          {/* Description */}
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              backgroundColor: colors.card,
              padding: 12,
            }}
          >
            <Text style={[FONTS.fontSm, { color: colors.text }]}>
              Description
            </Text>
            <Text style={[FONTS.font, { color: colors.title, marginTop: 4 }]}>
              {description || "—"}
            </Text>
          </View>

          {/* Post type & Location */}
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              backgroundColor: colors.card,
              padding: 12,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[FONTS.fontSm, { color: colors.text }]}>
                  Post Type
                </Text>
                <Text
                  style={[FONTS.font, { color: colors.title, marginTop: 4 }]}
                >
                  {postTypeLabel(post_type_id)}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[FONTS.fontSm, { color: colors.text }]}>
                  Location
                </Text>
                <Text
                  style={[FONTS.font, { color: colors.title, marginTop: 4 }]}
                >
                  {cityName || (city_id ? `City #${city_id}` : "—")}
                </Text>
              </View>
            </View>
          </View>

          {/* Price */}
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              backgroundColor: colors.card,
              padding: 12,
            }}
          >
            <Text style={[FONTS.fontSm, { color: colors.text }]}>Price</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Text style={[FONTS.fontLg, { color: colors.title }]}>
                UGX {formatUGX(price)}
              </Text>
              <View
                style={{
                  marginLeft: 10,
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: negotiable ? COLORS.success : colors.border,
                  backgroundColor: colors.card,
                }}
              >
                <Text
                  style={[
                    FONTS.fontSm,
                    { color: negotiable ? COLORS.success : colors.text },
                  ]}
                >
                  {negotiable ? "Negotiable" : "Fixed"}
                </Text>
              </View>
            </View>
          </View>

          {/* Tags */}
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              backgroundColor: colors.card,
              padding: 12,
            }}
          >
            <Text style={[FONTS.fontSm, { color: colors.text }]}>Tags</Text>
            {tagList.length ? (
              <View
                style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}
              >
                {tagList.map((t, i) => (
                  <View
                    key={`${t}-${i}`}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={[FONTS.fontSm, { color: colors.title }]}>
                      {t}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[FONTS.font, { color: colors.title, marginTop: 4 }]}>
                —
              </Text>
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
          onPress={() => navigation.navigate("Uploadphoto", { baseForm })}
          title="Post Now"
        />
      </View>
    </SafeAreaView>
  );
};

export default Review;
