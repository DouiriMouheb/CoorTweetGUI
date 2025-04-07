import { useState, useEffect } from "react";

import { Info } from "lucide-react";
import toast from "react-hot-toast";
export default function ConfigureParameters({
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
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Coordinated Sharing Behavior Detection
        </h1>
        <div className="flex items-center mt-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            3
          </div>
          <div className="ml-3 text-xl font-medium text-blue-500">
            Set Parameters
          </div>
        </div>
        <div className="w-full h-1 bg-gray-200 mt-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: "90%" }}
          ></div>
        </div>
      </div>
      {/* Main content area */}
      <div className="flex flex-1 flex-col md:flex-row overflow-y-auto">
        {/* Left sidebar */}
        <div className="w-full md:w-2/6 p-4 bg-gray-200">
          <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <h3 className="font-medium text-blue-800">Notes:</h3>
            <ul className="list-disc pl-5 mt-2 text-sm text-left text-blue-700">
              <li>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span>Minimum Participation</span>
                    <div className="relative ml-2 group">
                      <Info size={16} className="text-gray-500 cursor-help" />
                      <div className="absolute z-10 top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                        The threshold for the minimum level of coordinated
                        participation required for inclusion in the analysis.
                        Only users in the dataset with at least the specified
                        number of shares will be processed.
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 h-2 w-2 bg-gray-800 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span>Time Window (seconds)</span>
                    <div className="relative ml-2 group">
                      <Info size={16} className="text-gray-500 cursor-help" />
                      <div className="absolute z-10 top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                        The time window indicates the interval considered for
                        calculating co-shares. A very narrow time window (e.g.,
                        &lt; 1 sec) tends to indicate automated behavior,
                        whereas a time window of several hours may highlight
                        human-coordinated behavior.
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 h-2 w-2 bg-gray-800 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span>Edge Weight</span>
                    <div className="relative ml-2 group">
                      <Info size={16} className="text-gray-500 cursor-help" />
                      <div className="absolute z-10 top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                        The edge threshold defines the minimum frequency of
                        co-sharing required for a connection to be made. It
                        measures co-sharing frequency as a proportion (from 0 to
                        1) of all accounts in the dataset. A standard choice is
                        the median (0.5). Using higher thresholds helps identify
                        co-sharing activities between accounts that range from
                        unusual to extremely unusual.{" "}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 h-2 w-2 bg-gray-800 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right content area */}
        <div className="w-full md:w-4/6 p-6 bg-white rounded-r-lg flex justify-center items-center">
          <form className="w-full max-w-lg space-y-6">
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
        </div>
      </div>
      {/* Row 1 - 80% height */}

      {/* Footer with buttons */}
      <div className="flex justify-between items-center p-4 bg-gray-100 rounded-b-lg">
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
          onClick={prevStep}
        >
          Back
        </button>

        <button
          disabled={isLoading}
          onClick={handleNextStep}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors flex items-center"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Processing...
            </>
          ) : (
            "Next"
          )}
        </button>
      </div>
    </>
  );
}
