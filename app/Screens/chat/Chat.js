import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
  Platform,
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

// Flip to true only while debugging locally.
// const DEBUG = true;

/* ---------------------------------------------
   Helpers (no UI changes)
--------------------------------------------- */
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

const firstNonEmpty = (...vals) =>
  vals.find((v) => typeof v === "string" && v.trim().length) || "";

const normalizePayload = (json) => json?.result ?? json?.data ?? json ?? null;

const normUser = (u) =>
  u
    ? {
        id: u.id ?? u.user_id ?? null,
        name: u.name ?? u.username ?? "",
        username: u.username ?? "",
        email: u.email ?? "",
        phone: u.phone ?? "",
        photo_url: u.photo_url ?? u.photo ?? null,
      }
    : null;

/**
 * Decide the "other user id" using latest_message and p_recipient.
 * - If I sent the last message → other = p_recipient.user_id
 * - Else                  → other = latest_message.user_id (the sender)
 * Fallbacks handle unknown "me".
 */
const otherIdFromLatest = (threadDetail, myId) => {
  const lm = threadDetail?.latest_message;
  if (!lm) return null;

  const senderId = lm.user_id ?? null;
  const recipId = lm.p_recipient?.user_id ?? null;

  // If I know who I am:
  if (myId != null) {
    if (senderId != null && String(senderId) === String(myId))
      return recipId ?? null;
    if (recipId != null && String(recipId) === String(myId))
      return senderId ?? null;
  }

  // If I don't know me, prefer "the other" as the id different from creator (common case)
  const creatorId = threadDetail?.p_creator?.id ?? null;
  if (
    senderId != null &&
    creatorId != null &&
    String(senderId) !== String(creatorId)
  )
    return senderId;
  if (
    recipId != null &&
    creatorId != null &&
    String(recipId) !== String(creatorId)
  )
    return recipId;

  // Last resort
  return senderId ?? recipId ?? null;
};

/** Find the full other user object within the thread detail (creator/participants/user). */
const findOtherUserInThread = (threadDetail, otherId) => {
  if (!otherId) return null;

  if (
    threadDetail?.p_creator?.id != null &&
    String(threadDetail.p_creator.id) === String(otherId)
  ) {
    return normUser(threadDetail.p_creator);
  }

  if (Array.isArray(threadDetail?.participants)) {
    // some APIs attach participant.user; others have flattened user fields
    const hit = threadDetail.participants.find(
      (p) =>
        String(p?.id) === String(otherId) ||
        String(p?.user_id) === String(otherId) ||
        (p?.user && String(p.user?.id) === String(otherId))
    );
    if (hit?.user) return normUser(hit.user);
    if (hit) return normUser(hit);
  }

  if (
    threadDetail?.user?.id != null &&
    String(threadDetail.user.id) === String(otherId)
  ) {
    return normUser(threadDetail.user);
  }

  return null;
};

const extractListingThumb = (t) => {
  const p = t?.post || {};
  const picFromArray =
    Array.isArray(p?.pictures) && p.pictures[0]?.url ? p.pictures[0].url : null;
  return picFromArray || p?.picture || p?.picture_url || p?.image || null;
};

const extractUnread = (t) =>
  t?.unread_messages_count ?? t?.unread_count ?? (t?.p_is_unread ? 1 : 0);

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
   Screen (no dummy rows, only API data)
