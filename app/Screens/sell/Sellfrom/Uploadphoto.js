/*import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { COLORS, FONTS, IMAGES, SIZES } from "../../../constants/theme";
import { ScrollView } from "react-native-gesture-handler";
import { useTheme } from "@react-navigation/native";
import Header from "../../../layout/Header";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import Button from "../../../components/Button/Button";

const MAX_PHOTOS = 8;

const Uploadphoto = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;

  const [activeImage, setActiveImage] = useState("");

  // State
  const [images, setImages] = useState([]); // or [] if you want empty start

  // Derived
  const previewHeight = useMemo(() => {
    const w = SIZES.width;
    const base =
      SIZES.width > SIZES.container
        ? SIZES.container
        : SIZES.width - Math.min(SIZES.width * 0.2, SIZES.container * 0.2);
    return base;
  }, []);

  // Permissions (ask once when pressing the camera, but pre-warm here if you want)
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

  // Pick from gallery
  const onPickImages = async () => {
    const ok = await requestMediaLibraryPermission();
    if (!ok) return;

    try {
      const remaining = Math.max(0, MAX_PHOTOS - images.length);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true, // iOS 14+ and web; Android will return one
        quality: 0.8,
        selectionLimit: remaining > 0 ? remaining : 1, // iOS/web only
      });

      if (result.canceled) return;

      // Normalize result across platforms
      const picked = (result.assets || [])
        .slice(0, remaining || 0) // enforce limit
        .map((a, idx) => ({
          id: `picked-${Date.now()}-${idx}`,
          uri: a.uri,
          localAsset: false,
        }));

      if (!picked.length) {
        if (images.length >= MAX_PHOTOS) {
          Alert.alert(
            "Limit reached",
            `You can add up to ${MAX_PHOTOS} photos.`
          );
        }
        return;
      }

      const next = [...images, ...picked].slice(0, MAX_PHOTOS);
      setImages(next);

      // If we had no active image, set the first newly picked
      if (!activeImage) setActiveImage(picked[0].uri);
    } catch (e) {
      console.log("Image pick error:", e);
      Alert.alert("Error", "Could not open your gallery. Please try again.");
    }
  };

  // Remove image (long press)
  const removeImage = (id, uri) => {
    Alert.alert("Remove photo", "Do you want to remove this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const next = images.filter((it) => it.id !== id);
          setImages(next);
          // If we removed the active one, choose another
          if (activeImage === uri) {
            setActiveImage(next.length ? next[0].uri : null);
          }
        },
      },
    ]);
  };

  // Navigate forward (send selected images)
  const goNext = () => {
    if (!images.length) {
      Alert.alert("No photos", "Please add at least one photo to continue.");
      return;
    }
    navigation.navigate("Setprice", {
      photos: images, // [{id, uri, localAsset?}]
      primary: activeImage,
    });
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <Header title="Upload your photos" leftIcon={"back"} titleLeft />

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

export default Uploadphoto;*/

import React, { useEffect, useMemo, useState, useContext } from "react";
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
import { COLORS, FONTS, IMAGES, SIZES } from "../../../constants/theme";
import Header from "../../../layout/Header";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import Button from "../../../components/Button/Button";
import { AuthContext } from "../../../context/AuthProvider";
import {
  createDraftPost,
  updatePostFields,
} from "../../../../src/services/postApi";

const MAX_PHOTOS = 8;

