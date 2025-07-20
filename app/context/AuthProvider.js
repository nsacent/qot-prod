import React, { createContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../../src/config/api";
import PropTypes from "prop-types";
import api, { ApiService } from "../../src/services/api";
import axios from "axios";
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      setUserToken(null);
      setUserData(null);
      delete api.defaults.headers.common["Authorization"];
    } catch (err) {
      console.error("⚠️ Error during sign out:", err);
    }
  }, []);

  // Load auth state from AsyncStorage

  const validateSession = async (storedToken, userId) => {
    if (!storedToken) return false;
    try {
      const response = await ApiService.userStats(userId);
      if (response.data?.success) return true;
    } catch (error) {
      if (error?.response?.status === 401) {
        await AsyncStorage.removeItem("token");
        console.log("🔐 Token expired. Logging out.");
        await signOut();
        return false;
      }
      return false;
    }
  };

  const loadAuthState = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      if (!token || !parsedUser?.id || !validateSession(token, parsedUser.id))
        return await signOut();

      const res = await ApiService.getUser(parsedUser.id);

      if (res.status === 200 && res.data?.result) {
        const freshUser = res.data.result;
        setUserToken(token);
        setUserData(freshUser);
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(freshUser)
        );
      } else {
        console.warn("⚠️ Invalid token or user. Logging out...");
        return await signOut();
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn("🔐 Token unauthorized. Logging out.");
        signOut();
      } else {
        console.error("🔐 Auth load error:", error.message);
      }
      await signOut();
    } finally {
      setIsLoading(false);
    }
  }, [signOut]);

  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  const signIn = useCallback(async (token, userProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(userProfile)
      );
      setUserToken(token);
      setUserData(userProfile);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (err) {
      console.error("⚠️ Sign-in error:", err);
    }
  }, []);

  const updateUserData = useCallback(async (newUserData) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(newUserData)
      );
      setUserData(newUserData);
    } catch (err) {
      console.error("⚠️ Failed to update user data:", err);
    }
  }, []);

  const restoreSession = useCallback(() => loadAuthState(), [loadAuthState]);

  return (
    <AuthContext.Provider
      value={{
        userToken,
        userData,
        isLoading,
        signIn,
        signOut,
        updateUserData,
        restoreSession,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
