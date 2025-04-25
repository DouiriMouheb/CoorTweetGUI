import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import toast from "react-hot-toast";
import { ProgressBar } from "./ProgressBar";
import { AnalysisProgressOverlay } from "./ProgressBars/AnalysisProgressOverlay";
import { useAuth } from "../context/authContext";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function ConfigureParametersFormStep({
  nextStep,
  prevStep,
  formData,
  setFormData,
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

  // Initialize formik with proper validation
  const formik = useFormik({
    initialValues: {
      projectName: formData.parameters?.projectName || "",
      minParticipation: formData.parameters?.minParticipation || 2,
      timeWindow: formData.parameters?.timeWindow || 60,
      edgeWeight: formData.parameters?.edgeWeight || "0.5",
    },
    validationSchema: Yup.object({
      projectName: Yup.string().trim().required("Project name is required"),
      minParticipation: Yup.number()
        .min(1, "Minimum participation must be at least 1")
        .required("Minimum participation is required"),
      timeWindow: Yup.number()
        .min(1, "Time window must be at least 1 second")
        .required("Time window is required"),
      edgeWeight: Yup.number()
        .min(0, "Edge weight must be at least 0")
        .max(1, "Edge weight must be at most 1")
        .required("Edge weight is required"),
    }),
    onSubmit: (values) => {
      // Update formData with validated values
      setFormData((prevData) => ({
        ...prevData,
        parameters: { ...values },
      }));

      // Start analysis
      setTimeout(() => {
        fetchDataFromAPI(values);
      }, 0);
    },
  });

  // Save network data to the API
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

      const csvFile = formData.csvFile;

      // Step 2: Processing CSV file
      setAnalysisStep(1);
      await simulateDelay(1500);

      if (!csvFile) {
        setErrorData({
          status: "error",
          error: {
            stage: "file_access",
            message: "No CSV file provided",
          },
        });
        throw new Error("No CSV file provided");
      }

      const requestUrl = `${apiUrl}/r/run-r`;
      const formDataToSend = new FormData();
      formDataToSend.append("input", csvFile);
      formDataToSend.append("min_participation", parameters.minParticipation);
      formDataToSend.append("time_window", parameters.timeWindow);
      formDataToSend.append("subgraph", 1);
      formDataToSend.append("edge_weight", parameters.edgeWeight);

      // Step 3: Running algorithm
      setAnalysisStep(2);

      // Use axios with token for authentication
      const response = await axios.post(requestUrl, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Axios auto-parses JSON
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
      setFormData((prevData) => ({
        ...prevData,
        networkId: savedNetworkData._id,
        networkData: savedNetworkData,
      }));

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
      //toast.error(error.message);
      return null;
    }
  };

  // Map R script error stages to UI steps
  const mapErrorStageToStep = (stage) => {
    const stageToStepMap = {
      // Data loading and parameter steps
      parameter_parsing: 0,
      file_access: 1,
      file_reading: 1,
      empty_data: 1,

      // Algorithm step
      detect_groups: 2,
      no_coordination: 2,

      // Network building step
      network_generation: 3,
      empty_graph_nodes: 3,
      empty_graph_edges: 3,
      edge_extraction: 3,
      edge_processing: 3,
      graph_creation: 3,
      community_detection: 3,
      single_community: 3,
      vertex_extraction: 3,

      // Saving step
      output_preparation: 4,
      json_conversion: 4,
      saving_network: 4,
    };

    return stageToStepMap[stage] !== undefined
      ? stageToStepMap[stage]
      : analysisStep;
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

  return (
    <div className="w-full h-[100vh] mx-auto p-4 flex flex-col bg-gray-100 overflow-auto space-y-6">
      <AnalysisProgressOverlay
        isVisible={isLoading}
        currentStep={analysisStep}
        steps={analysisSteps}
        status={analysisStatus}
        networkId={savedNetworkId}
        errorData={errorData}
        onFinish={handleAnalysisFinished}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto  space-y-4 w-full"
      >
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold bg-[#00926c] bg-clip-text text-transparent"
          >
            Coordinated Sharing Behavior Detection
          </motion.h1>

          <div className="flex items-center justify-center gap-4">
            <div className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full font-medium flex items-center">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-2">
                3
              </span>
              Set Parameters
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={prevStep}
            className="px-6 py-3 rounded-lg font-medium text-black-600 hover:bg-blue-200 transition-colors flex items-center"
            disabled={isLoading}
          >
            Back
          </button>

          {/* Progress Bar in the middle */}
          <div className="mx-4 flex-grow max-w-xs">
            <ProgressBar currentStep={3} totalSteps={3} />
          </div>

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
        </motion.div>
        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Notes:</h3>
              <ul className="space-y-4">
                {[
                  {
                    title: "Minimum Participation",
                    content:
                      "The threshold for the minimum level of coordinated participation required for inclusion in the analysis. Only users in the dataset with at least the specified number of shares will be processed.",
                  },
                  {
                    title: "Time Window (seconds)",
                    content:
                      "The time window indicates the interval considered for calculating co-shares. A very narrow time window (e.g., < 1 sec) tends to indicate automated behavior, whereas a time window of several hours may highlight human-coordinated behavior.",
                  },
                  {
                    title: "Edge Weight",
                    content:
                      "The edge threshold defines the minimum frequency of co-sharing required for a connection to be made. It measures co-sharing frequency as a proportion (from 0 to 1) of all accounts in the dataset. A standard choice is the median (0.5). Using higher thresholds helps identify co-sharing activities between accounts that range from unusual to extremely unusual.",
                  },
                ].map((note, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group relative"
                  >
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <span className="text-sm text-gray-600">
                          {note.title}
                        </span>
                        <div className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 left-full  top-0 w-128 p-3 bg-white border rounded-lg shadow-lg transition-all">
                          <p className="text-sm text-gray-600">
                            {note.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-3 bg-white rounded-xl shadow-lg p-6"
          >
            <form
              onSubmit={formik.handleSubmit}
              className="w-full max-w-lg space-y-6"
            >
              {/* Project Name Field */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
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
                    } shadow-md rounded-md text-center w-full`}
                  />
                  {formik.touched.projectName && formik.errors.projectName && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.projectName}
                    </p>
                  )}
                </div>
              </div>

              {/* Min Participation Field */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
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
                    } shadow-md rounded-md text-center w-full`}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
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
                    } shadow-md rounded-md text-center w-full`}
                  />
                  {formik.touched.timeWindow && formik.errors.timeWindow && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.timeWindow}
                    </p>
                  )}
                </div>
              </div>

              {/* Edge Weight Field */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label
                  htmlFor="edgeWeight"
                  className="text-sm font-medium md:col-span-1 md:text-right"
                >
                  Edge Weight:
                </label>
                <div className="md:col-span-2">
                  <input
                    id="edgeWeight"
                    type="text"
                    name="edgeWeight"
                    value={formik.values.edgeWeight}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`p-2 border ${
                      formik.touched.edgeWeight && formik.errors.edgeWeight
                        ? "border-red-500"
                        : "border-gray-300"
                    } shadow-md rounded-md text-center w-full`}
                  />
                  {formik.touched.edgeWeight && formik.errors.edgeWeight && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.edgeWeight}
                    </p>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
