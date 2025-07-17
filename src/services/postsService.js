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
  getAll: (params = {}) => {
    const queryParams = { ...params, embed: params.embed || "pictures" };
    return api.get(API_ENDPOINTS.POSTS.GET_ALL, { params: queryParams });
  },

  getPendingApproval: (page = 1, perPage = 12) =>
    postsService.getAll({
      pendingApproval: 1,
      belongLoggedUser: 1,
      page,
      perPage,
    }),

  getArchived: (page = 1, perPage = 12) =>
    postsService.getAll({ belongLoggedUser: 1, archived: 1, page, perPage }),

  getById: (id, embed = "pictures") =>
    api.get(replaceParams(API_ENDPOINTS.POSTS.BY_ID, { id }), {
      params: { embed },
    }),

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

  archive: (id) => postsService.update(id, { archived: 1 }),
  unarchive: (id) => postsService.update(id, { archived: 0 }),
};

export default {
  listingTypes: listingTypesService,
  reportTypes: reportTypesService,
  posts: postsService,
};
