// authUtils.js - Utility functions for authentication

/**
 * Checks if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if token is expired or invalid, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    // Extract the payload part of the JWT
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));

    // Check if the token has an expiration claim
    if (!payload.exp) {
      console.warn("Token does not have an expiration");
      return false;
    }

    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    // Return true if token is expired, false otherwise
    return currentTime >= expirationTime;
  } catch (error) {
    console.error("Error parsing token:", error);
    return true; // Assume expired if we can't parse it
  }
};

/**
 * Extracts the expiration time from a JWT token
 * @param {string} token - The JWT token
 * @returns {Date|null} Expiration date or null if can't be determined
 */
export const getTokenExpiryDate = (token) => {
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));

    if (!payload.exp) return null;

    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error("Error getting token expiry:", error);
    return null;
  }
};

/**
 * Gets the time remaining until token expiration in milliseconds
 * @param {string} token - The JWT token
 * @returns {number} Time in milliseconds until expiration, or 0 if expired/invalid
 */
export const getTimeUntilExpiry = (token) => {
  const expiryDate = getTokenExpiryDate(token);
  if (!expiryDate) return 0;

  const timeLeft = expiryDate.getTime() - Date.now();
  return timeLeft > 0 ? timeLeft : 0;
};
