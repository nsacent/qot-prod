import React, { useContext } from "react";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import { Platform, StatusBar, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../context/AuthProvider";

// Auth Screens
import SignUp from "../Screens/Auth/SignUp";
import SignIn from "../Screens/Auth/SignIn";

// Main App Screens
import DrawerNavigation from "./DrawerNavigation";
import Categories from "../Screens/Categories/Categories";
import CarHome from "../Screens/Item/CarHome";
import Items from "../Screens/Item/Items";
import ItemDetails from "../Screens/Item/ItemDetails";

// Components
import Components from "../Screens/Components/Components";
import AccordionScreen from "../Screens/Components/Accordion";
import BottomSheet from "../Screens/Components/BottomSheet";
import ActionModals from "../Screens/Components/ActionModals";
import Buttons from "../Screens/Components/Buttons";
import Charts from "../Screens/Components/Charts";
import Badges from "../Screens/Components/Badges";
import DividerElements from "../Screens/Components/DividerElements";
import Inputs from "../Screens/Components/Inputs";
import Headers from "../Screens/Components/Headers";
import Footers from "../Screens/Components/Footers";
import TabStyle1 from "../components/Footers/FooterStyle1";
import TabStyle2 from "../components/Footers/FooterStyle2";
import TabStyle3 from "../components/Footers/FooterStyle3";
import TabStyle4 from "../components/Footers/FooterStyle4";
import ListScreen from "../Screens/Components/Lists";
import Pricings from "../Screens/Components/Pricings";
import Snackbars from "../Screens/Components/Snakbars";
import Socials from "../Screens/Components/Socials";
import SwipeableScreen from "../Screens/Components/Swipeable";
import Tabs from "../Screens/Components/Tabs";
import Tables from "../Screens/Components/Tables";
import Toggles from "../Screens/Components/Toggles";

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

// Profile
import Anotherprofile from "../Screens/profile/Anotherprofile";

// Settings
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

const StackComponent = createStackNavigator();

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
      {Platform.OS === "web" || Platform.OS === "android" ? (
        <StatusBar
          backgroundColor={theme.colors.card}
          barStyle={theme.dark ? "light-content" : "dark-content"}
        />
      ) : null}

      <StackComponent.Navigator
        initialRouteName={userToken ? "DrawerNavigation" : "SignIn"}
        detachInactiveScreens={true}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "transparent", flex: 1 },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        {userToken ? (
          /* Authenticated Screens */
          <>
            <StackComponent.Screen
              name="DrawerNavigation"
              component={DrawerNavigation}
            />

            {/* Categories & Items */}
            <StackComponent.Screen name="Categories" component={Categories} />
            <StackComponent.Screen name="CarHome" component={CarHome} />
            <StackComponent.Screen name="Items" component={Items} />
            <StackComponent.Screen name="ItemDetails" component={ItemDetails} />

            {/* Components */}
            <StackComponent.Screen name="Components" component={Components} />
            <StackComponent.Screen
              name="Accordion"
              component={AccordionScreen}
            />
            <StackComponent.Screen name="BottomSheet" component={BottomSheet} />
            {/* ... all other component screens ... */}

            {/* Chat */}
            <StackComponent.Screen name="SingleChat" component={SingleChat} />
            <StackComponent.Screen name="Call" component={Call} />
            <StackComponent.Screen name="Chat" component={Chat} />

            {/* Sell */}
            <StackComponent.Screen name="Sell" component={Sell} />
            <StackComponent.Screen name="Location" component={Location} />
            <StackComponent.Screen name="Selllist" component={Selllist} />
            <StackComponent.Screen name="Form" component={Form} />
            <StackComponent.Screen name="Uploadphoto" component={Uploadphoto} />
            <StackComponent.Screen name="Setprice" component={Setprice} />
            <StackComponent.Screen name="Review" component={Review} />

            <StackComponent.Screen
              name="Comfirmlocation"
              component={Comfirmlocation}
            />
            {/* ... all other sell screens ... */}

            {/* Profile */}
            <StackComponent.Screen name="Editprofile" component={Editprofile} />
            <StackComponent.Screen
              name="Anotherprofile"
              component={Anotherprofile}
            />

            {/* ... all other profile screens ... */}

            {/* Settings */}
            <StackComponent.Screen name="Setting" component={Setting} />
            <StackComponent.Screen
              name="Notification"
              component={Notification}
            />
            <StackComponent.Screen name="Privacy" component={Privacy} />
            <StackComponent.Screen
              name="Changepassword"
              component={Changepassword}
            />
            <StackComponent.Screen name="Language" component={Language} />
            <StackComponent.Screen name="Help" component={Help} />
            <StackComponent.Screen name="BuyPackages" component={BuyPackages} />
            <StackComponent.Screen name="Myorders" component={Myorders} />
            <StackComponent.Screen
              name="Billinginformation"
              component={Billinginformation}
            />
            <StackComponent.Screen name="Profile" component={Profile} />

            {/* ... all other setting screens ... */}
          </>
        ) : (
          /* Authentication Screens */
          <>
            <StackComponent.Screen name="SignIn" component={SignIn} />
            <StackComponent.Screen name="SignUp" component={SignUp} />
          </>
        )}
      </StackComponent.Navigator>
    </View>
  );
};

export default StackNavigator;
