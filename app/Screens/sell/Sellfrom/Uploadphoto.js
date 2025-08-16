import React, { useEffect, useMemo, useState } from "react";
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
