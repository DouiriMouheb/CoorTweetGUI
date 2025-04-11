import { useState } from "react";
import { useAuth } from "../context/authContext";
import { toast } from "react-hot-toast";
import { useToast } from "../components/Toast";
export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuth();
  const { showToast } = useToast(); // Get the showToast function from Toast Context

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null); // Reset error before making request

    try {
      const response = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json(); // Parse JSON response

      if (!response.ok) {
        throw new Error(json.error || "Login failed. Please try again.");
      }

      // If login is successful, save user data
      localStorage.setItem("user", JSON.stringify(json));
      dispatch({ type: "LOGIN", payload: json });

      // Personalized welcome message
      showToast("success", `Welcome back, ${json.username}!`);
      return true; // Return success flag
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
      // Show error toast
      showToast("error", err.message);
      return false; // Return failure flag
    } finally {
      setIsLoading(false);
    }
  };

  return { login, error, isLoading };
};
