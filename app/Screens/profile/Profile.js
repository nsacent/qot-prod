/*import React, { useContext, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Share,
  Animated,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { COLORS, FONTS, IMAGES, SIZES } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import FeatherIcon from "react-native-vector-icons/Feather";
import { ScrollView } from "react-native-gesture-handler";
import { AuthContext } from "../../context/AuthProvider";
import { format } from "date-fns";
import MyadsSheet from "../../components/BottomSheet/MyadsSheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import postApiService from "../../../src/services/postsService";

const Profile = ({ navigation }) => {
  const { signOut, userData: contextUserData } = useContext(AuthContext);
  const [userData, setUserData] = useState(contextUserData || null);
  const [pendingAds, setPendingAds] = useState([]);
  const [archivedAds, setArchivedAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const scrollRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const moresheet = useRef();

  const theme = useTheme();
  const { colors } = theme;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("userData");
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load user data from storage:", e);
      }
    };
    loadUserData();
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both pending and archived ads in parallel
      const [pendingResponse, archivedResponse] = await Promise.all([
        postApiService.posts.getPendingApproval("belongLoggedUser=1"),
        postApiService.posts.getArchived(),
      ]);

      setPendingAds(pendingResponse.result?.data || []);
      setArchivedAds(archivedResponse.result?.data || []);
    } catch (err) {
      console.error("Error fetching ads:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAds();
  };

  const slideIndicator = scrollX.interpolate({
    inputRange: [0, SIZES.width],
    outputRange: [0, (SIZES.width - 30) / 2],
    extrapolate: "clamp",
  });

  const onPressTouch = (val) => {
    setCurrentIndex(val);
    scrollRef.current?.scrollTo({
      x: SIZES.width * val,
      animated: true,
    });
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: "Check out my profile on this awesome app!",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleArchiveAd = async (adId) => {
    try {
      await apiService.posts.archive(adId);
      fetchAds(); // Refresh the ads list
    } catch (error) {
      console.error("Error archiving ad:", error);
    }
  };

  const handleUnarchiveAd = async (adId) => {
    try {
      await apiService.posts.unarchive(adId);
      fetchAds(); // Refresh the ads list
    } catch (error) {
      console.error("Error unarchiving ad:", error);
    }
  };

  const handleDeleteAd = async (adId) => {
    try {
      await apiService.posts.delete(adId);
      fetchAds(); // Refresh the ads list
    } catch (error) {
      console.error("Error deleting ad:", error);
    }
  };

  const renderAdItem = (data, isPending = true) => {
    const imageUrl =
      data.picture?.url?.medium ||
      data.picture?.url?.small ||
      data.picture?.url?.full ||
      IMAGES.defaultAd;

    return (
      <TouchableOpacity
        key={data.id}
        style={[
          GlobalStyleSheet.shadow2,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 10,
            paddingLeft: isPending ? 20 : 10,
            marginBottom: 20,
          },
        ]}
        onPress={() => navigation.navigate("ItemDetails", { postId: data.id })}
      >
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: isPending ? 1 : 0,
            borderBottomColor: colors.border,
            paddingBottom: isPending ? 10 : 0,
          }}
        >
          <Image
            style={{ height: 70, width: 70, borderRadius: 6 }}
            source={{ uri: imageUrl }}
            defaultSource={IMAGES.defaultAd}
          />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                ...FONTS.fontSm,
                ...FONTS.fontSemiBold,
                color: colors.title,
              }}
            >
              {data.title || "Untitled Listing"}
            </Text>
            <Text
              style={{
                ...FONTS.font,
                ...FONTS.fontMedium,
                color: colors.title,
                marginTop: 2,
              }}
            >
              {data.price_formatted || "Price not set"}
            </Text>

            {isPending ? (
              <View
                style={{
                  backgroundColor: COLORS.primary,
                  width: 100,
                  borderRadius: 20,
                  alignItems: "center",
                  padding: 2,
                  marginTop: 5,
                }}
              >
                <Text style={{ ...FONTS.fontSm, color: colors.card }}>
                  {data.archived_at ? "ARCHIVED" : "PENDING"}
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: "row", marginTop: 5 }}>
                <FeatherIcon size={12} color={colors.text} name={"map-pin"} />
                <Text
                  style={[
                    FONTS.fontXs,
                    { fontSize: 11, color: colors.text, marginLeft: 4 },
                  ]}
                >
                  {data.city_id
                    ? `City ID: ${data.city_id}`
                    : "Location not specified"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {isPending && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 10,
              paddingBottom: 0,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 15 }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <Image
                  style={{
                    width: 15,
                    height: 15,
                    resizeMode: "contain",
                    tintColor: colors.text,
                  }}
                  source={IMAGES.eye}
                />
                <Text style={{ ...FONTS.fontXs, color: colors.text }}>
                  Views:
                </Text>
                <Text style={{ ...FONTS.fontXs, color: colors.title }}>
                  {data.visits || 0}
                </Text>
              </View>
              <View
                style={{
                  height: 15,
                  width: 1,
                  backgroundColor: colors.borderColor,
                }}
              ></View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <Image
                  style={{ width: 15, height: 15, resizeMode: "contain" }}
                  source={IMAGES.like}
                />
                <Text style={{ ...FONTS.fontXs, color: colors.text }}>
                  Likes:
                </Text>
                <Text style={{ ...FONTS.fontXs, color: colors.title }}>
                  {data.likes || 0}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => moresheet.current.openSheet(data)}
              style={[
                GlobalStyleSheet.background,
                { marginRight: 5, height: 40, width: 40 },
              ]}
            >
              <Image
                style={{ height: 20, width: 20, tintColor: colors.title }}
                source={IMAGES.more}
              />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
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
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
          <View style={[GlobalStyleSheet.container, { paddingBottom: 10 }]}>
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
                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={() => navigation.navigate("Setting")}
                >
                  <Image
                    style={{
                      width: 20,
                      height: 20,
                      resizeMode: "contain",
                      tintColor: colors.title,
                    }}
                    source={IMAGES.settings}
                  />
                </TouchableOpacity>
              </View>
            </View>
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
                  Member since{" "}
                  {userData?.email_verified_at
                    ? format(new Date(userData.email_verified_at), "MMMM yyyy")
                    : "Not Verified"}
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
                  <Image
                    style={{ height: 80, width: 80, borderRadius: 50 }}
                    source={
                      userData?.photo_url
                        ? { uri: userData.photo_url }
                        : IMAGES.Small5
                    }
                  />
                </View>
                <Text
                  style={[
                    FONTS.fontLg,
                    FONTS.fontSemiBold,
                    { color: COLORS.white, fontSize: 18, marginTop: 10 },
                  ]}
                >
                  {userData?.name ? userData.name : "Anonymous"}
                </Text>
                <Text
                  style={[
                    FONTS.font,
                    { color: COLORS.white, marginTop: 5, opacity: 0.7 },
                  ]}
                >
                  {userData?.email ? userData.email : "anonymous@example.com"}
                </Text>
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
                  <TouchableOpacity
                    style={{ alignItems: "center" }}
                    onPress={() => navigation.navigate("FollowerFollowing")}
                  >
                    <Text
                      style={{
                        ...FONTS.h6,
                        ...FONTS.fontMedium,
                        color: COLORS.title,
                      }}
                    >
                      1520
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
                      Visits
                    </Text>
                  </TouchableOpacity>
                  <LinearGradient
                    colors={[
                      "rgba(0, 0, 0, 0.0)",
                      "rgba(18, 9, 46, 0.20)",
                      "rgba(0, 0, 0, 0.0)",
                    ]}
                    style={{ width: 2, height: 50 }}
                  ></LinearGradient>
                  <TouchableOpacity
                    style={{ alignItems: "center" }}
                    onPress={() => navigation.navigate("FollowerFollowing")}
                  >
                    <Text
                      style={{
                        ...FONTS.h6,
                        ...FONTS.fontMedium,
                        color: COLORS.title,
                      }}
                    >
                      360
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
                      Favorites
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.primary,
                    padding: 10,
                    borderRadius: 50,
                    position: "absolute",
                    top: 10,
                    right: 10,
                  }}
                  onPress={() => navigation.navigate("EditProfile")}
                >
                  <Image
                    style={{ height: 18, width: 18, tintColor: "#fff" }}
                    source={IMAGES.write}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>

        <SafeAreaView style={{ backgroundColor: colors.card }}>
          <View
            style={[
              GlobalStyleSheet.container,
              { paddingTop: 10, paddingHorizontal: 10, padding: 0 },
            ]}
          >
            <View
              style={{ flexDirection: "row", marginTop: 0, marginBottom: 0 }}
            >
              <TouchableOpacity
                onPress={() => onPressTouch(0)}
                style={GlobalStyleSheet.TouchableOpacity2}
              >
                <Text
                  style={[
                    { ...FONTS.fontMedium, fontSize: 14, color: "#475A77" },
                    currentIndex == 0 && { color: COLORS.primary },
                  ]}
                >
                  Pending Approval
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onPressTouch(1)}
                style={GlobalStyleSheet.TouchableOpacity2}
              >
                <Text
                  style={[
                    { ...FONTS.fontMedium, fontSize: 14, color: "#475A77" },
                    currentIndex == 1 && { color: COLORS.primary },
                  ]}
                >
                  Archived Ads
                </Text>
              </TouchableOpacity>
              <Animated.View
                style={{
                  backgroundColor: COLORS.primary,
                  width: "50%",
                  height: 3,
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  transform: [{ translateX: slideIndicator }],
                }}
              ></Animated.View>
            </View>
          </View>

          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : error ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              <Text style={{ color: colors.title }}>
                Error loading ads: {error}
              </Text>
              <TouchableOpacity
                onPress={fetchAds}
                style={{
                  marginTop: 10,
                  padding: 10,
                  backgroundColor: COLORS.primary,
                  borderRadius: 5,
                }}
              >
                <Text style={{ color: COLORS.white }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={[
                Platform.OS === "web" && GlobalStyleSheet.container,
                { padding: 0 },
              ]}
            >
              <ScrollView
                horizontal
                scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                ref={scrollRef}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(e) => {
                  const offsetX = e.nativeEvent.contentOffset.x;
                  if (Math.round(offsetX) === Math.round(SIZES.width)) {
                    setCurrentIndex(1);
                  } else if (Math.round(offsetX) === 0) {
                    setCurrentIndex(0);
                  } else {
                    setCurrentIndex(0);
                  }
                }}
              >
                <View
                  style={{
                    marginTop: 20,
                    width:
                      SIZES.width > SIZES.container
                        ? SIZES.container
                        : SIZES.width,
                    flex: 1,
                  }}
                >
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        flex: 1,
                        paddingBottom: 80,
                      }}
                    >
                      {pendingAds.length > 0 ? (
                        pendingAds.map((data) => renderAdItem(data, true))
                      ) : (
                        <View
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 20,
                          }}
                        >
                          <Text style={{ color: colors.text }}>
                            No pending ads found
                          </Text>
                        </View>
                      )}
                    </View>
                  </ScrollView>
                </View>

                <View
                  style={{
                    marginTop: 20,
                    width:
                      SIZES.width > SIZES.container
                        ? SIZES.container
                        : SIZES.width,
                    flex: 1,
                  }}
                >
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        flex: 1,
                        paddingBottom: 80,
                      }}
                    >
                      {archivedAds.length > 0 ? (
                        archivedAds.map((data) => renderAdItem(data, false))
                      ) : (
                        <View
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 20,
                          }}
                        >
                          <Text style={{ color: colors.text }}>
                            No archived ads found
                          </Text>
                        </View>
                      )}
                    </View>
                  </ScrollView>
                </View>
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </ScrollView>

      <MyadsSheet
        ref={moresheet}
        onArchive={handleArchiveAd}
        onUnarchive={handleUnarchiveAd}
        onDelete={handleDeleteAd}
      />
    </>
  );
};

export default Profile;*/
import React, { useContext, useEffect, useState, Suspense } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthProvider";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { COLORS, FONTS, SIZES } from "../../constants/theme";

