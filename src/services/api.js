/**
 * API Service Configuration
 * Handles all network requests with centralized error handling
 */

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigate } from "../navigation/navigationRef"; // adjust this path based on your folder structure

import {
  API_BASE_URL,
  DEFAULT_HEADERS,
  API_TIMEOUT,
  API_ENDPOINTS,
  STORAGE_KEYS,
  API_ERRORS,
} from "../config/api";

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: DEFAULT_HEADERS,
});

const replaceParams = (path, params) => {
  let result = path;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value);
  });
  return result;
};

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    // Add auth token if exists
    const rawToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    // FIX: avoid double "Bearer"
    if (rawToken) {
      const fixedToken =
        rawToken.startsWith("Bearer") ? rawToken : `Bearer ${rawToken}`;

      config.headers.Authorization = fixedToken;
    }


    // REQUIRED HEADERS FOR LARACLASSIFIER
    config.headers["Accept"] = "application/json";
    config.headers["Content-Language"] = "en";
    config.headers["X-AppApiToken"] = "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=";
    config.headers["X-AppType"] = "mobile";

    // Log request in development
    if (__DEV__) {
      console.log("API Request:", {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (__DEV__) {
      console.log("API Response:", {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    // Handle errors
    if (__DEV__) {
      console.error("API Error:", error);
    }

    const originalRequest = error.config;

    // Network Errors
    if (!error.response) {
      error.message = API_ERRORS.NETWORK;
      return Promise.reject(error);
    }

    // Timeout Errors
    if (error.code === "ECONNABORTED") {
      error.message = API_ERRORS.TIMEOUT;
      return Promise.reject(error);
    }

    // Unauthorized Errors (401)
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt token refresh
        const refreshToken = await AsyncStorage.getItem(
          STORAGE_KEYS.REFRESH_TOKEN
        );
        const response = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          { refresh_token: refreshToken }
        );

        // Store new tokens
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.AUTH_TOKEN, response.data.access_token],
          [STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh_token],
        ]);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear storage and redirect to login
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.AUTH_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
        ]);

        // You might want to navigate to login screen here
        // navigationRef.navigate('Auth');

        navigate("SignIn"); // ✅ Go to login screen

        error.message = API_ERRORS.UNAUTHORIZED;
        return Promise.reject(error);
      }
    }

    // Other API Errors
    error.message = error.response?.data?.message || API_ERRORS.DEFAULT;
    return Promise.reject(error);
  }
);

// API Methods
export const ApiService = {
  // Auth
  login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  register: (userData) => api.post(API_ENDPOINTS.AUTH.REGISTER, userData),
  logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT),
  forgot: (credentials) =>
    api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, credentials),
  reset: (token_forgot, email) =>
    api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token_forgot, email }),
  verify: (entity, field, token) =>
    api.get(replaceParams(API_ENDPOINTS.AUTH.VERIFY, { entity, field, token })),

  // User
  getUser: (id, params) =>
    api.get(replaceParams(API_ENDPOINTS.USER.BY_ID, { id }), { params }),
  getUserStats: (id) =>
    api.get(replaceParams(API_ENDPOINTS.USER.STATS, { id })),

  uploadPhoto: (userId, imageData, config = {}) => {
    const formData = new FormData();

    formData.append("avatar", {
      uri: imageData.uri,
      name: imageData.name || `user_${userId}_photo.jpg`,
      type: imageData.type || "image/jpeg",
    });

    return api.post(`/users/${userId}/photo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config, // allows `onUploadProgress` to be passed in
    });
  },



  // Categories
  getCategories: (params) =>
    api.get(API_ENDPOINTS.CATEGORIES.GET_ALL, { params }),

  // Settings/Notifications
  getNotificationSettings: () => api.get(API_ENDPOINTS.SETTINGS.NOTIFICATIONS),

  updateNotificationSettings: (id, data) =>
    api.put(replaceParams(API_ENDPOINTS.SETTINGS.UPDATE, { id }), data),

  //Thread messages
  getThreadMessages: (threadId, config = {}) =>
    api.get(`threads/${threadId}/messages`, config),

};

export default api;
