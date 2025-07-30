import React, { useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "../../layout/Header";
import { ScrollView } from "react-native-gesture-handler";
import { COLORS, FONTS, IMAGES, SIZES } from "../../constants/theme";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import FeatherIcon from "react-native-vector-icons/Feather";
import MyadsSheet from "../../components/BottomSheet/MyadsSheet";

const adsData = [
  {
    id: "1",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car2,
    view: "25",
    like: "65",
  },
  {
    id: "1",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1580.60",
    image: IMAGES.car3,
    view: "6",
    like: "60",
  },
  {
    id: "1",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1320.10",
    image: IMAGES.car4,
    view: "12",
    like: "30",
  },
  {
    id: "1",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car5,
    view: "25",
    like: "65",
  },
  {
    id: "1",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car6,
    view: "25",
    like: "65",
  },
  {
    id: "1",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car1,
    view: "25",
    like: "65",
  },
];

const FavouritesData = [
  {
    id: "1",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car1,
    location: "La Molina, Peru",
  },
  {
    id: "2",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car2,
    location: "La Molina, Peru",
  },
  {
    id: "3",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car3,
    location: "La Molina, Peru",
  },
  {
    id: "4",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car4,
    location: "La Molina, Peru",
  },
  {
    id: "5",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car5,
    location: "La Molina, Peru",
  },
  {
    id: "6",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car6,
    location: "La Molina, Peru",
  },
  {
    id: "1",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car1,
    location: "La Molina, Peru",
  },
  {
    id: "2",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car2,
    location: "La Molina, Peru",
  },
  {
    id: "3",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car3,
    location: "La Molina, Peru",
  },
  {
    id: "4",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car4,
    location: "La Molina, Peru",
  },
  {
    id: "5",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car5,
    location: "La Molina, Peru",
  },
  {
    id: "6",
    title: "NIKON CORPORATION, NIKON D5500",
    price: "$1288.50",
    image: IMAGES.car6,
    location: "La Molina, Peru",
  },
];

const Myads = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;

  const scrollRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slideIndicator = scrollX.interpolate({
    inputRange: [
      0,
      SIZES.width > SIZES.container ? SIZES.container : SIZES.width,
    ],
    outputRange: [
      0,
      (SIZES.width - 30) / 2 > SIZES.container
        ? (SIZES.container - 30) / 2
        : (SIZES.width - 30) / 2,
    ],
    extrapolate: "clamp",
  });

  const onPressTouch = (val) => {
    setCurrentIndex(val);
    scrollRef.current?.scrollTo({
      x: SIZES.width * val,
      animated: true,
    });
  };

  const moresheet = React.useRef();

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <Header title="My Ads" leftIcon={"back"} titleLeft />
      <View
        style={[
          GlobalStyleSheet.container,
          {
            paddingTop: 10,
            paddingHorizontal: 10,
            padding: 0,
          },
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
          ></Animated.View>
        </View>
      </View>
      <View
        style={[
          Platform.OS === "web" && GlobalStyleSheet.container,
          { padding: 0, paddingBottom: 80 },
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
            if (
              e.nativeEvent.contentOffset.x.toFixed(0) == SIZES.width.toFixed(0)
            ) {
              setCurrentIndex(1);
            } else if (e.nativeEvent.contentOffset.x.toFixed(0) == 0) {
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
                SIZES.width > SIZES.container ? SIZES.container : SIZES.width,
              flex: 1,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={{ paddingHorizontal: 10, flex: 1, paddingBottom: 80 }}
              >
                {adsData.map((data, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
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
                      onPress={() => navigation.navigate("ItemDetails")}
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
                          source={data.image}
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
                            {data.title}
                          </Text>
                          <Text
                            style={{
                              ...FONTS.font,
                              ...FONTS.fontMedium,
                              color: colors.title,
                              marginTop: 2,
                            }}
                          >
                            {data.price}
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
                              style={{ ...FONTS.fontSm, color: colors.card }}
                            >
                              ACTIVE
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={{
                              position: "absolute",
                              right: 60,
                              margin: 10,
                              marginTop: 5,
                            }}
                            onPress={() => moresheet.current.openSheet()}
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
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 15,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 5,
                            }}
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
                            <Text
                              style={{ ...FONTS.fontXs, color: colors.text }}
                            >
                              Views :
                            </Text>
                            <Text
                              style={{ ...FONTS.fontXs, color: colors.title }}
                            >
                              {data.view}
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
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <Image
                              style={{
                                width: 15,
                                height: 15,
                                resizeMode: "contain",
                              }}
                              source={IMAGES.like}
                            />
                            <Text
                              style={{ ...FONTS.fontXs, color: colors.text }}
                            >
                              Likes :
                            </Text>
                            <Text
                              style={{ ...FONTS.fontXs, color: colors.title }}
                            >
                              {data.like}
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
                            },
                          ]}
                        >
                          <Image
                            style={{
                              height: 20,
                              width: 20,
                              tintColor: colors.title,
                            }}
                            source={IMAGES.delete}
                          />
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
                })}
              </View>
            </ScrollView>
          </View>
          <View
            style={{
              marginTop: 20,
              width:
                SIZES.width > SIZES.container ? SIZES.container : SIZES.width,
              flex: 1,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={{ paddingHorizontal: 10, flex: 1, paddingBottom: 80 }}
              >
                {FavouritesData.map((item, index2) => (
                  <TouchableOpacity
                    key={index2}
                    style={[
                      GlobalStyleSheet.shadow2,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                        padding: 10,
                        marginBottom: 20,
                      },
                    ]}
                    onPress={() => navigation.navigate("ItemDetails")}
                  >
                    <View style={{ flexDirection: "row" }}>
                      <View style={{ flexDirection: "row", flex: 1 }}>
                        <Image
                          style={{ width: 70, height: 70, borderRadius: 6 }}
                          source={item.image}
                        />
                        <View style={{ marginLeft: 10 }}>
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
                              paddingRight: 150,
                              marginTop: 2,
                            }}
                          >
                            {item.title}
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              marginTop: 5,
                            }}
                          >
                            <FeatherIcon
                              size={12}
                              color={colors.text}
                              name={"map-pin"}
                            />
                            <Text
                              style={[
                                FONTS.fontXs,
                                {
                                  fontSize: 11,
                                  color: colors.text,
                                  marginLeft: 4,
                                },
                              ]}
                            >
                              {item.location}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ marginRight: 10 }}>
                        <Image
                          style={{
                            width: 25,
                            height: 25,
                            resizeMode: "contain",
                          }}
                          source={IMAGES.like}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
      <MyadsSheet ref={moresheet} />
    </SafeAreaView>
  );
};

