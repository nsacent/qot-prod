import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "../../../layout/Header";
import { FONTS } from "../../../constants/theme";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiService } from "../../../../src/services/api";

// per-parent cache key: qot.subcats.<parentId>.v1
const subkey = (parentId) => `qot.subcats.${parentId}.v1`;
const TTL = 24 * 60 * 60 * 1000; // 24h

const Selllist = ({ route, navigation }) => {
  const { colors } = useTheme();
  // From Sell screen: navigation.navigate("Selllist", { cat: item.slug, catId: Number(item.id) })
  const { cat, catId } = route.params || {};

  const [subs, setSubs] = useState([]); // array of { id, title/name, slug }
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const loadFromCache = useCallback(async () => {
    try {
      if (!catId) return null;
      const raw = await AsyncStorage.getItem(subkey(catId));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const fresh = parsed?.ts && Date.now() - parsed.ts < TTL;
      if (Array.isArray(parsed?.data)) {
        setSubs(parsed.data);
      }
      return !!fresh;
    } catch {
      return null;
    }
  }, [catId]);

  const saveToCache = useCallback(
    async (data) => {
      try {
        if (!catId) return;
        await AsyncStorage.setItem(
          subkey(catId),
          JSON.stringify({ ts: Date.now(), data })
        );
      } catch {}
    },
    [catId]
  );

  const fetchChildren = useCallback(async () => {
    try {
      setFetchError(null);
      // Strategy that matches the response you pasted:
      // GET /categories?embed=children → find the parent by id and read .children

      // This becomes GET /categories?embed=children
      const { data } = await ApiService.getCategories({ embed: "children" });

      const list = Array.isArray(data?.result?.data)
        ? data.result.data
        : Array.isArray(data?.result)
        ? data.result
        : [];

      const parent = list.find((c) =>
        catId ? Number(c.id) === Number(catId) : c.slug === cat
      );

      const children = Array.isArray(parent?.children) ? parent.children : [];

      // Map to UI shape your component expects
      const mapped = children.map((c) => ({
        id: String(c.id),
        title: c.name, // keep your existing label prop
        slug: c.slug,
      }));

      setSubs(mapped);
      await saveToCache(mapped);
    } catch (e) {
      setFetchError("Failed to load sub‑categories.");
      console.log("Sub-categories fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [cat, catId, saveToCache]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // 1) Try cache for instant paint
      await loadFromCache();
      // 2) Revalidate from network
      if (mounted) await fetchChildren();
      // if cache was empty, loading ends in fetchChildren
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [loadFromCache, fetchChildren]);

  const handlePress = (item) => {
    // Navigate to your form; pass the chosen subcategory id/slug for the posting flow
    navigation.navigate("Form", {
      subCategoryId: item.id,
      subCategorySlug: item.slug,
    });
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <Header
        title={
          cat
            ? cat.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
            : "Select a sub category"
        }
        leftIcon={"back"}
        titleLeft
      />
      {loading && subs.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[FONTS.font, { color: colors.text, marginTop: 8 }]}>
            Loading…
          </Text>
        </View>
      ) : (
        <ScrollView>
          <View
            style={[
              Platform.OS === "web" && GlobalStyleSheet.container,
              { padding: 0 },
            ]}
          >
            {subs.length === 0 ? (
              <View style={{ padding: 16 }}>
                <Text style={[FONTS.font, { color: colors.text }]}>
                  {fetchError || "No sub-categories found."}
                </Text>
              </View>
            ) : (
              subs.map((row, index) => (
                <View key={row.id ?? index} style={{ paddingHorizontal: 15 }}>
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 15,
                      paddingVertical: 15,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                    onPress={() => handlePress(row)}
                  >
                    <Text
                      style={[
                        FONTS.font,
                        FONTS.fontMedium,
                        { color: colors.title },
                      ]}
                    >
                      {row.title}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Selllist;
