import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export const AnalysisProgressOverlay = ({
  isVisible,
  currentStep,
  steps,
  status = "processing", // "processing", "success", "error"
  networkId = null,
  errorData = null, // Changed from errorMessage to errorData
  onFinish = () => {},
}) => {
  // Calculate the percentage completion
  const percentageComplete = steps
    ? (currentStep / (steps.length - 1)) * 100
    : 0;
  const navigate = useNavigate();
  const [showFinalState, setShowFinalState] = useState(false);

  // Get error message from errorData
  const getErrorMessage = () => {
    if (!errorData) return "An unknown error occurred";

    if (errorData.error && errorData.error.message) {
      return errorData.error.message;
    }

    // Fallback for backward compatibility
    if (typeof errorData === "string") {
      return errorData;
    }

    return "An error occurred during analysis";
  };

  // Handle completion and navigation
  useEffect(() => {
    let timer;

    if (status === "success" && networkId) {
      setShowFinalState(true);
      // Wait 2.5 seconds before navigating away on success
      timer = setTimeout(() => {
        navigate(`/network/${networkId}`);
        onFinish();
      }, 2500);
    } else if (status === "error") {
      setShowFinalState(true);
      // Wait 5 seconds before navigating to dashboard on error
      timer = setTimeout(() => {
        window.location.reload();
        onFinish();
      }, 6000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [status, networkId, navigate, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Blur overlay */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Content card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4 z-10"
          >
            {!showFinalState ? (
              // Processing state - show progress
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold bg-[#00926c] bg-clip-text text-transparent">
                    Analyzing Network
                  </h2>
                  <p className="text-[#3d3d3c] mt-2">
                    Please wait while we process your data
                  </p>
                </div>

                {/* Progress percentage */}
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-[#00926c]">
                    Progress
                  </span>
                  <span className="text-sm font-medium text-[#00926c]">
                    {Math.round(percentageComplete)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                  <motion.div
                    className="bg-[#00926c] h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentageComplete}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Steps display */}
                <div className="space-y-4">
                  {steps &&
                    steps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors
                          ${
                            index < currentStep
                              ? "bg-[#00926c] text-white"
                              : index === currentStep
                              ? status === "error" && currentStep === index
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-[#3d3d3c] text-white animate-pulse"
                              : "bg-gray-200 text-[#3d3d3c]"
                          }`}
                        >
                          {index < currentStep ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              index === currentStep
                                ? status === "error" && currentStep === index
                                  ? "text-red-600"
                                  : "text-[#3d3d3c]"
                                : index < currentStep
                                ? "text-[#00926c]"
                                : "text-[#3d3d3c]"
                            }`}
                          >
                            {step.name}
                          </p>
                          {index === currentStep && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={`text-sm mt-1 ${
                                status === "error" && currentStep === index
                                  ? "text-red-500"
                                  : "text-[#3d3d3c]"
                              }`}
                            >
                              {status === "error" && currentStep === index
                                ? `Error: ${getErrorMessage()}`
                                : step.detail}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </>
            ) : status === "success" ? (
              // Success state
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                    delay: 0.2,
                  }}
                >
                  <CheckCircle className="w-24 h-24 text-[#00926c] mb-4" />
                </motion.div>

                <h2 className="text-2xl font-bold text-[#00926c] mb-2">
                  Analysis Complete!
                </h2>

                <p className="text-[#3d3d3c]">
                  Your network has been successfully created
                </p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-[#3d3d3c] mt-6"
                >
                  Redirecting to network view...
                </motion.p>
              </motion.div>
            ) : (
              // Error state
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                    delay: 0.2,
                  }}
                >
                  <XCircle className="w-24 h-24 text-red-500 mb-4" />
                </motion.div>

                <h2 className="text-2xl font-bold text-red-600 mb-2">
                  Analysis Failed
                </h2>
                {/* this is why i commented the error long message */}
                {/*   <p className="text-[#3d3d3c]">{getErrorMessage()}</p> */}

                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{getErrorMessage()}</p>
                  </div>
                </div>

                {/* You can also add information about the specific error stage */}

                {/*        <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-[#3d3d3c] mt-6"
                >
                  Redirecting to dashboard in 5 seconds...
                </motion.p> */}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
