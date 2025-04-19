import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { isTokenExpired } from "../utils/authUtils";

export const AuthContext = createContext();

export const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      return { user: null };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load and validate user from localStorage on app initialization
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) return null;

        const user = JSON.parse(userData);

        // Check if token exists
        if (!user || !user.token) {
          console.log("No valid user data found in localStorage");
          return null;
        }

        // Check if token is expired
        if (isTokenExpired(user.token)) {
          console.log("Token is expired, logging out");
          localStorage.removeItem("user");
          toast.error("Your session has expired. Please log in again.");
          return null;
        }

        return user;
      } catch (error) {
        console.error("Error loading user data:", error);
        localStorage.removeItem("user");
        return null;
      }
    };

    const user = loadUser();
    if (user) {
      console.log("Valid user found in localStorage, logging in");
      dispatch({ type: "LOGIN", payload: user });
    }

    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
