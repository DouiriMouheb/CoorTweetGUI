import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import toast from "react-hot-toast";
import { ProgressBar } from "./ProgressBar";
export default function ConfigureParametersFormStep({
  nextStep,
  prevStep,
  formData,
  setFormData,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const defaultParameters = {
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
  //#####################################################################################################
  const fetchDataFromAPI = async () => {
    const minParticipation = parametersData.minParticipation;
    const timeWindow = parametersData.timeWindow;
    const edgeWeight = parametersData.edgeWeight;
    const csvFile = csvFilee;
    const requestUrl = `http://localhost:5000/run-r`;
    const formDataToSend = new FormData();
    formDataToSend.append("input", csvFile);
    formDataToSend.append("min_participation", minParticipation); // Example parameter
    formDataToSend.append("time_window", timeWindow); // Example parameter
    formDataToSend.append("subgraph", 1); // Example parameter
    formDataToSend.append("edge_weight", edgeWeight);

    try {
      setIsLoading(true);
      const response = await fetch(requestUrl, {
        method: "POST",
        body: formDataToSend, // Include the CSV file as multipart form data
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      if (response.ok) {
        const data = await response.json();
        setIsLoading(false);
        nextStep();
        console.log("API Response:", data);
        return data;
      }
    } catch (error) {
      console.error("Error fetching data:", error);

      toast.error("Failed to fetch data. Please try again.");
      return null;
    }
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
  const parametersData = formData.parameters;
  const csvFilee = formData.csvFile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6 space-y-8"
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
                  content: "The threshold for coordinated participation required for inclusion..."
                },
                {
                  title: "Time Window (seconds)",
                  content: "The interval considered for calculating co-shares..."
                },
                {
                  title: "Edge Weight",
                  content: "Defines the minimum frequency of co-sharing required..."
                }
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
                      <span className="text-sm text-gray-600">{note.title}</span>
                      <div className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 left-full ml-2 top-0 w-64 p-3 bg-white border rounded-lg shadow-lg transition-all">
                        <p className="text-sm text-gray-600">{note.content}</p>
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
          <form className="space-y-6">
            {[
              { label: "Minimum Participation", name: "minParticipation" },
              { label: "Time Window (seconds)", name: "timeWindow" },
              { label: "Edge Weight", name: "edgeWeight" }
            ].map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center"
              >
                <label className="text-sm font-medium text-gray-600">
                  {field.label}
                </label>
                <input
                  type={field.name === 'edgeWeight' ? "text" : "number"}
                  name={field.name}
                  value={parameters[field.name]}
                  onChange={handleInputChange}
                  className="col-span-2 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </motion.div>
            ))}
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
            "Next Step →"
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
