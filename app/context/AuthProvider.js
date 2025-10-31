import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { ApiService } from "../../src/services/api"; // your axios instance
import { STORAGE_KEYS } from "../../src/config/api";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isHandling401Ref = useRef(false);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      setUserToken(null);
      setUserData(null);
      delete api.defaults.headers.common.Authorization;
    } catch (e) {
      console.log("SignOut error:", e?.message);
    }
  }, []);

  const validateSession = async (storedToken, userId) => {
    if (!storedToken) return false;
    api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
    try {
      const res = await ApiService.userStats(userId);
      return !!res?.data?.success;
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        await signOut();
        return false;
      }
      // network/5xx/offline → don’t log out
      return true;
    }
  };

  // in AuthProvider.jsx (or .js)
  const loadAuthState = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      // 🚩 Set the header immediately so every call (including validateSession) has it
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        return await signOut();
      }

      // If we don't even have a user id, bail out
      if (!parsedUser?.id) return await signOut();

      // Validate
      const ok = await validateSession(token, parsedUser.id);
      if (!ok) return; // validateSession already signed you out on 401

      // Get fresh user
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
        return await signOut();
      }
    } catch (error) {
      await signOut();
    } finally {
      setIsLoading(false);
    }
  }, [signOut]);

  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  const signIn = useCallback(async (token, userProfile) => {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify(userProfile)
    );
    setUserToken(token);
    setUserData(userProfile);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, []);

  const updateUserData = useCallback(async (next) => {
    await AsyncStorage.setItem(STORAGE_KEYS_USER_DATA, JSON.stringify(next));
    setUserData(next);
  }, []);

  // 🔐 Interceptors: attach token; on first 401/403 → signOut() → StackNavigator swaps to Auth screens
  useEffect(() => {
    const reqId = api.interceptors.request.use((config) => {
      if (userToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${userToken}`;
      }
      return config;
    });

    const resId = api.interceptors.response.use(
      (res) => res,
      async (error) => {
        const status = error?.response?.status;
        if ((status === 401 || status === 403) && !isHandling401Ref.current) {
          isHandling401Ref.current = true;
          try {
            await signOut(); // this sets userToken=null → navigator shows Auth stack immediately
          } finally {
            setTimeout(() => (isHandling401Ref.current = false), 300);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(reqId);
      api.interceptors.response.eject(resId);
    };
  }, [userToken, signOut]);

  return (
    <AuthContext.Provider
      value={{
        userToken,
        userData,
        isLoading,
        signIn,
        signOut,
        updateUserData,
        restoreSession: loadAuthState,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
