import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "./ConfirmationModal.jsx";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import { useToast } from "./Toast.jsx";
import * as Yup from "yup";
import { useFormik } from "formik";

export default function UserProfile({ onUpdate }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // "profile" or "password"
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Modified function to get user ID correctly based on the actual structure
  // of how your app stores user information
  const getUserId = () => {
    // First try to get the ID from the user object (which comes from useAuth)
    if (user && user.id) {
      return user.id;
    }

    // Based on the screenshot, user data is stored as a JSON object in localStorage
    // under the "user" key, not as separate "userId" key
    try {
      const userDataStr = localStorage.getItem("user");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData && userData.userId) {
          return userData.userId;
        }
      }

      // If we get here, we couldn't find the user ID
      showToast("error", "User ID not found. Please log in again.");
      return null;
    } catch (error) {
      console.error("Error retrieving user ID:", error);
      showToast(
        "error",
        "Error retrieving user information. Please log in again."
      );
      return null;
    }
  };

  const getInitials = (name) => {
    const nameArray = name.split(" ");
    return nameArray.map((word) => word.charAt(0).toUpperCase()).join("");
  };
  useEffect(() => {
    // If user is switching away from the password tab, reset the form
    if (activeTab !== "password") {
      passwordFormik.resetForm();
    }
  }, [activeTab]);
  // Password update form with Formik
  const passwordFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Current password is required"),
      newPassword: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          "Password must contain uppercase, lowercase, number, and special character"
        )
        .required("New password is required")
        .notOneOf(
          [Yup.ref("currentPassword")],
          "New password must be different from current password"
        ),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Passwords must match")
        .required("Please confirm your password"),
    }),
    onSubmit: async (values) => {
      try {
        setIsUpdatingPassword(true);

        // Get userId using the updated function
        const userId = getUserId();
        if (!userId) return;

        const response = await fetch(
          "http://localhost:5000/api/user/update-password",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              userId: userId,
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
            }),
            credentials: "include",
          }
        );

        const data = await response.json();

        if (response.ok) {
          showToast("success", "Password updated successfully!");
          passwordFormik.resetForm();
        } else {
          showToast("error", data.error || "Failed to update password");
        }
      } catch (error) {
        console.error("Password update error:", error);
        showToast("error", "An error occurred. Please try again.");
      } finally {
        setIsUpdatingPassword(false);
      }
    },
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      await onUpdate({ email });
      showToast("success", "Profile updated successfully!");
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
      <h2 className="text-2xl font-medium mb-6 text-gray-800">
        Account Settings
      </h2>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "profile"
              ? "text-[#00926c] border-b-2 border-[#00926c]"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "password"
              ? "text-[#00926c] border-b-2 border-[#00926c]"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("password")}
        >
          Password
        </button>
      </div>

      {/* Content area */}
      <AnimatePresence mode="wait">
        {activeTab === "profile" ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center space-y-4">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="w-28 h-28 rounded-full bg-[#00926c] flex items-center justify-center text-white text-4xl font-semibold"
              >
                {getInitials(username)}
              </motion.div>
              <button className="text-sm text-[#00926c] hover:text-black font-medium transition-colors">
                Change Photo
              </button>
            </div>

            {/* Form Section */}
            <form onSubmit={handleProfileSubmit} className="space-y-5">
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

              <div className="pt-4">
                <motion.button
                  type="submit"
                  disabled={true}
                  className="w-full bg-gray-300  text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Save Changes
                </motion.button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="password"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-full bg-[#00926c]/10 mr-3">
                <LockClosedIcon className="w-5 h-5 text-[#00926c]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Update Password</h3>
                <p className="text-sm text-gray-500">
                  Ensure your account is using a secure password
                </p>
              </div>
            </div>

            <form onSubmit={passwordFormik.handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    passwordFormik.touched.currentPassword &&
                    passwordFormik.errors.currentPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-[#00926c]"
                  } focus:ring-2 focus:border-transparent transition-all`}
                />
                {passwordFormik.touched.currentPassword &&
                  passwordFormik.errors.currentPassword && (
                    <div className="text-red-500 text-sm mt-1">
                      {passwordFormik.errors.currentPassword}
                    </div>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    passwordFormik.touched.newPassword &&
                    passwordFormik.errors.newPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-[#00926c]"
                  } focus:ring-2 focus:border-transparent transition-all`}
                />
                {passwordFormik.touched.newPassword &&
                  passwordFormik.errors.newPassword && (
                    <div className="text-red-500 text-sm mt-1">
                      {passwordFormik.errors.newPassword}
                    </div>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    passwordFormik.touched.confirmPassword &&
                    passwordFormik.errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-[#00926c]"
                  } focus:ring-2 focus:border-transparent transition-all`}
                />
                {passwordFormik.touched.confirmPassword &&
                  passwordFormik.errors.confirmPassword && (
                    <div className="text-red-500 text-sm mt-1">
                      {passwordFormik.errors.confirmPassword}
                    </div>
                  )}
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword || !passwordFormik.isValid}
                className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all ${
                  isUpdatingPassword || !passwordFormik.isValid
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#00926c] text-white hover:bg-[#007a5a]"
                }`}
              >
                {isUpdatingPassword ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                    Updating...
                  </div>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmUpdate}
        title="Confirm Changes"
        message="Are you sure you want to update your profile?"
      />
    </motion.div>
  );
}
