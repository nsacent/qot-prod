import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { COLORS, FONTS, IMAGES, SIZES } from "../../../constants/theme";
import Header from "../../../layout/Header";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import Button from "../../../components/Button/Button";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const MAX_PHOTOS = 8;

const getPickerMediaTypes = () => {
  if (ImagePicker?.MediaType?.Images) return [ImagePicker.MediaType.Images]; // new API
  return ImagePicker.MediaTypeOptions.Images; // old API
};

const FP_DIR = FileSystem.cacheDirectory + "image-fp/";

const Uploadphoto = ({ navigation, route }) => {
  const { colors } = useTheme();

  // carry all previously collected data forward
  const {
    draft: {
      baseForm = {}, // includes: category_id, post_type_id, title, description, price, negotiable, city_id, country_code, etc
      dynamicValues = {}, // cf values object from Form screen
      fieldsMeta = [], // optional meta for pretty labels in Review
      tags, // array<string> or comma string
    },
  } = route?.params || {};

  const [images, setImages] = useState([]); // [{id, uri, name?, type?, assetKey}]
  const [activeImage, setActiveImage] = useState("");

  const previewHeight = useMemo(() => {
    const base =
      SIZES.width > SIZES.container
        ? SIZES.container
        : SIZES.width - Math.min(SIZES.width * 0.2, SIZES.container * 0.2);
    return base;
  }, []);

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need access to your photos to let you upload."
      );
      return false;
    }
    return true;
  };

  const normalizeUri = (u = "") => {
    try {
      const uri = String(u);
      // strip query/hash & lower-case scheme
      const [path] = uri.split(/[?#]/);
      return path.replace(/^file:\/\//i, "").trim();
    } catch {
      return u || "";
    }
  };

  const ensureFpDir = async () => {
    try {
      const info = await FileSystem.getInfoAsync(FP_DIR);
      if (!info.exists)
        await FileSystem.makeDirectoryAsync(FP_DIR, { intermediates: true });
    } catch {}
  };

  const safeName = (s = "") => s.replace(/[^\w.-]+/g, "_").slice(0, 60);

  const copyToCacheForHash = async (uri, name = "img") => {
    try {
      await ensureFpDir();
      const dest =
        FP_DIR +
        Date.now() +
        "_" +
        Math.random().toString(36).slice(2) +
        "_" +
        safeName(name);
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    } catch {
      return null;
    }
  };

  const fingerprintAsset = async (asset) => {
    // 1) Most reliable on iOS
    if (asset?.assetId) return `asset:${asset.assetId}`;

    // 2) Try MD5/size on original URI
    try {
      const info = await FileSystem.getInfoAsync(asset?.uri, { md5: true });
      if (info?.exists && (info?.md5 || Number.isFinite(info?.size))) {
        return `md5:${info.md5 || "x"}|size:${info.size || 0}`;
      }
    } catch {}

    // 3) If original is content:// (Android), copy to cache then hash
    try {
      const cached = await copyToCacheForHash(
        asset?.uri,
        asset?.fileName || asset?.filename || "photo.jpg"
      );
      if (cached) {
        const info = await FileSystem.getInfoAsync(cached, { md5: true });
        if (info?.exists && (info?.md5 || Number.isFinite(info?.size))) {
          return `md5:${info.md5 || "x"}|size:${info.size || 0}`;
        }
      }
    } catch {}

    // 4) Last resort: combine weak signals
    const name = asset?.fileName || asset?.filename || "";
    const wh = `${asset?.width || 0}x${asset?.height || 0}`;
    return `fallback:${safeName(name)}|${wh}`;
  };

  const onPickImages = async () => {
    const ok = await requestMediaLibraryPermission();
    if (!ok) return;

    try {
      const remaining = Math.max(0, MAX_PHOTOS - images.length);
      if (remaining === 0) {
        Alert.alert("Limit reached", `You can add up to ${MAX_PHOTOS} photos.`);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: getPickerMediaTypes(),
        allowsMultipleSelection: true,
        selectionLimit: remaining, // iOS/web (ignored on Android but fine)
        quality: 0.9,
      });
      if (result.canceled) return;

      const picked = result.assets || [];

      // Build an existing fingerprints set (covers prior picks)
      const existing = new Set(
        images.map((it) => it.fingerprint || it.assetKey || it.uri)
      );

      // Compute fingerprints for the new batch in parallel
      const enriched = await Promise.all(
        picked.map(async (a) => {
          const fp = await fingerprintAsset(a);
          return {
            id: `picked-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            uri: a.uri,
            name: a.fileName || a.filename || "photo.jpg",
            type: a.mimeType || "image/jpeg",
            width: a.width,
            height: a.height,
            fingerprint: fp,
          };
        })
      );

      // Dedupe both against existing and within this batch
      const seenThisBatch = new Set();
      const unique = [];
      for (const a of enriched) {
        if (existing.has(a.fingerprint) || seenThisBatch.has(a.fingerprint))
          continue;
        seenThisBatch.add(a.fingerprint);
        unique.push(a);
      }

      if (!unique.length) {
        Alert.alert("Already selected", "Those photo(s) were already added.");
        return;
      }

      const next = [...images, ...unique].slice(0, MAX_PHOTOS);
      setImages(next);
      if (!activeImage && next.length) setActiveImage(next[0].uri);
    } catch (e) {
      console.log("Image pick error:", e);
      Alert.alert("Error", "Could not open your gallery. Please try again.");
    }
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

  const goNext = () => {
    if (!images.length) {
      Alert.alert("No photos", "Please add at least one photo to continue.");
      return;
    }
    navigation.navigate("Review", {
      draft: {
        baseForm,
        dynamicValues,
        fieldsMeta,
        tags,
        photos: images,
      },
      primary: activeImage || images[0].uri,
    });
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

        <TouchableOpacity onPress={onPickImages} style={{ padding: 10 }}>
          <Image
            style={{ height: 24, width: 24, tintColor: colors.title }}
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
                key={item.id ?? index}
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
        <Button onPress={goNext} title="Next" />
      </View>
    </SafeAreaView>
  );
};

export default Uploadphoto;
