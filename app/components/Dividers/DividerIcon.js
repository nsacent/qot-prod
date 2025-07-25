import React from 'react';
import { Platform, View } from 'react-native';
import { COLORS } from '../../constants/theme';

const DividerIcon = (props) => {
    return (
        <>
            <View style={{flexDirection:'row',alignItems:'center'}}>
                {Platform.OS === "ios" ?
                    <View style={{ 
                        overflow: 'hidden' ,
                        marginTop:15,
                        marginBottom:15, 
                        flex:1,
                    }}>
                        <View
                            style={{
                                borderStyle: props.dashed ? 'dashed' : 'solid',
                                borderWidth: 1,
                                borderColor: props.color ? props.color : COLORS.borderColor,
                                margin: -2,
                                marginTop: 0,
                            }}>
                            <View style={{ height: 2 }} />
                        </View>
                    </View>
                    :
                    <View
                        style={{
                            borderBottomWidth:1, 
                            borderColor: props.color ? props.color : COLORS.borderColor,
                            borderStyle: props.dashed ? 'dashed' : 'solid',
                            marginTop:15,
                            marginBottom:15,
                            flex:1,
                            ...props.style,
                        }}
                    />
                }
                {
                    props.icon && 
                    <View style={{paddingHorizontal:10}}>

                        {props.icon}
                    </View>
                }
                {Platform.OS === "ios" ?
                    <View style={{ 
                        overflow: 'hidden' ,
                        marginTop:15,
                        marginBottom:15, 
                        flex:1,
                    }}>
                        <View
                            style={{
                                borderStyle: props.dashed ? 'dashed' : 'solid',
                                borderWidth: 1,
                                borderColor: props.color ? props.color : COLORS.borderColor,
                                margin: -2,
                                marginTop: 0,
                            }}>
                            <View style={{ height: 2 }} />
                        </View>
                    </View>
                    :
                    <View
                        style={{
                            borderBottomWidth:1, 
                            borderColor: props.color ? props.color : COLORS.borderColor,
                            borderStyle: props.dashed ? 'dashed' : 'solid',
                            marginTop:15,
                            marginBottom:15,
                            flex:1,
                            ...props.style,
                        }}
                    />
                }
            </View>
        </>
    );
};


export default DividerIcon;