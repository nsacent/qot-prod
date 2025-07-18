import React, { useContext, useState } from "react";
import { useTheme } from "@react-navigation/native";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import Header from "../../layout/Header";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { IMAGES, FONTS, COLORS } from "../../constants/theme";
import { Modal } from "react-native-paper";
import FeatherIcon from "react-native-vector-icons/Feather";
import CustomButton from "../../components/CustomButton"; // Make sure this exists
import { AuthContext } from "../../context/AuthProvider";

const SettingData = [
  {
    id: "1",
    image: IMAGES.bell,
    title: "Notification",
    navigate: "Notification",
  },
  {
    id: "2",
    image: IMAGES.verified,
    title: "Privacy",
    navigate: "Privacy",
  },
  {
    id: "3",
    image: IMAGES.earth,
    title: "Select Language",
    navigate: "Language",
  },
  {
    id: "4",
    image: IMAGES.help,
    title: "Help & Support",
    navigate: "Help",
  },
  {
    id: "5",
    image: IMAGES.logout,
    title: "Logout",
    navigate: null, // We'll handle manually
  },
];

const Setting = ({ navigation }) => {
  const { colors } = useTheme();
  const { signOut } = useContext(AuthContext);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleItemPress = (item) => {
    if (item.title === "Logout") {
      setShowLogoutModal(true);
    } else {
      navigation.navigate(item.navigate);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setShowLogoutModal(false);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <Header title="Setting" leftIcon={"back"} titleLeft />
      <View style={[GlobalStyleSheet.container, { marginTop: 10 }]}>
        {SettingData.map((data, index) => (
          <TouchableOpacity
            key={index}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              paddingBottom: 10,
              marginBottom: 20,
            }}
            onPress={() => handleItemPress(data)}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                style={{
                  width: 22,
                  height: 22,
                  resizeMode: "contain",
                  tintColor:
                    data.title === "Logout" ? COLORS.danger : colors.title,
                }}
                source={data.image}
              />
              <View style={{ marginLeft: 10 }}>
                <Text
                  style={{
                    ...FONTS.fontSm,
                    ...FONTS.fontMedium,
                    fontSize: 15,
                    color:
                      data.title === "Logout" ? COLORS.danger : colors.title,
                  }}
                >
                  {data.title}
                </Text>
              </View>
            </View>
            <View>
              {data.title === "Logout" && isLoggingOut ? (
                <ActivityIndicator size="small" color={COLORS.danger} />
              ) : (
                <Image
                  style={{
                    height: 15,
                    width: 15,
                    resizeMode: "contain",
                    tintColor: colors.title,
                  }}
                  source={IMAGES.rightarrow}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        onDismiss={() => setShowLogoutModal(false)}
        contentContainerStyle={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            padding: 20,
            marginHorizontal: 20,
            borderRadius: 8,
            width: "90%",
            maxWidth: 400,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 15,
              marginTop: 10,
            }}
          >
            <View
              style={{
                height: 80,
                width: 80,
                opacity: 0.2,
                backgroundColor: COLORS.warning,
                borderRadius: 80,
              }}
            />
            <View
              style={{
                height: 65,
                width: 65,
                backgroundColor: COLORS.warning,
                borderRadius: 65,
                position: "absolute",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FeatherIcon size={32} color={COLORS.white} name="log-out" />
            </View>
          </View>

          <Text style={{ ...FONTS.h4, color: colors.title, marginBottom: 8 }}>
            Confirm Logout
          </Text>
          <Text
            style={{
              ...FONTS.font,
              color: colors.text,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Are you sure you want to sign out?
          </Text>

          <CustomButton
            onPress={handleConfirmLogout}
            title={isLoggingOut ? "Signing out..." : "Yes, Sign Out"}
            color={COLORS.danger}
            style={{ width: "100%", marginBottom: 10 }}
            disabled={isLoggingOut}
          />
          <CustomButton
            onPress={() => setShowLogoutModal(false)}
            title="Cancel"
            color={COLORS.primary}
            style={{ width: "100%" }}
            disabled={isLoggingOut}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Setting;
