import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { COLORS, FONTS, IMAGES, SIZES } from "../../../constants/theme";
import Header from "../../../layout/Header";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import Button from "../../../components/Button/Button";
import { useListingDraft } from "../../../context/ListingDraftContext";
import useKeyboardInset from "../../../../src/utils/useKeyboardInset";

const API_BASE_URL = "https://qot.ug/api";
const CITIES_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const COUNTRY_CODE_DEFAULT = "UG";

const STORAGE_KEYS = {
  cities: (cc) => `cities:${cc}`,
  selectedCity: "selectedCity",
};

const HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "X-AppApiToken": "RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=",
  "Content-Language": "en",
  "X-AppType": "docs",
};

async function getCachedCities(countryCode) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.cities(countryCode));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.ts || !Array.isArray(parsed?.data)) return null;
    if (Date.now() - parsed.ts > CITIES_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}
async function setCachedCities(countryCode, cities) {
  try {
    const payload = { ts: Date.now(), data: cities };
    await AsyncStorage.setItem(
      STORAGE_KEYS.cities(countryCode),
      JSON.stringify(payload)
    );
  } catch {}
}
async function loadSelectedCity() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.selectedCity);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
async function saveSelectedCity(city) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.selectedCity, JSON.stringify(city));
  } catch {}
}

function normalizeCitiesPayload(json) {
  let arr =
    (json?.result && Array.isArray(json.result.data) && json.result.data) ||
    (Array.isArray(json?.data) && json.data) ||
    (Array.isArray(json?.result) && json.result) ||
    [];

  return arr
    .map((c) => ({
      id: c.id ?? c.code ?? c.city_id ?? c.value,
      name: c.name ?? c.city ?? c.text ?? String(c.id || ""),
      latitude: c.latitude ?? null,
      longitude: c.longitude ?? null,
      time_zone: c.time_zone ?? null,
      country_code: c.country_code ?? COUNTRY_CODE_DEFAULT,
      subadmin1_code: c.subadmin1_code ?? null,
      subadmin2_code: c.subadmin2_code ?? null,
    }))
    .filter((c) => c.id && c.name);
}

