// utils/apiService.js
import api from "./api"; // Your Axios instance
import { API_ENDPOINTS } from "../config/api";

/**
 * Helper function to replace path parameters
 */
const replaceParams = (path, params) => {
  let result = path;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value);
  });
  return result;
};

/**
 * Services for listing types, report types, and posts
 */
export const listingTypesService = {
  getAll: () => api.get(API_ENDPOINTS.POSTS_TYPES.GET_ALL),
  getById: (id) =>
    api.get(replaceParams(API_ENDPOINTS.POSTS_TYPES.BY_ID, { id })),
};

export const reportTypesService = {
  getAll: () => api.get(API_ENDPOINTS.POSTS_REPORT_TYPES.GET_ALL),
  getById: (id) =>
    api.get(replaceParams(API_ENDPOINTS.POSTS_REPORT_TYPES.BY_ID, { id })),
};

export const postsService = {
  getAll: (params = {}) => api.get(API_ENDPOINTS.POSTS.GET_ALL, { params }),

  getPendingApproval: (pendingApproval = 1) =>
    postsService.getAll({
      belongLoggedUser: 1,
      pendingApproval: 1,
    }),

  getArchived: (archived = 1) =>
    postsService.getAll({
      belongLoggedUser: 1,
      archived: 1,
    }),

  getById: (id, params = {}) =>
    api.get(replaceParams(API_ENDPOINTS.POSTS.BY_ID, { id }), { params }),

  getFavorite: (params = { embed: "{post,city,pictures,user}" }) => {
    const queryParams = { ...params, embed: params.embed || "page=1" };
    return api.get(API_ENDPOINTS.FAVORITE.GET_FAVORITE, {
      params: queryParams,
    });
  },

  getSimilar: (params) => postsService.getAll({ ...params, op: "similar" }),

  getFavoriteById: (id, embed = {}) =>
    api.get(replaceParams(API_ENDPOINTS.FAVORITE.BY_ID, { id }), { embed }),

  makeFavorite: ({ post_id }) =>
    api.post(API_ENDPOINTS.FAVORITE.GET_FAVORITE, { post_id }),

  deleteFavorite: (ids) => {
    // ids can be number, string, or array
    let idParam = Array.isArray(ids) ? ids.join(",") : ids;
    return api.delete(`/savedPosts/${idParam}`);
  },

  create: (postData, pictures = []) => {
    const formData = new FormData();
    Object.entries(postData).forEach(([key, value]) => {
      if (value != null) formData.append(key, value);
    });
    pictures.forEach((picture, index) => {
      formData.append("pictures[]", {
        uri: picture.uri,
        type: picture.type || "image/jpeg",
        name: `picture_${index}.jpg`,
      });
    });
    return api.post(API_ENDPOINTS.POSTS.CREATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id, postData, pictures = []) => {
    const formData = new FormData();
    Object.entries(postData).forEach(([key, value]) => {
      if (value != null) formData.append(key, value);
    });
    if (pictures.length > 0) {
      pictures.forEach((picture, index) => {
        formData.append("pictures[]", {
          uri: picture.uri,
          type: picture.type || "image/jpeg",
          name: `picture_${index}.jpg`,
        });
      });
    }
    return api.put(replaceParams(API_ENDPOINTS.POSTS.BY_ID, { id }), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (ids) =>
    api.delete(`/posts/${Array.isArray(ids) ? ids.join(",") : ids}`),

  toggleArchive: (id, payload) =>
    api.put(replaceParams(API_ENDPOINTS.POSTS.BY_ID, { id }), payload),
};

export default {
  listingTypes: listingTypesService,
  reportTypes: reportTypesService,
  posts: postsService,
};
