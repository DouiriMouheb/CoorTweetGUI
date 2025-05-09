import React, { useState, useEffect, useCallback, useMemo } from "react";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
// Import from our modules
import { PLATFORMS } from "./constants";
import { identifyDataSource } from "./utils/platformDetector";
import { platformHandlers } from "./handlers";
import AccountSourceSelector from "./ui/AccountSourceSelector";
import ObjectIDSourceSelector from "./ui/ObjectIDSourceSelector";
import PlatformInfo from "./ui/PlatformInfo";
import StepIndicator from "./ui/StepIndicator";
import { ProgressBar } from "../ProgressBar";
import PrepareDataset from "./PrepareDataset"; // Import the PrepareDataset component

// Main component
export default function PlatformSelectorStep({
  nextStep,
  prevStep,
  formData,
  setFormData,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [disableButton, setIsDisabled] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [showCustomHeaderUI, setShowCustomHeaderUI] = useState(false);

  // Detect platform from headers
  useEffect(() => {
    if (formData.csvHeaders && formData.csvHeaders.length > 0) {
      const detectedPlatform = identifyDataSource(formData.csvHeaders);
      setSelectedPlatform(detectedPlatform);

      // Show custom header UI if platform is OTHER
      if (detectedPlatform === PLATFORMS.OTHER) {
        setShowCustomHeaderUI(true);
      } else {
        setShowCustomHeaderUI(false);
        // Update formData with detected platform
        setFormData((prev) => ({
          ...prev,
          platform: detectedPlatform,
        }));

        // Auto-select account sources for platforms with only one option
        autoSelectSources(detectedPlatform);
      }
    }
  }, [formData.csvHeaders]);

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

  // Handle proceeding to next step with custom headers (for unknown platform)
  const handleCustomHeaderNext = () => {
    // If we have updatedHeaders from the PrepareDataset component, we're good to go
    if (formData.updatedHeaders && formData.updatedHeaders.length > 0) {
      // Process the custom mapped headers
      processCustomMappedCSV()
        .then(() => nextStep())
        .catch((err) => {
          console.error("Failed to process custom mapped CSV:", err);
          toast.error("Failed to update CSV. Please try again.");
        });
    } else {
      toast.error("Please select and configure at least one column");
    }
  };

  // Process CSV with custom header mapping
  const processCustomMappedCSV = useCallback(async () => {
    const file = formData.csvFile;

    if (!file) {
      toast.error("Missing CSV file.");
      return Promise.reject(new Error("Missing CSV file"));
    }

    setIsLoading(true);

    try {
      // Read the CSV file
      const text = await file.text();
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });

      // Map columns according to user selections
      const transformedData = result.data
        .map((row) => {
          try {
            // Create a new row with the standardized format
            const newRow = {
              account_id: "",
              content_id: "",
              object_id: "",
              timestamp_share: 0,
            };

            // Apply the user's column mappings
            formData.updatedHeaders.forEach((mapping) => {
              const originalHeader = formData.csvHeaders[mapping.index];
              const newHeader = mapping.newName;

              // If the new header is one of our required fields, use it
              if (
                [
                  "account_id",
                  "content_id",
                  "object_id",
                  "timestamp_share",
                ].includes(newHeader)
              ) {
                // For timestamp, attempt to convert to Unix timestamp if it's a date
                if (
                  newHeader === "timestamp_share" &&
                  isNaN(row[originalHeader])
                ) {
                  newRow[newHeader] = Math.floor(
                    new Date(row[originalHeader]).getTime() / 1000
                  );
                } else {
                  newRow[newHeader] = row[originalHeader];
                }
              }
            });

            // Check if we have the required fields
            if (newRow.account_id && newRow.content_id) {
              return newRow;
            }

            return null;
          } catch (err) {
            console.warn("Error processing row:", err);
            return null;
          }
        })
        .filter((row) => row !== null);

      if (transformedData.length === 0) {
        toast.error(
          "No valid data rows could be processed. Please check your column mappings."
        );
        setIsLoading(false);
        return Promise.reject(new Error("No valid data rows"));
      }

      // Generate CSV
      const csvContent = Papa.unparse(transformedData);
      const estimatedSizeMB = new Blob([csvContent]).size / (1024 * 1024);

      const updatedCsvBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      setFormData((prevData) => ({
        ...prevData,
        csvFile: updatedCsvBlob, // Replace with the updated file
        platform: PLATFORMS.PREPROCESSED, // Mark as preprocessed now
      }));

      if (estimatedSizeMB > 15) {
        toast.error(
          `Warning: The transformed file size (${estimatedSizeMB.toFixed(
            1
          )}MB) exceeds the 15MB limit of the Coordinated Sharing Detection Service.`
        );
      }

      return Promise.resolve();
    } catch (err) {
      console.error("Processing error:", err);
      toast.error(`Error processing CSV: ${err.message}`);
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [formData.csvFile, formData.csvHeaders, formData.updatedHeaders]);

  // Render platform detection message
  const getPlatformMessage = () => {
    if (selectedPlatform === PLATFORMS.PREPROCESSED) {
      return "Great, your DataSet is preprocessed correctly and ready to use.";
    } else if (selectedPlatform === PLATFORMS.OTHER) {
      return "We couldn't identify your data format automatically. Please map your columns manually.";
    } else {
      return `We detected that your data is imported from ${selectedPlatform}.`;
    }
  };

  // Function to set progress (stub to avoid errors with missing function)
  const setProgress = (progress) => {
    // This is just a stub - in a real implementation you'd have a progress state
    console.log(`Processing progress: ${progress}%`);
  };

  // If showing custom header UI, render the PrepareDataset component
  if (showCustomHeaderUI) {
    return (
      <div className="w-full h-[100vh] mx-auto p-4 flex flex-col bg-gray-100 overflow-auto space-y-6">
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
                  2
                </span>
                Custom Dataset Preparation
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <ProgressBar currentStep={2} totalSteps={3} />

          {/* Custom Header Mapping Component */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                We couldn't automatically recognize your CSV format. Please map
                your columns to our required fields:
              </p>
              <ul className="list-disc pl-5 mb-4 text-sm text-gray-600">
                <li>
                  <strong>account_id</strong> - Identifier for the account that
                  shared the content
                </li>
                <li>
                  <strong>content_id</strong> - Unique identifier for the
                  specific post/content
                </li>
                <li>
                  <strong>object_id</strong> - The content being shared (URL,
                  text, etc.)
                </li>
                <li>
                  <strong>timestamp_share</strong> - When the content was shared
                </li>
              </ul>
            </div>

            <PrepareDataset
              nextStep={handleCustomHeaderNext}
              prevStep={prevStep}
              formData={formData}
              setFormData={setFormData}
            />

            {isLoading && (
              <div className="flex justify-center items-center mt-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-blue-500">
                  Processing your data...
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Regular platform selector UI (for known platforms)
  return (
    <div className="w-full h-[100vh] mx-auto p-4 flex flex-col bg-gray-100 overflow-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto  space-y-8"
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
                2
              </span>
              Prepare Dataset
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressBar currentStep={2} totalSteps={3} />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1 bg-white rounded-xl shadow-lg p-6"
          >
            <PlatformInfo selectedPlatform={selectedPlatform} />
          </motion.div>

          {/* Right Content Area */}
          <div className="md:col-span-3 space-y-6">
            {/* Platform Detection */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-50 rounded-xl p-4 border border-blue-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  1
                </div>
                <p className="text-gray-700">{getPlatformMessage()}</p>
              </div>
            </motion.div>

            {/* Selectors */}
            {selectedPlatform !== PLATFORMS.PREPROCESSED &&
              selectedPlatform !== PLATFORMS.OTHER && (
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AccountSourceSelector
                      selectedPlatform={selectedPlatform}
                      accountSourceOptions={accountSourceOptions}
                      formData={formData}
                      handleAccountSourceChange={handleAccountSourceChange}
                      isLoading={isLoading}
                    />
                  </motion.div>

                  {formData.accountSource && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <ObjectIDSourceSelector
                        selectedPlatform={selectedPlatform}
                        objectIdSourceOptions={objectIdSourceOptions}
                        formData={formData}
                        handleObjectIdSourceChange={handleObjectIdSourceChange}
                        isLoading={isLoading}
                      />
                    </motion.div>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Footer with Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-between"
        >
          <button
            onClick={prevStep}
            disabled={isLoading}
            className="px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
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
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg"
            }`}
            onClick={() => {
              setIsLoading(true);
              updateCsvHeaders()
                .then(() => nextStep())
                .catch((err) => {
                  console.error("Failed to update CSV:", err);
                  toast.error("Failed to update CSV. Please try again.");
                  setIsLoading(false);
                  setIsDisabled(true);
                });
            }}
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
    </div>
  );
}
