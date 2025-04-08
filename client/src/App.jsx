import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import LoginScreen from "./pages/LoginScreen"
import Learnmore from "./pages/Learnmore";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import { AuthContextProvider } from "./context/authContext";
import Signup from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthGuard from "./context/AuthGuard";

axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;

function App() {
  return (
    <AuthContextProvider>
      <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
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
    </AuthContextProvider>
  );
}

export default App;
