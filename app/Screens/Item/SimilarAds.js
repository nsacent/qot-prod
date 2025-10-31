import React, { useEffect, useState, useContext, useMemo } from "react";
import { View, ScrollView, ActivityIndicator, Text } from "react-native";
import { useTheme } from "@react-navigation/native";
import { IMAGES, COLORS, FONTS } from "../../constants/theme";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import CardStyle2 from "../../components/Card/CardStyle2";
import postsService from "../../../src/services/postsService";

const formatPrice = (price, currencyCode, fallback = "") => {
  const amount = parseFloat(price ?? 0);
  if (Number.isNaN(amount)) return fallback;
  if (currencyCode === "UGX") return `${amount.toLocaleString()} UGX`;
  return `$${amount.toLocaleString()}`;
};

const mapPostToCard = (post) => {
  const firstPic =
    Array.isArray(post.pictures) && post.pictures.length > 0
      ? post.pictures[0]?.url?.large ||
        post.pictures[0]?.url?.medium ||
        post.pictures[0]?.url?.small
      : null;

  return {
    id: String(post.id),
    image: firstPic ? { uri: firstPic } : IMAGES.detail1, // fallback
    title: post.title || "Untitled",
    price:
      post.price_formatted || formatPrice(post.price, post.currency_code, ""),
    location: post.city?.name || "",
    trending: !!post.featured, // or post.is_featured depending on API
  };
};

const SimilarAds = ({ postId, perPage = 10 }) => {
  const { colors } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchSimilar = async () => {
      try {
        setLoading(true);

        const payload = {
          postId,
          op: "similar",
          embed: "pictures,city",
          perPage,
        };
        const { data } = await postsService.posts.getSimilar(payload);

        // API may return either {result: {data: [...]}} or {result: [...]}
        const raw = data?.result?.data ?? data?.result ?? [];

        const mapped = Array.isArray(raw) ? raw.map(mapPostToCard) : [];
        if (mounted) setItems(mapped);
      } catch (e) {
        if (mounted) setItems([]);
        console.warn(
          "SimilarAds fetch error:",
          e?.response?.data || e?.message
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (postId) fetchSimilar();
    return () => {
      mounted = false;
    };
  }, [postId, perPage]);

  if (loading) {
    return (
      <View style={{ marginHorizontal: -15, paddingVertical: 15 }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  if (!items.length) {
    return null; // or render a subtle "No similar ads" text
  }

  return (
    <View style={GlobalStyleSheet.container}>
      <Text style={[FONTS.h6, { color: colors.title, marginBottom: 10 }]}>
        Similar Ads
      </Text>
      <View
        style={{
          marginHorizontal: -15,
          backgroundColor: colors.card,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: 15,
            paddingBottom: 15,
            paddingTop: 10,
          }}
        >
          {items.map((item) => (
            <View
              key={item.id}
              style={{
                marginRight: 10,
                width: 160,
              }}
            >
              <CardStyle2 item={item} />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default React.memo(SimilarAds);
