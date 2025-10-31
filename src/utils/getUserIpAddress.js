import axios from "axios";

/**
 * Fetches the public IP address of the device.
 * @returns {Promise<string|null>} The IP address or null if failed.
 */
export const getUserIpAddress = async () => {
  try {
    // You can use "https://api.ipify.org?format=json" or "https://ipapi.co/json/"
    const response = await axios.get("https://api.ipify.org?format=json");
    if (response.data && response.data.ip) {
      return response.data.ip;
    }
    return null;
  } catch (error) {
    console.error("Error fetching IP address:", error.message);
    return null;
  }
};
