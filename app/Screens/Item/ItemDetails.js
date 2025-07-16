import React from 'react';
import { View, SafeAreaView, ScrollView, Image, TouchableOpacity, Text, Share, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Swiper from 'react-native-swiper';
import { COLORS, FONTS, IMAGES, SIZES } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { LinearGradient } from 'expo-linear-gradient';
import ButtonLight from '../../components/Button/ButtonLight';
import LatestAds from '../Home/LatestAds';
import ButtonOutline from '../../components/Button/ButtonOutline';
import Button from '../../components/Button/Button';
import Anotherprofile from '../profile/Anotherprofile';
import LikeBtn from '../../components/LikeBtn';




const ItemImages = [IMAGES.detail1, IMAGES.detail2, IMAGES.detail3, IMAGES.detail4];

const ItemDetails = ({ navigation }) => {

    const theme = useTheme();
    const { colors } = theme;

    const onShare = async () => {
        try {
            const result = await Share.share({
                message:
                    'Share your profile link here.',
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: colors.card,
            }}
        >
            <View
                style={{
                    flex: 1,
                }}
            >
                <ScrollView>
                    <View
                        style={{
                            height:Platform.OS === 'web' ? SIZES.height / 3.5 : SIZES.height / 2.8,
                        }}
                    >
                        <Swiper
                            loop={false}
                            paginationStyle={{
                                bottom: 12,
                            }}
                            dotStyle={{
                                height: 6,
                                width: 6,
                                backgroundColor: 'rgba(255,255,255,.2)',
                            }}
                            activeDotStyle={{
                                height: 8,
                                width: 8,
                                backgroundColor: COLORS.white,
                            }}
                        >
                            {ItemImages.map((data, index) => (
                                <View
                                    key={index}
                                >
                                    <Image
                                        style={{
                                            height: '100%',
                                            width: '100%',
                                        }}
                                        source={data}
                                    />
                                    <LinearGradient
                                        colors={["rgba(0,0,0,.5)", "rgba(0,0,0,0)"]}
                                        style={{
                                            position: 'absolute',
                                            height: 100,
                                            width: '100%'
                                        }}
                                    ></LinearGradient>
                                    <LinearGradient
                                        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.4)"]}
                                        style={{
                                            position: 'absolute',
                                            height: 40,
                                            width: '100%',
                                            bottom: 0,
                                        }}
                                    ></LinearGradient>
                                </View>
                            ))}
                        </Swiper>
                        <View
                            style={[GlobalStyleSheet.container,{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                paddingHorizontal: 15,
                                paddingVertical: 10,
                                flexDirection: 'row'
                            }]}
                        >
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    style={{
                                        height: 38,
                                        width: 38,
                                        borderRadius: 38,
                                        backgroundColor: 'rgba(255,255,255,.2)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <FeatherIcon size={20} color={COLORS.white} name="chevron-left" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={{
                                    height: 38,
                                    width: 38,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 8,
                                }}
                                onPress={onShare}
                            >
                                <FeatherIcon size={20} color={COLORS.white} name="share-2" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    height: 38,
                                    width: 38,
                                    borderRadius: 38,
                                    backgroundColor: 'rgba(255,255,255,.2)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {/* <FontAwesome size={20} color={COLORS.white} name="heart-o" /> */}
                                <LikeBtn />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={GlobalStyleSheet.container}>
                        <Text style={[FONTS.h6, FONTS.fontMedium, { color: colors.title, marginBottom: 4 }]}>NIKON CORPORATION, NIKON D5500</Text>
                        <Text style={[FONTS.fontXs, { color: colors.text, marginBottom: 10 }]}>2022 - 13,000km</Text>
                        <Text style={[FONTS.h5, { color: colors.title, marginBottom: 10 }]}>$12588.00</Text>
                        <View>
                            <View style={{ width: '100%', borderWidth: 1, borderRadius: 10, borderColor: colors.borderColor, padding: 15 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 50 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <Image
                                            style={{ height: 14, width: 14, resizeMode: 'contain', tintColor: colors.title, opacity: .5 }}
                                            source={IMAGES.gasstation}
                                        />
                                        <Text style={[FONTS.fontXs, { color: colors.title }]}>Petrol</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <Image
                                            style={{ height: 14, width: 14, resizeMode: 'contain', tintColor: colors.title, opacity: .5 }}
                                            source={IMAGES.Vector}
                                        />
                                        <Text style={[FONTS.fontXs, { color: colors.title }]}>45,000km</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <Image
                                            style={{ height: 14, width: 14, resizeMode: 'contain', tintColor: colors.title, opacity: .5 }}
                                            source={IMAGES.flashlight}
                                        />
                                        <Text style={[FONTS.fontXs, { color: colors.title }]}>Automatic</Text>
                                    </View>
                                </View>
                                <LinearGradient colors={theme.dark ? ['rgba(255, 255, 255, 0.0)', 'rgba(255, 255, 255, 0.20)', 'rgba(255, 255, 255, 0.0)'] : ['rgba(0, 0, 0, 0.0)', 'rgba(18, 9, 46, 0.20)', 'rgba(0, 0, 0, 0.0)']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={{ width: '100%', height: 1, position: 'absolute', top: 45, right: 10 }}
                                ></LinearGradient>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 50, marginTop: 30 }}>
                                    <View style={{ alignItems: 'center' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                                            <Image
                                                style={{ height: 14, width: 14, resizeMode: 'contain', tintColor: colors.title, opacity: .5 }}
                                                source={IMAGES.profile}
                                            />
                                            <Text style={[FONTS.fontXs, { color: colors.title, opacity: .7 }]}>Owner</Text>
                                        </View>
                                        <Text style={[FONTS.fontXs, { color: colors.title }]}>1 st</Text>
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                                            <Image
                                                style={{ height: 14, width: 14, resizeMode: 'contain', tintColor: colors.title, opacity: .5 }}
                                                source={IMAGES.map}
                                            />
                                            <Text style={[FONTS.fontXs, { color: colors.title, opacity: .7 }]}>location</Text>
                                        </View>
                                        <Text style={[FONTS.fontXs, { color: colors.title }]}>Kota</Text>
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                                            <Image
                                                style={{ height: 14, width: 14, resizeMode: 'contain', tintColor: colors.title, opacity: .5 }}
                                                source={IMAGES.calendar}
                                            />
                                            <Text style={[FONTS.fontXs, { color: colors.title, opacity: .7 }]}>Post date</Text>
                                        </View>
                                        <Text style={[FONTS.fontXs, { color: colors.title }]}>12 sep 2023</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <Text style={[FONTS.fontSm, FONTS.fontMedium, { color: colors.title, marginBottom: 8, marginTop: 20 }]}>Description</Text>
                        <View
                            style={{
                                backgroundColor: 'rgba(0,0,0,.05)',
                                borderRadius: SIZES.radius,
                                paddingHorizontal: 15,
                                paddingVertical: 10,
                            }}
                        >
                            <Text
                                style={[FONTS.fontXs, { color: colors.title, lineHeight: 20 }]}
                            >{`ABS: Yes \nAccidental: No \nAdjustable Steering: Yes \nAir Conditioning: Yes \nNumbers of Airbags : 2 \nColor: Red \nExchange: Yes`}</Text>
                        </View>
                    </View>
                    <View style={GlobalStyleSheet.container}>
                        <View style={{
                            flexDirection: 'row',
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                            paddingBottom: 20
                        }}>
                            <View>
                                <Image
                                    style={{ height: 75, width: 75, borderRadius: 15 }}
                                    source={IMAGES.Small5}
                                />
                            </View>
                            <View style={{ marginLeft: 10, alignItems: 'flex-start' }}>
                                <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 5 }]}>Posted by</Text>
                                <Text style={[FONTS.font, { color: colors.title, marginTop: 5 }]}>Yatin Xarma</Text>
                                <Text style={[FONTS.fontXs, FONTS.fontMedium, { color: colors.text, marginTop: 5 }]}>Posted date: 12 Sep 2023</Text>
                                <View style={{ marginTop: 10 }}>
                                    <ButtonLight
                                        onPress={() => navigation.navigate(Anotherprofile)}
                                        size={'sm'}
                                        title="See Profile"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={GlobalStyleSheet.container}>
                        <View style={{
                            flexDirection: 'row',
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                            paddingBottom: 20,
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <View style={{ alignItems: 'flex-start' }}>
                                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 30 }}>
                                    <Image
                                        style={{ width: 20, height: 20, tintColor: colors.title }}
                                        source={IMAGES.map}
                                    />
                                    <Text style={[FONTS.font, { color: colors.title }]} >La Molina, Peru</Text>
                                </View>
                                <View>
                                    <Text style={[FONTS.font, { color: colors.title }]}>Ad ID : 24154545</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <ButtonLight
                                        size={'sm'}
                                        title="Report Ad"
                                        color={COLORS.danger}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={GlobalStyleSheet.container}>
                        <Text style={[FONTS.h6, { color: colors.title }]}>Latest Ads</Text>

                        <LatestAds />
                    </View>
                </ScrollView>
                <View style={[GlobalStyleSheet.container, { marginTop: 10 }]}>
                    <View style={{
                        flexDirection: 'row', justifyContent: 'center', gap: 10
                    }}>
                        <View style={{ flex: 1 }}>
                            <ButtonOutline
                                title="chat"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Button
                                title="Make Offer"
                            />
                        </View>
                    </View>
                </View>
            </View >
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    container: {
        height: 120,
        width: 174,
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderRadius: 6
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default ItemDetails;