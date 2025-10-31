import React, { createContext, useContext, useReducer, useMemo } from "react";

const ListingDraftContext = createContext(null);

const initialState = {
  // core
  baseForm: {
    category_id: null,
    post_type_id: null,
    title: "",
    description: "",
    contact_name: "",
    auth_field: "email",
    email: "",
    phone: "",
    phone_country: "UG",
    city_id: null,
    country_code: "UG",
    price: 0,
    negotiable: 0,
    tags: "", // CSV
  },
  // dynamic/custom fields
  fieldsMeta: [], // [{id,name,type,...}]
  dynamicValues: {}, // { [fieldId]: string | string[] }

  // location display-only helpers
  city_name: null,

  // photos (in-memory only)
  photos: [], // [{ id, uri, name, type }]
  primary: null,
};

function dedupePhotos(arr) {
  const seen = new Set();
  const out = [];
  for (const p of arr) {
    const key = p.uri || p.id || p.name;
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

function reducer(state, action) {
  switch (action.type) {
    case "PATCH_BASE":
      return { ...state, baseForm: { ...state.baseForm, ...action.patch } };

    case "SET_FIELDS_META":
      return {
        ...state,
        fieldsMeta: Array.isArray(action.fields) ? action.fields : [],
      };

    case "SET_DYNAMIC_VALUES":
      return { ...state, dynamicValues: action.values || {} };

    case "SET_TAGS": {
      const csv = Array.isArray(action.tags)
        ? action.tags
            .map((t) => String(t).trim())
            .filter(Boolean)
            .slice(0, 10)
            .join(",")
        : String(action.tags || "");
      return { ...state, baseForm: { ...state.baseForm, tags: csv } };
    }

    case "SET_PRICE_NEGOTIABLE":
      return {
        ...state,
        baseForm: {
          ...state.baseForm,
          price: action.price ?? 0,
          negotiable: action.negotiable ? 1 : 0,
        },
      };

    case "SET_LOCATION":
      return {
        ...state,
        baseForm: {
          ...state.baseForm,
          city_id: action.city_id,
          country_code: action.country_code || state.baseForm.country_code,
        },
        city_name: action.city_name || null,
      };

    case "ADD_PHOTOS": {
      const merged = dedupePhotos([
        ...(state.photos || []),
        ...(action.photos || []),
      ]);
      return {
        ...state,
        photos: merged,
        primary: state.primary || (merged[0]?.uri ?? null),
      };
    }

    case "REMOVE_PHOTO": {
      const filtered = (state.photos || []).filter(
        (p) => (p.uri || p.id) !== action.key
      );
      const nextPrimary =
        state.primary && state.primary === action.key
          ? filtered[0]?.uri ?? null
          : state.primary;
      return { ...state, photos: filtered, primary: nextPrimary };
    }

    case "SET_PRIMARY":
      return { ...state, primary: action.uri || null };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export function ListingDraftProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const api = useMemo(
    () => ({
      draft: state,

      patchBase: (patch) => dispatch({ type: "PATCH_BASE", patch }),
      setFieldsMeta: (fields) => dispatch({ type: "SET_FIELDS_META", fields }),
      setDynamicValues: (values) =>
        dispatch({ type: "SET_DYNAMIC_VALUES", values }),
      setTags: (tags) => dispatch({ type: "SET_TAGS", tags }),

      setPriceNegotiable: (price, negotiable) =>
        dispatch({ type: "SET_PRICE_NEGOTIABLE", price, negotiable }),

      setLocation: ({ city_id, city_name, country_code }) =>
        dispatch({ type: "SET_LOCATION", city_id, city_name, country_code }),

      addPhotos: (photos) => dispatch({ type: "ADD_PHOTOS", photos }),
      removePhoto: (key) => dispatch({ type: "REMOVE_PHOTO", key }),
      setPrimary: (uri) => dispatch({ type: "SET_PRIMARY", uri }),

      resetDraft: () => dispatch({ type: "RESET" }),
    }),
    [state]
  );

  return (
    <ListingDraftContext.Provider value={api}>
      {children}
    </ListingDraftContext.Provider>
  );
}

export const useListingDraft = () => {
  const ctx = useContext(ListingDraftContext);
  if (!ctx)
    throw new Error("useListingDraft must be used inside ListingDraftProvider");
  return ctx;
};