export default Myads;

<View
  style={[
    Platform.OS === "web" && GlobalStyleSheet.container,
    { padding: 0, paddingBottom: 80 },
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
      if (e.nativeEvent.contentOffset.x.toFixed(0) == SIZES.width.toFixed(0)) {
        setCurrentIndex(1);
      } else if (e.nativeEvent.contentOffset.x.toFixed(0) == 0) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(0);
      }
    }}
  >
    <View
      style={{
        marginTop: 20,
        width: SIZES.width > SIZES.container ? SIZES.container : SIZES.width,
        flex: 1,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 10, flex: 1, paddingBottom: 80 }}>
          {adsData.map((data, index) => {
            return (
              <TouchableOpacity
                key={index}
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
                onPress={() => navigation.navigate("ItemDetails")}
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
                    source={data.image}
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
                      {data.title}
                    </Text>
                    <Text
                      style={{
                        ...FONTS.font,
                        ...FONTS.fontMedium,
                        color: colors.title,
                        marginTop: 2,
                      }}
                    >
                      {data.price}
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
                        right: 60,
                        margin: 10,
                        marginTop: 5,
                      }}
                      onPress={() => moresheet.current.openSheet()}
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
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 15,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
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
                        {data.view}
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
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Image
                        style={{
                          width: 15,
                          height: 15,
                          resizeMode: "contain",
                        }}
                        source={IMAGES.like}
                      />
                      <Text style={{ ...FONTS.fontXs, color: colors.text }}>
                        Likes :
                      </Text>
                      <Text style={{ ...FONTS.fontXs, color: colors.title }}>
                        {data.like}
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
                      },
                    ]}
                  >
                    <Image
                      style={{
                        height: 20,
                        width: 20,
                        tintColor: colors.title,
                      }}
                      source={IMAGES.delete}
                    />
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
          })}
        </View>
      </ScrollView>
    </View>
    <View
      style={{
        marginTop: 20,
        width: SIZES.width > SIZES.container ? SIZES.container : SIZES.width,
        flex: 1,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 10, flex: 1, paddingBottom: 80 }}>
          {FavouritesData.map((item, index2) => (
            <TouchableOpacity
              key={index2}
              style={[
                GlobalStyleSheet.shadow2,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  padding: 10,
                  marginBottom: 20,
                },
              ]}
              onPress={() => navigation.navigate("ItemDetails")}
            >
              <View style={{ flexDirection: "row" }}>
                <View style={{ flexDirection: "row", flex: 1 }}>
                  <Image
                    style={{ width: 70, height: 70, borderRadius: 6 }}
                    source={item.image}
                  />
                  <View style={{ marginLeft: 10 }}>
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
                        paddingRight: 150,
                        marginTop: 2,
                      }}
                    >
                      {item.title}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        marginTop: 5,
                      }}
                    >
                      <FeatherIcon
                        size={12}
                        color={colors.text}
                        name={"map-pin"}
                      />
                      <Text
                        style={[
                          FONTS.fontXs,
                          {
                            fontSize: 11,
                            color: colors.text,
                            marginLeft: 4,
                          },
                        ]}
                      >
                        {item.location}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{ marginRight: 10 }}>
                  <Image
                    style={{
                      width: 25,
                      height: 25,
                      resizeMode: "contain",
                    }}
                    source={IMAGES.like}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  </ScrollView>
</View>;
