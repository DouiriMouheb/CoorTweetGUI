// AnalysisProgressBar.jsx
import React from "react";
import { motion } from "framer-motion";

export const AnalysisProgressBar = ({ currentStep, steps }) => {
  // Calculate the percentage completion
  const percentageComplete = (currentStep / steps.length) * 100;

  return (
    <div className="w-full space-y-2">
      {/* Progress percentage display */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-blue-700">
          Analysis Progress
        </span>
        <span className="text-sm font-medium text-blue-700">
          {Math.round(percentageComplete)}%
        </span>
      </div>

      {/* Actual progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentageComplete}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Step indicator */}
      <div className="flex flex-col mt-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-3 mb-2">
            <div
              className={`w-5 h-5 flex items-center justify-center rounded-full 
                ${
                  index < currentStep
                    ? "bg-green-500 text-white"
                    : index === currentStep
                    ? "bg-blue-500 text-white animate-pulse"
                    : "bg-gray-200 text-gray-400"
                }`}
            >
              {index < currentStep ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
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
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
            <span
              className={`text-sm ${
                index === currentStep
                  ? "text-blue-600 font-medium"
                  : index < currentStep
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {step.name}
              {index === currentStep && step.detail && (
                <span className="ml-2 text-xs text-gray-500">
                  {step.detail}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
