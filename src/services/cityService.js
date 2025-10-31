// utils/cityService.js
import axios from 'axios';

const API_BASE_URL = 'https://qot.ug/api';
const API_TOKEN = 'RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=';

// Cache for cities
let citiesCache = {
  // Default known cities
  52: { name: 'Kampala' } // From your data, city_id 52 is Kampala
};

// Function to get city details with retry logic
export const getCityDetails = async (cityId, userToken) => {
  // Return from cache if available
  if (citiesCache[cityId]) {
    return citiesCache[cityId];
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-AppApiToken': API_TOKEN,
    };

    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const response = await axios.get(`${API_BASE_URL}/cities/${cityId}`, {
      headers,
      params: { embed: 'country' },
      timeout: 5000 // 5 second timeout
    });

    if (response.data.success && response.data.result) {
      citiesCache[cityId] = response.data.result;
      return response.data.result;
    }
    return null;
  } catch (error) {
    console.warn(`Error fetching city ${cityId}:`, error.message);
    return null;
  }
};

// Function to get just the city name
export const getCityName = async (cityId, userToken) => {
  try {
    const city = await getCityDetails(cityId, userToken);
    return city?.name || 'Unknown location';
  } catch (error) {
    console.warn(`Failed to get city name for ${cityId}:`, error);
    return 'Unknown location';
  }
};

// Modified preloadCities to only cache known cities
export const preloadCities = async (userToken) => {
  try {
    // Only preload the cities we know about (like Kampala)
    const knownCityIds = [52]; // Add more IDs if you know them
    
    await Promise.all(knownCityIds.map(id => 
      getCityDetails(id, userToken).catch(e => console.warn(`Failed to preload city ${id}:`, e))
    ));
    
    return true;
  } catch (error) {
    console.warn('Error in preloadCities:', error);
    return false;
  }
};

// Export all functions
export default {
  getCityDetails,
  getCityName,
  preloadCities
};