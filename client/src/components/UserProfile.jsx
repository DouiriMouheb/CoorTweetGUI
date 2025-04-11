import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { motion } from "framer-motion";
import {
  UserCircleIcon,
  XMarkIcon,
  ArrowLeftEndOnRectangleIcon,
  HomeIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useLogout } from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";

export default function UserProfileEditor({ onUpdate }) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(user.username); // Assuming user has a username field
  const [profilePic, setProfilePic] = useState(user.profilePic);
  const [isExpanded, setIsExpanded] = useState(false);
  const { logout } = useLogout();
  const handleLogout = () => logout();
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  const navigate = useNavigate(); // Add this for navigation

  const getInitials = (name) => {
    const nameArray = name.split(" ");
    const initials = nameArray
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
    return initials;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = { email, password: password || undefined, profilePic };
    onUpdate(updatedData);
  };

  return (
    <div className="w-full h-[100vh] mx-auto p-4 flex flex-col bg-gray-100 overflow-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-center w-full ">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            duration: 0.5,
          }}
          className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-between shadow-lg ${
            isExpanded ? "w-full max-w-4xl py-3 px-6" : "w-64 py-2 px-4"
          }`}
          style={{
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Collapsed view */}
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center">
                <UserCircleIcon className="w-6 h-6 mr-2 transition-transform duration-300" />
                <span className="font-medium truncate">{user?.username}</span>
              </div>
              <button
                onClick={toggleExpand}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors duration-300"
              >
                <ChevronRightIcon className="w-5 h-5 transition-transform duration-300" />
              </button>
            </motion.div>
          )}

          {/* Expanded view */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center space-x-8">
                <motion.div
                  className="flex items-center"
                  transition={{ staggerChildren: 0.1 }}
                >
                  <UserCircleIcon className="w-6 h-6 mr-2 transition-transform duration-300" />
                  <span className="font-medium">{user.username}</span>
                </motion.div>

                <div className="flex space-x-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => {
                      navigate("/");
                      toggleExpand();
                    }}
                    className="flex items-center space-x-2 hover:text-blue-200 transition-colors duration-300"
                  >
                    <HomeIcon className="w-5 h-5" />
                    <span>Dashboard</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => {
                      if (location.pathname !== "/profile") navigate("/");

                      toggleExpand();
                    }}
                    className="flex items-center space-x-2 hover:text-blue-200 transition-colors duration-300"
                  >
                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                    <span>Parameters</span>
                  </motion.button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-200 hover:text-red-100 transition-colors duration-300"
                >
                  <ArrowLeftEndOnRectangleIcon className="w-5 h-5" />
                  <span>Logout</span>
                </motion.button>

                <button
                  onClick={toggleExpand}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors duration-300"
                >
                  <ChevronDownIcon className="w-5 h-5 transform rotate-180 transition-transform duration-300" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      <div className="p-6 bg-white shadow-md rounded-lg w-full max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Edit Profile</h2>

        {/* Two-column layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Profile Picture (Initials) Column */}
          <div className="flex items-center justify-center">
            <div className="w-32 h-32 rounded-full shadow-lg bg-blue-500 text-white flex items-center justify-center font-bold text-3xl">
              {getInitials(username)}
            </div>
          </div>

          {/* Form Column */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium w-24">Username:</label>
              <input
                disabled="true"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 p-2 border border-gray-300 shadow-md rounded-md w-full"
                required
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium w-24">Email:</label>
              <input
                disabled="true"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 p-2 border border-gray-300 shadow-md rounded-md w-full"
                required
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium w-24">New Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 p-2 border border-gray-300 shadow-md rounded-md w-full"
              />
            </div>
          </form>
        </div>

        {/* Save Changes Button (Centered Below Both Columns) */}
        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white border border-gray-300 shadow-lg rounded-md"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
