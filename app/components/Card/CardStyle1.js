import React, {memo} from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS, IMAGES, SIZES } from '../../constants/theme';
import LikeBtn from '../LikeBtn';

const CardStyle1 = ({item,list}) => {
    
    const {colors} = useTheme();

    const navigation = useNavigation();

    const {price , image , title , location , trending } = item;
    
    return (
        <TouchableOpacity
            activeOpacity={.9}
            onPress={() => navigation.navigate('ItemDetails')}
        >
            <View
                style={[{
                    backgroundColor:colors.card,
                    borderWidth:1,
                    borderColor:colors.borderColor,
                    borderRadius:SIZES.radius,
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 5,
                    },
                    shadowOpacity: 0.34,
                    shadowRadius: 6.27,
                    elevation: 5,
                },list && {
                    flexDirection:'row',
                }]}
            >
                <View
                    style={[list && {
                        width:140,
                    }]}
                >
                    <Image
                        source={image}
                        style={[{
                            width:'100%',
                            height:null,
                            aspectRatio:1.5/1,
                            borderTopLeftRadius:SIZES.radius,
                            borderTopRightRadius:SIZES.radius,
                        },list && {
                            borderTopRightRadius:0,
                            borderBottomLeftRadius:SIZES.radius,
                            aspectRatio:1.4/1,
                        }]}
                    />
                    {trending &&
                        <View
                            style={[{
                                overflow:'hidden',
                                position:'absolute',
                                bottom:0,
                                left:0,
                                height:18,
                                paddingRight:16,
                            },list && {
                                borderBottomLeftRadius:4,
                            }]}
                        >
                            <View
                                style={{
                                    backgroundColor:'#E89A25',
                                    paddingHorizontal:6,
                                    flexDirection:'row',
                                    alignItems:'center',
                                }}
                                >
                                <View
                                    style={{
                                        height:18,
                                        width:25,
                                        backgroundColor:'#E89A25',
                                        position:'absolute',
                                        right: -14,
                                        top:6,
                                        transform:[{rotate: '45deg'}]
                                    }}
                                />
                                <Image
                                    style={{
                                        height:10,
                                        width:10,
                                        resizeMode:'contain',
                                        marginRight:3,
                                    }}
                                    source={IMAGES.flash}
                                />
                                <Text style={{...FONTS.font,...FONTS.fontTitle,fontSize:10,color:COLORS.title}}>Trending</Text>
                            </View>
                        </View>
                    }
                    <View
                        style={{
                            height:28,
                            width:28,
                            borderRadius:14,
                            alignItems:'center',
                            justifyContent:'center',
                            position:'absolute',
                            top:5,
                            right:5,
                            backgroundColor:'rgba(0,0,0,.2)',
                        }}
                    >
                        <LikeBtn/>
                    </View>
                </View>
                <View
                    style={[{
                        paddingHorizontal:8,
                        paddingVertical:8,
                    },list && {
                        flex:1,
                        paddingHorizontal:15,
                        paddingVertical:10,
                    }]}
                >
                    <View
                        style={[list && {
                            flex:1,
                        }]}
                    >
                        <Text style={[FONTS.h5,FONTS.fontTitle,{fontSize:15,color:colors.title}]}>{price}</Text>
                        <Text numberOfLines={1} 
                            style={[FONTS.fontXs,{
                                fontSize:11,
                                color:colors.title,
                            }]}
                            >{title}</Text>
                    </View>
                    <View
                        style={{
                            flexDirection:'row',
                            marginTop:5,
                        }}
                    >
                        <FeatherIcon size={12} color={colors.text} name={'map-pin'}/>
                        <Text style={[FONTS.fontXs,{fontSize:11,color:colors.text,marginLeft:4}]}>{location}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default memo(CardStyle1);