import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";
import LoadingSpinner from "../components/LoadingSpinner"; // Import the spinner

const ProtectedRoute = () => {
  const { user } = useAuth();

  if (user === undefined) {
    return <LoadingSpinner />; // Show spinner instead of flashing login
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
