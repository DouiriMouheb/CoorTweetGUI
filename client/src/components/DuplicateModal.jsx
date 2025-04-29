import { motion, AnimatePresence } from "framer-motion";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/solid";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import axios from "axios";
import { AnalysisDuplicateProgressOverlay } from "./ProgressBars/AnalysisDuplicateProgressOverlay";
import toast from "react-hot-toast";

export default function DuplicateModal({
  isOpen,
  onClose,
  onConfirm,
  projectData,
  dataSetName,
  title = "Duplicate Project",
  confirmText = "Duplicate",
  confirmColor = "blue",
  disabled = false,
  children,
}) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState("processing"); // "processing", "success", "error"
  const [savedNetworkId, setSavedNetworkId] = useState(null);
  const [errorData, setErrorData] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  // Define the analysis steps
  const analysisSteps = [
    {
      name: "Preparing Data",
      detail: "Validating parameters and preparing for analysis...",
    },
    {
      name: "Processing CSV",
      detail: "Reading and processing file contents...",
    },
    {
      name: "Running Algorithm",
      detail: "Detecting coordinated behavior patterns...",
    },
    { name: "Building Network", detail: "Constructing relationship graph..." },
    { name: "Saving Results", detail: "Storing network data in database..." },
  ];
  // Create validation schema
  const validationSchema = Yup.object({
    projectName: Yup.string().required("Project name is required"),
    minParticipation: Yup.number()
      .required("Minimum participation is required")
      .min(1, "Must be at least 1"),
    timeWindow: Yup.number()
      .required("Time window is required")
      .min(1, "Must be at least 1"),
    edgeWeight: Yup.number()
      .required("Edge weight is required")
      .min(0, "Must be at least 0"),
    dataSetName: Yup.string(),
  });

  // Setup formik with initial values from projectData
  const formik = useFormik({
    initialValues: {
      projectName: projectData?.projectName
        ? `${projectData.projectName} (Copy)`
        : "",
      minParticipation: projectData?.minParticipation || 2,
      timeWindow: projectData?.timeWindow || 60,
      edgeWeight: projectData?.edgeWeight || 0.5,
      dataSetName: dataSetName || "",
    },
    validationSchema,
    onSubmit: (values) => {
      // Log the form data to console
      console.log("Form data submitted:", values);
      // Start analysis
      setTimeout(() => {
        fetchDataFromAPI(values);
      }, 0);
      // Call the onConfirm function with the values
      onConfirm(values);
    },
  });
  const saveNetwork = async (data, parameters, token) => {
    // Update the analysis step to indicate we're saving the network
    setAnalysisStep(4);

    const networkData = {
      // Only send what the server controller is looking for
      data: data,
      networkName: parameters.projectName || "Test",
      // Since the model requires these fields, include them even though the controller doesn't use them
      minParticipation: parameters.minParticipation,
      timeWindow: parameters.timeWindow,
      edgeWeight: parameters.edgeWeight,
      dataSetName: data.filename,
    };

    try {
      const response = await axios.post(
        `${apiUrl}/api/network/save-network`,
        networkData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Network saved successfully");

      // Store the network ID for navigation
      setSavedNetworkId(response.data._id);

      return response.data;
    } catch (error) {
      console.error("Error saving network:", error);
      setErrorData({
        status: "error",
        error: {
          stage: "saving_network",
          message:
            error.response?.data?.error ||
            "Failed to save network data to database",
        },
      });
      setAnalysisStatus("error");
      //toast.error("Failed to save network.");
      throw error;
    }
  };

  // Fetch data from the API and then save the network
  const fetchDataFromAPI = async (parameters) => {
    try {
      // Reset states for a new analysis
      setIsLoading(true);
      setAnalysisStatus("processing");
      setErrorData(null);

      // Debug auth token
      const userData = localStorage.getItem("user");
      const token = userData ? JSON.parse(userData).token : null;
      if (!token) {
        console.error("No auth token found in localStorage");
        setErrorData({
          status: "error",
          error: {
            stage: "authentication",
            message: "Authentication token missing. Please log in again.",
          },
        });
        setAnalysisStatus("error");
        toast.error("Authentication failed. Please log in again.");
        return null;
      }

      // Step 1: Preparing data
      setAnalysisStep(0);
      await simulateDelay(1000);

      // Step 2: Processing CSV file
      setAnalysisStep(1);
      await simulateDelay(1500);

      const requestUrl = `${apiUrl}/r-duplicate/run-r-duplicate`;

      // Instead of using FormData, send a JSON request with the correct parameter names
      const requestData = {
        minParticipation: parameters.minParticipation,
        timeWindow: parameters.timeWindow,
        subgraph: 1,
        edgeWeight: parameters.edgeWeight,
        userId: user.userId,
        projectName: parameters.projectName,
        dataSetName: parameters.dataSetName,
      };

      // Step 3: Running algorithm
      setAnalysisStep(2);

      // Use axios with token for authentication
      const response = await axios.post(requestUrl, requestData, {
        headers: {
          "Content-Type": "application/json", // Changed to JSON
          Authorization: `Bearer ${token}`,
        },
      });

      // Axios auto-parses JSON
      console.log(response);
      const data = response.data;

      // Check if the response contains an error status from R script
      if (data.status === "error") {
        setErrorData(data);
        if (data.error && data.error.stage) {
          setAnalysisStep(mapErrorStageToStep(data.error.stage));
        }
        setAnalysisStatus("error");
        throw new Error(data.error?.message || "Analysis failed");
      }

      // Step 4: Building network
      setAnalysisStep(3);
      await simulateDelay(1000);

      // Check if data is valid
      if (!data || Object.keys(data).length === 0) {
        setErrorData({
          status: "error",
          error: {
            stage: "network_generation",
            message: "No valid network data was generated",
          },
        });
        throw new Error("No valid network data was generated");
      }

      // Save the network data with the token
      const savedNetworkData = await saveNetwork(data, parameters, token);

      // Update formData with the network ID and data
      /*setFormData((prevData) => ({
        ...prevData,
        networkId: savedNetworkData._id,
        networkData: savedNetworkData,
      }));*/

      // Complete all steps before showing success state
      await simulateDelay(1000);

      // Set the analysis as complete to trigger the success state
      setAnalysisStatus("success");

      return data;
    } catch (error) {
      console.error("Error during analysis:", error);

      // If errorData is not already set, create appropriate error structure
      if (!errorData) {
        // Create error data based on the current step
        switch (analysisStep) {
          case 0:
            setErrorData({
              status: "error",
              error: {
                stage: "parameter_parsing",
                message: `${error.message}`,
              },
            });
            break;
          case 1:
            setErrorData({
              status: "error",
              error: {
                stage: "file_reading",
                message: `CSV processing error: ${error.message}`,
              },
            });
            break;
          case 2:
            setErrorData({
              status: "error",
              error: {
                stage: "detect_groups",
                message: `Algorithm error: ${error.message}`,
              },
            });
            break;
          case 3:
            setErrorData({
              status: "error",
              error: {
                stage: "network_generation",
                message: `Network construction error: ${error.message}`,
              },
            });
            break;
          case 4:
            setErrorData({
              status: "error",
              error: {
                stage: "output_preparation",
                message: `Saving error: ${error.message}`,
              },
            });
            break;
          default:
            setErrorData({
              status: "error",
              error: {
                stage: "unknown",
                message: `Error: ${error.message}`,
              },
            });
        }
      }

      setAnalysisStatus("error");
      return null;
    }
  };
  // Handle completion of the success or error state and cleanup
  const handleAnalysisFinished = () => {
    // Reset only the loading state - keep other states intact until explicitly changed
    setIsLoading(false);

    // Only proceed to next step if success
    if (analysisStatus === "success") {
      nextStep();

      // Reset states after navigation
      setTimeout(() => {
        setAnalysisStatus("processing");
        setAnalysisStep(0);
        setErrorData(null);
      }, 500);
    }
    // For error state, leave the error message visible until user takes action
  };

  // Helper function to simulate delay for progress visualization
  const simulateDelay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  // Add effect to reset form when modal closes or when dataSetName changes
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
    }
  }, [isOpen]);

  // Update dataSetName value when prop changes
  useEffect(() => {
    if (dataSetName) {
      formik.setFieldValue("dataSetName", dataSetName);
    }
  }, [dataSetName]);

  return (
    <>
      <AnalysisDuplicateProgressOverlay
        isVisible={isLoading}
        currentStep={analysisStep}
        steps={analysisSteps}
        status={analysisStatus}
        networkId={savedNetworkId}
        errorData={errorData}
        onFinish={handleAnalysisFinished}
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl"
            >
              <div className="flex items-start mb-4">
                <ArrowPathRoundedSquareIcon className="w-6 h-6 text-green-500 mr-3 mt-1" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    You are about to start a new analysis based on the selected
                    dataset.
                  </p>

                  {/* Hidden input field for dataSetName */}
                  <input
                    type="hidden"
                    id="dataSetName"
                    name="dataSetName"
                    value={formik.values.dataSetName}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* Project Name Field */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                  <label
                    htmlFor="projectName"
                    className="text-sm font-medium md:col-span-1 md:text-right"
                  >
                    Project Name:
                  </label>
                  <div className="md:col-span-2">
                    <input
                      id="projectName"
                      type="text"
                      name="projectName"
                      value={formik.values.projectName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`p-2 border ${
                        formik.touched.projectName && formik.errors.projectName
                          ? "border-red-500"
                          : "border-gray-300"
                      } shadow-sm rounded-md w-full`}
                    />
                    {formik.touched.projectName &&
                      formik.errors.projectName && (
                        <p className="text-red-500 text-xs mt-1">
                          {formik.errors.projectName}
                        </p>
                      )}
                  </div>
                </div>

                {/* Min Participation Field */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                  <label
                    htmlFor="minParticipation"
                    className="text-sm font-medium md:col-span-1 md:text-right"
                  >
                    Minimum Participation:
                  </label>
                  <div className="md:col-span-2">
                    <input
                      id="minParticipation"
                      type="number"
                      name="minParticipation"
                      value={formik.values.minParticipation}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`p-2 border ${
                        formik.touched.minParticipation &&
                        formik.errors.minParticipation
                          ? "border-red-500"
                          : "border-gray-300"
                      } shadow-sm rounded-md w-full`}
                    />
                    {formik.touched.minParticipation &&
                      formik.errors.minParticipation && (
                        <p className="text-red-500 text-xs mt-1">
                          {formik.errors.minParticipation}
                        </p>
                      )}
                  </div>
                </div>

                {/* Time Window Field */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                  <label
                    htmlFor="timeWindow"
                    className="text-sm font-medium md:col-span-1 md:text-right"
                  >
                    Time Window (seconds):
                  </label>
                  <div className="md:col-span-2">
                    <input
                      id="timeWindow"
                      type="number"
                      name="timeWindow"
                      value={formik.values.timeWindow}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`p-2 border ${
                        formik.touched.timeWindow && formik.errors.timeWindow
                          ? "border-red-500"
                          : "border-gray-300"
                      } shadow-sm rounded-md w-full`}
                    />
                    {formik.touched.timeWindow && formik.errors.timeWindow && (
                      <p className="text-red-500 text-xs mt-1">
                        {formik.errors.timeWindow}
                      </p>
                    )}
                  </div>
                </div>

                {/* Edge Weight Field */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                  <label
                    htmlFor="edgeWeight"
                    className="text-sm font-medium md:col-span-1 md:text-right"
                  >
                    Edge Weight:
                  </label>
                  <div className="md:col-span-2">
                    <input
                      id="edgeWeight"
                      type="number"
                      name="edgeWeight"
                      value={formik.values.edgeWeight}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`p-2 border ${
                        formik.touched.edgeWeight && formik.errors.edgeWeight
                          ? "border-red-500"
                          : "border-gray-300"
                      } shadow-sm rounded-md w-full`}
                    />
                    {formik.touched.edgeWeight && formik.errors.edgeWeight && (
                      <p className="text-red-500 text-xs mt-1">
                        {formik.errors.edgeWeight}
                      </p>
                    )}
                  </div>
                </div>

                {children}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  {/*
                  <button
                    type="submit"
                    disabled={isLoading || !formik.isValid}
                    className={`px-4 py-2 flex items-center justify-center ${
                      confirmColor === "red"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : confirmColor === "blue"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    } rounded-lg transition-colors w-24`}
                  >
                    {disabled ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      confirmText
                    )}
                  </button>*/}
                  <button
                    disabled={isLoading || !formik.isValid}
                    onClick={formik.handleSubmit}
                    className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center ${
                      isLoading || !formik.isValid
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r bg-[#00926c] text-white hover:shadow-lg"
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                        Processing...
                      </div>
                    ) : (
                      "Analyse"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
