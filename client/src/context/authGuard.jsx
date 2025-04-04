import { Navigate } from "react-router-dom";

const AuthGuard = ({ children }) => {
  const user = localStorage.getItem("user"); // Check if user is logged in

  if (user) {
    return <Navigate to="/dashboard" replace />; // Redirect to home if logged in
  }

  return children; // Otherwise, render the page
};

export default AuthGuard;
