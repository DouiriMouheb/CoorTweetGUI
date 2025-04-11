import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import toast from "react-hot-toast";
import { ProgressBar } from "./ProgressBar";
import { AnalysisProgressOverlay } from "./AnalysisProgressOverlay";
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
  const [errorMessage, setErrorMessage] = useState("");

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
        "http://localhost:5000/api/network/save-network",
        networkData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Network saved successfully:", response.data);
      console.log("Network ID:", response.data._id);
      toast.success("Network saved successfully");

      // Return the network ID or the entire response data
      return response.data;
    } catch (error) {
      console.error("Error saving network:", error);
      setErrorMessage("Failed to save network data to database");
      setAnalysisStatus("error");
      toast.error("Failed to save network.");
      throw error;
    }
  };

  // Fetch data from the API and then save the network
  const fetchDataFromAPI = async () => {
    try {
      // Reset states for a new analysis
      setIsLoading(true);
      setAnalysisStatus("processing");
      setErrorMessage("");

      // Step 1: Preparing data
      setAnalysisStep(0);
      await simulateDelay(1000); // Show first step a bit longer

      // Check if parameters are valid
      if (!parameters.projectName) {
        throw new Error("Project name is required");
      }

      if (parameters.minParticipation < 1) {
        throw new Error("Minimum participation must be at least 1");
      }

      if (parameters.timeWindow < 1) {
        throw new Error("Time window must be at least 1 second");
      }

      if (
        parseFloat(parameters.edgeWeight) < 0 ||
        parseFloat(parameters.edgeWeight) > 1
      ) {
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
        throw new Error("No CSV file provided");
      }

      const requestUrl = `http://localhost:5000/run-r`;
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
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      // Step 4: Building network
      setAnalysisStep(3);
      await simulateDelay(1000);

      const data = await response.json();

      // Check if data is valid
      if (!data || Object.keys(data).length === 0) {
        throw new Error("No valid network data was generated");
      }

      console.log("API Response:", data);

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
      console.log("Network ID saved to formData:", savedNetworkData._id);

      // Complete all steps before showing success state
      await simulateDelay(1000);

      // Set the analysis as complete to trigger the success state
      setAnalysisStatus("success");

      return data;
    } catch (error) {
      console.error("Error during analysis:", error);
      // Determine at which step the error occurred and update the error message
      let errorMsg = error.message || "An unexpected error occurred";

      // Set detailed error message based on the current step
      switch (analysisStep) {
        case 0:
          errorMsg = `Parameter error: ${errorMsg}`;
          break;
        case 1:
          errorMsg = `CSV processing error: ${errorMsg}`;
          break;
        case 2:
          errorMsg = `Algorithm error: ${errorMsg}`;
          break;
        case 3:
          errorMsg = `Network construction error: ${errorMsg}`;
          break;
        case 4:
          errorMsg = `Saving error: ${errorMsg}`;
          break;
        default:
          errorMsg = `Error: ${errorMsg}`;
      }

      setErrorMessage(errorMsg);
      setAnalysisStatus("error");
      toast.error(errorMsg);
      return null;
    }
  };

  // Handle completion of the success or error state and cleanup
  const handleAnalysisFinished = () => {
    // Reset states
    setIsLoading(false);
    setAnalysisStatus("processing");
    setAnalysisStep(0);
    setErrorMessage("");

    // Only go to the next step if the analysis was successful
    if (analysisStatus === "success") {
      nextStep();
    }
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
      console.log("Updated formData:", formData); // Log the latest formData
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
        errorMessage={errorMessage}
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
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
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
