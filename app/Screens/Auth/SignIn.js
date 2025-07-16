import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import FeatherIcon from "react-native-vector-icons/Feather";
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';

const SignIn = (props) => {

    const theme = useTheme();
    const { colors } = theme;

    const [isFocused, setisFocused] = useState(false);
    const [isFocused2, setisFocused2] = useState(false);
    const [handlePassword, setHandlePassword] = useState(true);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        paddingHorizontal: 20,
                        paddingVertical: 40,
                        paddingBottom: 80
                    }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={{ alignItems: 'center', marginBottom: 60 }}>
                        <Image
                            style={{
                                height: 51,
                                width: 162,
                                resizeMode: 'contain',
                                marginBottom: 20,
                            }}
                            source={theme.dark ? IMAGES.logowhite : IMAGES.logo}
                        />
                        <Text style={{ ...FONTS.h3, color: colors.title, marginBottom: 6 }}>Welcome back!</Text>
                        <Text style={{ ...FONTS.font, color: colors.text, textAlign: 'center' }}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                        </Text>
                    </View>

                    <View style={GlobalStyleSheet.inputGroup}>
                        <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>Username</Text>
                        <TextInput
                            style={[
                                GlobalStyleSheet.shadow2,
                                {
                                    backgroundColor: colors.input,
                                    color: colors.title,
                                    borderColor: colors.border,
                                    paddingLeft: 20,
                                    height: 48
                                },
                                isFocused && GlobalStyleSheet.activeInput
                            ]}
                            onFocus={() => setisFocused(true)}
                            onBlur={() => setisFocused(false)}
                            placeholder='Type Username Here'
                            placeholderTextColor={colors.textLight}
                        />
                    </View>

                    <View style={GlobalStyleSheet.inputGroup}>
                        <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>Password</Text>
                        <View>
                            <TouchableOpacity
                                onPress={() => setHandlePassword(!handlePassword)}
                                style={{
                                    position: 'absolute',
                                    zIndex: 1,
                                    height: 50,
                                    width: 50,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    right: 0,
                                    opacity: 0.5,
                                }}
                            >
                                {handlePassword ?
                                    <FeatherIcon name='eye-off' color={colors.title} size={18} />
                                    :
                                    <FeatherIcon name='eye' color={colors.title} size={18} />
                                }
                            </TouchableOpacity>
                            <TextInput
                                style={[
                                    GlobalStyleSheet.shadow2,
                                    {
                                        backgroundColor: colors.input,
                                        color: colors.title,
                                        borderColor: colors.border,
                                        paddingLeft: 20,
                                        paddingRight: 40,
                                        height: 48
                                    },
                                    isFocused2 && GlobalStyleSheet.activeInput
                                ]}
                                onFocus={() => setisFocused2(true)}
                                onBlur={() => setisFocused2(false)}
                                secureTextEntry={handlePassword}
                                placeholder='Type Password Here'
                                placeholderTextColor={colors.textLight}
                            />
                        </View>
                    </View>

                    <CustomButton
                        onPress={() => props.navigation.navigate('DrawerNavigation')}
                        color={COLORS.primary}
                        title="Login"
                    />

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 15,
                    }}>
                        <Text style={{ ...FONTS.font, color: colors.text }}>Forgot password?</Text>
                        <TouchableOpacity>
                            <Text style={{ ...FONTS.fontLg, color: COLORS.primary }}>Reset here</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <Text style={{
                            ...FONTS.font,
                            color: colors.title,
                            textAlign: 'center',
                            marginBottom: 12
                        }}>
                            Don’t have an account?
                        </Text>
                        <CustomButton
                            onPress={() => props.navigation.navigate('SignUp')}
                            outline
                            color={COLORS.secondary}
                            title="Register now"
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignIn;
SignIn.navigationOptions = {
    headerShown: false,
};