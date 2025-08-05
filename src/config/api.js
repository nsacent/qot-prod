/**
 * API Configuration Constants
 * Centralized management of all API-related settings
 */

// Base API Configuration
export const API_BASE_URL = "https://qot.ug/api";

// Request Timeout (ms)
export const API_TIMEOUT = 30000;

// Default Headers
export const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "Content-Language": "en", // Default app language
  "X-AppApiToken": "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=", // Static API token
  "X-Client-Version": "1.0.0", // App version
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/users",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/password/forgot", // Endpoint for forgot password
    RESET_PASSWORD: "/auth/password/reset", // Endpoint for reset password
    VERIFY: "/auth/verify/:entity/:field/:token?",
  },
  USER: {
    PROFILE: "/users/profile",
    UPDATE: "/users/update",
    PHOTO: "/users/:id/photo",
    BY_ID: "/users/:id",
    STATS: "/users/:id/stats",
  },

  POSTS_TYPES: {
    GET_ALL: "/postTypes",
    BY_ID: `/postTypes/:id`,
  },

  POSTS_REPORT_TYPES: {
    GET_ALL: "/reportTypes",
    BY_ID: `/reportTypes/:id`,
  },

  POSTS: {
    CREATE: "/posts",
    GET_ALL: "/posts",
    SEARCH: "/posts/search",
    BY_ID: "/posts/:id",
  },

  FAVORITE: {
    GET_FAVORITE: "/savedPosts",
    BY_ID: "/savedPosts/:id",
  },

  SETTINGS: {
    UPDATE: "/users/:id/preferences",
  },

  CATEGORIES: {
    GET_ALL: "/categories",
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "@auth_token",
  REFRESH_TOKEN: "@refresh_token",
  USER_DATA: "@user_data",
  APP_SETTINGS: "@app_settings",
};

// Error Messages
export const API_ERRORS = {
  NETWORK: "Network error. Please check your connection.",
  TIMEOUT: "Request timeout. Please try again.",
  UNAUTHORIZED: "Session expired. Please login again.",
  DEFAULT: "Something went wrong. Please try again later.",
};
