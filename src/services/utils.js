const getImageSource = (pictures, size = "medium") => {
  if (!pictures || !Array.isArray(pictures) || pictures.length === 0) {
    return IMAGES.car1;
  }

  const firstPicture = pictures[0];
  if (!firstPicture?.url?.medium) {
    return IMAGES.car1;
  }

  if (size === "small" && firstPicture?.url?.small) {
    return { uri: firstPicture.url.small };
  } else if (size === "large" && firstPicture?.url?.large) {
    return { uri: firstPicture.url.large };
  } else if (size === "original" && firstPicture?.url?.original) {
    return { uri: firstPicture.url.original };
  }

  return { uri: firstPicture.url.medium };
};

const toggleFavorite = async (postId) => {
  try {
    const headers = getHeaders();
    const isFavorited = favourites.some(
      (item) => item.id === postId.toString()
    );

    if (isFavorited) {
      await axios.delete(`${API_BASE_URL}/savedPosts/${postId}`, { headers });
      setFavourites((prev) =>
        prev.filter((item) => item.id !== postId.toString())
      );
      setAllFavorites((prev) =>
        prev.filter((item) => item.id !== postId.toString())
      );
    } else {
      const response = await axios.get(
        `${API_BASE_URL}/posts/${postId}?embed=pictures`,
        { headers }
      );
      const newFavorite = await processItemsWithCities(
        [response.data.result],
        userToken
      );
      await axios.post(
        `${API_BASE_URL}/savedPosts`,
        { post_id: postId },
        { headers }
      );
      setFavourites((prev) => [...prev, ...newFavorite]);
      setAllFavorites((prev) => [...prev, ...newFavorite]);
    }

    return true;
  } catch (error) {
    console.error("Error toggling favorite:", error);
    alert("Failed to update favorites. Please try again.");
    return false;
  }
};

const formatPrice = (price, currencyCode) => {
  const amount = parseFloat(price || 0);
  if (currencyCode === "UGX") {
    return `${amount.toLocaleString()} UGX`;
  }
  return `$${amount.toLocaleString()}`;
};

export default getImageSource;
export { toggleFavorite, formatPrice };
