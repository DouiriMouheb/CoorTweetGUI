import axios from "axios";
import { toast } from "react-hot-toast";
import { isTokenExpired } from "../utils/authUtils";

// Create axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
  timeout: 100000, // 10 seconds timeout
});

// Request interceptor - Adds authorization header and validates token
api.interceptors.request.use(
  (config) => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (!userData) return config;

    try {
      const user = JSON.parse(userData);

      // If we have a token, check if it's valid
      if (user && user.token) {
        // Check if token is expired before making the request
        if (isTokenExpired(user.token)) {
          // Token is expired, clear localStorage and don't add token
          localStorage.removeItem("user");

          // Only show toast if it's not a login/register request
          if (
            !config.url.includes("/login") &&
            !config.url.includes("/register")
          ) {
            toast.error("Your session has expired. Please log in again.");
            // Redirect to login page
            window.location.href = "/login";
          }
        } else {
          // Token is valid, add it to the headers
          config.headers["Authorization"] = `Bearer ${user.token}`;
        }
      }
    } catch (error) {
      console.error("Error processing request interceptor:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handles auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Handle expired token or unauthorized errors
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // If we get a 401, clear user data and redirect to login
      localStorage.removeItem("user");

      // Only show the message and redirect if it's not a login/register request
      if (
        !originalRequest.url.includes("/login") &&
        !originalRequest.url.includes("/register")
      ) {
        toast.error("Authentication failed. Please log in again.");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
