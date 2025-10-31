import React, { useRef } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import SearchBar from '../../components/SearchBar';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { IMAGES, FONTS, COLORS } from '../../constants/theme';
import CategoryList from './CategoryList';
import LatestAds from './LatestAds';
import CardStyle1 from '../../components/Card/CardStyle1';

const RecommendationsData = [
    {
        id: '1',
        image: IMAGES.car6,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
    },
    {
        id: '2',
        image: IMAGES.electronics2,
        title: "HP laptop",
        price: "$1000.50",
        location: "La Molina, Peru",
        trending: true,

    },
    {
        id: '3',
        image: IMAGES.mobile3,
        title: "Vivo NEX S",
        price: "$1100.50",
        location: "La Molina, Peru",
        trending: true,
    },
    {
        id: '4',
        image: IMAGES.properties1,
        title: "Serenity Pines Retreat",
        price: "$12880.50",
        location: "La Molina, Peru",
    },
    {
        id: '5',
        image: IMAGES.bike1,
        title: "Yamaha (e.g., YZF-R series, MT series, FZ series)",
        price: "$1285.50",
        location: "La Molina, Peru",
    },
    {
        id: '6',
        image: IMAGES.car5,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
    },
    {
        id: '7',
        image: IMAGES.furniture2,
        title: "Coffee table",
        price: "$1308.50",
        location: "La Molina, Peru",
        trending: true,
    },
    {
        id: '8',
        image: IMAGES.electronics5,
        title: "Tea machine",
        price: "$158.50",
        location: "La Molina, Peru",
    },
    {
        id: '9',
        image: IMAGES.bike3,
        title: "Royal Enfield Bullet 350",
        price: "$1300.50",
        location: "La Molina, Peru",
    },
    {
        id: '10',
        image: IMAGES.mobile4,
        title: "iPhone 13 Pro Max (2021)",
        price: "$130.50",
        location: "La Molina, Peru",
    },
    {
        id: '11',
        image: IMAGES.service3,
        title: "Audemars Piguet, watch",
        price: "$1888.50",
        location: "La Molina, Peru",
    },
    {
        id: '12',
        image: IMAGES.properties2,
        title: "Tranquil Haven Cottage",
        price: "$12500.50",
        location: "La Molina, Peru",
        trending: true,
    },
]

const HomeScreen = ({ navigation }) => {

    const { colors } = useTheme();

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: colors.background,
            }}
        >
            <View
                style={[GlobalStyleSheet.container, { paddingBottom: 5 }]}
            >
                <View
                    style={{
                        flexDirection: 'row',
                    }}
                >
                    <View
                        style={{
                            flex: 1
                        }}
                    >
                        <SearchBar />
                    </View>
                    <TouchableOpacity
                        style={{
                            padding: 14,
                            marginLeft: 5,
                        }}
                        onPress={() => navigation.openDrawer()}
                    >
                        <Image
                            style={{
                                height: 20,
                                width: 20,
                                resizeMode: 'contain',
                                tintColor: colors.title,
                            }}
                            source={IMAGES.hamburger}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: 80,
                }}
                showsHorizontalScrollIndicator={false}
            >
                <View
                    style={[GlobalStyleSheet.container, { paddingTop: 10, flex: 1 }]}
                >
                    <View>
                        <View
                            style={{
                                flexDirection: 'row',
                                marginBottom: 12,
                            }}
                        >
                            <Text
                                style={{
                                    ...FONTS.font,
                                    ...FONTS.fontTitle,
                                    color: colors.title,
                                    flex: 1,
                                }}
                            >Categories</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Categories')}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={[FONTS.fontSm, { color: COLORS.primary }]}>View all</Text>
                                <FeatherIcon size={16} color={COLORS.primary} name={'chevron-right'} />
                            </TouchableOpacity>
                        </View>

                        <CategoryList />

                    </View>

                    <View
                        style={{
                            marginHorizontal: -15,
                            marginTop: 20,
                            flex: 1
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: colors.card,
                                borderTopLeftRadius: 25,
                                borderTopRightRadius: 25,
                                flex: 1,
                                paddingHorizontal: 15,
                                paddingVertical: 15,
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 5,
                                },
                                shadowOpacity: 0.34,
                                shadowRadius: 6.27,
                                elevation: 10,
                            }}
                        >
                            <Text style={[FONTS.h6, { color: colors.title }]}>Latest Ads</Text>

                            <LatestAds />

                            <Text style={[FONTS.h6, { color: colors.title, marginTop: 8, marginBottom: 10 }]}>Recommendations</Text>

                            <View style={[GlobalStyleSheet.row]}>
                                {RecommendationsData.map((data, index) => (
                                    <View
                                        key={index}
                                        style={[GlobalStyleSheet.col50, { marginBottom: 15 }]}
                                    >
                                        <CardStyle1
                                            item={data}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default HomeScreen;