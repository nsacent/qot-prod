import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignIn from "../Screens/Auth/SignIn";
import SignUp from "../Screens/Auth/SignUp";
// Add any other auth-related screens

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
    </Stack.Navigator>
  );
};

export default AuthStack;
