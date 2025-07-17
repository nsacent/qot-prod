import React, { createContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PropTypes from "prop-types";
import api from "../../../src/services/api";

import { STORAGE_KEYS } from "../../../src/config/api";

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

  const loadAuthState = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      if (!token || !parsedUser?.id) return await signOut();

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const res = await api.get(`/users/${parsedUser.id}`);

      if (res.status === 200 && res.data?.result) {
        const freshUser = res.data.result;
        setUserToken(token);
        setUserData(freshUser);
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(freshUser)
        );
      } else {
        console.warn("⚠️ Invalid token or user. Logging out.");
        await signOut();
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn("🔐 Token unauthorized. Logging out.");
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
