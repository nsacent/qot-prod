import "react-native-reanimated"; // Should be first import
import "react-native-gesture-handler";
import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import Routes from "./app/Navigations/Route";
import AuthProvider from "./app/context/AuthProvider";
import { ListingDraftProvider } from "./app/context/ListingDraftContext";

const App = () => {
  const [loaded] = useFonts({
    PoppinsRegular: require("./app/assets/fonts/Poppins-Regular.ttf"),
    PoppinsSemiBold: require("./app/assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsMedium: require("./app/assets/fonts/Poppins-Medium.ttf"),
    PoppinsBold: require("./app/assets/fonts/Poppins-Bold.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ListingDraftProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <SafeAreaView
            style={{
              flex: 1,
            }}
          >
            <Routes />
          </SafeAreaView>
        </SafeAreaProvider>
      </AuthProvider>
    </ListingDraftProvider>
  );
};

export default App;
