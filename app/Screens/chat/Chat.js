import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useTheme, useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { COLORS, FONTS, IMAGES, SIZES } from "../../constants/theme";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { AuthContext } from "../../context/AuthProvider";

/* ---------------------------------------------
   Config
--------------------------------------------- */
const API_BASE = "https://qot.ug/api";
const APP_API_TOKEN = "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=";
const REFRESH_INTERVAL_MS = 6000;

/* ---------------------------------------------
   Helpers (no UI changes)
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

const normUser = (u) =>
  u
    ? {
        id: u.id ?? u.user_id ?? null,
        name: u.name ?? u.username ?? "",
        username: u.username ?? "",
        photo_url: u.photo_url ?? u.photo ?? null,
      }
    : null;

/**
 * Rule:
 * If latest_message.p_recipient.user_id === myId → otherId = p_creator.id
 * Else → otherId = latest_message.p_recipient.user_id
 */
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

const fetchUserById = async (id, token) => {
  if (!id) return null;
  const urls = [`${API_BASE}/users/${id}`, `${API_BASE}/user/${id}`];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "application/json",
          "Content-Language": "en",
          "X-AppApiToken": APP_API_TOKEN,
          "X-AppType": "docs",
        },
      });
      if (!res.ok) continue;
      const j = await res.json();
      const payload = normalizePayload(j);
      const u = normUser(payload);
      if (u?.id) return u;
    } catch {}
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
   YOUR EXACT UI (unchanged)
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
        borderRadius: 15,
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
                  alignItems: "center",
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
   Screen (cache + live fetch + spinner + pull-to-refresh)
--------------------------------------------- */
const Chat = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;

  const { userToken, userData } = useContext(AuthContext) || {};
  const myId = userData?.id ?? null;

  const [chatData, setChatData] = useState([]);
  const [liveUsers, setLiveUsers] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Per-user cache keys
  const THREADS_CACHE_KEY = `chat_threads_cache_v1_${myId ?? "anon"}`;
  const LIVEUSERS_CACHE_KEY = `chat_live_users_cache_v1_${myId ?? "anon"}`;

  const fetchToken = useCallback(async () => {
    if (userToken) return userToken;
    const t1 = await AsyncStorage.getItem("authToken");
    const t2 = await AsyncStorage.getItem("token");
    const t3 = await AsyncStorage.getItem("userToken");
    return t1 || t2 || t3 || "";
  }, [userToken]);

  const authHeaders = (token) => ({
    Authorization: token ? `Bearer ${token}` : "",
    Accept: "application/json",
    "Content-Type": "application/json",
    "Content-Language": "en",
    "X-AppApiToken": APP_API_TOKEN,
    "X-AppType": "docs",
  });

  // precise unread (when API doesn't provide a number)
  const fetchUnreadCount = useCallback(
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
  );

  // ---------- Cache helpers ----------
  const loadCache = useCallback(async () => {
    try {
      const [threadsStr, liveStr] = await AsyncStorage.multiGet([
        THREADS_CACHE_KEY,
        LIVEUSERS_CACHE_KEY,
      ]).then((arr) => arr.map(([, v]) => v));

      const cachedThreads = threadsStr ? JSON.parse(threadsStr) : [];
      const cachedLive = liveStr ? JSON.parse(liveStr) : [];

      if (Array.isArray(cachedThreads) && cachedThreads.length) {
        setChatData(cachedThreads);
      }
      if (Array.isArray(cachedLive) && cachedLive.length) {
        setLiveUsers(cachedLive);
      }
    } catch {
      // ignore
    } finally {
      setIsInitialLoading(false); // spinner only if no cache and network pending
    }
  }, [THREADS_CACHE_KEY, LIVEUSERS_CACHE_KEY]);

  const saveCache = useCallback(
    async (threads, live) => {
      try {
        await AsyncStorage.multiSet([
          [THREADS_CACHE_KEY, JSON.stringify(threads || [])],
          [LIVEUSERS_CACHE_KEY, JSON.stringify(live || [])],
        ]);
      } catch {
        // ignore
      }
    },
    [THREADS_CACHE_KEY, LIVEUSERS_CACHE_KEY]
  );

  // ---------- Fetch & map ----------
  const loadOnce = useCallback(async () => {
    const token = await fetchToken();
    if (!token) return;

    // 1) Get threads list
    const listRes = await fetch(`${API_BASE}/threads?perPage=50`, {
      headers: authHeaders(token),
    });
    const listJson = await listRes.json();
    const payload = normalizePayload(listJson);
    const list = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
      ? payload
      : [];

    if (!list.length) {
      setChatData([]);
      setLiveUsers([]);
      await saveCache([], []);
      return;
    }

    // 2) Build items using the rule + accurate unread count if needed
    const items = await Promise.all(
      list.map(async (t) => {
        const otherId = getOtherIdBySimpleRule(t, myId);

        let other = findOtherUserLocal(t, otherId);
        if (!other && otherId) {
          const token = await fetchToken();
          other = await fetchUserById(otherId, token);
        }

        const title = firstNonEmpty(
          other?.name,
          other?.username,
          otherId != null ? `User #${otherId}` : "User"
        );

        const image = IMAGES.car1; // big
        const image2 = other?.photo_url
          ? { uri: other.photo_url }
          : IMAGES.Small1; // small overlay

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
            } catch {}
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

        return {
          id: String(t.id),
          title,
          image,
          image2,
          model,
          text,
          time,
          chatcount,
        };
      })
    );

    setChatData(items);

    // 3) ActiveChat = unique other users from items
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

    // 4) Save to cache for instant next load
    await saveCache(items, live);
  }, [fetchToken, myId, saveCache, fetchUnreadCount]);

  // ---------- Effects ----------
  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    // load cache immediately
    loadCache();

    // first network fetch
    (async () => {
      try {
        await loadOnce();
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    })();

    // polling for new data
    intervalId = setInterval(() => {
      loadOnce().catch(() => {});
    }, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [loadCache, loadOnce]);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadOnce();
    } finally {
      setRefreshing(false);
    }
  }, [loadOnce]);

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
          <TouchableOpacity>
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
      </View>

      <FlatList
        contentContainerStyle={[
          { paddingBottom: 100 },
          Platform.OS === "web" && GlobalStyleSheet.container,
          { padding: 0, flexGrow: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        data={chatData}
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
              <ActivityIndicator size="small" color={colors.title} />
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
