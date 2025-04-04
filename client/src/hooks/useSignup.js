import { useState } from "react";
import { useAuth } from "../context/authContext";
import { toast } from "react-hot-toast";

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Initial value should be false
  const { dispatch } = useAuth();

  const signup = async (username, email, password) => {
    setIsLoading(true);
    setError(null); // Reset error before starting the signup process
    try {
      const response = await fetch("http://localhost:5000/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "SignUp failed. Please try again.");
      }
      localStorage.setItem("user", JSON.stringify(json));
      // set the user in the context
      dispatch({ type: "LOGIN", payload: json });
      toast.success("Login successful!");
      return true;
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message);
      toast.error(err.message); // Display error toast here
      return false; // Return failure flag
    } finally {
      setIsLoading(false);
    }
  };

  return { signup, error, isLoading };
};
