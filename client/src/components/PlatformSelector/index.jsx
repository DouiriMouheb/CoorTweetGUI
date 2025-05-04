import React, { useState, useEffect, useCallback, useMemo } from "react";
import Papa from "papaparse";
import { toast } from "react-hot-toast";

// Import from our modules
import { PLATFORMS } from "./constants";
import { identifyDataSource } from "./utils/platformDetector";
import { platformHandlers } from "./handlers";
import AccountSourceSelector from "./ui/AccountSourceSelector";
import ObjectIDSourceSelector from "./ui/ObjectIDSourceSelector";
import PlatformInfo from "./ui/PlatformInfo";
import StepIndicator from "./ui/StepIndicator";

// Main component
export default function PlatformSelector2({
  nextStep,
  prevStep,
  formData,
  setFormData,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [disableButton, setIsDisabled] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");

  // Detect platform from headers
  useEffect(() => {
    if (formData.csvHeaders && formData.csvHeaders.length > 0) {
      const detectedPlatform = identifyDataSource(formData.csvHeaders);
      setSelectedPlatform(detectedPlatform);
      // Update formData with detected platform
      setFormData((prev) => ({
        ...prev,
        platform: detectedPlatform,
      }));

      // Auto-select account sources for platforms with only one option
      autoSelectSources(detectedPlatform);
    }
  }, [formData.csvHeaders]);
  useEffect(() => {}, [selectedPlatform]);
  // Auto-select sources for certain platforms
  const autoSelectSources = useCallback((platform) => {
    if (
      [PLATFORMS.YOUTUBE, PLATFORMS.TIKTOK, PLATFORMS.BLUESKY].includes(
        platform
      )
    ) {
      const sourceMap = {
        [PLATFORMS.YOUTUBE]: "channel_title_id_youtube_account_source",
        [PLATFORMS.TIKTOK]: "name_region_tiktok_account_source",
        [PLATFORMS.BLUESKY]: "username_bluesky_account_source",
      };

      const defaultAccountSource = sourceMap[platform];
      if (defaultAccountSource) {
        handleAccountSourceChange(defaultAccountSource);
      }
    }

    if ([PLATFORMS.BLUESKY, PLATFORMS.TELEGRAM].includes(platform)) {
      const sourceMap = {
        [PLATFORMS.BLUESKY]: "text_bluesky",
        [PLATFORMS.TELEGRAM]: "message_text_telegram",
      };

      const defaultObjectIdSource = sourceMap[platform];
      if (defaultObjectIdSource) {
        handleObjectIdSourceChange(defaultObjectIdSource);
      }
    }
  }, []);

  // Get account source options using memoization
  const accountSourceOptions = useMemo(() => {
    if (!selectedPlatform || !platformHandlers[selectedPlatform]) {
      return [];
    }
    return platformHandlers[selectedPlatform].getAccountSourceOptions();
  }, [selectedPlatform]);

  // Get object ID source options using memoization
  const objectIdSourceOptions = useMemo(() => {
    if (!selectedPlatform || !platformHandlers[selectedPlatform]) {
      return [];
    }
    return platformHandlers[selectedPlatform].getObjectIdSourceOptions();
  }, [selectedPlatform]);

  // Handle account source selection
  const handleAccountSourceChange = useCallback(
    (source) => {
      setFormData((prev) => ({
        ...prev,
        accountSource: source,
      }));
    },
    [setFormData]
  );

  // Handle object ID source selection
  const handleObjectIdSourceChange = useCallback(
    (objectId) => {
      setFormData((prev) => ({
        ...prev,
        objectIdSource: objectId,
      }));
    },
    [setFormData]
  );

  // Process CSV with chunking for large files
  const processCSVWithChunking = useCallback(
    async (file, chunkSize = 5000) => {
      return new Promise((resolve, reject) => {
        const results = [];
        let totalProcessed = 0;
        let totalSkipped = 0;
        let totalErrors = 0;

        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          chunk: (chunk, parser) => {
            try {
              // Process this chunk of data
              const handler = platformHandlers[selectedPlatform];

              chunk.data.forEach((row) => {
                try {
                  const transformed = handler.transformRow(
                    row,
                    formData.accountSource,
                    formData.objectIdSource
                  );

                  if (transformed) {
                    results.push(transformed);
                    totalProcessed++;
                  } else {
                    totalSkipped++;
                  }
                } catch (err) {
                  console.warn("Error processing row:", err);
                  totalErrors++;
                  totalSkipped++;
                }
              });

              // Update progress
              const progress = Math.min(
                100,
                Math.round((parser.streamer.bytesTotal / file.size) * 100)
              );
              setProgress(progress);
            } catch (error) {
              console.error("Error processing chunk:", error);
              // Continue processing despite errors in a chunk
            }
          },
          complete: () => {
            resolve(results);
          },
          error: (error) => {
            console.error("CSV parsing error:", error);
            reject(error);
          },
        });
      });
    },
    [selectedPlatform, formData.accountSource, formData.objectIdSource]
  );

  // Main function to update and export CSV
  const updateCsvHeaders = useCallback(async () => {
    const file = formData.csvFile;

    if (!file) {
      toast.error("Missing CSV file.");
      setIsDisabled(true);
      return;
    }

    setIsLoading(true);

    try {
      // Process the file using chunking for large files
      const fileSize = file.size / (1024 * 1024); // Size in MB
      const useChunking = fileSize > 5; // Use chunking for files larger than 5MB

      let transformedData;
      if (useChunking) {
        transformedData = await processCSVWithChunking(file);
      } else {
        // For small files, process all at once
        const text = await file.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });

        const handler = platformHandlers[selectedPlatform];
        transformedData = result.data
          .map((row) => {
            try {
              return handler.transformRow(
                row,
                formData.accountSource,
                formData.objectIdSource
              );
            } catch (err) {
              console.warn("Error processing row:", err);
              return null;
            }
          })
          .filter((row) => row !== null);
      }

      if (transformedData.length === 0) {
        toast.error(
          "No valid data rows could be processed. Please check your CSV format and selections."
        );
        setIsLoading(false);
        setIsDisabled(true);
        return;
      }

      // Generate CSV and download
      const csvContent = Papa.unparse(transformedData);
      const estimatedSizeMB = new Blob([csvContent]).size / (1024 * 1024);

      const updatedCsvBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      setFormData((prevData) => ({
        ...prevData,
        csvFile: updatedCsvBlob, // Replace with the updated file
      }));

      if (estimatedSizeMB > 15) {
        toast.error(
          `Warning: The transformed file size (${estimatedSizeMB.toFixed(
            1
          )}MB) exceeds the 15MB limit of the Coordinated Sharing Detection Service.`
        );
      }
    } catch (err) {
      console.error("Processing error:", err);

      toast.error(`Error processing CSV: ${err.message}`);
      setIsDisabled(true);
    } finally {
      setIsLoading(false);
    }
  }, [
    formData.csvFile,
    selectedPlatform,
    formData.accountSource,
    formData.objectIdSource,
    processCSVWithChunking,
  ]);

  // Render platform detection message
  const getPlatformMessage = () => {
    if (selectedPlatform === PLATFORMS.PREPROCESSED) {
      return "Great, your DataSet is preprocessed correctly and ready to use.";
    } else if (selectedPlatform === PLATFORMS.OTHER) {
      return "We couldn't identify your data format automatically. Please check your CSV file.";
    } else {
      return `We detected that your data is imported from ${selectedPlatform}.`;
    }
  };

  return (
    <>
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Coordinated Sharing Behavior Detection
        </h1>
        <div className="flex items-center mt-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            2
          </div>
          <div className="ml-3 text-xl font-medium text-blue-500">
            Prepare Dataset
          </div>
        </div>
        <div className="w-full h-1 bg-gray-200 mt-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: "50%" }}
          ></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:flex-row overflow-y-auto">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/4 p-4 bg-gray-200">
          <PlatformInfo selectedPlatform={selectedPlatform} />
        </div>

        {/* Right Content Area */}
        <div className="w-full md:w-3/4 p-6 bg-white rounded-r-lg">
          {/* Platform Detection */}
          <StepIndicator number={1} title={getPlatformMessage()} />

          {/* Only show selectors for non-preprocessed, non-other platforms */}
          {selectedPlatform !== PLATFORMS.PREPROCESSED &&
            selectedPlatform !== PLATFORMS.OTHER && (
              <>
                <AccountSourceSelector
                  selectedPlatform={selectedPlatform}
                  accountSourceOptions={accountSourceOptions}
                  formData={formData}
                  handleAccountSourceChange={handleAccountSourceChange}
                  isLoading={isLoading}
                />

                {formData.accountSource && (
                  <ObjectIDSourceSelector
                    selectedPlatform={selectedPlatform}
                    objectIdSourceOptions={objectIdSourceOptions}
                    formData={formData}
                    handleObjectIdSourceChange={handleObjectIdSourceChange}
                    isLoading={isLoading}
                  />
                )}
              </>
            )}
        </div>
      </div>

      {/* Footer with Navigation Buttons */}
      <div className="flex justify-between items-center p-4 bg-gray-100 rounded-b-lg">
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
          onClick={prevStep}
          disabled={isLoading}
        >
          Back
        </button>

        <button
          disabled={
            isLoading ||
            disableButton ||
            (selectedPlatform !== PLATFORMS.PREPROCESSED &&
              (!formData.accountSource || !formData.objectIdSource))
          }
          className={`${
            isLoading
              ? "bg-blue-300 cursor-not-allowed"
              : disableButton ||
                (selectedPlatform !== PLATFORMS.PREPROCESSED &&
                  (!formData.accountSource || !formData.objectIdSource))
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white px-6 py-2 rounded transition-colors flex items-center`}
          onClick={() => {
            setIsLoading(true);
            updateCsvHeaders()
              .then(() => {
                nextStep();
              })
              .catch((err) => {
                console.error("Failed to update CSV:", err);
                toast.error("Failed to update CSV. Please try again.");
                setIsLoading(false);
                setIsDisabled(true);
              });
          }}
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
