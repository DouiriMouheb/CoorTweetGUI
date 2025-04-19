import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useToast } from "../components/Toast";
import tokenRefreshService from "../services/tokenRefreshService";

export const useLogout = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const logout = () => {
    // Stop token refresh service
    tokenRefreshService.stop();

    // Remove user from localStorage
    localStorage.removeItem("user");

    // Update auth context
    dispatch({ type: "LOGOUT" });

    // Notify user
    showToast("success", "Logged out successfully");

    // Redirect to login page
    navigate("/login");
  };

  return { logout };
};
