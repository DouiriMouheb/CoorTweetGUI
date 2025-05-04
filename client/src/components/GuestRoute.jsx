import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export const GuestRoute = ({ children }) => {
  const { user } = useAuth(); // Access user from AuthContext

  if (user) {
    return <Navigate to="/" replace />; // Redirect to home if user is already authenticated
  }

  return children; // Render the guest component if not authenticated
};
