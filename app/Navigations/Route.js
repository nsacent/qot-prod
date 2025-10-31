import React, { useState, useContext } from "react";
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppStack from "./AppStack";
import AuthStack from "./AuthStack"; // your Auth stack (SignIn, SignUp)
import themeContext from "../constants/themeContext";
import { COLORS } from "../constants/theme";
import { AuthContext } from "../context/AuthProvider";

const Routes = () => {
  const { userToken, isLoading } = useContext(AuthContext);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const authContext = React.useMemo(
    () => ({
      setDarkTheme: () => setIsDarkTheme(true),
      setLightTheme: () => setIsDarkTheme(false),
    }),
    []
  );

  const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      background: COLORS.background,
      title: COLORS.title,
      card: COLORS.card,
      text: COLORS.text,
      textLight: COLORS.textLight,
      input: COLORS.input,
      borderColor: COLORS.borderColor,
      border: "rgba(18,9,46,.1)",
    },
  };

  const CustomDarkTheme = {
    ...NavigationDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      background: COLORS.darkBackground,
      title: COLORS.darkTitle,
      card: COLORS.darkCard,
      text: COLORS.darkText,
      textLight: COLORS.darkTextLight,
      input: COLORS.darkInput,
      borderColor: COLORS.darkBorder,
      border: "rgba(255,255,255,.1)",
    },
  };

  const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

  if (isLoading) return null; // show splash here if needed

  return (
    <SafeAreaProvider>
      <themeContext.Provider value={authContext}>
        <NavigationContainer theme={theme}>
          {userToken ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
      </themeContext.Provider>
    </SafeAreaProvider>
  );
};

export default Routes;
