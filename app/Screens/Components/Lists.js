import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import FeatherIcon from "react-native-vector-icons/Feather";
import { useTheme } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import Header from '../../layout/Header';

import pic1 from '../../assets/images/small/pic1.jpg';
import pic2 from '../../assets/images/small/pic2.jpg';
import pic3 from '../../assets/images/small/pic3.jpg';
import pic4 from '../../assets/images/small/pic4.jpg';
import ListStyle1 from '../../components/list/ListStyle1';
import ListStyle2 from '../../components/list/ListStyle2';

const table = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="28px" height="28px" viewBox="0 0 24 24" version="1.1" class="svg-main-icon"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><rect x="0" y="0" width="24" height="24"/><rect fill="#4A89DC" opacity="0.3" x="4" y="5" width="16" height="6" rx="1.5"/><rect fill="#4A89DC" x="4" y="13" width="16" height="6" rx="1.5"/></g></svg>`;
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" class="svg-main-icon"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><rect x="0" y="0" width="24" height="24"/><path d="M4.5,3 L19.5,3 C20.3284271,3 21,3.67157288 21,4.5 L21,19.5 C21,20.3284271 20.3284271,21 19.5,21 L4.5,21 C3.67157288,21 3,20.3284271 3,19.5 L3,4.5 C3,3.67157288 3.67157288,3 4.5,3 Z M8,5 C7.44771525,5 7,5.44771525 7,6 C7,6.55228475 7.44771525,7 8,7 L16,7 C16.5522847,7 17,6.55228475 17,6 C17,5.44771525 16.5522847,5 16,5 L8,5 Z" fill="#da4453"/></g></svg>`;
const modal = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" class="svg-main-icon"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><rect x="0" y="0" width="24" height="24"/><path d="M6,9 L6,15 C6,16.6568542 7.34314575,18 9,18 L15,18 L15,18.8181818 C15,20.2324881 14.2324881,21 12.8181818,21 L5.18181818,21 C3.76751186,21 3,20.2324881 3,18.8181818 L3,11.1818182 C3,9.76751186 3.76751186,9 5.18181818,9 L6,9 Z" fill="#8cc152" fill-rule="nonzero"/><path d="M10.1818182,4 L17.8181818,4 C19.2324881,4 20,4.76751186 20,6.18181818 L20,13.8181818 C20,15.2324881 19.2324881,16 17.8181818,16 L10.1818182,16 C8.76751186,16 8,15.2324881 8,13.8181818 L8,6.18181818 C8,4.76751186 8.76751186,4 10.1818182,4 Z" fill="#8cc152" opacity="0.3"/></g></svg>`;
const button = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" class="svg-main-icon"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><rect x="0" y="0" width="24" height="24"/><rect fill="#967adc" x="4" y="5" width="16" height="3" rx="1.5"/><path d="M5.5,15 L18.5,15 C19.3284271,15 20,15.6715729 20,16.5 C20,17.3284271 19.3284271,18 18.5,18 L5.5,18 C4.67157288,18 4,17.3284271 4,16.5 C4,15.6715729 4.67157288,15 5.5,15 Z M5.5,10 L18.5,10 C19.3284271,10 20,10.6715729 20,11.5 C20,12.3284271 19.3284271,13 18.5,13 L5.5,13 C4.67157288,13 4,12.3284271 4,11.5 C4,10.6715729 4.67157288,10 5.5,10 Z" fill="#967adc" opacity="0.3"/></g></svg>`;

const ListScreen = () => {

    const {colors} = useTheme();

    return (
        <SafeAreaView style={{flex:1,backgroundColor:colors.card}}>
            <View
                style={{
                    flex:1,
                    backgroundColor:colors.background,
                }}
            >
                <Header 
                    titleLeft
                    title={'List Styles'}
                    leftIcon={'back'}
                />
                <ScrollView>
                    <View style={GlobalStyleSheet.container}>
                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                            <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                <Text style={{...FONTS.h6,color:colors.title}}>Default list</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <ListStyle1 arrowRight title={'Who Can Benefit from Ecommerce?'}/>
                                <ListStyle1 arrowRight title={'10 Ways to Maximize Your Profits.'}/>
                                <ListStyle1 arrowRight title={'Exploring the Benefits of Ecommerce'}/>
                                <ListStyle1 arrowRight title={'The Impact of Ecommerce on Business'}/>
                            </View>
                        </View>

                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                            <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                <Text style={{...FONTS.h6,color:colors.title}}>List with icon</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <ListStyle1 
                                    arrowRight 
                                    icon={<FeatherIcon name={'shopping-cart'} size={15} color={COLORS.white} />}
                                    title={'Cart Checkout Sheet'}
                                />
                                <ListStyle1 
                                    arrowRight 
                                    icon={<FeatherIcon name={'check-circle'} size={15} color={COLORS.white} />}
                                    title={'Success Sheet'}
                                />
                                <ListStyle1 
                                    arrowRight
                                    icon={<FeatherIcon name={'log-out'} size={15} color={COLORS.white} />} 
                                    title={'Login Sheet'}
                                />
                                <ListStyle1 
                                    arrowRight 
                                    icon={<FeatherIcon name={'file-text'} size={15} color={COLORS.white} />}
                                    title={'Register Sheet'}
                                />
                            </View>
                        </View>

                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                            <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                <Text style={{...FONTS.h6,color:colors.title}}>List with image</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <ListStyle1 
                                    arrowRight 
                                    image={pic1}
                                    title={'James'}
                                />
                                <ListStyle1 
                                    arrowRight 
                                    image={pic2}
                                    title={'Robert'}
                                />
                                <ListStyle1 
                                    arrowRight
                                    image={pic3}
                                    title={'John Doe'}
                                />
                                <ListStyle1 
                                    arrowRight 
                                    image={pic4}
                                    title={'David geta'}
                                />
                            </View>
                        </View>

                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                            <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                <Text style={{...FONTS.h6,color:colors.title}}>List with detail</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <ListStyle2
                                    icon={<SvgXml xml={table}/>}
                                    title="Accordion List"
                                    desc="Use for compacting content"
                                />
                                <ListStyle2
                                    icon={<SvgXml xml={sheet}/>}
                                    title="Modal Box"
                                    desc="Use for Popup"
                                />
                                <ListStyle2
                                    icon={<SvgXml xml={modal}/>}
                                    title="Bottom Sheets"
                                    desc="Use for display content"
                                />
                                <ListStyle2
                                    icon={<SvgXml xml={button}/>}
                                    title="Button Styles"
                                    desc="Use for Action"
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};


export default ListScreen;