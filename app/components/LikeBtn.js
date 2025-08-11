import React, { useState, useEffect, useContext } from "react";
import { Pressable, ActivityIndicator } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { COLORS } from "../constants/theme";
import { AuthContext } from "../context/AuthProvider";
import axios from "axios";
import postsService from "../../src/services/postsService";

const LikeBtn = ({ postId, defaultLiked = false }) => {
  const { userToken } = useContext(AuthContext);
  const [isLike, setIsLike] = useState(defaultLiked);
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    if (!userToken) return;

    console.log("Saved BY LOGGED USER", defaultLiked);

    try {
      setLoading(true);
      if (isLike) {
        // Unlike the post
        await postsService.posts.deleteFavorite(postId);
      } else {
        // Like the post
        await postsService.posts.makeFavorite({ post_id: postId });
      }
      setIsLike(!isLike);
    } catch (error) {
      console.error("Like toggle error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      accessible={true}
      accessibilityLabel="Like Button"
      accessibilityHint="Toggles like status"
      onPress={toggleLike}
      style={{
        height: 50,
        width: 50,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.white} />
      ) : isLike ? (
        <FontAwesome size={18} color={COLORS.danger} name="heart" />
      ) : (
        <FontAwesome size={18} color={COLORS.white} name="heart-o" />
      )}
    </Pressable>
  );
};

export default LikeBtn;
