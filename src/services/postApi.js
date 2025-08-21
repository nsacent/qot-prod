// src/services/postApi.js
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { Platform } from "react-native";

const BASE_URL = "https://qot.ug/api";
const APP_TOKEN = "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=";

const headers = (token) => ({
  Accept: "application/json",
  "Content-Type": "multipart/form-data",
  Authorization: `Bearer ${token}`,
  "Content-Language": "en",
  "X-AppApiToken": APP_TOKEN,
  "X-AppType": "docs", // keep "docs" to match your working example
});

// ---------- helpers ----------
const ensureFilePath = async (uri) => {
  if (Platform.OS === "android" && uri?.startsWith("content://")) {
    const dest = FileSystem.cacheDirectory + `upload-${Date.now()}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: dest }).catch(() => null);
    return dest;
  }
  return uri;
};

// Convert HEIC/HEIF → JPEG (many PHP stacks can’t handle HEIC)
const toJpegIfNeeded = async (uri) => {
  const lower = (uri || "").toLowerCase();
  if (lower.endsWith(".heic") || lower.endsWith(".heif")) {
    const result = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 0.85,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return result.uri;
  }
  return uri;
};

const buildFilePart = (uri, fallbackName = "photo.jpg", forceJpeg = false) => {
  const name = uri.split("/").pop() || fallbackName;
  let type = "image/jpeg"; // default to jpeg after conversion
  if (!forceJpeg) {
    const lower = name.toLowerCase();
    type = lower.endsWith(".png")
      ? "image/png"
      : lower.endsWith(".jpg") || lower.endsWith(".jpeg")
      ? "image/jpeg"
      : "image/jpeg";
  }
  return { uri, name, type };
};

const prepFileParts = async (assets) => {
  const parts = [];
  for (let i = 0; i < assets.length; i++) {
    let uri = await ensureFilePath(assets[i].uri);
    uri = await toJpegIfNeeded(uri);
    parts.push(buildFilePart(uri, `photo-${i}.jpg`, true)); // force jpeg
  }
  return parts;
};

// ---------- API calls ----------
export const createPostWithImages = async (token, base, assets, onProgress) => {
  if (!assets?.length) throw new Error("At least one image is required.");

  const fd = new FormData();

  // Required fields per your server errors
  fd.append("category_id", String(base.category_id));
  fd.append("post_type_id", String(base.post_type_id));
  fd.append("title", base.title || "Untitled");
  fd.append("description", base.description || base.title || "No description");
  fd.append("contact_name", base.contact_name || "User");
  fd.append("auth_field", base.auth_field); // "email" | "phone"
  if (base.auth_field === "email" && base.email) {
    fd.append("email", base.email);
  }
  if (base.auth_field === "phone" && base.phone) {
    fd.append("phone", base.phone);
    fd.append("phone_country", base.phone_country || "");
  }
  fd.append("city_id", String(base.city_id));
  fd.append("country_code", base.country_code);
  fd.append("price", String(base.price ?? 0));
  fd.append("accept_terms", "true");

  const files = await prepFileParts(assets);
  files.forEach((f) => fd.append("pictures[]", f));

  const { data } = await axios.post(`${BASE_URL}/posts`, fd, {
    headers: headers(token),
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(e.loaded / e.total);
    },
  });

  return data?.result?.id ?? data?.id;
};

// NOTE: some installs require core fields on PUT even if you’re only changing pictures.
// Pass `baseRequired` if you have it; we’ll include it with pictures[].
export const replaceAllPictures = async (
  token,
  postId,
  assets,
  baseRequired = null,
  onProgress
) => {
  const fd = new FormData();

  if (baseRequired) {
    // Re-include the core fields to satisfy stricter validations
    fd.append("category_id", String(baseRequired.category_id));
    fd.append("post_type_id", String(baseRequired.post_type_id));
    fd.append("title", baseRequired.title || "Untitled");
    fd.append(
      "description",
      baseRequired.description || baseRequired.title || "No description"
    );
    fd.append("contact_name", baseRequired.contact_name || "User");
    fd.append("auth_field", baseRequired.auth_field);
    if (baseRequired.auth_field === "email" && baseRequired.email) {
      fd.append("email", baseRequired.email);
    }
    if (baseRequired.auth_field === "phone" && baseRequired.phone) {
      fd.append("phone", baseRequired.phone);
      fd.append("phone_country", baseRequired.phone_country || "");
    }
    fd.append("city_id", String(baseRequired.city_id));
    fd.append("country_code", baseRequired.country_code);
    fd.append("price", String(baseRequired.price ?? 0));
    // Optional but sometimes checked
    fd.append("latest_update_ip", baseRequired.latest_update_ip || "127.0.0.1");
  }

  const files = await prepFileParts(assets);
  files.forEach((f) => fd.append("pictures[]", f));

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
