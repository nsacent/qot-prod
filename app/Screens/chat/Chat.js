import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { COLORS, FONTS, IMAGES, SIZES } from "../../constants/theme";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { AuthContext } from "../../context/AuthProvider";
import { ApiService } from "../../../src/services/api";

/* ---------------------------------------------
   Config
--------------------------------------------- */
const API_BASE = "https://qot.ug/api";
const ORIGIN = "https://qot.ug";
const APP_API_TOKEN = "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=";
const REFRESH_INTERVAL_MS = 6000;

/* ---------------------------------------------
   Helpers
--------------------------------------------- */
const normalizePayload = (json) => json?.result ?? json?.data ?? json ?? null;
const idsEqual = (a, b) => a != null && b != null && String(a) === String(b);
const firstNonEmpty = (...vals) =>
  vals.find((v) => typeof v === "string" && v?.trim().length) || "";

const relativeShort = (dateLike) => {
  try {
    const d = new Date(dateLike);
    if (isNaN(d.getTime())) return "";
    const diff = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
    if (diff < 5) return "just now";
    if (diff < 60) return `${diff}s`;
    const m = Math.floor(diff / 60);
    if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const days = Math.floor(h / 24);
    if (days < 30) return `${days}d`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo`;
    const years = Math.floor(months / 12);
    return `${years}y`;
  } catch {
    return "";
  }
};

const ensureAbsoluteUrl = (u) => {
  if (!u || typeof u !== "string") return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `${ORIGIN}/${u.replace(/^\/+/, "")}`;
};

const normUser = (u) =>
  u
    ? {
      id: u.id ?? u.user_id ?? null,
      name: u.name ?? u.username ?? "",
      username: u.username ?? "",
      photo_url: u.photo_url ?? u.photo ?? null,
    }
    : null;

/** Other-party rule */
const getOtherIdBySimpleRule = (t, myId) => {
  const recipUserId = t?.latest_message?.p_recipient?.user_id ?? null;
  const creatorId = t?.p_creator?.id ?? null;
  if (recipUserId != null && idsEqual(recipUserId, myId))
    return creatorId ?? null;
  if (recipUserId != null) return recipUserId;
  if (creatorId != null && !idsEqual(creatorId, myId)) return creatorId;
  return null;
};

const findOtherUserLocal = (t, otherId) => {
  if (!otherId) return null;
  if (idsEqual(t?.p_creator?.id, otherId)) return normUser(t.p_creator);
  if (Array.isArray(t?.participants)) {
    const hit = t.participants.find(
      (p) =>
        idsEqual(p?.user?.id, otherId) ||
        idsEqual(p?.user_id, otherId) ||
        idsEqual(p?.id, otherId)
    );
    if (hit?.user) return normUser(hit.user);
    if (hit) return normUser(hit);
  }
  return null;
};

export const fetchUserById = async (id) => {
  if (!id) return null;

  try {
    // Primary endpoint (users/:id)
    const response = await ApiService.getUser(id);
    const payload = normalizePayload(response.data);
    const user = normUser(payload);

    if (user?.id) return user;

  } catch (error) {
    console.error("fetchUserById error:", error?.message || error);
  }

  return null;
};

/** Unread helpers */
const extractUnreadField = (t) => {
  const n = t?.unread_messages_count ?? t?.unread_count;
  if (typeof n === "number") return n;
  return t?.p_is_unread ? 1 : 0;
};
const safeTs = (iso) => {
  const t = iso ? new Date(iso).getTime() : NaN;
  return Number.isFinite(t) ? t : null;
};

/* ---------------------------------------------
   POST IMAGE HELPERS (avatar fallback & upgrade via /posts/{id})
--------------------------------------------- */
// meta: { uri: string | null, source: 'post' | 'avatar' | 'none' }
const pickPostImageFromPost = (post) => {
  if (!post) return { uri: null, source: "none" };

  const pickFromUrlObj = (urlObj) => {
    if (!urlObj) return null;
    const nonWebp = [urlObj.small, urlObj.medium, urlObj.large, urlObj.full]
      .map(ensureAbsoluteUrl)
      .filter(Boolean);
    const webpObj = urlObj.webp || {};
    const webp = [webpObj.small, webpObj.medium, webpObj.large, webpObj.full]
      .map(ensureAbsoluteUrl)
      .filter(Boolean);
    return nonWebp[0] || webp[0] || null;
  };

  const fromTopLevel = pickFromUrlObj(post.picture?.url);
  if (fromTopLevel) return { uri: fromTopLevel, source: "post" };

  for (const key of ["pictures", "images", "photos"]) {
    const arr = post?.[key];
    if (Array.isArray(arr) && arr.length) {
      const urlObj = arr[0]?.url || arr[0]?.webp;
      const fromArrUrl = pickFromUrlObj(urlObj);
      if (fromArrUrl) return { uri: fromArrUrl, source: "post" };

      const candidate =
        arr[0]?.filename_url ||
        arr[0]?.file_url ||
        arr[0]?.picture_url ||
        arr[0]?.thumbnail ||
        arr[0]?.small ||
        arr[0]?.medium ||
        arr[0]?.large ||
        arr[0]?.url;
      const abs = ensureAbsoluteUrl(candidate);
      if (abs) return { uri: abs, source: "post" };
    }
  }

  if (post.user_photo_url) {
    const abs = ensureAbsoluteUrl(post.user_photo_url);
    if (abs) return { uri: abs, source: "avatar" };
  }

  return { uri: null, source: "none" };
};

const getPostImageById = async (postId, token, authHeaders) => {
  try {
    if (!postId) return { uri: null, source: "none" };
    const res = await fetch(`${API_BASE}/posts/${postId}`, {
      headers: authHeaders(token),
    });
    if (!res.ok) return { uri: null, source: "none" };
    const j = await res.json();
    const post = normalizePayload(j);
    return pickPostImageFromPost(post);
  } catch {
    return { uri: null, source: "none" };
  }
};

/* ---------------------------------------------
   SEARCH helpers
--------------------------------------------- */
const ensureSearchFields = (t) => {
  const name = (t.__search_name ?? t.title ?? "").toString().toLowerCase();
  const subj = (t.__search_subject ?? t.model ?? t.subject ?? "")
    .toString()
    .toLowerCase();
  const text = (t.__search_text ?? t.text ?? "").toString().toLowerCase();
  return {
    ...t,
    __search_name: name,
    __search_subject: subj,
    __search_text: text,
  };
};

const filterThreads = (items, q) => {
  const ql = (q || "").trim().toLowerCase();
  if (!ql) return items || [];
  return (items || []).filter((raw) => {
    const t = ensureSearchFields(raw);
    return (
      t.__search_name.includes(ql) ||
      t.__search_subject.includes(ql) ||
      t.__search_text.includes(ql)
    );
  });
};

/* ---------------------------------------------
   UI
--------------------------------------------- */
const Item = ({
  id,
  title,
  image,
  text,
  time,
  chatcount,
  navigation,
  theme,
  image2,
  model,
}) => (
  <View>
    <TouchableOpacity
      onPress={() => navigation.navigate("SingleChat", { threadId: id, title })}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        paddingVertical: 10,
        paddingLeft: 10,
        marginBottom: 8,
        marginHorizontal: 10,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderRadius: SIZES.radius,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 5,
      }}
    >
      <View>
        <TouchableOpacity style={{ marginRight: 20 }}>
          <View>
            <Image
              style={{ width: 50, height: 50, borderRadius: 6 }}
              source={image}
            />
          </View>
          <View
            style={{
              position: "absolute",
              bottom: -10,
              right: -10,
              borderWidth: 2,
              borderRadius: 50,
              borderColor: theme.colors.card,
            }}
          >
            <Image
              style={{ width: 25, height: 25, borderRadius: 50 }}
              source={image2}
            />
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", marginBottom: 5 }}>
          <Text
            style={{
              ...FONTS.fontSm,
              ...FONTS.fontMedium,
              color: theme.colors.title,
              flex: 1,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              ...FONTS.fontSm,
              ...FONTS.fontRegular,
              color: theme.colors.title,
              opacity: 0.4,
            }}
          >
            {time}
          </Text>
        </View>

        <View style={{ flexDirection: "row", paddingRight: 60 }}>
          <Text
            numberOfLines={1}
            style={{ ...FONTS.fontXs, color: theme.colors.title, flex: 1 }}
          >
            {model}
          </Text>
        </View>

        <View
          style={{
            position: "absolute",
            flexDirection: "row",
            alignItems: "center",
            bottom: 5,
            right: 5,
          }}
        >
          {chatcount ? (
            <View style={{ borderRadius: 50, backgroundColor: COLORS.primary }}>
              <Text
                style={{
                  ...FONTS.font,
                  color: "#fff",
                  width: 20,
                  height: 20,
                  textAlign: "center",
                }}
              >
                {chatcount}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", marginTop: 5 }}>
          <Text style={{ ...FONTS.fontXs, color: theme.colors.text, flex: 1 }}>
            {text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  </View>
);

const ActiveChat = ({ data }) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { colors } = theme;

  return (
    <View style={[GlobalStyleSheet.container, { padding: 0 }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 15, gap: 5 }}
      >
        {data.map((user) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("SingleChat", { userName: user.title })
            }
            key={user.id}
            style={{ alignItems: "center", marginBottom: 10, width: 65 }}
          >
            <Image
              style={{ width: 55, height: 55, borderRadius: 12 }}
              source={user.image}
            />
            <Text
              numberOfLines={1}
              style={{
                ...FONTS.fontMedium,
                color: colors.title,
                fontSize: 10,
                marginTop: 5,
              }}
            >
              {user.title}
            </Text>
            <View
              style={{
                backgroundColor: COLORS.success,
                width: 12,
                height: 12,
                borderRadius: 50,
                position: "absolute",
                bottom: 20,
                right: 5,
                borderWidth: 2,
                borderColor: colors.card,
              }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text
        style={{
          ...FONTS.fontMedium,
          fontSize: 16,
          color: colors.title,
          paddingHorizontal: 15,
          marginBottom: 10,
        }}
      >
        Messages
      </Text>
    </View>
  );
};

/* ---------------------------------------------
   Screen (cache + live fetch + spinner + pull-to-refresh + search)
--------------------------------------------- */
const Chat = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;

  const { userToken, userData } = useContext(AuthContext) || {};
  const myId = userData?.id ?? null;

  const [chatData, setChatData] = useState([]); // full
  const [displayData, setDisplayData] = useState([]); // filtered for list
  const [liveUsers, setLiveUsers] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // blocks view only if no data yet
  const [isSyncing, setIsSyncing] = useState(false); // small header spinner for first sync
  const [refreshing, setRefreshing] = useState(false);

  // Search
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isSearchActive = useMemo(
    () => searchQuery.trim().length > 0,
    [searchQuery]
  );
  const baseDataRef = useRef([]); // last full dataset for stable filtering

  // Per-user cache keys
  const THREADS_CACHE_KEY_v1 = `chat_threads_cache_v16_${myId ?? "anon"}`;
  const LIVEUSERS_CACHE_KEY_v1 = `chat_live_users_cache_v16_${myId ?? "anon"}`;

  const fetchToken = useCallback(async () => {
    if (userToken) return userToken;
    const t1 = await AsyncStorage.getItem("authToken");
    const t2 = await AsyncStorage.getItem("token");
    const t3 = await AsyncStorage.getItem("userToken");
    return t1 || t2 || t3 || "";
  }, [userToken]);

  const authHeaders = (token) => ({
    Accept: "application/json",
    "Content-Type": "application/json",
    "Content-Language": "en",
    "X-AppApiToken": APP_API_TOKEN,
    "X-AppType": "mobile",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });


  /** const fetchUnreadCount = useCallback(
     async (threadId, myIdLocal, token, myLastRead) => {
       try {
         const res = await fetch(
           `${API_BASE}/threads/${threadId}/messages?sort=created_at&perPage=100`,
           { headers: authHeaders(token) }
         );
         if (!res.ok) return 0;
         const j = await res.json();
         const payload = normalizePayload(j);
         const msgs = Array.isArray(payload?.data)
           ? payload.data
           : Array.isArray(payload)
             ? payload
             : [];
         const lastReadTs = safeTs(myLastRead);
         const unread = msgs.filter((m) => {
           const ts = safeTs(m?.created_at);
           if (!ts) return false;
           if (lastReadTs != null && ts <= lastReadTs) return false;
           return String(m?.user_id ?? "") !== String(myIdLocal ?? "");
         }).length;
         return unread;
       } catch {
         return 0;
       }
     },
     []
   );**/

  const fetchUnreadCount = useCallback(
    async (threadId, myIdLocal, myLastRead) => {
      if (!threadId) return 0;

      try {
        // Use ApiService.get or a generic GET method
        const token = await fetchToken();

        const res = await ApiService.getThreadMessages(threadId, {
          params: { sort: "created_at", perPage: 100 },
          headers: authHeaders(token),
        });


        const payload = normalizePayload(res.data);

        // Normalize messages array
        const msgs = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

        const lastReadTs = safeTs(myLastRead);

        // Count unread messages
        const unread = msgs.filter((m) => {
          const ts = safeTs(m?.created_at);
          if (!ts) return false;
          if (lastReadTs != null && ts <= lastReadTs) return false;
          return String(m?.user_id ?? "") !== String(myIdLocal ?? "");
        }).length;

        return unread;
      } catch (err) {
        console.error("fetchUnreadCount error:", err?.message || err);
        return 0;
      }
    },
    []
  );


  // ---------- Cache ----------
  const loadCache = useCallback(async () => {
    let hadCache = false;
    try {
      const [threadsStr, liveStr] = await AsyncStorage.multiGet([
        THREADS_CACHE_KEY_v1,
        LIVEUSERS_CACHE_KEY_v1,
      ]).then((arr) => arr.map(([, v]) => v));

      const cachedThreads = threadsStr ? JSON.parse(threadsStr) : [];
      const cachedLive = liveStr ? JSON.parse(liveStr) : [];

      if (Array.isArray(cachedThreads) && cachedThreads.length) {
        const withSearchFields = cachedThreads.map(ensureSearchFields);
        baseDataRef.current = withSearchFields;
        setChatData(withSearchFields);
        setDisplayData(
          isSearchActive
            ? filterThreads(withSearchFields, searchQuery)
            : withSearchFields
        );
        hadCache = true;
      }
      if (Array.isArray(cachedLive) && cachedLive.length) {
        setLiveUsers(cachedLive);
        hadCache = true;
      }
    } catch {
      // ignore
    } finally {
      // Only dismiss the blocking spinner if we actually showed cached data.
      if (hadCache) setIsInitialLoading(false);
    }
  }, [THREADS_CACHE_KEY_v1, LIVEUSERS_CACHE_KEY_v1, isSearchActive, searchQuery]);

  const saveCache = useCallback(
    async (threads, live) => {
      try {
        await AsyncStorage.multiSet([
          [THREADS_CACHE_KEY_v1, JSON.stringify(threads || [])],
          [LIVEUSERS_CACHE_KEY_v1, JSON.stringify(live || [])],
        ]);
      } catch { }
    },
    [THREADS_CACHE_KEY_v1, LIVEUSERS_CACHE_KEY_v1]
  );

  // ---------- Build & Fetch ----------
  const loadOnce = useCallback(
    async (showHeaderSpinner = false) => {
      const token = await fetchToken();
      if (!token) {
        setIsInitialLoading(false);
        return;
      }
      if (showHeaderSpinner) setIsSyncing(true);

      try {
        const listRes = await fetch(
          `${API_BASE}/threads?perPage=50&embed=post`,
          {
            headers: authHeaders(token),
          }
        );
        if (!listRes.ok) throw new Error("threads fetch failed");

        const listJson = await listRes.json();
        const payload = normalizePayload(listJson);
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

        if (!list.length) {
          baseDataRef.current = [];
          setChatData([]);
          setDisplayData([]);
          setLiveUsers([]);
          await saveCache([], []);
          setIsInitialLoading(false);
          return;
        }

        const items = await Promise.all(
          list.map(async (t) => {
            const otherId = getOtherIdBySimpleRule(t, myId);

            let other = findOtherUserLocal(t, otherId);
            if (!other && otherId) {
              const tkn = await fetchToken();
              other = await fetchUserById(otherId, tkn);
            }

            const title = firstNonEmpty(
              other?.name,
              other?.username,
              otherId != null ? `User #${otherId}` : "User"
            );

            // Big image: embedded post -> upgrade via /posts/{id} if needed
            let imgMeta = pickPostImageFromPost(t?.post);
            const needsUpgrade =
              !imgMeta?.uri ||
              imgMeta.source !== "post" ||
              (imgMeta.uri || "").includes("/storage/app/default/user.png");

            if (needsUpgrade && t?.post_id) {
              const upgraded = await getPostImageById(
                t.post_id,
                token,
                authHeaders
              );
              if (upgraded?.uri && upgraded.source === "post") {
                imgMeta = upgraded;
              }
            }
            const image = imgMeta?.uri ? { uri: imgMeta.uri } : IMAGES.car1;

            // Small overlay avatar
            const image2 = other?.photo_url
              ? { uri: ensureAbsoluteUrl(other.photo_url) }
              : IMAGES.Small1;

            const last = t?.latest_message;
            const text = last?.body || "";
            const time = last?.created_at ? relativeShort(last.created_at) : "";
            const model = firstNonEmpty(t?.subject, " ");

            let unread = extractUnreadField(t);
            if (unread <= 1) {
              let myLastRead = null;
              const recip = t?.latest_message?.p_recipient;
              if (
                recip?.user_id != null &&
                String(recip.user_id) === String(myId)
              ) {
                myLastRead = recip.last_read ?? null;
              }
              if (!myLastRead) {
                try {
                  const res = await fetch(
                    `${API_BASE}/threads/${t.id}?embed=participants`,
                    {
                      headers: authHeaders(token),
                    }
                  );
                  if (res.ok) {
                    const j = await res.json();
                    const det = normalizePayload(j);
                    const parts = Array.isArray(det?.participants)
                      ? det.participants
                      : [];
                    const me = parts.find(
                      (p) =>
                        String(p?.user_id ?? p?.user?.id ?? p?.id) ===
                        String(myId ?? "")
                    );
                    if (me?.last_read) myLastRead = me.last_read;
                  }
                } catch { }
              }
              const computed = await fetchUnreadCount(
                t.id,
                myId,
                token,
                myLastRead
              );
              if (computed > 0) unread = computed;
            }
            const chatcount =
              unread > 99 ? "99+" : unread > 0 ? String(unread) : "";

            return ensureSearchFields({
              id: String(t.id),
              title,
              image,
              image2,
              model,
              text,
              time,
              chatcount,
            });
          })
        );

        baseDataRef.current = items;
        setChatData(items);
        setDisplayData(
          isSearchActive ? filterThreads(items, searchQuery) : items
        );

        const seen = new Set();
        const live = [];
        items.forEach((m, i) => {
          const key = (m.title || "").trim().toLowerCase();
          if (!key || seen.has(key)) return;
          seen.add(key);
          live.push({
            id: String(i + 1),
            title: m.title,
            image: m.image2 || IMAGES.Small1,
          });
        });
        setLiveUsers(live);

        await saveCache(items, live);
        setIsInitialLoading(false);
      } catch {
        setIsInitialLoading(false);
      } finally {
        if (showHeaderSpinner) setIsSyncing(false);
      }
    },
    [fetchToken, myId, saveCache, fetchUnreadCount, isSearchActive, searchQuery]
  );

  // Effects: load cache immediately, then run first sync WITH header spinner; poll silently afterwards.
  useEffect(() => {
    let intervalId = null;

    loadCache().finally(() => {
      loadOnce(true); // show header spinner for first sync
      intervalId = setInterval(() => {
        loadOnce(false).catch(() => { }); // silent polling
      }, REFRESH_INTERVAL_MS);
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [loadCache, loadOnce]);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadOnce(false); // RefreshControl already shows spinner
    } finally {
      setRefreshing(false);
    }
  }, [loadOnce]);

  // Search handlers
  const applySearch = useCallback((q) => {
    setDisplayData(filterThreads(baseDataRef.current, q));
  }, []);
  const toggleSearch = useCallback(() => {
    if (isSearchVisible) {
      setSearchQuery("");
      setDisplayData(baseDataRef.current);
    }
    setIsSearchVisible((v) => !v);
  }, [isSearchVisible]);

  const spinnerColor = colors.primary ?? COLORS.primary ?? colors.title;

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <View style={GlobalStyleSheet.container}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            marginHorizontal: -15,
            paddingHorizontal: 15,
          }}
        >
          <Text
            style={{
              ...FONTS.fontSemiBold,
              fontSize: 18,
              color: colors.title,
              flex: 1,
            }}
          >
            Chats
          </Text>

          {/* Small header spinner that matches your theme color */}
          {isSyncing && (
            <ActivityIndicator
              size="small"
              color={spinnerColor}
              style={{ marginRight: 12 }}
            />
          )}

          <TouchableOpacity onPress={toggleSearch}>
            <Image
              style={{
                width: 20,
                height: 20,
                resizeMode: "contain",
                tintColor: colors.title,
              }}
              source={IMAGES.search}
            />
          </TouchableOpacity>
        </View>

        {isSearchVisible && (
          <View
            style={{
              marginHorizontal: -15,
              paddingHorizontal: 15,
              paddingTop: 8,
              paddingBottom: 10,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: SIZES.radius,
                paddingHorizontal: 10,
                height: 38,
              }}
            >
              <Image
                source={IMAGES.search}
                style={{
                  width: 16,
                  height: 16,
                  tintColor: colors.text,
                  marginRight: 8,
                  resizeMode: "contain",
                }}
              />
              <TextInput
                placeholder="Search chats"
                placeholderTextColor={colors.text + "99"}
                value={searchQuery}
                onChangeText={(t) => {
                  const next = (t || "").toString();
                  setSearchQuery(next);
                  applySearch(next);
                }}
                autoCorrect={false}
                autoCapitalize="none"
                style={{
                  flex: 1,
                  ...FONTS.fontSm,
                  color: colors.title,
                  paddingVertical: 0,
                }}
                returnKeyType="search"
              />
              {searchQuery ? (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setDisplayData(baseDataRef.current);
                  }}
                >
                  <Text
                    style={{
                      ...FONTS.fontSm,
                      color: colors.title,
                      opacity: 0.6,
                    }}
                  >
                    Clear
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
      </View>

      <FlatList
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          { paddingBottom: 100 },
          Platform.OS === "web" && GlobalStyleSheet.container,
          { padding: 0, flexGrow: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        data={displayData}
        renderItem={({ item }) => (
          <Item
            id={item.id}
            title={item.title}
            image={item.image}
            image2={item.image2}
            text={item.text}
            time={item.time}
            chatcount={item.chatcount}
            model={item.model}
            navigation={navigation}
            theme={theme}
          />
        )}
        ListHeaderComponent={() => <ActiveChat data={liveUsers} />}
        keyExtractor={(item) => String(item.id)}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          isInitialLoading ? (
            <View
              style={{
                flex: 1,
                paddingTop: 40,
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <ActivityIndicator size="small" color={spinnerColor} />
              <Text
                style={{
                  ...FONTS.fontSm,
                  color: colors.title,
                  opacity: 0.6,
                  marginTop: 8,
                }}
              >
                Loading messages…
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default Chat;
