import { useState } from "react";
import { useAuth } from "../context/authContext";
import { toast } from "react-hot-toast";
import api from "../services/api";

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuth();

  const signup = async (username, email, password) => {
    setIsLoading(true);
    setError(null); // Reset error before starting the signup process

    try {
      const response = await api.post("/api/user/register", {
        username,
        email,
        password,
      });

      const data = response.data;

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(data));

      // Set the user in the context
      dispatch({ type: "LOGIN", payload: data });

      // Show success message
      toast.success("Registration successful!");
      return true;
    } catch (err) {
      console.error("Signup error:", err);

      // Extract error message from response if available
      const errorMessage =
        err.response?.data?.error || "Signup failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { signup, error, isLoading };
};
