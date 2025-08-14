import React, { useContext, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Share,
  Platform,
  RefreshControl,
  ScrollView as RNScrollView,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { COLORS, FONTS, IMAGES, SIZES } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView } from "react-native-gesture-handler";
import { AuthContext } from "../../context/AuthProvider";
import { format } from "date-fns";
import MyprofileSheet from "../../components/BottomSheet/MyprofileSheet";
import { ApiService } from "../../../src/services/api";
import { Skeleton } from "moti/skeleton";
import postsService from "../../../src/services/postsService";

const Profile = ({ navigation }) => {
  const scrollRef = useRef(null);
  const { userData } = useContext(AuthContext);
  const [pendingAds, setPendingAds] = useState([]);
  const [archivedAds, setArchivedAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [miniStats, setMiniStats] = useState([]);
  const [deletingIds, setDeletingIds] = useState([]); // id of the ad being deleted

  const [currentIndex, setCurrentIndex] = useState(0);
  const moresheetPending = useRef();
  const moresheetArchived = useRef();
  const theme = useTheme();
  const { colors } = theme;

  const actionsPending = [
    {
      icon: IMAGES.delete,
      label: "Delete",
      color: "red",
      onPress: (item) => {
        moresheetPending.current?.close(); // ← CLOSE the sheet
        handleDeleteAd(item.id, "pending"); // ← Then delete
      },
    },
    {
      icon: IMAGES.write,
      label: "Edit",
      color: colors.title,
      onPress: (item) => {
        moresheetPending.current?.close();
        handleEditAd(item.id, "pending");
      },
    },
  ];

  const actionsArchived = [
    {
      icon: IMAGES.delete,
      label: "Delete",
      color: "red",
      onPress: (item) => {
        moresheetArchived.current?.close();
        handleDeleteAd(item.id, "archived");
      },
    },
    {
      icon: IMAGES.verified,
      label: "UnArchive",
      color: colors.title,
      onPress: (item) => {
        moresheetArchived.current?.close();
        handleUnarchiveAd(item, "archived");
      },
    },
    {
      icon: IMAGES.write,
      label: "Edit",
      color: colors.title,
      onPress: (item) => {
        moresheetArchived.current?.close();
        handleEditAd(item.id, "archived");
      },
    },
  ];

  useEffect(() => {
    fetchUserMiniStats(userData.id);
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pendingResponse, archivedResponse] = await Promise.all([
        postsService.posts.getPendingApproval({ pendingApproval: 1 }),
        postsService.posts.getArchived({ archived: 1 }),
      ]);

      setPendingAds(pendingResponse.data?.result?.data || []);
      setArchivedAds(archivedResponse.data?.result?.data || []);
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
    fetchUserMiniStats(userData.id);
    fetchAds();
  };

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

  const fetchUserMiniStats = async (userId) => {
    try {
      const response = await ApiService.getUserStats(userId);
      if (response.data?.success && response.data?.result?.posts) {
        setMiniStats(response.data?.result?.posts);
      } else {
        return {
          published: 0,
          pendingApproval: 0,
          archived: 0,
          visits: 0,
          favourite: 0,
        };
      }
    } catch (error) {
      console.error("Error fetching mini stats:", error);
      return {
        published: 0,
        pendingApproval: 0,
        archived: 0,
        visits: 0,
        favourite: 0,
      };
    }
  };

  const handleEditAd = async (id) => {
    try {
      console.log("Hanndle Edit Reached");
      //await apiService.posts.archive(id);

      fetchAds();
      setRefreshing(false);
    } catch (error) {
      console.error("Error archiving ad:", error);
    }
  };

  const handleUnarchiveAd = async (item, tab = "archived") => {
    if (!item?.id) return;

    try {
      setDeletingIds((prev) => [...prev, item.id]); // ✅ correct for array

      const payload = {
        category_id: item.category_id,
        post_type_id: item.post_type_id,
        title: item.title,
        description: item.description,
        contact_name: item.contact_name || item.name || "Unknown",
        city_id: item.city_id,
        email: item.email,
        price: item.price,
        archived_at: null,
        archived_manually_at: null,
        reviewed_at: null, // Reset reviewed_at
        // Add any other fields you need to reset
      };

      const response = await postsService.posts.toggleArchive(item.id, payload);

      if (response?.data?.success) {
        if (tab === "archived") {
          setArchivedAds((prev) => prev?.filter((ad) => ad.id !== item.id));
        } else {
          setPendingAds((prev) => prev?.filter((ad) => ad.id !== item.id));
        }
      } else {
        console.warn(
          "Failed to unarchive:",
          response?.data?.message || "Unknown error"
        );
        alert("Failed to unarchive this post.");
      }
    } catch (error) {
      console.error("Unarchive error:", error);
      alert("An error occurred while unarchiving.");
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  const handleDeleteAd = async (adId, type = "pending") => {
    if (!adId) return;

    try {
      // Start spinner
      setDeletingIds((prev) => [...prev, adId]);

      const response = await postsService.posts.delete(adId);

      // Check for successful response
      if (response?.data?.success) {
        if (type === "pending") {
          setPendingAds((prev) => prev?.filter((item) => item.id !== adId));
        } else if (type === "archived") {
          setArchivedAds((prev) => prev?.filter((item) => item.id !== adId));
        } else {
          console.warn("Unknown delete type:", type);
        }
      } else {
        alert("Failed to delete the ad.");
        console.warn(
          "Delete failed:",
          response?.data?.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
      alert("An error occurred while deleting the ad.");
    } finally {
      // Stop spinner
      setDeletingIds((prev) => prev.filter((id) => id !== adId));
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
        onPress={() => navigation.navigate("ItemDetails", { itemId: data.id })}
      >
        <View
          style={{
            flexDirection: "row",
            borderBottomColor: colors.border,
            paddingBottom: 0,
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
              <Text
                style={{
                  ...FONTS.fontSm,
                  color: colors.card,
                  paddingHorizontal: 5,
                }}
              >
                {data.archived_at ? "ARCHIVED" : "PENDING"}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 10,
            paddingBottom: 0,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
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
            onPress={() => {
              if (!deletingIds.includes(data.id)) {
                isPending
                  ? moresheetPending.current?.openSheet(data)
                  : moresheetArchived.current?.openSheet(data);
              }
            }}
            style={[
              GlobalStyleSheet.background,
              {
                marginRight: 5,
                height: 40,
                width: 40,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            {deletingIds.includes(data.id) ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Image
                style={{ height: 20, width: 20, tintColor: colors.title }}
                source={IMAGES.more}
              />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Skeleton placeholder for ad item
  const renderSkeletonAd = () => (
    <View
      style={[
        GlobalStyleSheet.shadow2,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          padding: 10,
          paddingLeft: 20,
          marginBottom: 20,
          borderRadius: 8,
        },
      ]}
    >
      <View style={{ flexDirection: "row", paddingBottom: 0 }}>
        {/* Image skeleton */}
        <Skeleton colorMode="light" radius={6} width={70} height={70} />
        {/* Text container */}
        <View style={{ marginLeft: 10, flex: 1 }}>
          {/* Title skeleton */}
          <Skeleton
            colorMode="light"
            radius={4}
            width={"70%"}
            height={16}
            style={{ marginBottom: 6, marginTop: 4 }}
          />
          {/* Price skeleton */}
          <Skeleton
            colorMode="light"
            radius={4}
            width={"40%"}
            height={14}
            style={{ marginBottom: 6 }}
          />
          {/* Status badge skeleton */}
          <Skeleton
            colorMode="light"
            radius={20}
            width={100}
            height={24}
            style={{ marginTop: 8 }}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 10,
          paddingBottom: 0,
        }}
      >
        {/* Views and likes skeleton */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
          <Skeleton colorMode="light" radius={4} width={60} height={14} />
          <Skeleton
            colorMode="light"
            radius={4}
            width={60}
            height={14}
            style={{ marginLeft: 10 }}
          />
        </View>
        {/* More button skeleton */}
        <Skeleton colorMode="light" radius={20} width={40} height={40} />
      </View>
    </View>
  );

  return (
    <>
      <RNScrollView
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
                  <TouchableOpacity style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        ...FONTS.h6,
                        ...FONTS.fontMedium,
                        color: COLORS.title,
                      }}
                    >
                      {miniStats.visits}
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
                  <TouchableOpacity style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        ...FONTS.h6,
                        ...FONTS.fontMedium,
                        color: COLORS.title,
                      }}
                    >
                      {miniStats.favourite}
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

                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.primary,
                    padding: 10,
                    borderRadius: 50,
                    position: "absolute",
                    top: 10,
                    right: 10,
                  }}
                  onPress={() => navigation.navigate("Editprofile")}
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
              <View
                style={{
                  backgroundColor: COLORS.primary,
                  width: "50%",
                  height: 3,
                  position: "absolute",
                  bottom: 0,
                  left: currentIndex === 0 ? 0 : "50%",
                }}
              />
            </View>
          </View>

          {error ? (
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
              {currentIndex === 0 ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{ paddingHorizontal: 10, paddingBottom: 80 }}>
                    {loading ? (
                      Array(5)
                        .fill(null)
                        .map((_, i) => (
                          <React.Fragment key={`skel-pending-${i}`}>
                            {renderSkeletonAd()}
                          </React.Fragment>
                        ))
                    ) : pendingAds.length > 0 ? (
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
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{ paddingHorizontal: 10, paddingBottom: 80 }}>
                    {loading ? (
                      Array(3)
                        .fill(null)
                        .map((_, i) => (
                          <React.Fragment key={`skel-archived-${i}`}>
                            {renderSkeletonAd()}
                          </React.Fragment>
                        ))
                    ) : archivedAds.length > 0 ? (
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
              )}
            </View>
          )}
        </SafeAreaView>
      </RNScrollView>

      <MyprofileSheet ref={moresheetPending} actions={actionsPending} />
      <MyprofileSheet ref={moresheetArchived} actions={actionsArchived} />
    </>
  );
};

export default Profile;
