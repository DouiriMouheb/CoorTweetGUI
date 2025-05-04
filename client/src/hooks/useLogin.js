import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useToast } from "../components/Toast";
import api from "../services/api";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuth();
  const { showToast } = useToast();

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null); // Reset error before making request

    try {
      // Use our API service instead of direct fetch
      const response = await api.post("/api/user/login", {
        email,
        password,
      });

      const data = response.data;

      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(data));

      // Update auth context
      dispatch({ type: "LOGIN", payload: data });

      showToast("success", "Login successful!");
      return true; // Return success flag
    } catch (err) {
      console.error("Login error:", err);

      // Get error message from response or use generic message
      const errorMessage =
        err.response?.data?.error || "Login failed. Please try again.";
      setError(errorMessage);
      showToast("error", errorMessage);
      return false; // Return failure flag
    } finally {
      setIsLoading(false);
    }
  };

  return { login, error, isLoading };
};
