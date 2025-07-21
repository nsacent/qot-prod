import React, { useEffect, useState, useContext } from "react";
import { View, Text } from "react-native";
import { useTheme } from "@react-navigation/native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { AuthContext } from "../../context/AuthProvider";
import { GlobalStyleSheet } from "../../constants/StyleSheet";

const ArchivedAdsTab = () => {
  const { colors } = useTheme();
  const { userInfo } = useContext(AuthContext);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://qot.ug/api/user/archived`, {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setAds(data?.data || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <SkeletonPlaceholder>
        {[...Array(3)].map((_, index) => (
          <View
            key={index}
            style={{ height: 100, borderRadius: 10, marginBottom: 12 }}
          />
        ))}
      </SkeletonPlaceholder>
    );
  }

  return (
    <View>
      {ads.length === 0 ? (
        <Text style={{ color: colors.textLight }}>No archived ads found.</Text>
      ) : (
        ads.map((item, index) => (
          <View key={index} style={GlobalStyleSheet.listCard}>
            <Text style={{ color: colors.text }}>{item.title}</Text>
          </View>
        ))
      )}
    </View>
  );
};

export default ArchivedAdsTab;
