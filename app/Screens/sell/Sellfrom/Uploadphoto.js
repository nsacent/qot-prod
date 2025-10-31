import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { COLORS, FONTS, IMAGES, SIZES } from "../../../constants/theme";
import Header from "../../../layout/Header";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import Button from "../../../components/Button/Button";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 👉 pull in patchBase from your draft context
import { useListingDraft } from "../../../context/ListingDraftContext";

const MAX_PHOTOS = 8;

const STORAGE_KEYS = {
  pendingPhotos: "pendingPhotos",
  pendingPrimary: "pendingPrimary",
};

export async function clearPendingPhotosCache() {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.pendingPhotos,
      STORAGE_KEYS.pendingPrimary,
    ]);
  } catch {}
}

const getPickerMediaTypes = () => {
  // Prefer the new API (array of MediaType)
  if (ImagePicker?.MediaType?.Images) return [ImagePicker.MediaType.Images];
  // Fallback for older SDKs (will show a deprecation warning in newer Expo)
  return ImagePicker.MediaTypeOptions?.Images;
};

const FP_DIR = FileSystem.cacheDirectory + "image-fp/";

const Uploadphoto = ({ navigation }) => {
  const { colors } = useTheme();

  // use patchBase from context
  const { patchBase } = useListingDraft();

  const [images, setImages] = useState([]); // [{id, uri, name?, type?, fingerprint}]
  const [activeImage, setActiveImage] = useState("");

  const previewHeight = useMemo(() => {
    const base =
      SIZES.width > SIZES.container
        ? SIZES.container
        : SIZES.width - Math.min(SIZES.width * 0.2, SIZES.container * 0.2);
    return base;
  }, []);

  // --------- AsyncStorage restore on mount ----------
  useEffect(() => {
    (async () => {
      try {
        const [rawPhotos, rawPrimary] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.pendingPhotos),
          AsyncStorage.getItem(STORAGE_KEYS.pendingPrimary),
        ]);
        if (rawPhotos) {
          const saved = JSON.parse(rawPhotos);
          if (Array.isArray(saved) && saved.length) {
            setImages(saved);
            const prim = rawPrimary ? JSON.parse(rawPrimary) : null;
            setActiveImage(prim || saved[0]?.uri || "");
          }
        }
      } catch {}
    })();
  }, []);

  // --------- Persist to AsyncStorage whenever images or primary change ----------
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.pendingPhotos,
          JSON.stringify(images || [])
        );
      } catch {}
    })();
  }, [images]);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.pendingPrimary,
          JSON.stringify(activeImage || "")
        );
      } catch {}
    })();
  }, [activeImage]);

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
    if (asset?.assetId) return `asset:${asset.assetId}`;

    try {
      const info = await FileSystem.getInfoAsync(asset?.uri, { md5: true });
      if (info?.exists && (info?.md5 || Number.isFinite(info?.size))) {
        return `md5:${info.md5 || "x"}|size:${info.size || 0}`;
      }
    } catch {}

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
        selectionLimit: remaining, // best-effort on Android
        quality: 0.9,
      });
      if (result.canceled) return;

      const picked = result.assets || [];

      const existing = new Set(images.map((it) => it.fingerprint || it.uri));

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

  // 🔥 NEW: Clear all photos (wipes state + AsyncStorage cache)
  const clearAllPhotos = () => {
    if (!images.length) return;
    Alert.alert(
      "Clear all photos",
      "This will remove all selected photos. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setImages([]);
            setActiveImage("");
            try {
              await clearPendingPhotosCache();
            } catch {}
          },
        },
      ]
    );
  };

  const goNext = async () => {
    if (!images.length) {
      Alert.alert("No photos", "Please add at least one photo to continue.");
      return;
    }

    const primary = activeImage || images[0].uri;

    // ✅ store into the draft using patchBase
    patchBase({
      photos: images,
      primary,
    });

    // ✅ also ensure cache is up to date before navigating
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.pendingPhotos, JSON.stringify(images)],
        [STORAGE_KEYS.pendingPrimary, JSON.stringify(primary)],
      ]);
    } catch {}

    // then move on
    navigation.navigate("Review");
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

        {/* 🔥 NEW: Clear all button */}
        <TouchableOpacity onPress={clearAllPhotos} style={{ padding: 10 }}>
          <Text style={{ color: "crimson" }}>Clear</Text>
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
