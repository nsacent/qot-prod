import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from "@react-navigation/native";
import Header from "../../layout/Header";
import { COLORS, FONTS, IMAGES, SIZES } from "../../constants/theme";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import FeatherIcon from "react-native-vector-icons/Feather";
import { AuthContext } from "../../context/AuthProvider";
import { ScrollView } from "react-native-gesture-handler";
import MyadsSheet from "../../components/BottomSheet/MyadsSheet";
import { Skeleton } from "moti/skeleton";
import postsService from "../../../src/services/postsService";
import ConfirmModal from "../../components/Modal/ConfirmModal";

const Myads = ({ navigation }) => {
  const { userToken } = useContext(AuthContext);
  const theme = useTheme();
  const { colors } = theme;

  // Refs
  const scrollRef = useRef();
  const moresheet = useRef();
  const scrollX = useRef(new Animated.Value(0)).current;

  // States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ads, setAds] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [allFavorites, setAllFavorites] = useState([]);
  const [hasMoreFavorites, setHasMoreFavorites] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]); // Track multiple deletions
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Slide indicator animation
  const slideIndicator = scrollX.interpolate({
    inputRange: [
      0,
      SIZES.width > SIZES.container ? SIZES.container : SIZES.width,
    ],
    outputRange: [0, (SIZES.width - 30) / 2],
    extrapolate: "clamp",
  });

  const formatPrice = (price, currencyCode) => {
    const amount = parseFloat(price || 0);
    if (currencyCode === "UGX") return `${amount.toLocaleString()} UGX`;
    return `$${amount.toLocaleString()}`;
  };

  // --- API calls (embed city) -------------------------------------------------
  const fetchAdsData = async () => {
    // detailed=1 will include relationships (incl. city) without needing embed
    return await postsService.posts.getAll({
      belongLoggedUser: 1,
      detailed: 1,
      noCache: 1,
    });
  };

  const fetchFavoritesData = async (page = 1) => {
    let savedResponse;

    try {
      savedResponse = await postsService.posts.getFavorite({ page });
      if (!savedResponse?.data?.result) {
        console.error("Invalid response structure from getFavorite");
        return { data: { result: { data: [] } } };
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      return { data: { result: { data: [] } } };
    }

    const resultMeta = savedResponse.data.result.meta || {};
    const resultData = savedResponse.data.result.data || [];

    if (page >= resultMeta.last_page) {
      setHasMoreFavorites(false);
    }

    // Pull each post with city + pictures embedded (lightweight vs detailed=1)
    const postDetails = await Promise.all(
      resultData.map(async (savedItem) => {
        try {
          const postResponse = await postsService.posts.getById(
            savedItem.post_id,
            {
              embed: "city,pictures",
              noCache: 1,
            }
          );
          return {
            ...postResponse.data.result,
            saved_at_formatted: savedItem.saved_at_formatted,
          };
        } catch (error) {
          console.error(`Failed to fetch post ${savedItem.post_id}:`, error);
          return null;
        }
      })
    ).then((results) => results.filter(Boolean));

    return { data: { result: { data: postDetails } } };
  };

  // --- Item formatting (no cityService) --------------------------------------
  const processItems = (items) => {
    return items.map((item) => ({
      ...item,
      id: String(item.id),
      cityName: item?.city?.name || "",
      priceFormatted: formatPrice(item.price, item.currency_code),
      pictures: item.pictures || [],
      views_count: item.visits || 0,
      saved_at_formatted: item.saved_at_formatted || null,
    }));
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [adsResponse, favoritesResponse] = await Promise.all([
        fetchAdsData(),
        fetchFavoritesData(1),
      ]);

      const [processedAds, processedFavorites] = await Promise.all([
        processItems(adsResponse?.data?.result?.data || []),
        processItems(favoritesResponse?.data?.result?.data || []),
      ]);

      setAds(processedAds);
      setAllFavorites(processedFavorites);
      setFavourites(processedFavorites);
    } catch (error) {
      console.error("Initialization error:", error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    if (error?.response) {
      if (error.response.status === 401)
        return "Session expired. Please login again.";
      if (error.response.status === 404) return "Resource not found.";
      return `Server error: ${error.response.status}`;
    }
    if (error?.request) return "Network error. Please check your connection.";
    return "An unexpected error occurred.";
  };

  const loadMoreFavorites = async () => {
    if (!hasMoreFavorites || loading) return;

    try {
      const nextPage = favoritesPage + 1;
      const response = await fetchFavoritesData(nextPage);
      const newFavorites = processItems(response.data.result.data);

      setAllFavorites((prev) => [...prev, ...newFavorites]);
      setFavourites((prev) => [...prev, ...newFavorites]);
      setFavoritesPage(nextPage);
    } catch (error) {
      console.error("Error loading more favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
      setFavoritesPage(1);
      setHasMoreFavorites(true);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleFavorite = async (postId) => {
    try {
      const isFavorited = favourites.some((item) => item.id === String(postId));

      if (isFavorited) {
        // Delete favorite by saved-record id or by post id depending on your backend:
        // Assuming your API uses post id for deleteFavorite:
        await postsService.posts.deleteFavorite(postId);
        setFavourites((prev) =>
          prev.filter((item) => item.id !== String(postId))
        );
        setAllFavorites((prev) =>
          prev.filter((item) => item.id !== String(postId))
        );
      } else {
        // Pull post with city + pictures for UI
        const response = await postsService.posts.getById(postId, {
          embed: "city,pictures",
          noCache: 1,
        });
        const [newFavorite] = processItems([response.data.result]);

        // Create favorite (expects { post_id })
        await postsService.posts.makeFavorite(postId);

        setFavourites((prev) => [...prev, newFavorite]);
        setAllFavorites((prev) => [...prev, newFavorite]);
      }

      return true;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorites. Please try again.");
      return false;
    }
  };

  const onPressTouch = (index) => {
    setCurrentIndex(index);
    scrollRef.current?.scrollTo({ x: SIZES.width * index, animated: true });
  };

  const handleDelete = async (adId) => {
    try {
      setDeletingIds((prev) => [...prev, adId]);
      await postsService.posts.delete(adId);
      setAds((prev) => prev.filter((item) => item.id !== adId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete ad. Please try again.");
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== adId));
    }
  };

  const getImageSource = (item) => {
    const main = item?.picture?.url?.medium || item?.pictures?.[0]?.url?.medium;

    return main ? { uri: main } : IMAGES.car1;
  };

  const handleArchive = async (item) => {
    if (!item?.id) return;

    try {
      setDeletingIds((prev) => [...prev, item.id]);

      const now = new Date().toISOString();
      const payload = {
        category_id: item.category_id,
        post_type_id: item.post_type_id,
        title: item.title,
        description: item.description,
        contact_name: item.contact_name || item.name || "Unknown",
        city_id: item.city_id,
        email: item.email,
        price: item.price,
        archived_at: now,
        archived_manually_at: now,
      };

      const response = await postsService.posts.toggleArchive(item.id, payload);

      if (response?.data?.success) {
        setAds((prev) => prev.filter((ad) => ad.id !== item.id));
        moresheet.current?.close?.();
      } else {
        console.warn(
          "Failed to archive:",
          response.data?.message || "Unknown error"
        );
        alert("Failed to archive this post.");
      }
    } catch (error) {
      console.error("Archive error:", error);
      alert("An error occurred while archiving.");
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  const AdItem = ({ item, onMorePress, deletingIds, onRequestDelete }) => {
    const isDeleting = deletingIds.includes(item.id);
    const [isProcessing, setIsProcessing] = useState(false);
    const isFavorited = favourites.some((fav) => fav.id === item.id);

    const handleToggleFavorite = async () => {
      setIsProcessing(true);
      await toggleFavorite(parseInt(item.id, 10));
      setIsProcessing(false);
    };

    return (
      <TouchableOpacity
        style={[
          GlobalStyleSheet.shadow2,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 10,
            paddingLeft: 20,
            marginBottom: 20,
          },
        ]}
        onPress={() => navigation.navigate("ItemDetails", { itemId: item.id })}
      >
        <TouchableOpacity
          style={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
          onPress={() => onMorePress(item)}
        >
          <Image
            source={IMAGES.more}
            style={{
              width: 18,
              height: 18,
              resizeMode: "contain",
              tintColor: colors.title,
            }}
          />
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingBottom: 10,
          }}
        >
          <Image
            style={{ height: 70, width: 70, borderRadius: 6 }}
            source={getImageSource(item)}
            resizeMode="cover"
            onError={(e) =>
              console.log("Image load error:", e.nativeEvent.error)
            }
          />
          <View style={{ marginLeft: 10 }}>
            <Text
              numberOfLines={1}
              style={{
                ...FONTS.fontSm,
                ...FONTS.fontSemiBold,
                color: colors.title,
                paddingRight: 150,
              }}
            >
              {item.title}
            </Text>
            <Text
              style={{
                ...FONTS.font,
                ...FONTS.fontMedium,
                color: colors.title,
                marginTop: 2,
              }}
            >
              {item.priceFormatted}
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
              <Text style={{ ...FONTS.fontSm, color: colors.card }}>
                ACTIVE
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
                Views :
              </Text>
              <Text style={{ ...FONTS.fontXs, color: colors.title }}>
                {item.views_count}
              </Text>
            </View>

            <View
              style={{
                height: 15,
                width: 1,
                backgroundColor: colors.borderColor,
              }}
            />

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <TouchableOpacity
                onPress={handleToggleFavorite}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Image
                    style={{
                      width: 15,
                      height: 15,
                      resizeMode: "contain",
                      tintColor: isFavorited ? COLORS.primary : colors.text,
                    }}
                    source={IMAGES.like}
                  />
                )}
              </TouchableOpacity>
              <Text style={{ ...FONTS.fontXs, color: colors.text }}>
                Likes :
              </Text>
              <Text style={{ ...FONTS.fontXs, color: colors.title }}>
                {item.likes_count}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              GlobalStyleSheet.background,
              {
                marginRight: 5,
                height: 40,
                width: 40,
                backgroundColor: theme.dark
                  ? "rgba(255,255,255,.1)"
                  : "rgba(0,0,0,.1)",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
            onPress={() => onRequestDelete(item.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={colors.title} />
            ) : (
              <Image
                style={{ height: 20, width: 20, tintColor: colors.title }}
                source={IMAGES.delete}
              />
            )}
          </TouchableOpacity>
        </View>

        <View
          style={{
            width: 5,
            height: 150,
            backgroundColor: COLORS.primary,
            position: "absolute",
            left: -1,
            borderTopLeftRadius: 6,
            borderBottomLeftRadius: 6,
          }}
        />
      </TouchableOpacity>
    );
  };

  const FavoriteItem = ({ item }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleToggleFavorite = async () => {
      setIsProcessing(true);
      await toggleFavorite(parseInt(item.id, 10));
      setIsProcessing(false);
    };

    return (
      <TouchableOpacity
        style={[
          GlobalStyleSheet.shadow2,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 10,
            marginBottom: 20,
          },
        ]}
        onPress={() => navigation.navigate("ItemDetails", { itemId: item.id })}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", flex: 1 }}>
            <Image
              style={{ width: 70, height: 70, borderRadius: 6 }}
              source={getImageSource(item)}
              resizeMode="cover"
              onError={(e) =>
                console.log("Image load error:", e.nativeEvent.error)
              }
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text
                style={{
                  ...FONTS.font,
                  ...FONTS.fontMedium,
                  color: colors.title,
                  fontSize: 16,
                }}
              >
                {item.priceFormatted}
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
                <FeatherIcon size={12} color={colors.text} name={"map-pin"} />
                <Text
                  style={[
                    FONTS.fontXs,
                    { fontSize: 11, color: colors.text, marginLeft: 4 },
                  ]}
                >
                  {item.cityName /* or item.city?.name */}
                </Text>
              </View>
              {item.saved_at_formatted && (
                <Text
                  style={[
                    FONTS.fontXs,
                    { fontSize: 11, color: colors.text, marginTop: 5 },
                  ]}
                >
                  Saved: {item.saved_at_formatted}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            disabled={isProcessing}
          >
            <View style={{ marginRight: 10 }}>
              {isProcessing ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Image
                  style={{
                    width: 25,
                    height: 25,
                    resizeMode: "contain",
                    tintColor: COLORS.primary,
                  }}
                  source={IMAGES.like}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const TabHeader = () => (
    <View
      style={[
        GlobalStyleSheet.container,
        { paddingTop: 10, paddingHorizontal: 10, padding: 0 },
      ]}
    >
      <View style={{ flexDirection: "row", marginTop: 0, marginBottom: 0 }}>
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
            Active Ads
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
            Favorites
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
        />
      </View>
    </View>
  );

  const renderAdsTab = () => (
    <View
      style={{
        marginTop: 20,
        width: SIZES.width > SIZES.container ? SIZES.container : SIZES.width,
        flex: 1,
        paddingBottom: 80,
      }}
    >
      {loading ? (
        <View style={{ paddingHorizontal: 10 }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton.Group key={i}>
              <View
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  padding: 10,
                  paddingLeft: 20,
                  marginBottom: 20,
                  borderRadius: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    paddingBottom: 10,
                  }}
                >
                  <Skeleton
                    width={70}
                    height={70}
                    radius={6}
                    colorMode="light"
                  />

                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Skeleton
                      height={14}
                      width="80%"
                      radius="round"
                      colorMode="light"
                    />
                    <Skeleton
                      height={14}
                      width="50%"
                      radius="round"
                      style={{ marginTop: 6 }}
                      colorMode="light"
                    />
                    <Skeleton
                      height={18}
                      width={100}
                      radius={20}
                      style={{ marginTop: 10 }}
                      colorMode="light"
                    />
                  </View>

                  <Skeleton
                    width={18}
                    height={18}
                    radius={9}
                    colorMode="light"
                    style={{ position: "absolute", right: 50, top: 5 }}
                  />
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 10,
                  }}
                >
                  <View style={{ flexDirection: "row", gap: 20 }}>
                    <Skeleton
                      width={60}
                      height={10}
                      radius="round"
                      colorMode="light"
                    />
                    <Skeleton
                      width={60}
                      height={10}
                      radius="round"
                      colorMode="light"
                    />
                  </View>
                  <Skeleton
                    width={40}
                    height={40}
                    radius={20}
                    colorMode="light"
                  />
                </View>
              </View>
            </Skeleton.Group>
          ))}
        </View>
      ) : error ? (
        <Text
          style={{
            ...FONTS.fontRegular,
            color: colors.text,
            textAlign: "center",
            marginTop: 20,
          }}
        >
          {error}
        </Text>
      ) : ads.length > 0 ? (
        <>
          <FlatList
            data={ads}
            renderItem={({ item }) => (
              <AdItem
                item={item}
                onMorePress={(item) => {
                  setSelectedItem(item);
                  moresheet.current?.openSheet();
                }}
                deletingIds={deletingIds}
                onRequestDelete={(id) => {
                  setConfirmTargetId(id);
                  setShowConfirm(true);
                }}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          />

          <ConfirmModal
            visible={showConfirm}
            onRequestClose={() => setShowConfirm(false)}
            iconName="trash-outline"
            iconColor={COLORS.danger}
            iconSize={65}
            title="Confirm Delete"
            message="Are you sure you want to delete this ad?"
            confirmText="Yes, Delete"
            cancelText="Cancel"
            onConfirm={() => {
              setShowConfirm(false);
              if (confirmTargetId) handleDelete(confirmTargetId);
            }}
            onCancel={() => {
              setShowConfirm(false);
              setConfirmTargetId(null);
            }}
            confirmButtonProps={{ color: COLORS.danger }}
            cancelButtonProps={{ outline: true, color: COLORS.primary }}
          />
        </>
      ) : (
        <Text
          style={{
            ...FONTS.fontRegular,
            color: colors.text,
            textAlign: "center",
            marginTop: 20,
          }}
        >
          You haven't posted any ads yet.
        </Text>
      )}
    </View>
  );

  const renderFavoritesTab = () => (
    <View
      style={{
        marginTop: 20,
        width: SIZES.width > SIZES.container ? SIZES.container : SIZES.width,
        flex: 1,
        paddingBottom: 80,
      }}
    >
      {loading ? (
        <View style={{ paddingHorizontal: 10 }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton.Group key={i}>
              <View
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  padding: 10,
                  marginBottom: 20,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {/* Image */}
                <Skeleton width={70} height={70} radius={6} colorMode="light" />

                {/* Text block */}
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Skeleton
                    height={14}
                    width="40%"
                    radius="round"
                    colorMode="light"
                  />
                  <Skeleton
                    height={12}
                    width="90%"
                    radius="round"
                    colorMode="light"
                    style={{ marginTop: 6 }}
                  />
                  <Skeleton
                    height={10}
                    width="30%"
                    radius="round"
                    colorMode="light"
                    style={{ marginTop: 6 }}
                  />
                  <Skeleton
                    height={10}
                    width="60%"
                    radius="round"
                    colorMode="light"
                    style={{ marginTop: 6 }}
                  />
                </View>

                {/* Heart Icon */}
                <Skeleton
                  width={25}
                  height={25}
                  radius={12.5}
                  colorMode="light"
                  style={{ marginLeft: 10 }}
                />
              </View>
            </Skeleton.Group>
          ))}
        </View>
      ) : favourites.length > 0 ? (
        <FlatList
          data={favourites}
          renderItem={({ item }) => <FavoriteItem item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          onEndReached={loadMoreFavorites}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            hasMoreFavorites ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
        />
      ) : (
        <Text
          style={{
            ...FONTS.fontRegular,
            color: colors.text,
            textAlign: "center",
            marginTop: 20,
          }}
        >
          No favorites yet.
        </Text>
      )}
    </View>
  );

  useEffect(() => {
    loadInitialData();
  }, [userToken]);

  return (
    <>
      <SafeAreaView
        style={{ backgroundColor: colors.card, flex: 1, paddingBottom: 80 }}
      >
        <Header
          title="My Ads"
          leftIcon={"back"}
          titleLeft
          onPressLeft={() => navigation.goBack()}
        />

        <TabHeader />

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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            pagingEnabled
            ref={scrollRef}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              {
                useNativeDriver: false,
              }
            )}
            onMomentumScrollEnd={(e) => {
              const offsetX = e.nativeEvent.contentOffset.x;
              const screenWidth = SIZES.width;
              if (Math.round(offsetX) === Math.round(screenWidth)) {
                setCurrentIndex(1);
              } else if (Math.round(offsetX) === 0) {
                setCurrentIndex(0);
              } else {
                setCurrentIndex(0);
              }
            }}
          >
            {renderAdsTab()}
            {renderFavoritesTab()}
          </ScrollView>
        </View>

        <MyadsSheet
          ref={moresheet}
          onDelete={() => {
            setConfirmTargetId(selectedItem?.id);
            setShowConfirm(true);
          }}
          onEdit={() => {
            navigation.navigate("EditAd", { item: selectedItem });
          }}
          onArchive={() => {
            handleArchive(selectedItem);
          }}
        />
      </SafeAreaView>
    </>
  );
};

export default Myads;
