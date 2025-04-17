import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "./ConfirmationModal.jsx";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { useToast } from "./Toast.jsx";

export default function UserProfile({ onUpdate }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(user.username);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const getInitials = (name) => {
    const nameArray = name.split(" ");
    return nameArray.map((word) => word.charAt(0).toUpperCase()).join("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      const updatedData = { email, password: password || undefined };
      await onUpdate(updatedData);
      showToast("success", "Profile updated successfully!");
      setPassword("");
    } catch (error) {
      showToast("error", "Failed to update profile. Please try again.");
    } finally {
      setShowConfirmation(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 w-full max-w-2xl mx-auto relative"
    >
      <h2 className="text-2xl font-medium mb-6 text-gray-800">Edit Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="w-28 h-28 rounded-full bg-[#00926c] flex items-center justify-center text-white  text-4xl font-semibold"
          >
            {getInitials(username)}
          </motion.div>
          <button className="text-sm text-[#00926c] hover:text-black font-medium transition-colors">
            Change Photo
          </button>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              disabled
              type="text"
              value={username}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              disabled
              type="email"
              value={email}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
          </motion.div>
          <div className="pt-4">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#00926c] hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Save Changes
            </motion.button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmUpdate}
        title="Confirm Changes"
        message="Are you sure you want to update your profile?"
      >
        {password && (
          <p className="mt-2 text-sm text-gray-500">
            This will change your password.
          </p>
        )}
      </ConfirmationModal>
    </motion.div>
  );
}
