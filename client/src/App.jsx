import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ToastProvider } from "./components/Toast";

// Pages
import LoginScreen from "./pages/LoginScreen";
import Learnmore from "./pages/Learnmore";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NetworkScreen from "./components/NetworkScreen"; // Use the correct path for your NetworkScreen component

// Authentication
import { AuthContextProvider, useAuth } from "./context/authContext";
import Signup from "./pages/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthGuard from "./context/AuthGuard";

// Initialize API service with interceptors
import "./services/api";

// Token refresh service
import tokenRefreshService from "./services/tokenRefreshService";

// App content with access to auth context
const AppContent = () => {
  const { user } = useAuth();

  // Initialize token refresh service when user is logged in
  useEffect(() => {
    if (user) {
      // Start token refresh service
      tokenRefreshService.initialize();
    } else {
      // Stop it when logged out
      tokenRefreshService.stop();
    }

    // Clean up on unmount
    return () => {
      tokenRefreshService.stop();
    };
  }, [user]);

  return (
    <>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/network/:networkId" element={<NetworkScreen />} />
        </Route>
        <Route
          path="/"
          element={
            <AuthGuard>
              <Home />
            </AuthGuard>
          }
        />
        <Route
          path="/register"
          element={
            <AuthGuard>
              <Signup />
            </AuthGuard>
          }
        />
        <Route
          path="/login"
          element={
            <AuthGuard>
              <LoginScreen />
            </AuthGuard>
          }
        />
        <Route path="/learnmore" element={<Learnmore />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthContextProvider>
        <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
        <AppContent />
      </AuthContextProvider>
    </ToastProvider>
  );
}

export default App;
