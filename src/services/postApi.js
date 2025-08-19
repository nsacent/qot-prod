// src/services/postApi.js
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

const BASE_URL = "https://qot.ug/api";
const APP_TOKEN = "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=";

const headers = (token) => ({
  Accept: "application/json",
  "Content-Type": "multipart/form-data",
  Authorization: `Bearer ${token}`,
  "Content-Language": "en",
  "X-AppApiToken": APP_TOKEN,
  "X-AppType": "mobile",
});

// --- utilities ---------------------------------------------------
const ensureFilePath = async (uri) => {
  if (Platform.OS === "android" && uri?.startsWith("content://")) {
    const dest = FileSystem.cacheDirectory + `upload-${Date.now()}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: dest }).catch(() => null);
    return dest;
  }
  return uri;
};

const filePart = (uri, fallbackName = "photo.jpg") => {
  const name = uri.split("/").pop() || fallbackName;
  const lower = name.toLowerCase();
  const type = lower.endsWith(".png")
    ? "image/png"
    : lower.endsWith(".heic") || lower.endsWith(".heif")
    ? "image/heic"
    : "image/jpeg";
  return { uri, name, type };
};

// --- API calls ---------------------------------------------------
export const createDraftPost = async (token, base) => {
  const fd = new FormData();
  // Minimal valid fields (adapt if your admin requires more)
  fd.append("category_id", String(base.category_id));
  fd.append("title", base.title || "Draft");
  fd.append("description", base.description || "Draft");
  fd.append("contact_name", base.contact_name || "User");
  fd.append("auth_field", base.auth_field); // "email" | "phone"
  if (base.email) fd.append("email", base.email);
  if (base.phone) {
    fd.append("phone", base.phone);
    fd.append("phone_country", base.phone_country || "");
  }
  fd.append("city_id", String(base.city_id));
  fd.append("country_code", base.country_code);
  fd.append("price", String(base.price || 0));
  fd.append("accept_terms", "true");

  const { data } = await axios.post(`${BASE_URL}/posts`, fd, {
    headers: headers(token),
  });

  // Return id (adjust to your response shape if needed)
  return data?.result?.id ?? data?.id;
};

export const uploadPicturesToPost = async (
  token,
  postId,
  assets,
  onProgress
) => {
  const fd = new FormData();
  for (let i = 0; i < assets.length; i++) {
    const uri = await ensureFilePath(assets[i].uri);
    fd.append("pictures[]", filePart(uri, `photo-${i}.jpg`));
  }
  const { data } = await axios.put(`${BASE_URL}/posts/${postId}`, fd, {
    headers: headers(token),
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(e.loaded / e.total);
    },
  });
  return data;
};

export const updatePostFields = async (token, postId, fields) => {
  const fd = new FormData();
  // Only append what changed:
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      fd.append(k, typeof v === "boolean" ? String(!!v) : String(v));
    }
  });

  const { data } = await axios.put(`${BASE_URL}/posts/${postId}`, fd, {
    headers: headers(token),
  });
  return data;
};
