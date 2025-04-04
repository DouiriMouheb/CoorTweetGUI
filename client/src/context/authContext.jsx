import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import LoadingSpinner from "../components/LoadingSpinner"; // Import the spinner

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
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      dispatch({ type: "LOGIN", payload: user });
    }
    setTimeout(() => setLoading(false), 1000); // Add a slight delay for smooth UI
  }, []);

  if (loading) {
    return <LoadingSpinner />; // Show the spinner instead of flashing login
  }

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