--------------------------------------------- */
const Chat = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const { userToken, user: ctxUser } = useContext(AuthContext) || {};

  const [chatData, setChatData] = useState([]); // starts empty
  const [liveUsers, setLiveUsers] = useState([]); // starts empty

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

  // Try to get my user id for perfect disambiguation.
  const fetchMe = useCallback(
    async (token) => {
      if (ctxUser && (ctxUser.id || ctxUser.email || ctxUser.phone))
        return normUser(ctxUser);

      const storageKeys = ["user", "authUser", "me"];
      for (const k of storageKeys) {
        const raw = await AsyncStorage.getItem(k);
        if (raw) {
          try {
            const obj = JSON.parse(raw);
            if (obj && (obj.id || obj.email || obj.phone)) return normUser(obj);
          } catch {}
        }
      }

      const endpoints = [
        `${API_BASE}/me`,
        `${API_BASE}/auth/me`,
        `${API_BASE}/user`,
        `${API_BASE}/users/me`,
        `${API_BASE}/profile`,
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { headers: authHeaders(token) });
          if (!res.ok) continue;
          const json = await res.json();
          const payload = normalizePayload(json);
          const normalized = normUser(payload);
          if (
            normalized &&
            (normalized.id || normalized.email || normalized.phone)
          )
            return normalized;
        } catch {}
      }
      return null;
    },
    [ctxUser]
  );

  // REPLACE your existing useEffect with this one
  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const authHeaders = (token) => ({
      Authorization: token ? `Bearer ${token}` : "",
      Accept: "application/json",
      "Content-Type": "application/json",
      "Content-Language": "en",
      "X-AppApiToken": APP_API_TOKEN,
      "X-AppType": "docs",
    });

    const normalizePayload = (json) =>
      json?.result ?? json?.data ?? json ?? null;

    const firstNonEmpty = (...vals) =>
      vals.find((v) => typeof v === "string" && v.trim().length) || "";

    const loadOnce = async () => {
      try {
        const token = await fetchToken();
        if (!token || !isMounted) return;

        // who am I (for disambiguating latest_message sender/recipient)
        const me = await fetchMe(token);
        if (!isMounted) return;

        // 1) list threads
        const listRes = await fetch(`${API_BASE}/threads?perPage=50`, {
          headers: authHeaders(token),
        });
        const listJson = await listRes.json();
        const listPayload = normalizePayload(listJson);
        const list = Array.isArray(listPayload?.data)
          ? listPayload.data
          : Array.isArray(listPayload)
          ? listPayload
          : [];
        if (!isMounted) return;

        if (!list.length) {
          if (isMounted) {
            setChatData([]);
            setLiveUsers([]);
          }
          return;
        }

        // 2) thread details (need latest_message.p_recipient, p_creator, participants, post)
        const detailPairs = await Promise.all(
          list.map(async (t) => {
            try {
              const res = await fetch(
                `${API_BASE}/threads/${t.id}?embed=participants,post`,
                { headers: authHeaders(token) }
              );
              if (!res.ok) return [t.id, null];
              const j = await res.json();
              return [t.id, normalizePayload(j)];
            } catch {
              return [t.id, null];
            }
          })
        );
        if (!isMounted) return;

        const byId = {};
        detailPairs.forEach(([id, d]) => {
          if (d) byId[id] = d;
        });

        // helpers we already defined earlier in your file:
        // relativeShort, extractListingThumb, extractUnread,
        // otherIdFromLatest(threadDetail, myId),
        // findOtherUserInThread(threadDetail, otherId)

        // 3) map into your existing UI props
        const mapped = list.map((lite, idx) => {
          const t = byId[lite.id] ? { ...lite, ...byId[lite.id] } : lite;

          const myId = me?.id ?? null;
          const otherId = otherIdFromLatest(t, myId);
          const other = findOtherUserInThread(t, otherId);

          const title = firstNonEmpty(
            other?.name,
            other?.username,
            otherId != null ? `User #${otherId}` : "User"
          );

          const listingUri = extractListingThumb(t);
          const image = listingUri ? { uri: listingUri } : IMAGES.car1;

          const image2 = other?.photo_url
            ? { uri: other.photo_url }
            : IMAGES.Small1;

          const model = firstNonEmpty(
            t?.post?.category?.name,
            t?.post?.title,
            " "
          );

          const last = t?.latest_message;
          const text = last?.body || "";
          const time = last?.created_at ? relativeShort(last.created_at) : "";

          const chatcount = extractUnread(t) ? "1" : "";

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
        });

        if (!isMounted) return;
        setChatData(mapped);

        // 4) ActiveChat (unique other users by name)
        const seen = new Set();
        const live = [];
        mapped.forEach((m, i) => {
          const key = (m.title || "").trim().toLowerCase();
          if (!key || seen.has(key)) return;
          seen.add(key);
          live.push({
            id: String(i + 1),
            title: m.title,
            image: m.image2 || IMAGES.Small1,
          });
        });
        if (isMounted) setLiveUsers(live);
      } catch (e) {
        if (isMounted) {
          setChatData([]);
          setLiveUsers([]);
        }
      }
    };

    // initial load + interval
    loadOnce();
    intervalId = setInterval(loadOnce, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchToken, fetchMe]);

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
          { padding: 0 },
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
      />
    </SafeAreaView>
  );
};

export default Chat;
