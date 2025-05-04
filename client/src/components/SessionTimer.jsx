import { useState, useEffect } from "react";
import { getTimeUntilExpiry, getTokenExpiryDate } from "../utils/authUtils";
import { useLogout } from "../hooks/useLogout";
import { useToast } from "./Toast";

/**
 * Displays a session timer showing when the user's JWT will expire
 * Shows warnings as the expiration time approaches
 */
const SessionTimer = ({ className }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [warningLevel, setWarningLevel] = useState("");
  const { logout } = useLogout();
  const { showToast } = useToast();

  useEffect(() => {
    // Function to update time remaining
    const updateTimeRemaining = () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) return;

        const user = JSON.parse(userData);
        if (!user || !user.token) return;

        const timeRemaining = getTimeUntilExpiry(user.token);

        // If token has expired, log out
        if (timeRemaining <= 0) {
          setTimeLeft("Expired");
          logout();
          showToast("error", "Your session has expired. Please log in again.");
          return;
        }

        // Calculate minutes and seconds
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);

        // Format time based on remaining time
        let formattedTime = "";
        if (minutes > 60) {
          const hours = Math.floor(minutes / 60);
          formattedTime = `${hours}h ${minutes % 60}m`;
          setWarningLevel("");
        } else if (minutes > 5) {
          formattedTime = `${minutes}m`;
          setWarningLevel("");
        } else if (minutes > 0) {
          formattedTime = `${minutes}m ${seconds}s`;
          setWarningLevel("warning");

          // Show warning toast at 5 minutes remaining
          if (minutes === 5 && seconds > 55) {
            showToast("warning", "Your session will expire in 5 minutes");
          }
        } else {
          formattedTime = `${seconds}s`;
          setWarningLevel("critical");

          // Show critical toast at 1 minute remaining
          if (seconds === 60) {
            showToast("error", "Your session will expire in 1 minute!");
          }
        }

        setTimeLeft(formattedTime);
      } catch (error) {
        console.error("Error updating session timer:", error);
        setTimeLeft("");
      }
    };

    // Initial update
    updateTimeRemaining();

    // Update every second
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [logout, showToast]);

  // Don't render if no time left data
  if (!timeLeft) return null;

  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1.5 ${
        warningLevel === "critical"
          ? "bg-red-100 text-red-800 animate-pulse"
          : warningLevel === "warning"
          ? "bg-amber-100 text-amber-800"
          : "bg-gray-100 text-gray-600"
      } ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>Session: {timeLeft}</span>
    </div>
  );
};

export default SessionTimer;
