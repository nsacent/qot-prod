import React, { useContext, useState } from "react";
import { useTheme } from "@react-navigation/native";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Header from "../../layout/Header";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { IMAGES, FONTS, COLORS } from "../../constants/theme";
import { AuthContext } from "../../context/AuthProvider";
import ConfirmModal from "../../components/Modal/ConfirmModal";

const SettingData = [
  {
    id: "1",
    image: IMAGES.bell,
    title: "Notification & Preferences",
    navigate: "Notification",
  },
  { id: "2", image: IMAGES.verified, title: "Privacy", navigate: "Privacy" },
  {
    id: "3",
    image: IMAGES.earth,
    title: "Select Language",
    navigate: "Language",
  },
  { id: "4", image: IMAGES.help, title: "Help & Support", navigate: "Help" },
  { id: "5", image: IMAGES.logout, title: "Logout", navigate: null },
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
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
      <Header title="Settings" leftIcon="back" titleLeft />
      <ScrollView
        contentContainerStyle={[
          GlobalStyleSheet.container,
          { paddingVertical: 10 },
        ]}
      >
        {SettingData.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              paddingVertical: 12,
            }}
            onPress={() => handleItemPress(item)}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                style={{
                  width: 22,
                  height: 22,
                  resizeMode: "contain",
                  tintColor:
                    item.title === "Logout" ? COLORS.danger : colors.title,
                }}
                source={item.image}
              />
              <View style={{ marginLeft: 10 }}>
                <Text
                  style={{
                    ...FONTS.fontSm,
                    ...FONTS.fontMedium,
                    fontSize: 15,
                    color:
                      item.title === "Logout" ? COLORS.danger : colors.title,
                  }}
                >
                  {item.title}
                </Text>
              </View>
            </View>
            {item.title === "Logout" && isLoggingOut ? (
              <ActivityIndicator size="small" color={COLORS.danger} />
            ) : (
              <Image
                source={IMAGES.rightarrow}
                style={{ width: 15, height: 15, tintColor: colors.title }}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ConfirmModal sits at the top level */}
      <ConfirmModal
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
        iconName="log-out-outline"
        iconColor={COLORS.warning}
        iconSize={65}
        title="Confirm Logout"
        message="Are you sure you want to sign out?"
        confirmText={isLoggingOut ? "Signing out..." : "Yes, Sign Out"}
        cancelText="Cancel"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmButtonProps={{ disabled: isLoggingOut, color: COLORS.danger }}
        cancelButtonProps={{
          disabled: isLoggingOut,
          outline: true,
          color: COLORS.primary,
        }}
      />
    </SafeAreaView>
  );
};

export default Setting;
