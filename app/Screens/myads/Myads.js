import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "../../layout/Header";
import { COLORS, FONTS, IMAGES, SIZES } from "../../constants/theme";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import FeatherIcon from "react-native-vector-icons/Feather";
import axios from "axios";
import { AuthContext } from "../../context/AuthProvider";
import { ScrollView } from "react-native-gesture-handler";
import MyadsSheet from "../../components/BottomSheet/MyadsSheet";
import { getCityName, preloadCities } from "../../../src/services/cityService";
import { Skeleton } from "moti/skeleton";
import postsService from "../../../src/services/postsService";

const API_BASE_URL = "https://qot.ug/api";

const Myads = ({ navigation }) => {
  const { userToken, userData } = useContext(AuthContext);
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
  const [citiesLoaded, setCitiesLoaded] = useState(false);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [allFavorites, setAllFavorites] = useState([]);
  const [hasMoreFavorites, setHasMoreFavorites] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]); // Track multiple deletions

  // Slide indicator animation
  const slideIndicator = scrollX.interpolate({
    inputRange: [
      0,
      SIZES.width > SIZES.container ? SIZES.container : SIZES.width,
    ],
    outputRange: [0, (SIZES.width - 30) / 2],
    extrapolate: "clamp",
  });

  const getHeaders = () => ({
    Authorization: `Bearer ${userToken}`,
    "Content-Type": "application/json",
    "X-AppApiToken": "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=",
  });

  const formatPrice = (price, currencyCode) => {
    const amount = parseFloat(price || 0);
    if (currencyCode === "UGX") {
      return `${amount.toLocaleString()} UGX`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const fetchWithRetry = async (url, options, retries = 3) => {
    try {
      return await axios(url, options);
    } catch (error) {
      if (retries <= 0) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
  };

  /*const fetchAdsData = async () => {
    const headers = getHeaders();
    return fetchWithRetry(
      `${API_BASE_URL}/posts?belongLoggedUser=1&embed=pictures`,
      {
        headers,
        timeout: 10000,
      }
    );
  };*/

  const fetchAdsData = async () => {
    return await postsService.posts.getAll({
      belongLoggedUser: 1,
      detailed: 1,
    });
  };

  const fetchFavoritesData = async (page = 1) => {
    const headers = getHeaders();

    const savedResponse = await fetchWithRetry(
      `${API_BASE_URL}/savedPosts?page=${page}`,
      {
        headers,
        timeout: 10000,
      }
    );

    if (page >= savedResponse.data.result.meta.last_page) {
      setHasMoreFavorites(false);
    }

    const postDetails = await Promise.all(
      savedResponse.data.result.data.map(async (savedItem) => {
        try {
          const postResponse = await fetchWithRetry(
            `${API_BASE_URL}/posts/${savedItem.post_id}?embed=pictures`,
            {
              headers,
              timeout: 10000,
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

  const processItemsWithCities = async (items, userToken) => {
    return Promise.all(
      items.map(async (item) => {
        const cityName = await getCityName(item.city_id, userToken);
        return {
          ...item,
          id: item.id.toString(),
          cityName,
          priceFormatted: formatPrice(item.price, item.currency_code),
          pictures: item.pictures || [],
          views_count: item.visits || 0,
          saved_at_formatted: item.saved_at_formatted || null,
        };
      })
    );
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      await preloadCities(userToken);

      const [adsResponse, favoritesResponse] = await Promise.all([
        fetchAdsData(),
        fetchFavoritesData(1),
      ]);

      const [processedAds, processedFavorites] = await Promise.all([
        processItemsWithCities(
          adsResponse?.data?.result?.data || [],
          userToken
        ),
        processItemsWithCities(
          favoritesResponse?.data?.result?.data || [],
          userToken
        ),
      ]);

      setAds(processedAds);
      setAllFavorites(processedFavorites);
      setFavourites(processedFavorites);
    } catch (error) {
      console.error("Initialization error:", error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
      setCitiesLoaded(true);
    }
  };

  const getErrorMessage = (error) => {
    if (error.response) {
      if (error.response.status === 401)
        return "Session expired. Please login again.";
      if (error.response.status === 404) return "Resource not found.";
      return `Server error: ${error.response.status}`;
    }
    if (error.request) return "Network error. Please check your connection.";
    return "An unexpected error occurred.";
  };

  const loadMoreFavorites = async () => {
    if (!hasMoreFavorites || loading) return;

    try {
      // setLoading(true);
      const nextPage = favoritesPage + 1;
      const response = await fetchFavoritesData(nextPage);
      const newFavorites = await processItemsWithCities(
        response.data.result.data,
        userToken
      );

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
      const headers = getHeaders();
      const isFavorited = favourites.some(
        (item) => item.id === postId.toString()
      );

      if (isFavorited) {
        await axios.delete(`${API_BASE_URL}/savedPosts/${postId}`, { headers });
        setFavourites((prev) =>
          prev.filter((item) => item.id !== postId.toString())
        );
        setAllFavorites((prev) =>
          prev.filter((item) => item.id !== postId.toString())
        );
      } else {
        const response = await axios.get(
          `${API_BASE_URL}/posts/${postId}?embed=pictures`,
          { headers }
        );
        const newFavorite = await processItemsWithCities(
          [response.data.result],
          userToken
        );
        await axios.post(
          `${API_BASE_URL}/savedPosts`,
          { post_id: postId },
          { headers }
        );
        setFavourites((prev) => [...prev, ...newFavorite]);
        setAllFavorites((prev) => [...prev, ...newFavorite]);
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
      setDeletingIds((prev) => [...prev, adId]); // Add to deleting array
      const headers = getHeaders();
      await axios.delete(`${API_BASE_URL}/posts/${adId}`, { headers });
      setAds((prev) => prev.filter((item) => item.id !== adId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete ad. Please try again.");
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== adId)); // Remove from deleting array
    }
  };

  const getImageSource = (pictures) => {
    if (!pictures || !Array.isArray(pictures) || pictures.length === 0) {
      return IMAGES.car1;
    }

    const firstPicture = pictures[0];
    if (!firstPicture?.url?.medium) {
      return IMAGES.car1;
    }

    return { uri: firstPicture.url.medium };
  };

  const AdItem = ({ item, onDelete, onMorePress, deletingIds }) => {
    const isDeleting = deletingIds.includes(item.id);
    const [isProcessing, setIsProcessing] = useState(false);
    const isFavorited = favourites.some((fav) => fav.id === item.id);

    const handleToggleFavorite = async () => {
      setIsProcessing(true);
      await toggleFavorite(parseInt(item.id));
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
            source={getImageSource(item.pictures)}
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
            <TouchableOpacity
              style={{
                position: "absolute",
                right: 50,
                margin: 10,
                marginTop: 5,
              }}
              onPress={() => onMorePress(item.id)}
            >
              <Image
                style={{
                  width: 18,
                  height: 18,
                  resizeMode: "contain",
                  tintColor: colors.title,
                }}
                source={IMAGES.more}
              />
            </TouchableOpacity>
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
            ></View>
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
            onPress={() => onDelete(item.id)}
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
        ></View>
      </TouchableOpacity>
    );
  };

  const FavoriteItem = ({ item }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleToggleFavorite = async () => {
      setIsProcessing(true);
      await toggleFavorite(parseInt(item.id));
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
        onPress={() => navigation.navigate("ItemDetails", { id: item.id })}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", flex: 1 }}>
            <Image
              style={{ width: 70, height: 70, borderRadius: 6 }}
              source={getImageSource(item.pictures)}
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
                  {item.cityName}
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
            Ads
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
            Favourites
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
        <FlatList
          data={ads}
          renderItem={({ item }) => (
            <AdItem
              item={item}
              onDelete={handleDelete}
              onMorePress={(id) => moresheet.current?.openSheet(id)}
              deletingIds={deletingIds}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 10 }}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
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
    <SafeAreaView
      style={{ backgroundColor: colors.card, flex: 1, paddingBottom: 80 }}
    >
      <Header
        title="My Ads"
        leftIcon={"back"}
        titleLeft
        onPressLeft={() => navigation.goBack()}
      />

      {!citiesLoaded && (
        <View style={{ padding: 20 }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}

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
          pagingEnabled
          ref={scrollRef}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
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

      <MyadsSheet ref={moresheet} onDelete={handleDelete} />
    </SafeAreaView>
  );
};

export default Myads;
