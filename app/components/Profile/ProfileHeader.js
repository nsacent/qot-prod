import React, { useEffect, useState, useContext } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthProvider";
import { FONTS, COLORS, IMAGES } from "../../constants/theme";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const ProfileHeader = ({ navigation }) => {
  const { colors } = useTheme();
  const { userInfo } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <SkeletonPlaceholder borderRadius={4}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View style={{ width: 60, height: 60, borderRadius: 30 }} />
          <View style={{ marginLeft: 10 }}>
            <View style={{ width: 120, height: 20, borderRadius: 4 }} />
            <View
              style={{ width: 180, height: 14, borderRadius: 4, marginTop: 6 }}
            />
          </View>
        </View>
      </SkeletonPlaceholder>
    );
  }

  return (
    <View style={GlobalStyleSheet.profileHeader}>
      <Image
        source={{ uri: userInfo?.data?.photo || IMAGES.user }}
        style={GlobalStyleSheet.avatar}
      />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={[FONTS.h6, { color: colors.text }]}>
          {userInfo?.data?.name}
        </Text>
        <Text style={[FONTS.fontSm, { color: colors.textLight }]}>
          {userInfo?.data?.email}
        </Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
        <Image source={IMAGES.settings} style={GlobalStyleSheet.icon} />
      </TouchableOpacity>
    </View>
  );
};

export default ProfileHeader;