// Lazy load components
const ProfileHeader = React.lazy(() =>
  import("../../components/Profile/ProfileHeader")
);
const PendingAdsTab = React.lazy(() =>
  import("../../components/Profile/PendingAdsTab")
);
const ArchivedAdsTab = React.lazy(() =>
  import("../../components/Profile/ArchivedAdsTab")
);

// Skeleton loaders
const SkeletonBox = ({ height = 20, width = "100%", style = {} }) => (
  <View
    style={{
      height,
      width,
      backgroundColor: "#e0e0e0",
      borderRadius: 4,
      marginBottom: 10,
      ...style,
    }}
  />
);

const Profile = ({ navigation }) => {
  const { colors } = useTheme();
  const { userInfo } = useContext(AuthContext);
  const [selectedTab, setSelectedTab] = useState("pending");

  const renderTabContent = () => {
    switch (selectedTab) {
      case "pending":
        return (
          <Suspense fallback={<SkeletonBox height={200} />}>
            <PendingAdsTab navigation={navigation} />
          </Suspense>
        );
      case "archived":
        return (
          <Suspense fallback={<SkeletonBox height={200} />}>
            <ArchivedAdsTab navigation={navigation} />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      <View style={GlobalStyleSheet.container}>
        <Suspense
          fallback={
            <View style={{ marginBottom: 20 }}>
              <SkeletonBox height={20} width="40%" />
              <SkeletonBox height={16} width="80%" />
              <SkeletonBox height={16} width="60%" />
            </View>
          }
        >
          <ProfileHeader navigation={navigation} />
        </Suspense>

        <View style={GlobalStyleSheet.tabContainer}>
          <TouchableOpacity
            style={[
              GlobalStyleSheet.tab,
              selectedTab === "pending" && {
                borderBottomColor: COLORS.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setSelectedTab("pending")}
          >
            <Text
              style={[
                FONTS.font,
                {
                  color:
                    selectedTab === "pending"
                      ? COLORS.primary
                      : colors.textLight,
                },
              ]}
            >
              Pending Ads
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              GlobalStyleSheet.tab,
              selectedTab === "archived" && {
                borderBottomColor: COLORS.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setSelectedTab("archived")}
          >
            <Text
              style={[
                FONTS.font,
                {
                  color:
                    selectedTab === "archived"
                      ? COLORS.primary
                      : colors.textLight,
                },
              ]}
            >
              Archived Ads
            </Text>
          </TouchableOpacity>
        </View>

        {renderTabContent()}
      </View>
    </ScrollView>
  );
};

export default Profile;
