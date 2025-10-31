import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { FONTS, IMAGES } from '../../constants/theme';
import { useNavigation, useTheme } from '@react-navigation/native';


const categoryData = [
    {
        id: '1',
        icon: IMAGES.cat1,
        name: 'Cars',
        navigate: 'CarHome',
    },
    {
        id: '2',
        icon: IMAGES.cat2,
        name: 'Mobiles',
        navigate: 'Mobile',
    },
    {
        id: '3',
        icon: IMAGES.cat3,
        name: 'Properties',
        navigate: 'Properties',
    },
    {
        id: '4',
        icon: IMAGES.cat4,
        name: 'Jobs',
        navigate: 'Jobs',
    },
    {
        id: '5',
        icon: IMAGES.cat5,
        name: 'Bikes',
        navigate: 'Bike',
    },
    {
        id: '6',
        icon: IMAGES.cat6,
        name: 'Electornics & Appliances',
        navigate: 'Electornics',
    },
    {
        id: '7',
        icon: IMAGES.cat7,
        name: 'Furniture',
        navigate: 'Furniture',
    },
    {
        id: '8',
        icon: IMAGES.cat8,
        name: 'Fashion',
        navigate: 'Fashion',
    },
    {
        id: '9',
        icon: IMAGES.cat9,
        name: 'Pets',
        navigate: 'Pets',
    },
    {
        id: '10',
        icon: IMAGES.cat10,
        name: 'Books, Sports & Hobbies',
        navigate: 'Books',
    },
    {
        id: '11',
        icon: IMAGES.cat11,
        name: 'Services',
        navigate: 'Service',
    },
]


const CatItem = ({ item, theme, navigation }) => {

    const { colors } = theme;
    return (
        <View
            style={{
                width: 80,
                marginRight: 5,
            }}
        >
            <TouchableOpacity
                onPress={() => item.navigate === 'CarHome' ? navigation.navigate('CarHome') : navigation.navigate('Items', { cat: item.navigate })}
                style={{
                    alignItems: 'center',
                }}
            >
                <View
                    style={{
                        height: 64,
                        width: 64,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 20,
                        backgroundColor:theme.dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)',
                        marginBottom: 6,
                    }}
                >
                    <Image
                        source={item.icon}
                        style={{
                            height: 40,
                            width: 40,
                            resizeMode: 'contain',
                        }}
                    />
                </View>
                <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.title }]}>{item.name}</Text>
            </TouchableOpacity>
        </View>
    )
}

const CategoryList = () => {

    const theme = useTheme();
    const navigation = useNavigation();

    const renderItem = ({ item }) => {
        return (
            <CatItem
                item={item}
                theme={theme}
                navigation={navigation}
            />
        );
    };

    return (
        <View
            style={{
                marginHorizontal: -15,
            }}
        >
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categoryData}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{
                    paddingLeft: 15,
                }}
            />
        </View>
    )
}

export default React.memo(CategoryList);