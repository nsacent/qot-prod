import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import Header from "../../layout/Header";
import { FONTS, IMAGES, SIZES } from "../../constants/theme";
import { useTheme } from "@react-navigation/native";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://qot.ug/api";

// 🔐 Cache config
const CAT_CACHE_KEY = "qot.topCategories.v1";
const CAT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const Sell = ({ navigation }) => {
  const { colors } = useTheme();

  const [layout, setLayout] = useState("grid");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const mapApiToUi = (raw = []) =>
    raw.map((c) => ({
      id: String(c.id),
      name: c.name,
      slug: c.slug,
      type: c.type,
      iconUrl: c.image_url || null,
    }));

  const loadFromCache = async () => {
    try {
      const raw = await AsyncStorage.getItem(CAT_CACHE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      const isFresh =
        parsed &&
        parsed.timestamp &&
        Date.now() - parsed.timestamp < CAT_CACHE_TTL_MS;

      if (parsed?.data?.length) {
        // show cached immediately
        setCategories(parsed.data);
      }
      return isFresh;
    } catch {
      return null;
    }
  };

  const saveToCache = async (data) => {
    try {
      await AsyncStorage.setItem(
        CAT_CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data })
      );
    } catch {}
  };

  const fetchCategories = async () => {
    try {
      setFetchError(null);
      const res = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-AppApiToken": "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=",
          "Content-Language": "en",
          "X-AppType": "docs",
        },
      });
      const json = await res.json();
      const list = mapApiToUi(json?.result?.data ?? []);
      setCategories(list);
      await saveToCache(list);
    } catch (e) {
      setFetchError("Failed to load categories.");
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      // 1) Try cache first
      const fresh = await loadFromCache();

      // 2) Always revalidate from network (SWr)
      if (mounted) await fetchCategories();

      // 3) End initial skeleton if nothing cached
      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  }, []);

  const onPressCategory = (item) => {
    navigation.navigate("Selllist", { cat: item.slug, catId: Number(item.id) });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={"What are you offering ?"} leftIcon={"back"} titleLeft />

      {loading && categories.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ ...FONTS.fontSm, color: colors.text, marginTop: 10 }}>
            Loading categories…
          </Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          key={layout}
          contentContainerStyle={[
            GlobalStyleSheet.container,
            { paddingHorizontal: 15, paddingVertical: 15 },
          ]}
          numColumns={layout === "grid" ? 3 : 1}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <Text style={{ ...FONTS.font, color: colors.text }}>
                {fetchError || "No categories found."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={[
                layout === "grid" && {
                  width: "33.33%",
                  height: 110,
                  paddingHorizontal: 5,
                  marginBottom: 10,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => onPressCategory(item)}
                activeOpacity={0.8}
                style={[
                  layout === "grid"
                    ? {
                        alignItems: "center",
                        backgroundColor: colors.card,
                        flex: 1,
                        borderRadius: SIZES.radius,
                        paddingHorizontal: 10,
                        shadowColor: "rgba(0,0,0,.5)",
                        shadowOffset: { width: 0, height: 5 },
                        shadowOpacity: 0.34,
                        shadowRadius: 6.27,
                        elevation: 10,
                      }
                    : {
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 18,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                ]}
              >
                <Image
                  style={[
                    layout === "grid"
                      ? {
                          height: 42,
                          width: 42,
                          resizeMode: "contain",
                          marginTop: 15,
                        }
                      : {
                          height: 24,
                          width: 24,
                          resizeMode: "contain",
                          marginRight: 13,
                        },
                  ]}
                  source={item.iconUrl ? { uri: item.iconUrl } : IMAGES.cat2}
                />

                <View style={{ flex: 1, justifyContent: "center" }}>
                  <Text
                    style={[
                      layout === "grid"
                        ? {
                            ...FONTS.fontSm,
                            color: colors.title,
                            textAlign: "center",
                          }
                        : { ...FONTS.font, fontSize: 16, color: colors.title },
                    ]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default Sell;
