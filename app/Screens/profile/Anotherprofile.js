import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  useCallback,
} from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useTheme, useRoute } from "@react-navigation/native";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { COLORS, FONTS, IMAGES } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import FeatherIcon from "react-native-vector-icons/Feather";
import axios from "axios";
import { AuthContext } from "../../context/AuthProvider";

const API_BASE_URL = "https://qot.ug/api";
const APP_API_TOKEN = "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=";

const formatPrice = (price, currencyCode) => {
  const amount = parseFloat(price ?? 0);
  if (Number.isNaN(amount)) return "";
  if (currencyCode === "UGX") return `${amount.toLocaleString()} UGX`;
  return `$${amount.toLocaleString()}`;
};

const Anotherprofile = ({ navigation }) => {
  const { params } = useRoute();
  const userId = params?.userId;
  const { userToken } = useContext(AuthContext);
  const { colors } = useTheme();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [miniStats, setMiniStats] = useState([]);

  const headers = useMemo(
    () => ({
      Authorization: userToken ? `Bearer ${userToken}` : undefined,
      "X-AppApiToken": APP_API_TOKEN,
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    [userToken]
  );

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setLoadingUser(true);
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/users/${userId}?embed=country,userType,gender,countPostsViews,countPosts`,
        { headers }
      );

      const { data: dataministats } = await axios.get(
        `${API_BASE_URL}/users/${userId}/stats`,
        { headers }
      );

      console.log("Fetched user data:", data);
      console.log("Fetched mini stats:", dataministats);

      if (data?.result && dataministats?.result) {
        setUser(data?.result ?? null);
        setMiniStats(dataministats?.result ?? null);
      }
    } catch (e) {
      console.error("Error fetching user:", e);
      setUser(null);
      setMiniStats(null);
    } finally {
      setLoadingUser(false);
    }
  }, [userId, headers]);

  const fetchPosts = useCallback(async () => {
    if (!userId) return;
    setLoadingPosts(true);
    try {
      // List user's posts (embed pictures & city for the card)
      const url = `${API_BASE_URL}/posts?userId=${encodeURIComponent(
        userId
      )}&perPage=20&embed=pictures,city&op=search`;
      const { data } = await axios.get(url, { headers });
      const raw = data?.result?.data ?? data?.result ?? [];
      const mapped = Array.isArray(raw)
        ? raw.map((p) => {
            const img =
              Array.isArray(p.pictures) && p.pictures.length > 0
                ? p.pictures[0]?.url?.large ||
                  p.pictures[0]?.url?.medium ||
                  p.pictures[0]?.url?.small
                : null;
            return {
              id: String(p.id),
              title: p.title || "",
              price: p.price_formatted || formatPrice(p.price, p.currency_code),
              image: img ? { uri: img } : IMAGES.detail1,
              location: p.city?.name || "",
              date: p.created_at_formatted || "",
            };
          })
        : [];
      setPosts(mapped);
    } catch (e) {
      setPosts([]);
      console.warn(
        "Fetch user's posts error:",
        e?.response?.data || e?.message
      );
    } finally {
      setLoadingPosts(false);
    }
  }, [userId, headers]);

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, [fetchUser, fetchPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUser(), fetchPosts()]);
    setRefreshing(false);
  };

  const onShare = async () => {
    let userUrl;
    if (user?.username) {
      userUrl = `https://qot.ug/profile/${user?.username}`;
    } else {
      userUrl = `https://qot.ug/users/${user?.id}/ads`;
    }

    try {
      await Share.share({
        message: `Check out this profile on QOT: ${userUrl}`,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const memberSince =
    user?.created_at_formatted ||
    (user?.created_at
      ? new Date(user.created_at).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "");

  const avatarUri = user?.photo_url || user?.photoUrl || user?.photo || null; // fall back to placeholder below

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={[GlobalStyleSheet.container, { paddingBottom: 80 }]}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={{ padding: 10 }}
              onPress={() => navigation.goBack()}
            >
              <Image
                style={{ width: 18, height: 18, tintColor: colors.title }}
                source={IMAGES.arrowleft}
              />
            </TouchableOpacity>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <TouchableOpacity style={{ padding: 10 }} onPress={onShare}>
                <Image
                  style={{ width: 18, height: 18, tintColor: colors.title }}
                  source={IMAGES.share}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Card */}
          <View
            style={[
              GlobalStyleSheet.shadow2,
              {
                borderWidth: 0,
                backgroundColor: COLORS.primary,
                marginTop: 20,
                borderRadius: 20,
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                margin: 10,
                marginBottom: 10,
              }}
            >
              <Image
                style={{
                  height: 18,
                  width: 18,
                  resizeMode: "contain",
                  tintColor: "#fff",
                }}
                source={IMAGES.calendar}
              />
              <Text
                style={{
                  ...FONTS.fontRegular,
                  fontSize: 13,
                  color: COLORS.white,
                }}
              >
                {memberSince ? `Member Since ${memberSince}` : "Member"}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: COLORS.secondary,
                flex: 1,
                padding: 20,
                borderRadius: 20,
                alignItems: "center",
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.9)",
                  width: 85,
                  height: 85,
                  borderRadius: 50,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {loadingUser ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : avatarUri ? (
                  <Image
                    style={{ height: 80, width: 80, borderRadius: 50 }}
                    source={{ uri: avatarUri }}
                    onError={() => {
                      // fallback if remote avatar 404s
                      setUser((u) => (u ? { ...u, photo_url: null } : u));
                    }}
                  />
                ) : (
                  <Image
                    style={{ height: 80, width: 80, borderRadius: 50 }}
                    source={IMAGES.Small5}
                  />
                )}
              </View>

              <Text
                style={[
                  FONTS.fontLg,
                  FONTS.fontSemiBold,
                  { color: COLORS.white, fontSize: 18, marginTop: 10 },
                ]}
              >
                {user?.name || "User"}
              </Text>
              {!!user?.email && (
                <Text
                  style={[
                    FONTS.font,
                    { color: COLORS.white, marginTop: 5, opacity: 0.7 },
                  ]}
                >
                  {user.email}
                </Text>
              )}

              {/* Stats (optional placeholders if you don't have counts) */}
              <View
                style={{
                  backgroundColor: COLORS.white,
                  paddingTop: 5,
                  borderRadius: 9,
                  marginTop: 15,
                  flexDirection: "row",
                  gap: 20,
                  paddingHorizontal: 20,
                }}
              >
                <TouchableOpacity style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      ...FONTS.h6,
                      ...FONTS.fontMedium,
                      color: COLORS.title,
                    }}
                  >
                    {miniStats?.posts?.visits ?? "—"}
                  </Text>
                  <Text
                    style={{
                      ...FONTS.fontRegular,
                      fontSize: 12,
                      color: COLORS.title,
                      opacity: 0.7,
                      lineHeight: 14,
                    }}
                  >
                    Views
                  </Text>
                </TouchableOpacity>

                <LinearGradient
                  colors={[
                    "rgba(0, 0, 0, 0.0)",
                    "rgba(18, 9, 46, 0.20)",
                    "rgba(0, 0, 0, 0.0)",
                  ]}
                  style={{ width: 2, height: 50 }}
                />

                <TouchableOpacity style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      ...FONTS.h6,
                      ...FONTS.fontMedium,
                      color: COLORS.title,
                    }}
                  >
                    {miniStats?.posts?.favourite ?? "—"}
                  </Text>
                  <Text
                    style={{
                      ...FONTS.fontRegular,
                      fontSize: 12,
                      color: COLORS.title,
                      opacity: 0.7,
                      lineHeight: 14,
                    }}
                  >
                    Liked
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Posts */}
          <View style={{ paddingVertical: 10 }}>
            <Text
              style={{ ...FONTS.fontMedium, color: colors.title, fontSize: 16 }}
            >
              All Post ({miniStats?.posts?.published ?? "—"})
            </Text>
          </View>

          {loadingPosts ? (
            <ActivityIndicator
              color={COLORS.primary}
              style={{ marginTop: 10 }}
            />
          ) : (
            <View>
              {posts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    GlobalStyleSheet.shadow2,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      padding: 10,
                      marginBottom: 20,
                    },
                  ]}
                  onPress={() =>
                    navigation.navigate("ItemDetails", { itemId: item.id })
                  }
                >
                  <View style={{ flexDirection: "row" }}>
                    <Image
                      style={{ width: 70, height: 70, borderRadius: 6 }}
                      source={item.image}
                    />
                    <View style={{ marginLeft: 10, flex: 1, paddingRight: 20 }}>
                      <Text
                        style={{
                          ...FONTS.font,
                          ...FONTS.fontMedium,
                          color: colors.title,
                          fontSize: 16,
                        }}
                      >
                        {item.price}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{
                          ...FONTS.fontSm,
                          ...FONTS.fontSemiBold,
                          color: colors.title,
                          marginTop: 2,
                        }}
                      >
                        {item.title}
                      </Text>
                      <View style={{ flexDirection: "row", marginTop: 5 }}>
                        <FeatherIcon
                          size={12}
                          color={colors.text}
                          name={"map-pin"}
                        />
                        <Text
                          style={[
                            FONTS.fontXs,
                            { fontSize: 11, color: colors.text, marginLeft: 4 },
                          ]}
                        >
                          {item.location}
                        </Text>
                      </View>
                    </View>
                    <View style={{ bottom: 0, justifyContent: "flex-end" }}>
                      <Text
                        style={{
                          ...FONTS.fontRegular,
                          fontSize: 12,
                          color: colors.title,
                          opacity: 0.7,
                        }}
                      >
                        {item.date}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {posts.length === 0 && (
                <Text
                  style={[FONTS.fontSm, { color: colors.text, marginTop: 10 }]}
                >
                  No posts yet.
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Anotherprofile;
