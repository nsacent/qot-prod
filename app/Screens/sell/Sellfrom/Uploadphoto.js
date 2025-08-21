import React, { useMemo, useState, useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ScrollView } from "react-native-gesture-handler";
import { useTheme } from "@react-navigation/native";
import Header from "../../../layout/Header";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import { COLORS, FONTS, IMAGES, SIZES } from "../../../constants/theme";
import Button from "../../../components/Button/Button";
import { AuthContext } from "../../../context/AuthProvider";

// ✅ your service
import { createPostWithImages } from "../../../../src/services/postApi";

const MAX_PHOTOS = 8;

const Uploadphoto = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { userToken } = useContext(AuthContext);

  // All non-image fields must be provided by previous steps
  const baseForm = route?.params?.baseForm || {};

  const [activeImage, setActiveImage] = useState("");
  const [images, setImages] = useState([]); // [{ id, uri }]
  const [busy, setBusy] = useState(false);

  // preview height
  const previewHeight = useMemo(() => {
    const base =
      SIZES.width > SIZES.container
        ? SIZES.container
        : SIZES.width - Math.min(SIZES.width * 0.2, SIZES.container * 0.2);
    return base;
  }, []);

  // --- helpers ----------------------------------------------------
  const requestPerms = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need access to your photos to upload."
      );
      return false;
    }
    return true;
  };

  // quick required checks before publish
  const validateBaseForm = (form) => {
    const missing = [];
    if (!form.category_id) missing.push("category_id");
    if (!form.post_type_id) missing.push("post_type_id");
    if (!form.title) missing.push("title");
    if (!form.description) missing.push("description");
    if (!form.contact_name) missing.push("contact_name");
    if (!form.city_id) missing.push("city_id");
    if (!form.country_code) missing.push("country_code");
    if (!form.auth_field) missing.push("auth_field");
    if (form.auth_field === "email" && !form.email) missing.push("email");
    if (form.auth_field === "phone") {
      if (!form.phone) missing.push("phone");
      if (!form.phone_country) missing.push("phone_country");
    }
    if (form.price == null || form.price === "") missing.push("price");
    // optional booleans we normalize later: negotiable, phone_hidden, etc.
    return { ok: missing.length === 0, missing };
  };

  // --- image picking (no network here) ----------------------------
  const onPickImages = async () => {
    if (!(await requestPerms())) return;

    const remaining = Math.max(0, MAX_PHOTOS - images.length);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images, // ✅ non-deprecated
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: remaining > 0 ? remaining : 1,
    });
    if (result.canceled) return;

    const picked = (result.assets || []).slice(0, remaining);
    if (!picked.length) return;

    const stamped = picked.map((a, idx) => ({
      id: `picked-${Date.now()}-${idx}`,
      uri: a.uri,
    }));

    const newGallery = [...images, ...stamped].slice(0, MAX_PHOTOS);
    setImages(newGallery);
    if (!activeImage && stamped[0]) setActiveImage(stamped[0].uri);
  };

  const removeImage = (id, uri) => {
    Alert.alert("Remove photo", "Do you want to remove this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const next = images.filter((it) => it.id !== id);
          setImages(next);
          if (activeImage === uri) {
            setActiveImage(next.length ? next[0].uri : "");
          }
        },
      },
    ]);
  };

  // --- final publish ----------------------------------------------
  const onPublish = async () => {
    // validate fields
    const { ok, missing } = validateBaseForm(baseForm);
    if (!ok) {
      Alert.alert(
        "Missing info",
        `Please provide: ${missing.join(", ")} on previous steps.`
      );
      return;
    }
    if (images.length === 0) {
      Alert.alert("Add photos", "Please add at least one photo.");
      return;
    }

    try {
      setBusy(true);
      // You said you want to create only now (last step):
      // send **all fields + pictures** in one call.
      const postId = await createPostWithImages(userToken, baseForm, images);

      Alert.alert("Success", "Your listing was created.", [
        // TODO: change 'Home' to whatever makes sense in your app
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    } catch (e) {
      const payload = e?.response?.data || e?.message;
      console.log("Create failed:", payload);
      Alert.alert(
        "Publish failed",
        typeof payload === "string"
          ? payload
          : "Server rejected the request. Please review required fields and try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <Header title="Upload your photos" leftIcon={"back"} titleLeft />

      {/* Preview */}
      <View>
        <View
          style={{
            paddingVertical: 30,
            backgroundColor: "rgba(71,90,119,.25)",
          }}
        >
          {activeImage ? (
            <Image
              style={{
                height: previewHeight,
                width: "100%",
                resizeMode: "contain",
              }}
              source={{ uri: activeImage }}
            />
          ) : (
            <View
              style={{
                height: previewHeight,
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={[FONTS.font, { color: colors.text }]}>
                No photo selected
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Toolbar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 15,
        }}
      >
        <Text
          style={{
            flex: 1,
            ...FONTS.fontMedium,
            ...FONTS.h5,
            color: colors.title,
          }}
        >
          Gallery ({images.length}/{MAX_PHOTOS})
        </Text>

        <TouchableOpacity
          onPress={onPickImages}
          style={{ padding: 10 }}
          disabled={busy}
        >
          <Image
            style={{
              height: 24,
              width: 24,
              tintColor: colors.title,
              opacity: busy ? 0.5 : 1,
            }}
            source={IMAGES.camera}
          />
        </TouchableOpacity>
      </View>

      {/* Thumbnails */}
      <ScrollView showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {images.map((item, index) => {
            const isActive = activeImage === item.uri;
            const cellSize =
              SIZES.width / 4 > SIZES.container
                ? SIZES.container / 4
                : SIZES.width / 4;

            return (
              <View
                key={item.id ?? item.uri ?? index}
                style={{
                  width: "25%",
                  height: cellSize,
                  padding: 1,
                }}
              >
                <TouchableOpacity
                  onPress={() => setActiveImage(item.uri)}
                  onLongPress={() => removeImage(item.id, item.uri)}
                  delayLongPress={250}
                  activeOpacity={0.9}
                  style={{
                    flex: 1,
                    borderWidth: isActive ? 2 : 0,
                    borderColor: isActive ? COLORS.primary : "transparent",
                  }}
                >
                  <Image
                    style={{ width: "100%", height: "100%" }}
                    source={{ uri: item.uri }}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
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
          onPress={onPublish}
          title={busy ? "Publishing…" : "Publish"}
          disabled={busy}
        />
        {busy && (
          <View style={{ marginTop: 8, alignItems: "center" }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={{ marginTop: 6, color: colors.text, fontSize: 12 }}>
              Creating your listing…
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Uploadphoto;
