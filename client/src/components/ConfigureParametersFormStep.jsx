import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import toast from "react-hot-toast";
import { ProgressBar } from "./ProgressBar";
import { AnalysisProgressOverlay } from "./ProgressBars/AnalysisProgressOverlay";
import { useAuth } from "../context/authContext";
import axios from "axios";

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

  const defaultParameters = {
    projectName: "", // Default empty or you can set a default value
    minParticipation: 2,
    timeWindow: 60,
    edgeWeight: "0.5",
  };

  const [parameters, setParameters] = useState({
    ...defaultParameters,
    ...formData.parameters, // Override default values if formData.parameters exists
  });

  // Ensure parameters are stored in formData when they change
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      parameters,
    }));
  }, [parameters, setFormData]);

  const parametersData = formData.parameters;
  const csvFilee = formData.csvFile;

  // Save network data to the API
  const saveNetwork = async (data) => {
    // Update the analysis step to indicate we're saving the network
    setAnalysisStep(4);

    const networkData = {
      userId: user.userId,
      data: data,
      networkName: parameters.projectName || "Test",
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
          },
        }
      );

      toast.success("Network saved successfully");

      // Return the network ID or the entire response data
      return response.data;
    } catch (error) {
      console.error("Error saving network:", error);
      setErrorData({
        status: "error",
        error: {
          stage: "saving_network",
          message: "Failed to save network data to database",
        },
      });
      setAnalysisStatus("error");
      toast.error("Failed to save network.");
      throw error;
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

  // Fetch data from the API and then save the network
  const fetchDataFromAPI = async () => {
    try {
      // Reset states for a new analysis
      setIsLoading(true);
      setAnalysisStatus("processing");
      setErrorData(null);

      // Step 1: Preparing data
      setAnalysisStep(0);
      await simulateDelay(1000); // Show first step a bit longer

      // Check if parameters are valid
      if (!parameters.projectName) {
        setErrorData({
          status: "error",
          error: {
            stage: "parameter_parsing",
            message: "Project name is required",
          },
        });
        throw new Error("Project name is required");
      }

      if (parameters.minParticipation < 1) {
        setErrorData({
          status: "error",
          error: {
            stage: "parameter_parsing",
            message: "Minimum participation must be at least 1",
          },
        });
        throw new Error("Minimum participation must be at least 1");
      }

      if (parameters.timeWindow < 1) {
        setErrorData({
          status: "error",
          error: {
            stage: "parameter_parsing",
            message: "Time window must be at least 1 second",
          },
        });
        throw new Error("Time window must be at least 1 second");
      }

      if (
        parseFloat(parameters.edgeWeight) < 0 ||
        parseFloat(parameters.edgeWeight) > 1
      ) {
        setErrorData({
          status: "error",
          error: {
            stage: "parameter_parsing",
            message: "Edge weight must be between 0 and 1",
          },
        });
        throw new Error("Edge weight must be between 0 and 1");
      }

      const minParticipation = parametersData.minParticipation;
      const timeWindow = parametersData.timeWindow;
      const edgeWeight = parametersData.edgeWeight;
      const csvFile = csvFilee;

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
      formDataToSend.append("min_participation", minParticipation);
      formDataToSend.append("time_window", timeWindow);
      formDataToSend.append("subgraph", 1);
      formDataToSend.append("edge_weight", edgeWeight);

      // Step 3: Running algorithm
      setAnalysisStep(2);

      const response = await fetch(requestUrl, {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        setErrorData({
          status: "error",
          error: {
            stage: "network_generation",
            message: `Server error: ${response.status} ${response.statusText}`,
          },
        });
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      // Parse the JSON response
      const data = await response.json();

      // Check if the response contains an error status from R script
      if (data.status === "error") {
        // Set error data from R script
        setErrorData(data);

        // Set the step based on the error stage
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

      // Save the network data after successfully receiving it
      const savedNetworkData = await saveNetwork(data);

      // Update formData with the network ID and data before proceeding to next step
      setFormData((prevData) => ({
        ...prevData,
        networkId: savedNetworkData._id,
        networkData: savedNetworkData,
      }));

      // Store the network ID for navigation
      setSavedNetworkId(savedNetworkData._id);

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
                message: `Parameter error: ${error.message}`,
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
      toast.error(error.message);
      return null;
    }
  };

  // Handle completion of the success or error state and cleanup
  const handleAnalysisFinished = () => {
    console.log("Analysis finished with status:", analysisStatus);

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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParameters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextStep = () => {
    // Pass the updated parameters to formData
    setFormData((prevData) => ({
      ...prevData,
      parameters: { ...parameters }, // Ensure the latest parameters are stored
    }));

    // Now you can safely update the CSV headers and proceed to the next step
    setTimeout(() => {
      fetchDataFromAPI();
    }, 0);
  };

  return (
    <div className="w-full h-[100vh] mx-auto p-4 flex flex-col bg-gray-100 overflow-auto space-y-6">
      {/* Analysis Progress Overlay */}
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
        className="max-w-6xl mx-auto space-y-8"
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

        {/* Progress Indicator */}
        <ProgressBar currentStep={3} totalSteps={3} />

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
                      "The threshold for coordinated participation required for inclusion...",
                  },
                  {
                    title: "Time Window (seconds)",
                    content:
                      "The interval considered for calculating co-shares...",
                  },
                  {
                    title: "Edge Weight",
                    content:
                      "Defines the minimum frequency of co-sharing required...",
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
                        <div className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 left-full ml-2 top-0 w-64 p-3 bg-white border rounded-lg shadow-lg transition-all">
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
            <form className="w-full max-w-lg space-y-6">
              {/* Add this new field at the top of the form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium md:col-span-1 md:text-right">
                  Project Name :
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={parameters.projectName || ""}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 shadow-md rounded-md text-center"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium md:col-span-1 md:text-right">
                  Minimum Participation :
                </label>
                <input
                  type="number"
                  name="minParticipation"
                  value={parameters.minParticipation}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 shadow-md rounded-md text-center"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium md:col-span-1 md:text-right">
                  Time Window (seconds) :
                </label>
                <input
                  type="number"
                  name="timeWindow"
                  value={parameters.timeWindow}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 shadow-md rounded-md text-center"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium md:col-span-1 md:text-right">
                  Edge Weight :
                </label>
                <input
                  type="text"
                  name="edgeWeight"
                  value={parameters.edgeWeight}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 shadow-md rounded-md text-center"
                />
              </div>
            </form>
          </motion.div>
        </div>

        {/* Footer with Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-between"
        >
          <button
            onClick={prevStep}
            className="px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            Back
          </button>

          <button
            disabled={isLoading}
            onClick={handleNextStep}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                Processing...
              </div>
            ) : (
              "Analyse "
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
