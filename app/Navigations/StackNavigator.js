import React, { useContext, memo } from "react";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import { Platform, StatusBar, View, ActivityIndicator } from "react-native";
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../context/AuthProvider";

// Auth
import SignUp from "../Screens/Auth/SignUp";
import SignIn from "../Screens/Auth/SignIn";

// App (main)
import DrawerNavigation from "./DrawerNavigation";
import Categories from "../Screens/Categories/Categories";
import CarHome from "../Screens/Item/CarHome";
import Items from "../Screens/Item/Items";
import ItemDetails from "../Screens/Item/ItemDetails";

// Components (examples)
import Components from "../Screens/Components/Components";
import AccordionScreen from "../Screens/Components/Accordion";
import BottomSheet from "../Screens/Components/BottomSheet";

// Chat
import SingleChat from "../Screens/chat/SingleChat";
import Call from "../Screens/chat/Call";
import Chat from "../Screens/chat/Chat";

// Sell
import Sell from "../Screens/sell/Sell";
import Location from "../Screens/sell/Sellfrom/Location";
import Uploadphoto from "../Screens/sell/Sellfrom/Uploadphoto";
import Setprice from "../Screens/sell/Sellfrom/Setprice";
import Comfirmlocation from "../Screens/sell/Sellfrom/Comfirmlocation";
import Review from "../Screens/sell/Sellfrom/Review";
import Selllist from "../Screens/sell/Selllist/Selllist";
import Form from "../Screens/sell/Sellfrom/Form";

// Settings / Profile
import Anotherprofile from "../Screens/profile/Anotherprofile";
import Setting from "../Screens/setting/Setting";
import Notification from "../Screens/setting/Notification";
import Privacy from "../Screens/setting/privacy/Privacy";
import Changepassword from "../Screens/setting/privacy/Changepassword";
import BuyPackages from "../Screens/setting/buypackages/BuyPackages";
import Myorders from "../Screens/setting/buypackages/Myorders";
import Language from "../Screens/setting/language/Language";
import Help from "../Screens/setting/Help/Help";
import Billinginformation from "../Screens/setting/buypackages/Billinginformation";
import Profile from "../Screens/profile/Profile";
import Editprofile from "../Screens/profile/Editprofile";

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();

const defaultScreenOptions = {
  headerShown: false,
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

const AuthStackNavigator = memo(() => (
  <AuthStack.Navigator screenOptions={defaultScreenOptions}>
    <AuthStack.Screen name="SignIn" component={SignIn} />
    <AuthStack.Screen name="SignUp" component={SignUp} />
  </AuthStack.Navigator>
));

const AppStackNavigator = memo(() => (
  <AppStack.Navigator
    screenOptions={defaultScreenOptions}
    initialRouteName="DrawerNavigation"
  >
    <AppStack.Screen name="DrawerNavigation" component={DrawerNavigation} />

    {/* Categories & Items */}
    <AppStack.Screen name="Categories" component={Categories} />
    <AppStack.Screen name="CarHome" component={CarHome} />
    <AppStack.Screen name="Items" component={Items} />
    <AppStack.Screen name="ItemDetails" component={ItemDetails} />

    {/* Components */}
    <AppStack.Screen name="Components" component={Components} />
    <AppStack.Screen name="Accordion" component={AccordionScreen} />
    <AppStack.Screen name="BottomSheet" component={BottomSheet} />
    {/* ...other component screens... */}

    {/* Chat */}
    <AppStack.Screen name="SingleChat" component={SingleChat} />
    <AppStack.Screen name="Call" component={Call} />
    <AppStack.Screen name="Chat" component={Chat} />

    {/* Sell */}
    <AppStack.Screen name="Sell" component={Sell} />
    <AppStack.Screen name="Location" component={Location} />
    <AppStack.Screen name="Selllist" component={Selllist} />
    <AppStack.Screen name="Form" component={Form} />
    <AppStack.Screen name="Uploadphoto" component={Uploadphoto} />
    <AppStack.Screen name="Setprice" component={Setprice} />
    <AppStack.Screen name="Review" component={Review} />
    <AppStack.Screen name="Comfirmlocation" component={Comfirmlocation} />

    {/* Profile */}
    <AppStack.Screen name="Editprofile" component={Editprofile} />
    <AppStack.Screen name="Anotherprofile" component={Anotherprofile} />

    {/* Settings */}
    <AppStack.Screen name="Setting" component={Setting} />
    <AppStack.Screen name="Notification" component={Notification} />
    <AppStack.Screen name="Privacy" component={Privacy} />
    <AppStack.Screen name="Changepassword" component={Changepassword} />
    <AppStack.Screen name="Language" component={Language} />
    <AppStack.Screen name="Help" component={Help} />
    <AppStack.Screen name="BuyPackages" component={BuyPackages} />
    <AppStack.Screen name="Myorders" component={Myorders} />
    <AppStack.Screen name="Billinginformation" component={Billinginformation} />
    <AppStack.Screen name="Profile" component={Profile} />
    {/* ...other screens... */}
  </AppStack.Navigator>
));

const StackNavigator = () => {
  const theme = useTheme();
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ width: "100%", flex: 1 }}>
      {(Platform.OS === "web" || Platform.OS === "android") && (
        <StatusBar
          backgroundColor={theme.colors.card}
          barStyle={theme.dark ? "light-content" : "dark-content"}
        />
      )}

      <RootStack.Navigator screenOptions={defaultScreenOptions}>
        {userToken ? (
          <RootStack.Screen name="App" component={AppStackNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStackNavigator} />
        )}
      </RootStack.Navigator>
    </View>
  );
};

export default memo(StackNavigator);