async function fetchCitiesFromApi(countryCode = COUNTRY_CODE_DEFAULT) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/countries/${countryCode}/cities?page=1&perPage=100`,
      { headers: HEADERS }
    );
    if (res.ok) {
      const json = await res.json();
      const list = normalizeCitiesPayload(json);
      if (list.length) return list;
    }
  } catch {}
  try {
    const res = await fetch(
      `${API_BASE_URL}/cities?country_code=${encodeURIComponent(countryCode)}`,
      { headers: HEADERS }
    );
    if (res.ok) {
      const json = await res.json();
      const list = normalizeCitiesPayload(json);
      if (list.length) return list;
    }
  } catch {}
  throw new Error("Could not load cities");
}

const Location = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { draft, patchBase } = useListingDraft();

  const countryCode =
    route?.params?.country_code ||
    draft.baseForm?.country_code ||
    COUNTRY_CODE_DEFAULT;

  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [query, setQuery] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [error, setError] = useState("");

  // hydrate only once to avoid loops
  const didHydrateRef = useRef(false);

  const kbInset = useKeyboardInset();
  const windowH = Dimensions.get("window").height;
  const sheetMaxHeight = Math.min(
    Math.floor(windowH * 0.75),
    Math.floor(windowH - kbInset - 24) // leave a little headroom
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => c.name.toLowerCase().includes(q));
  }, [cities, query]);

  const ensureCities = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const cached = await getCachedCities(countryCode);
      let list = cached;
      if (!cached || !cached.length) {
        list = await fetchCitiesFromApi(countryCode);
        setCachedCities(countryCode, list);
      }
      setCities(list || []);

      // hydrate selection once:
      if (!didHydrateRef.current) {
        didHydrateRef.current = true;

        // 1) from draft if present
        if (draft.baseForm?.city_id) {
          const match = (list || []).find(
            (c) => Number(c.id) === Number(draft.baseForm.city_id)
          );
          if (match)
            setSelectedCity((prev) => (prev?.id === match.id ? prev : match));
        } else {
          // 2) from saved AsyncStorage
          const saved = await loadSelectedCity();
          if (saved?.id && saved?.name) {
            setSelectedCity((prev) => (prev?.id === saved.id ? prev : saved));
          }
        }
      }
    } catch (e) {
      setError("Failed to load cities. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [countryCode, draft.baseForm?.city_id]);

  useEffect(() => {
    ensureCities();
  }, [ensureCities]);

  const openPicker = () => {
    if (!cities.length && !loading) ensureCities();
    setPickerVisible(true);
  };

  const pickCity = async (city) => {
    setSelectedCity((prev) => (prev?.id === city?.id ? prev : city));
    await saveSelectedCity(city);
    setPickerVisible(false);
  };

  const onContinue = () => {
    if (!selectedCity?.id) {
      Alert.alert("Select a city", "Please choose a city to continue.");
      return;
    }
    // write to context (no effect loops here)
    patchBase({
      city_id: selectedCity.id,
      city_name: selectedCity.name,
      country_code:
        selectedCity.country_code || countryCode || COUNTRY_CODE_DEFAULT,
    });

    navigation.navigate("Uploadphoto");
  };

  const cardStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: SIZES.radius,
    shadowColor: "rgba(0,0,0,.5)",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
      <Header title="Location" leftIcon={"back"} titleLeft />

      <View
        style={[
          GlobalStyleSheet.container,
          {
            backgroundColor: COLORS.primaryLight,
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 30,
          },
        ]}
      >
        <Text style={{ ...FONTS.fontSm, color: colors.title }}>
          Sharing accurate location helps you make a{"\n"}quicker sale
        </Text>
        <View style={{ position: "absolute", right: 20 }}>
          <Image
            style={{ height: 30, width: 30, tintColor: colors.title }}
            source={IMAGES.map}
          />
        </View>
      </View>

      <View
        style={[
          GlobalStyleSheet.container,
          { paddingVertical: 30, paddingHorizontal: 20 },
        ]}
      >
        <Text
          style={{
            ...FONTS.fontMedium,
            fontSize: 18,
            color: colors.title,
            textAlign: "center",
          }}
        >
          What is the location of the car you are selling?
        </Text>
      </View>

      <View
        style={[GlobalStyleSheet.container, { flex: 1, paddingHorizontal: 20 }]}
      >
        <TouchableOpacity onPress={openPicker} style={cardStyle}>
          <Image
            source={IMAGES.mapgps}
            style={{
              width: 15,
              height: 15,
              marginRight: 10,
              tintColor: colors.title,
            }}
          />
          <Text style={{ ...FONTS.font, fontSize: 15, color: colors.title }}>
            {selectedCity?.name
              ? `Selected city: ${selectedCity.name}`
              : "Tap to choose your city"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openPicker}
          style={[cardStyle, { marginTop: 20 }]}
        >
          <Text style={{ ...FONTS.font, fontSize: 15, color: colors.title }}>
            Choose another city
          </Text>
        </TouchableOpacity>

        {!!error && (
          <Text
            style={{ color: "crimson", marginTop: 12, textAlign: "center" }}
          >
            {error}
          </Text>
        )}
      </View>

      <View style={[GlobalStyleSheet.container, { paddingHorizontal: 20 }]}>
        <Button onPress={onContinue} title={"Continue"} />
      </View>

      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setPickerVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.2)",
            justifyContent: "flex-end",
            paddingBottom: kbInset, // ⬅️ pushes sheet above the keyboard on iOS & Android
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              maxHeight: sheetMaxHeight,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 24,
            }}
          >
            <View
              style={{
                height: 5,
                width: 48,
                backgroundColor: colors.border,
                borderRadius: 3,
                alignSelf: "center",
                marginBottom: 12,
              }}
            />

            <Text
              style={{
                ...FONTS.fontMedium,
                color: colors.title,
                fontSize: 18,
                marginBottom: 8,
              }}
            >
              Select City
            </Text>

            <TextInput
              placeholder="Search city..."
              placeholderTextColor={colors.text}
              value={query}
              onChangeText={setQuery}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingHorizontal: 12,
                height: 44,
                color: colors.title,
                marginBottom: 10,
              }}
            />

            {loading ? (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={{ marginTop: 8, color: colors.text }}>
                  Loading cities…
                </Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.id)}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => pickCity(item)}
                    style={{
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text style={{ color: colors.title, fontSize: 16 }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={{ paddingVertical: 24, alignItems: "center" }}>
                    <Text style={{ color: colors.text }}>No cities found.</Text>
                  </View>
                }
                style={{ maxHeight: "100%" }}
              />
            )}

            <View style={{ marginTop: 14 }}>
              <Button title="Close" onPress={() => setPickerVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Location;
