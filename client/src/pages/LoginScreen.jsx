import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useFormik } from "formik";
import * as Yup from "yup";

const LoginScreen = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { login, error, isLoading } = useLogin();
  const [serverError, setServerError] = useState({ field: "", message: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState({ type: "", text: "" });

  // Update serverError when the error from useLogin changes
  useEffect(() => {
    if (error) {
      // Determine which field has the error
      if (
        error.toLowerCase().includes("email") ||
        error.toLowerCase().includes("user") ||
        error.toLowerCase().includes("account")
      ) {
        setServerError({ field: "email", message: error });
      } else {
        setServerError({ field: "password", message: error });
      }
    } else {
      setServerError({ field: "", message: "" });
    }
  }, [error]);

  // Create formik instance
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      // No need to clear previous server errors here as it will be handled by the useEffect

      const success = await login(values.email, values.password);

      if (success) {
        navigate("/dashboard");
      }
      // No need to handle errors here as the useEffect will catch them
    },
  });

  // Reset server error when the user changes the field's value
  useEffect(() => {
    if (
      serverError.field === "email" &&
      formik.values.email !== formik.initialValues.email
    ) {
      setServerError({ field: "", message: "" });
    }
  }, [formik.values.email]);

  useEffect(() => {
    if (
      serverError.field === "password" &&
      formik.values.password !== formik.initialValues.password
    ) {
      setServerError({ field: "", message: "" });
    }
  }, [formik.values.password]);

  // Check if there are errors to show (either Formik validation or server errors)
  const hasEmailError =
    (formik.touched.email && formik.errors.email) ||
    (serverError.field === "email" && serverError.message);
  const hasPasswordError =
    (formik.touched.password && formik.errors.password) ||
    (serverError.field === "password" && serverError.message);

  // Get the appropriate error message to display
  const emailErrorMessage =
    serverError.field === "email" ? serverError.message : formik.errors.email;
  const passwordErrorMessage =
    serverError.field === "password"
      ? serverError.message
      : formik.errors.password;

  // Then add this function to handle the password reset
  /*const handleForgotPassword = async (e) => {
    e.preventDefault();

    // Reset previous messages
    setResetMessage({ type: "", text: "" });

    if (!forgotEmail) {
      setResetMessage({
        type: "error",
        text: "Please enter your email address",
      });
      return;
    }

    try {
      setIsResetting(true);

      const response = await fetch(
        "http://localhost:5000/api/user/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: forgotEmail }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResetMessage({
          type: "success",
          text: "Check your email for your new password!",
        });
        // Clear the email input
        setForgotEmail("");
      } else {
        setResetMessage({
          type: "error",
          text: data.error || "Failed to reset password. Please try again.",
        });
      }
    } catch (error) {
      setResetMessage({
        type: "error",
        text: "An error occurred. Please try again later.",
      });
      console.error("Forgot password error:", error);
    } finally {
      setIsResetting(false);
    }
  };*/
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    // Reset previous messages
    setResetMessage({ type: "", text: "" });

    if (!forgotEmail) {
      setResetMessage({
        type: "error",
        text: "Please enter your email address",
      });
      return;
    }

    try {
      setIsResetting(true);

      const response = await fetch(
        `${apiUrl}/api/user/forgot-password`,

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: forgotEmail }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResetMessage({
          type: "success",
          text: "Check your email for your new password!",
        });
        setForgotEmail("");
      } else if (response.status === 429) {
        // Rate limit error
        setResetMessage({
          type: "error",
          text:
            data.error ||
            "Too many password reset requests. Please try again later.",
        });
      } else {
        setResetMessage({
          type: "error",
          text: data.error || "Failed to reset password. Please try again.",
        });
      }
    } catch (error) {
      setResetMessage({
        type: "error",
        text: "An error occurred. Please try again later.",
      });
      console.error("Forgot password error:", error);
    } finally {
      setIsResetting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold bg-[#00926c] bg-clip-text text-transparent"
          >
            Coordinated Sharing Behavior Detection
          </motion.h1>
          <h2 className="text-lg text-gray-600">Sign in to your account</h2>
        </div>

        <form className="space-y-6" onSubmit={formik.handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                hasEmailError
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              } transition-all`}
            />
            {hasEmailError && (
              <div className="text-red-500 text-sm mt-1">
                {emailErrorMessage}
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(true);
                }}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                hasPasswordError
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              } transition-all`}
            />
            {hasPasswordError && (
              <div className="text-red-500 text-sm mt-1">
                {passwordErrorMessage}
              </div>
            )}
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="w-full py-3 px-4 bg-[#00926c] text-white rounded-lg font-medium hover:shadow-md transition-shadow relative"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                Signing in...
              </div>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </a>
        </p>
      </motion.div>

      {/* Forgot Password Dialog */}
      {/* Forgot Password Dialog */}
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setForgotEmail("");
          setResetMessage({ type: "", text: "" });
        }}
        className="relative z-10"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 p-2 rounded-lg mr-4">
                  <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Reset Password
                  </DialogTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your email to receive a new password
                  </p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleForgotPassword}>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                />

                {resetMessage.text && (
                  <div
                    className={`p-3 rounded ${
                      resetMessage.type === "success"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {resetMessage.text}
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setForgotEmail("");
                      setResetMessage({ type: "", text: "" });
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center"
                  >
                    {isResetting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      "Send Password"
                    )}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </motion.div>
        </div>
      </Dialog>
    </div>
  );
};

export default LoginScreen;
