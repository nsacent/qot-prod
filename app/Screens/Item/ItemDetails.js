import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
  Share,
  Platform,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import FeatherIcon from "react-native-vector-icons/Feather";
import { COLORS, FONTS, IMAGES, SIZES } from "../../constants/theme";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import ButtonLight from "../../components/Button/ButtonLight";
import ButtonOutline from "../../components/Button/ButtonOutline";
import Button from "../../components/Button/Button";
import { AuthContext } from "../../context/AuthProvider";
import axios from "axios";
import LikeBtn from "../../components/LikeBtn";
import MapView, { Marker } from "react-native-maps";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import getSpecIcon from "../../../src/utils/getSpecIcon";
import SimilarAds from "./SimilarAds";
import ReportAdOptionsSheet from "../../components/BottomSheet/ReportAdOptionsSheet";
import ReportMessageSheet from "../../components/BottomSheet/ReportMessageSheet";
import RBSheet from "react-native-raw-bottom-sheet";
import MakeOfferSheet from "../../components/BottomSheet/MakeOfferSheet";
import postsService from "../../../src/services/postsService";
import AdImageCarousel from "../Components/AdImageCarousel";
import { SafeAreaView } from 'react-native-safe-area-context';


const ItemDetails = ({ navigation, route }) => {
  const { itemId } = route.params;
  const { userToken, userData } = useContext(AuthContext);
  const theme = useTheme();
  const { colors } = theme;

  const reportOptionsRef = useRef();
  const reportMessageRef = useRef();
  const [selectedReason, setSelectedReason] = useState("");
  const makeOfferRef = useRef(null);

  const openReportOptions = () => reportOptionsRef.current?.expand();
  const openMakeOffer = () => makeOfferRef.current?.open();

  // States
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [similarItems, setSimilarItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  //Reports sheets and hadling
  const handleSelectReason = (reason) => {
    setSelectedReason(reason);
    sheetOptionsRef.current?.close();
    setTimeout(() => {
      sheetFormRef.current?.expand();
    }, 300);
  };

  const handleSubmitReport = async ({ reason, message }) => {
    setIsSubmitting(true);
    try {
      // Send to API
      await axios.post(
        `https://qot.ug/api/reports`,
        {
          post_id: item.id,
          reason,
          message,
        },
        { headers }
      );

      alert("Report submitted");
      sheetFormRef.current?.close();
    } catch (err) {
      alert("Failed to submit report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfferSubmit = async ({ amount, message }) => {
    // TODO: integrate with your backend.
    // Option A (common): create/continue a thread with seller and send a message flagged as "offer"
    // Example (pseudo):
    //
    // await axios.post(`${API_BASE_URL}/threads`, {
    //   to_user_id: listing.sellerId,
    //   post_id: listing.id,
    //   message: `Offer ${currency}${amount}${message ? ` — ${message}` : ""}`,
    // }, { headers });
    //
    // Or if you have a dedicated offers endpoint, call that instead:
    // await axios.post(`${API_BASE_URL}/offers`, { post_id: listing.id, amount, message }, { headers });

    // For now, just log it or show a toast/snackbar
    console.log("Offer submitted", { amount, message });
  };

  // Fetch item details
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);

        const itemResponse = await postsService.posts.getById(itemId, {
          detailed: 1, // includes relationships, embed not needed
          noCache: 1,
          // embed is ignored when detailed=1
        });

        const itemData = itemResponse.data.result;
        const itemExtra = itemResponse.data.extra;

        setItem({
          ...itemData,
          ...itemExtra,
          priceFormatted:
            itemData.price_formatted ||
            formatPrice(itemData.price, itemData.currency_code),
          createdDate: new Date(itemData.created_at).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          ),
        });

        // Fetch similar items from same category
        if (itemData.category_id) {
          const similarResponse = await postsService.posts.getAll({
            category: itemData.category_id,
            perPage: 4,
            embed: "pictures",
          });

          setSimilarItems(
            similarResponse.data?.result?.data.map((item) => ({
              ...item,
              priceFormatted:
                item?.price_formatted ||
                formatPrice(item?.price, item?.currency_code),
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [itemId, userToken]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItemDetails(); // Move fetch function out of useEffect
    setRefreshing(false);
  };

  const formatPrice = (price, currencyCode) => {
    const amount = parseFloat(price || 0);
    if (currencyCode === "UGX") {
      return `${amount.toLocaleString()} UGX`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const onShare = async () => {
    try {
      setIsProcessing(true);
      const result = await Share.share({
        message: `Check out this item: ${item.title} - ${item.price_formatted}`,
        url: item.url || `https://qot.ug/items/${itemId}`,
      });
    } catch (error) {
      console.error("Share error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReportSubmit = (message) => {
    reportMessageRef.current?.close();
    console.log("Final Report: ", { selectedReason, message });
    // Optionally send to API here
  };

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    reportOptionsRef.current?.close();
    setTimeout(() => reportMessageRef.current?.open(), 300);
  };

  const handleMakeOffer = () => {
    navigation.navigate("MakeOffer", {
      itemId,
      sellerId: item.user_id,
      itemTitle: item.title,
      itemPrice: item.price,
    });
  };

  const handleChat = () => {
    navigation.navigate("Chat", {
      recipientId: item.user_id,
      itemId,
      itemTitle: item.title,
      itemPrice: item.price_formatted,
    });
  };

  const handleCall = () => {
    if (item.phone) {
      Linking.openURL(`tel:${item.phone}`);
    }
  };

  const handleViewProfile = () => {
    navigation.navigate("Anotherprofile", { userId: item.user_id });
  };

  if (loading || !item) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.card, // <== add this
          padding: 20,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  // Get images for swiper - use pictures array if available, otherwise use main picture
  const itemImages =
    item.pictures && Array.isArray(item.pictures) && item.pictures.length > 0
      ? item.pictures
        .filter((pic) => !!pic?.url?.large) // filter out bad data
        .map((pic) => ({ uri: pic.url.large }))
      : item.picture?.url?.large
        ? [{ uri: item.picture.url.large }]
        : [{ uri: null }]; // fallback to avoid undefined

  const renderTags = () => {
    if (!Array.isArray(item?.tags) || item.tags.length === 0) return null;

    return (
      <>
        <Text
          style={[
            FONTS.fontSm,
            FONTS.fontMedium,
            { color: colors.title, marginBottom: 8, marginTop: 20 },
          ]}
        >
          Tags
        </Text>

        <View
          style={{
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 12,
            backgroundColor: colors.card,
          }}
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {item.tags.map((tag, idx) => (
              <View
                key={`${tag}-${idx}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.05)",
                  borderRadius: 999,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <FontAwesome
                  name="tag"
                  size={12}
                  color={COLORS.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[FONTS.fontXs, { color: colors.title }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </>
    );
  };

  const renderCategoryHierarchy = (category) => {
    const hierarchy = [];
    let current = category;
    while (current) {
      hierarchy.unshift(current.name); // add name to start of array
      current = current.parent; // move up the hierarchy
    }

    return hierarchy.join(" > ");
  };

  // Render car specifications from fieldsValues

  const renderSpecifications = () => {
    const rawFields = item?.fieldsValues;

    // Convert object to array
    const fields = rawFields
      ? Object.values(rawFields).filter(
        (field) =>
          field.name.toLowerCase() !== "features" &&
          field.value !== null &&
          field.value !== ""
      )
      : [];

    if (fields.length === 0) return null;

    // Single spec layout
    if (fields.length === 1) {
      const field = fields[0];
      const displayValue =
        typeof field.value === "object"
          ? Object.values(field.value).join(", ")
          : String(field.value);

      return (
        <>
          <Text
            style={[
              FONTS.fontSm,
              FONTS.fontMedium,
              { color: colors.title, marginBottom: 10, marginTop: 20 },
            ]}
          >
            Specifications
          </Text>
          <View
            style={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 15,
              backgroundColor: colors.card,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <FontAwesome
                name={getSpecIcon(field.name)}
                size={14}
                color={COLORS.primary}
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    FONTS.fontXs,
                    FONTS.fontMedium,
                    { color: colors.title },
                  ]}
                >
                  {field.name}
                </Text>
                <Text
                  style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}
                >
                  {displayValue}
                </Text>
              </View>
            </View>
          </View>
        </>
      );
    }

    // Multiple specs layout
    const rows = [];
    for (let i = 0; i < fields.length; i += 2) {
      rows.push([fields[i], fields[i + 1]]);
    }

    return (
      <>
        <Text
          style={[
            FONTS.fontSm,
            FONTS.fontMedium,
            { color: colors.title, marginBottom: 10, marginTop: 20 },
          ]}
        >
          Specifications
        </Text>
        <View
          style={{
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 15,
            backgroundColor: colors.card,
          }}
        >
          {rows.map((pair, rowIndex) => (
            <View
              key={rowIndex}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              {pair.map((field, colIndex) => {
                if (!field) return <View key={colIndex} style={{ flex: 1 }} />;

                const displayValue =
                  typeof field.value === "object"
                    ? Object.values(field.value).join(", ")
                    : String(field.value);

                return (
                  <View
                    key={colIndex}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginRight: colIndex === 0 ? 10 : 0,
                    }}
                  >
                    <FontAwesome
                      name={getSpecIcon(field.name)}
                      size={14}
                      color={COLORS.primary}
                      style={{ marginTop: 2, marginRight: 8 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          FONTS.fontXs,
                          FONTS.fontMedium,
                          { color: colors.title },
                        ]}
                      >
                        {field.name}
                      </Text>
                      <Text
                        style={[
                          FONTS.fontXs,
                          { color: colors.text, marginTop: 2 },
                        ]}
                      >
                        {displayValue}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </>
    );
  };

  const renderFeatures = () => {
    if (!Array.isArray(item?.fieldsValues)) return null;

    const featuresField = item.fieldsValues.find(
      (field) => field.name.toLowerCase() === "features"
    );

    if (!featuresField || !featuresField.value) return null;

    const features = Object.values(featuresField.value);

    return (
      <>
        <Text
          style={[
            FONTS.fontSm,
            FONTS.fontMedium,
            { color: colors.title, marginBottom: 10, marginTop: 20 },
          ]}
        >
          Features
        </Text>

        <View
          style={{
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 15,
            backgroundColor: colors.card,
          }}
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.05)",
                  borderRadius: 8,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  margin: 5,
                }}
              >
                <FontAwesome
                  name="check-circle"
                  size={14}
                  color={COLORS.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[FONTS.fontXs, { color: colors.title }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Image Swiper */}
          <View
            style={{
              height:
                Platform.OS === "web" ? SIZES.height / 3.5 : SIZES.height / 2.8,
            }}
          >
            <AdImageCarousel
              images={itemImages}
              colors={colors}
              fallback={IMAGES.detail1}
            />

            {/* Header Actions */}
            <View
              style={[
                GlobalStyleSheet.container,
                {
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  flexDirection: "row",
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{
                    height: 38,
                    width: 38,
                    borderRadius: 38,
                    backgroundColor: "rgba(255,255,255,.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FeatherIcon
                    size={20}
                    color={COLORS.white}
                    name="chevron-left"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{
                  height: 38,
                  width: 38,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
                onPress={onShare}
                disabled={isProcessing}
              >
                <FeatherIcon size={20} color={COLORS.white} name="share-2" />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  height: 38,
                  width: 38,
                  borderRadius: 38,
                  backgroundColor: "rgba(255,255,255,.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LikeBtn
                  postId={item.id}
                  defaultLiked={!!item.p_saved_by_logged_user}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Item Details Section */}
          <View style={GlobalStyleSheet.container}>
            <Text
              style={[
                FONTS.h6,
                FONTS.fontMedium,
                { color: colors.title, marginBottom: 2 },
              ]}
            >
              {item.title}
            </Text>
            {item.category && (
              <View style={{ marginTop: 0, marginBottom: 8 }}>
                <Text style={[FONTS.fontXs, { color: colors.text }]}>
                  {renderCategoryHierarchy(item.category)}
                </Text>
              </View>
            )}
            <Text
              style={[
                FONTS.h5,
                { color: COLORS.primary, marginBottom: 10, fontSize: 25 },
              ]}
            >
              {item.price_formatted}
            </Text>

            {/* Basic Info */}
            <View
              style={{
                width: "100%",
                borderWidth: 1,
                borderRadius: 10,
                borderColor: colors.border,
                padding: 15,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-around",
                }}
              >
                {!!item.visits && (
                  <View style={{ alignItems: "center" }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <FeatherIcon
                        name="eye"
                        size={14}
                        color={colors.title}
                        style={{ opacity: 0.5 }}
                      />
                      <Text
                        style={[
                          FONTS.fontXs,
                          FONTS.fontMedium,
                          { color: colors.title },
                        ]}
                      >
                        Views
                      </Text>
                    </View>
                    <Text
                      style={[
                        FONTS.fontXs,
                        { color: colors.text, marginTop: 2 },
                      ]}
                    >
                      {item.visits}
                    </Text>
                  </View>
                )}
                {item.city?.name && (
                  <View style={{ alignItems: "center" }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <FeatherIcon
                        name="map-pin"
                        size={14}
                        color={colors.title}
                        style={{ opacity: 0.5 }}
                      />
                      <Text
                        style={[
                          FONTS.fontXs,
                          FONTS.fontMedium,
                          { color: colors.title },
                        ]}
                      >
                        Location
                      </Text>
                    </View>
                    <Text
                      style={[
                        FONTS.fontXs,
                        { color: colors.text, marginTop: 2 },
                      ]}
                    >
                      {item.city.name}
                    </Text>
                  </View>
                )}
                {item.created_at_formatted && (
                  <View style={{ alignItems: "center" }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <FeatherIcon
                        name="clock"
                        size={14}
                        color={colors.title}
                        style={{ opacity: 0.5 }}
                      />
                      <Text
                        style={[
                          FONTS.fontXs,
                          FONTS.fontMedium,
                          { color: colors.title },
                        ]}
                      >
                        Posted
                      </Text>
                    </View>
                    <Text
                      style={[
                        FONTS.fontXs,
                        { color: colors.text, marginTop: 2 },
                      ]}
                    >
                      {item.created_at_formatted}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Specifications */}
            {renderSpecifications()}
            {/* Features */}
            {renderFeatures()}
            {/* Description */}
            <Text
              style={[
                FONTS.fontSm,
                FONTS.fontMedium,
                { color: colors.title, marginBottom: 8, marginTop: 20 },
              ]}
            >
              Description
            </Text>

            <View
              style={{
                backgroundColor: "rgba(0,0,0,.05)",
                borderRadius: SIZES.radius,
                paddingHorizontal: 15,
                paddingVertical: 10,
                marginBottom: 15,
              }}
            >
              <Text
                style={[FONTS.fontXs, { color: colors.title, lineHeight: 20 }]}
              >
                {item.description || "No description provided"}
              </Text>
            </View>

            {/*Render Taga*/}
            {renderTags()}
          </View>

          {/* Seller Info */}
          <View style={GlobalStyleSheet.container}>
            <View
              style={{
                flexDirection: "row",
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                paddingBottom: 20,
              }}
            >
              <View>
                {item.user?.photo_url ? (
                  <Image
                    style={{ height: 100, width: 100, borderRadius: 50 }}
                    source={{
                      uri: `${item.user?.photo_url}?t=${new Date().getTime()}`,
                    }}
                  />
                ) : (
                  <Image
                    style={{ height: 100, width: 100, borderRadius: 15 }}
                    source={IMAGES.Small5}
                  />
                )}
              </View>
              <View
                style={{ marginLeft: 10, alignItems: "flex-start", flex: 1 }}
              >
                <Text
                  style={[FONTS.fontXs, { color: colors.text, marginTop: 5 }]}
                >
                  Posted by
                </Text>
                <Text
                  style={[FONTS.font, { color: colors.title, marginTop: 5 }]}
                >
                  {item.user?.name || "Unknown"}
                </Text>
                {item.created_at_formatted && (
                  <Text
                    style={[
                      FONTS.fontXs,
                      FONTS.fontMedium,
                      { color: colors.text, marginTop: 5 },
                    ]}
                  >
                    Posted: {item.created_at_formatted}
                  </Text>
                )}

                {item.user_id !== userData?.id && (
                  <View
                    style={{ flexDirection: "row", gap: 10, marginTop: 10 }}
                  >
                    <ButtonLight
                      onPress={handleViewProfile}
                      size={"sm"}
                      title="See Profile"
                    />
                    {item.phone && (
                      <ButtonLight
                        onPress={handleCall}
                        size={"sm"}
                        title="Call"
                        icon="phone"
                      />
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Location and Report */}
          <View style={GlobalStyleSheet.container}>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                paddingBottom: 20,
              }}
            >
              {/* Location Info */}
              <View style={{ alignItems: "flex-start", marginBottom: 15 }}>
                {item.city?.name && (
                  <View
                    style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}
                  >
                    <FeatherIcon
                      name="map-pin"
                      size={20}
                      color={colors.title}
                    />
                    <Text style={[FONTS.font, { color: colors.title }]}>
                      {item.city.name}
                    </Text>

                    <Text
                      style={[
                        FONTS.font,
                        FONTS.fontMedium,
                        { color: colors.title },
                      ]}
                    >
                      Ad ID: {item.id}
                    </Text>
                  </View>
                )}
              </View>

              {/* Small Map */}
              {item.city?.latitude && item.city?.longitude && (
                <View
                  style={{
                    height: 150,
                    borderRadius: 10,
                    overflow: "hidden",
                    marginBottom: 15,
                  }}
                >
                  <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: parseFloat(item.city.latitude),
                      longitude: parseFloat(item.city.longitude),
                      latitudeDelta: 0.02,
                      longitudeDelta: 0.02,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    rotateEnabled={false}
                    pitchEnabled={false}
                  >
                    <Marker
                      coordinate={{
                        latitude: parseFloat(item.city.latitude),
                        longitude: parseFloat(item.city.longitude),
                      }}
                      title={item.city.name}
                    />
                  </MapView>
                </View>
              )}

              {/* Report Button */}
              <View style={{ marginTop: 10 }}>
                <ButtonLight
                  onPress={() => reportOptionsRef.current?.open()}
                  size={"sm"}
                  title="Report Ad"
                  color={COLORS.danger}
                  loading={isProcessing}
                />
              </View>
            </View>
          </View>

          {/* Similar Items */}
          <SimilarAds postId={item.id} />
        </ScrollView>

        {/* Bottom Buttons */}
        <View
          style={[
            GlobalStyleSheet.container,
            { marginTop: 10, marginBottom: Platform.OS === "ios" ? 20 : 10 },
          ]}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}
          >
            <View style={{ flex: 1 }}>
              <ButtonOutline
                onPress={handleChat}
                title="Chat"
                loading={isProcessing}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                onPress={openMakeOffer}
                title="Make Offer"
                loading={isProcessing}
              />
            </View>
          </View>
        </View>
      </View>

      <RBSheet
        ref={reportOptionsRef}
        height={350}
        openDuration={300}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: colors.card, // <== fix background
          },
        }}
      >
        <ReportAdOptionsSheet onSelectReason={handleReasonSelect} />
      </RBSheet>

      <RBSheet
        ref={reportMessageRef}
        height={350}
        openDuration={300}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: colors.card, // <== fix background
          },
        }}
      >
        <ReportMessageSheet
          reason={selectedReason}
          onSubmit={handleReportSubmit}
        />
      </RBSheet>

      <MakeOfferSheet
        ref={makeOfferRef}
        currency={"currency" in item ? item.currency : "UGX"}
        min={1}
        // max={100000} // optional cap
        onSubmit={handleOfferSubmit}
      />
    </SafeAreaView>
  );
};

export default ItemDetails;
