/*import React from "react";
import { View, Text, SafeAreaView, TextInput, Image } from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "../../../layout/Header";
import { COLORS, FONTS, IMAGES, SIZES } from "../../../constants/theme";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import Button from "../../../components/Button/Button";

const Setprice = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <Header title="Set a price for your item" leftIcon={"back"} titleLeft />
      <View style={[GlobalStyleSheet.container, { flex: 1 }]}>
        <Text
          style={[FONTS.fontMedium, { color: colors.title, marginBottom: 5 }]}
        >
          Price
        </Text>
        <TextInput
          placeholder="Enter your price..."
          placeholderTextColor={colors.text}
          keyboardType={"number-pad"}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            padding: 10,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            backgroundColor: colors.card,
            borderRadius: SIZES.radius,
            shadowColor: "rgba(0,0,0,.5)",
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,
            elevation: 10,
            paddingLeft: 40,
            height: 48,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 58,
            right: 27,
            alignItems: "center",
          }}
        >
          <Text
            style={[FONTS.fontMedium, { color: colors.title, marginBottom: 5 }]}
          >
            UGX
          </Text>
        </View>
      </View>
      <View
        style={[
          GlobalStyleSheet.container,
          { paddingBottom: 20, paddingHorizontal: 20 },
        ]}
      >
        <Button
          onPress={() => navigation.navigate("Comfirmlocation")}
          title="Next"
        />
      </View>
    </SafeAreaView>
  );
};

export default Setprice;*/

// Setprice.js
import React, { useContext, useState } from "react";
import { View, Alert } from "react-native";
import Button from "../../../components/Button/Button";
import { AuthContext } from "../../../context/AuthProvider";
import { updatePostFields } from "../../../../src/services/postApi";

const Setprice = ({ navigation, route }) => {
  const { postId } = route.params;
  const { userToken } = useContext(AuthContext);

  const [form, setForm] = useState({
    price: 5000,
    negotiable: true,
    tags: "car,automotive,tesla",
    is_permanent: false,
    // add any you edit here (city_id, title, description…)
  });
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    try {
      setSaving(true);
      await updatePostFields(userToken, postId, form); // No pictures[] here
      Alert.alert("Success", "Your listing has been updated.");
      navigation.replace("ItemDetails", { id: postId }); // or wherever
    } catch (e) {
      console.log("Finalize failed:", e?.response?.data || e.message);
      Alert.alert("Error", "Failed to save listing changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* your inputs */}
      <Button
        title={saving ? "Saving…" : "Publish"}
        onPress={onSubmit}
        disabled={saving}
      />
    </View>
  );
};

export default Setprice;
