import { useState, useEffect } from "react";
import Papa from "papaparse";

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
    const apiKey = import.meta.env.VITE_API_KEY; // Get API key from .env
    console.log(apiKey, "apikeyyy");
    if (!apiKey) {
      console.error("API key is missing. Check your .env file.");
      alert("API key is missing. Please configure it.");
      return null;
    }

    const minParticipation = parametersData.minParticipation;
    const timeWindow = parametersData.timeWindow;
    const edgeWeight = parametersData.edgeWeight;
    console.log(minParticipation, timeWindow, edgeWeight, "WORKED ???");
    const csvFile = csvFilee;
    console.log(csvFile, "CSV FILE");

    const requestUrl = `http://localhost:5000/run-r`;
    console.log(requestUrl, "URLURL");
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
        console.log("Response OK");
        console.log("API Response:", data);
        return data;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data. Please try again.");
      return null;
    }
  };
  //#####################################################################################################
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParameters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateCsvHeaders = () => {
    const file = formData.csvFile; // Access CSV file from formData
    const updatedHeaders = formData.updatedHeaders; // Access updated headers

    if (!file || !updatedHeaders) {
      alert("Missing CSV file or header updates.");
      return;
    }

    const reader = new FileReader();
    reader.onload = ({ target }) => {
      const csvText = target.result;

      // Parse CSV content
      Papa.parse(csvText, {
        complete: (result) => {
          let rows = result.data;
          if (rows.length === 0) return;

          console.log("Original Headers:", rows[0]); // Log original headers

          // Modify the headers based on updatedHeaders
          updatedHeaders.forEach(({ index, newName }) => {
            if (index < rows[0].length) {
              rows[0][index] = newName;
            }
          });

          console.log("Updated Headers:", rows[0]); // Log updated headers

          // Convert back to CSV format
          const updatedCsv = Papa.unparse(rows);

          // Create a Blob with the updated CSV
          const updatedCsvBlob = new Blob([updatedCsv], { type: "text/csv" });

          // Update formData state
          setFormData((prevData) => ({
            ...prevData,
            csvFile: updatedCsvBlob, // Replace with the updated file
          }));
        },
      });
    };

    reader.readAsText(file);
  };

  const handleNextStep = () => {
    // Pass the updated parameters to formData
    setFormData((prevData) => ({
      ...prevData,
      parameters: { ...parameters }, // Ensure the latest parameters are stored
    }));

    // Now you can safely update the CSV headers and proceed to the next step
    setTimeout(() => {
      updateCsvHeaders();
      console.log("Updated formData:", formData); // Log the latest formData
      fetchDataFromAPI();
    }, 0);
  };
  const parametersData = formData.parameters;
  const csvFilee = formData.csvFile;
  console.log("Parameters Data:", parametersData); // Log the parameters data
  console.log("CSV File:", csvFilee); // Log the CSV file

  return (
    <>
      <h1 className="text-xl font-semibold text-center">
        Coordinated Sharing Behaviour Detection
      </h1>

      <h2 className="text-lg font-bold mb-4">Phase 3: Configure Parameters</h2>
      <div className="bg-white shadow-md rounded-lg p-6 mt-4">
        <form className="space-y-4 mx-auto">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium w-60">
              Minimum Participation
            </label>
            <input
              type="number"
              name="minParticipation"
              value={parameters.minParticipation}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 shadow-md rounded-md w-full"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium w-60">
              Time Window (seconds)
            </label>
            <input
              type="number"
              name="timeWindow"
              value={parameters.timeWindow}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 shadow-md rounded-md w-full"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium w-60">Edge Weight</label>
            <input
              type="text"
              name="edgeWeight"
              value={parameters.edgeWeight}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 shadow-md rounded-md w-full"
            />
          </div>
        </form>
      </div>

      <div className="flex justify-between mt-5">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={prevStep}
        >
          Back
        </button>

        <button
          disabled={isLoading}
          onClick={handleNextStep}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isLoading ? (
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-white"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            "Next"
          )}
        </button>
      </div>
    </>
  );
}
