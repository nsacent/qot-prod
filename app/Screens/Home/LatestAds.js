import React from 'react';
import { View, ScrollView } from 'react-native';
import CardStyle1 from '../../components/Card/CardStyle1';
import { IMAGES } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';

const data = [
    {
        id: '1',
        image: IMAGES.car1,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
        trending: true,
    },
    {
        id: '2',
        image: IMAGES.mobile4,
        title: "iPhone 13 Pro Max (2021)",
        price: "$130.50",
        location: "La Molina, Peru",
    },
    {
        id: '3',
        image: IMAGES.bike4,
        title: "Royal Enfield Bullet Electra",
        price: "$1400.50",
        location: "La Molina, Peru",
        trending: true,
    },
    {
        id: '4',
        image: IMAGES.car4,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
    },
    {
        id: '5',
        image: IMAGES.service2,
        title: "Cannondale bicycle",
        price: "$125.50",
        location: "La Molina, Peru",
        trending: true,
    },
    {
        id: '6',
        image: IMAGES.service3,
        title: "Audemars Piguet, watch",
        price: "$1888.50",
        location: "La Molina, Peru",
    },
    {
        id: '7',
        image: IMAGES.service4,
        title: "Yamaha, Piano",
        price: "$12808.50",
        location: "La Molina, Peru",
        trending: true,
    },
]

// const theme = useTheme();
// const {colors} = theme;

const LatestAds = () => {

    const { colors } = useTheme();

    return (
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
                {data.map((item, index) => (
                    <View
                        key={index}
                        style={{
                            marginRight: 10,
                            width: 160,
                        }}
                    >
                        <CardStyle1 item={item} />
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}

export default React.memo(LatestAds);