const Uploadphoto = ({ navigation, route }) => {
  const { baseForm } = route.params || {};
  const { colors } = useTheme();
  const { userToken } = useContext(AuthContext);

  const [postId, setPostId] = useState(null);
  const [creating, setCreating] = useState(true);

  const [activeImage, setActiveImage] = useState("");
  const [images, setImages] = useState([]);
  const previewHeight = useMemo(() => {
    const base =
      SIZES.width > SIZES.container
        ? SIZES.container
        : SIZES.width - Math.min(SIZES.width * 0.2, SIZES.container * 0.2);
    return base;
  }, []);

  // 1) Create draft once
  useEffect(() => {
    (async () => {
      try {
        setCreating(true);
        const id = await createDraftPost(userToken, baseForm);
        setPostId(id);
      } catch (e) {
        console.log("Create draft failed:", e?.response?.data || e.message);
        Alert.alert("Error", "Failed to create draft. Please try again.");
        navigation.goBack();
      } finally {
        setCreating(false);
      }
    })();
  }, []);

  const requestPerms = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access to upload images.");
      return false;
    }
    return true;
  };

  // 2) Pick & immediately upload to the draft (PUT pictures[])
  const onPickImages = async () => {
    if (!postId) return;
    const ok = await requestPerms();
    if (!ok) return;

    const remaining = Math.max(0, MAX_PHOTOS - images.length);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: remaining > 0 ? remaining : 1,
    });
    if (result.canceled) return;

    const picked = (result.assets || []).slice(0, remaining);
    if (!picked.length) return;

    // show previews immediately
    const withStatus = picked.map((a, i) => ({
      id: `picked-${Date.now()}-${i}`,
      uri: a.uri,
      status: "uploading",
      progress: 0,
    }));
    const next = [...images, ...withStatus].slice(0, MAX_PHOTOS);
    setImages(next);
    if (!activeImage) setActiveImage(withStatus[0].uri);

    try {
      await uploadPicturesToPost(userToken, postId, picked, (p) => {
        // optional overall progress hook
      });

      // mark as done
      setImages((prev) =>
        prev.map((it) =>
          it.status === "uploading"
            ? { ...it, status: "done", progress: 1 }
            : it
        )
      );
    } catch (e) {
      console.log("Upload failed:", e?.response?.data || e.message);
      setImages((prev) =>
        prev.map((it) =>
          it.status === "uploading" ? { ...it, status: "error" } : it
        )
      );
      Alert.alert("Upload failed", "Some photos could not be uploaded.");
    }
  };

  const removeImage = (id, uri) => {
    // NOTE: server-side deletion depends on whether your update endpoint
    // replaces or appends. Easiest pattern: re-upload final set on submit.
    setImages((prev) => prev.filter((it) => it.id !== id));
    if (activeImage === uri) {
      const rest = images.filter((it) => it.id !== id);
      setActiveImage(rest.length ? rest[0].uri : null);
    }
  };

  const goNext = () => {
    if (!postId) return;
    const anyUploading = images.some((x) => x.status === "uploading");
    if (anyUploading) {
      Alert.alert("Please wait", "Photos are still uploading.");
      return;
    }
    const anyError = images.some((x) => x.status === "error");
    if (anyError) {
      Alert.alert("Upload error", "Remove or retry failed photos first.");
      return;
    }
    navigation.navigate("Setprice", { postId });
  };

  if (creating) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10 }}>Preparing your draft…</Text>
      </SafeAreaView>
    );
  }

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

      {/* Thumbs */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {images.map((item, i) => {
            const isActive = activeImage === item.uri;
            const cell =
              SIZES.width / 4 > SIZES.container
                ? SIZES.container / 4
                : SIZES.width / 4;
            return (
              <View
                key={item.id || i}
                style={{ width: "25%", height: cell, padding: 1 }}
              >
                <TouchableOpacity
                  onPress={() => setActiveImage(item.uri)}
                  onLongPress={() => removeImage(item.id, item.uri)}
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
                  {item.status === "uploading" && (
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 4,
                        backgroundColor: "#ffffff55",
                      }}
                    >
                      <View
                        style={{
                          width: `${Math.round((item.progress || 0) * 100)}%`,
                          height: "100%",
                          backgroundColor: COLORS.primary,
                        }}
                      />
                    </View>
                  )}
                  {item.status === "error" && (
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        backgroundColor: "#00000055",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 12 }}>
                        Failed (long-press to remove)
                      </Text>
                    </View>
                  )}
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
