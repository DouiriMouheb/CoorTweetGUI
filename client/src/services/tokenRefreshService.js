import { getTimeUntilExpiry } from "../utils/authUtils";
import api from "./api";

// Minimum time before expiration to trigger a refresh (10 minutes)
const REFRESH_THRESHOLD = 10 * 60 * 1000;

// Store for refresh timers
let refreshTimerId = null;

/**
 * Token Refresh Service - Handles automatic token refreshing
 *
 * Note: You'll need to implement a token refresh endpoint on your backend
 * before this service will work properly
 */
const tokenRefreshService = {
  /**
   * Starts the token refresh service
   * @returns {void}
   */
  initialize: () => {
    // Clear any existing timers
    if (refreshTimerId !== null) {
      clearTimeout(refreshTimerId);
      refreshTimerId = null;
    }

    // Schedule the first check
    tokenRefreshService.scheduleRefreshCheck();
  },

  /**
   * Schedules a token refresh check
   * @returns {void}
   */
  scheduleRefreshCheck: () => {
    // Clean up any existing timer
    if (refreshTimerId !== null) {
      clearTimeout(refreshTimerId);
    }

    try {
      const userData = localStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);
      if (!user || !user.token) return;

      const timeRemaining = getTimeUntilExpiry(user.token);

      // If less than our threshold, refresh the token
      if (timeRemaining > 0 && timeRemaining < REFRESH_THRESHOLD) {
        // Schedule immediate refresh
        refreshTimerId = setTimeout(() => {
          tokenRefreshService.refreshToken();
        }, 0);
      } else if (timeRemaining > 0) {
        // Schedule check for when we hit the threshold
        const timeToNextCheck = timeRemaining - REFRESH_THRESHOLD;
        refreshTimerId = setTimeout(() => {
          tokenRefreshService.refreshToken();
        }, timeToNextCheck);

        console.log(
          `Token refresh scheduled in ${Math.round(
            timeToNextCheck / 1000 / 60
          )} minutes`
        );
      }
    } catch (error) {
      console.error("Error scheduling token refresh:", error);
    }
  },

  /**
   * Refreshes the token by calling the backend
   * @returns {Promise<void>}
   */
  refreshToken: async () => {
    try {
      console.log("Attempting to refresh token...");

      // Get current user data
      const userData = localStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);
      if (!user || !user.token) return;

      // Call your backend refresh token endpoint
      // You need to implement this endpoint on your backend!
      const response = await api.post("/api/user/refresh-token", {
        // You might need to send the userId
        userId: user.userId,
      });

      // Check if we got a valid response
      if (response.data && response.data.token) {
        // Update user data with new token
        const updatedUser = {
          ...user,
          token: response.data.token,
        };

        // Save updated user data
        localStorage.setItem("user", JSON.stringify(updatedUser));

        console.log("Token refreshed successfully");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
    }

    // Schedule the next check regardless of success/failure
    tokenRefreshService.scheduleRefreshCheck();
  },

  /**
   * Stops the token refresh service
   * @returns {void}
   */
  stop: () => {
    if (refreshTimerId !== null) {
      clearTimeout(refreshTimerId);
      refreshTimerId = null;
    }
  },
};

export default tokenRefreshService;
