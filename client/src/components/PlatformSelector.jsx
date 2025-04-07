import React, { useState, useEffect, useCallback, useMemo } from "react";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
// Platform constants
const PLATFORMS = {
  PREPROCESSED: "Preprocessed",
  YOUTUBE: "Youtube",
  TIKTOK: "Tiktok",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  TELEGRAM: "Telegram",
  BLUESKY: "Bluesky",
  OTHER: "Other",
};

// Separate platform detection logic
const identifyDataSource = (headers) => {
  if (!headers || headers.length === 0) return PLATFORMS.OTHER;

  // Convert headers to lowercase for case-insensitive matching
  const lowercaseHeaders = headers.map((h) => h.toLowerCase());

  // Check for preprocessed data
  if (
    lowercaseHeaders.includes("account_id") &&
    lowercaseHeaders.includes("content_id") &&
    lowercaseHeaders.includes("object_id") &&
    lowercaseHeaders.includes("timestamp_share")
  ) {
    return PLATFORMS.PREPROCESSED;
  }

  // Check for YouTube
  if (lowercaseHeaders.includes("videoid")) {
    return PLATFORMS.YOUTUBE;
  }

  // Check for TikTok
  if (
    lowercaseHeaders.includes("video_id") &&
    lowercaseHeaders.includes("author_name")
  ) {
    return PLATFORMS.TIKTOK;
  }

  // Check for Meta/Facebook
  if (
    lowercaseHeaders.includes("surface.id") ||
    lowercaseHeaders.includes("surface.name")
  ) {
    return PLATFORMS.FACEBOOK;
  }

  // Check for Instagram
  if (
    lowercaseHeaders.includes("post_owner.id") &&
    lowercaseHeaders.includes("post_owner.name") &&
    !lowercaseHeaders.includes("surface.id") &&
    !lowercaseHeaders.includes("surface.name")
  ) {
    return PLATFORMS.INSTAGRAM;
  }

  // Check for Telegram
  if (
    lowercaseHeaders.includes("channel_id") ||
    lowercaseHeaders.includes("channel_name")
  ) {
    return PLATFORMS.TELEGRAM;
  }

  // Check for BlueSky
  if (
    lowercaseHeaders.includes("username") &&
    lowercaseHeaders.includes("id") &&
    lowercaseHeaders.length <= 4
  ) {
    return PLATFORMS.BLUESKY;
  }

  return PLATFORMS.OTHER;
};

// Platform-specific handlers
const platformHandlers = {
  [PLATFORMS.FACEBOOK]: {
    getAccountSourceOptions: () => [
      {
        value: "post_owner_facebook_account_source",
        label: "Post Owner (post_owner.id, post_owner.name)",
      },
      {
        value: "surface_account_source",
        label: "Surface (surface.id, surface.name)",
      },
    ],
    getObjectIdSourceOptions: () => [
      {
        value: "text_facebook",
        label: "Text content (text)",
      },
      {
        value: "link_attachment.link_facebook",
        label: "Link attachment (link_attachment.link)",
      },
    ],
    transformRow: (row, accountSource, objectIdSource) => {
      const idField = accountSource.includes("post_owner")
        ? "post_owner.id"
        : "surface.id";
      const nameField = accountSource.includes("post_owner")
        ? "post_owner.name"
        : "surface.name";

      const accountIdVal = row[idField];
      const contentIdVal = row.id;
      const timestampVal = row.creation_time;
      let objectIdSourceVal;

      if (objectIdSource.includes("text")) {
        objectIdSourceVal = row.text;
      } else if (objectIdSource.includes("link_attachment")) {
        objectIdSourceVal = row["link_attachment.link"];
      }

      const isValid = Boolean(
        accountIdVal &&
          row[nameField] &&
          contentIdVal &&
          timestampVal &&
          objectIdSourceVal
      );

      if (!isValid) return null;

      // Parse timestamp
      let timestamp = timestampVal;
      if (isNaN(timestampVal)) {
        timestamp = Math.floor(new Date(timestampVal).getTime() / 1000);
      }

      return {
        account_id: String(accountIdVal).trim(),
        content_id: String(contentIdVal).trim(),
        object_id: String(objectIdSourceVal || "").trim(),
        timestamp_share: timestamp,
      };
    },
  },
  [PLATFORMS.INSTAGRAM]: {
    getAccountSourceOptions: () => [
      {
        value: "post_owner_instagram_account_source",
        label: "Post Owner (post_owner.id, post_owner.name)",
      },
    ],
    getObjectIdSourceOptions: () => [
      {
        value: "text_instagram",
        label: "Text content (text)",
      },
    ],
    transformRow: (row, accountSource, objectIdSource) => {
      // Similar implementation to Facebook
      const idField = "post_owner.id";
      const nameField = "post_owner.name";

      const accountIdVal = row[idField];
      const contentIdVal = row.id;
      const timestampVal = row.creation_time;
      const objectIdSourceVal = row.text;

      const isValid = Boolean(
        accountIdVal &&
          row[nameField] &&
          contentIdVal &&
          timestampVal &&
          objectIdSourceVal
      );

      if (!isValid) return null;

      // Parse timestamp
      let timestamp = timestampVal;
      if (isNaN(timestampVal)) {
        timestamp = Math.floor(new Date(timestampVal).getTime() / 1000);
      }

      return {
        account_id: String(accountIdVal).trim(),
        content_id: String(contentIdVal).trim(),
        object_id: String(objectIdSourceVal || "").trim(),
        timestamp_share: timestamp,
      };
    },
  },
  [PLATFORMS.YOUTUBE]: {
    getAccountSourceOptions: () => [
      {
        value: "channel_title_id_youtube_account_source",
        label:
          "For YouTube, 'channel' (Title + ID) is automatically selected as the account source.",
      },
    ],
    getObjectIdSourceOptions: () => [
      {
        value: "video_title_youtube",
        label: "Video Title",
      },
      {
        value: "video_description_youtube",
        label: "Video Description",
      },
      {
        value: "video_tags_youtube",
        label: "Tags",
      },
    ],
    transformRow: (row, accountSource, objectIdSource) => {
      const accountIdVal = row.channelId || row.channelTitle;
      const contentIdVal = row.videoId;
      const timestampVal = row.publishedAt;

      let objectIdSourceVal;
      if (objectIdSource === "video_title_youtube") {
        objectIdSourceVal = row.title || row.videoTitle;
      } else if (objectIdSource === "video_description_youtube") {
        objectIdSourceVal = row.description || row.videoDescription;
      } else if (objectIdSource === "video_tags_youtube") {
        objectIdSourceVal = row.tags || "";
      }

      const isValid = Boolean(
        accountIdVal && contentIdVal && timestampVal && objectIdSourceVal
      );

      if (!isValid) return null;

      // Parse timestamp
      let timestamp = timestampVal;
      if (isNaN(timestampVal)) {
        timestamp = Math.floor(new Date(timestampVal).getTime() / 1000);
      }

      return {
        account_id: `${row.channelTitle || ""} (${row.channelId || ""})`.trim(),
        content_id: String(contentIdVal).trim(),
        object_id: String(objectIdSourceVal || "").trim(),
        timestamp_share: timestamp,
      };
    },
  },
  // Similar handlers for other platforms...
  [PLATFORMS.TIKTOK]: {
    getAccountSourceOptions: () => [
      {
        value: "name_region_tiktok_account_source",
        label:
          "For TikTok, 'author' (Name + Region) is automatically selected as the account source.",
      },
    ],
    getObjectIdSourceOptions: () => [
      {
        value: "video_description_tiktok",
        label: "Video Description",
      },
      {
        value: "video_to_text_tiktok",
        label: "Voice To Text",
      },
      {
        value: "video_url_tiktok",
        label: "Video URL",
      },
      {
        value: "video_effect_ids_tiktok",
        label: "Effect IDs",
      },
      {
        value: "video_music_id_tiktok",
        label: "Music Id",
      },
      {
        value: "video_hashtag_names_tiktok",
        label: "Hashtag Names",
      },
    ],
    transformRow: (row, accountSource, objectIdSource) => {
      const accountIdVal = row.author_name;
      const contentIdVal = row.video_id;
      const timestampVal = row.create_time;

      // Map objectIdSource to the correct field
      const tiktokFieldMap = {
        video_description_tiktok: "video_description",
        video_to_text_tiktok: "voice_to_text",
        video_url_tiktok: "video_url",
        video_effect_ids_tiktok: "effect_ids",
        video_music_id_tiktok: "music_id",
        video_hashtag_names_tiktok: "hashtag_names",
      };

      const fieldToUse = tiktokFieldMap[objectIdSource];
      const objectIdSourceVal = fieldToUse ? row[fieldToUse] : "";

      const requiredFields = [
        "video_description_tiktok",
        "video_to_text_tiktok",
        "video_url_tiktok",
        "video_hashtag_names_tiktok",
      ];

      const isRequired = requiredFields.includes(objectIdSource);
      const isValid = Boolean(
        accountIdVal &&
          contentIdVal &&
          timestampVal &&
          (isRequired
            ? Boolean(objectIdSourceVal)
            : objectIdSourceVal !== undefined)
      );

      if (!isValid) return null;

      // Parse timestamp
      let timestamp = timestampVal;
      if (isNaN(timestampVal)) {
        timestamp = Math.floor(new Date(timestampVal).getTime() / 1000);
      }

      return {
        account_id: `${row.author_name || ""} (${
          row.region_code || "unknown"
        })`.trim(),
        content_id: String(contentIdVal).trim(),
        object_id: String(objectIdSourceVal || "").trim(),
        timestamp_share: timestamp,
      };
    },
  },
  [PLATFORMS.BLUESKY]: {
    getAccountSourceOptions: () => [
      {
        value: "username_bluesky_account_source",
        label:
          "For BlueSky, 'username' is automatically selected as the account source.",
      },
    ],
    getObjectIdSourceOptions: () => [
      {
        value: "text_bluesky",
        label:
          "For BlueSky, 'text' (post content) is automatically selected as the Object ID.",
      },
    ],
    transformRow: (row, accountSource, objectIdSource) => {
      const accountIdVal = row.username;
      const contentIdVal = row.id;
      const timestampVal = row.date;
      const objectIdSourceVal = row.text;

      const isValid = Boolean(
        accountIdVal && contentIdVal && timestampVal && objectIdSourceVal
      );

      if (!isValid) return null;

      // Parse timestamp
      let timestamp = timestampVal;
      if (isNaN(timestampVal)) {
        timestamp = Math.floor(new Date(timestampVal).getTime() / 1000);
      }

      return {
        account_id: String(accountIdVal).trim(),
        content_id: String(contentIdVal).trim(),
        object_id: String(objectIdSourceVal || "").trim(),
        timestamp_share: timestamp,
      };
    },
  },
  [PLATFORMS.TELEGRAM]: {
    getAccountSourceOptions: () => [
      {
        value: "channel_telegram_account_source",
        label: "Channel (channel_name, channel_id)",
      },
      {
        value: "author_telegram_account_source",
        label: "Author (post_author, sender_id)",
      },
    ],
    getObjectIdSourceOptions: () => [
      {
        value: "message_text_telegram",
        label:
          "For Telegram, 'message_text' is automatically selected as the Object ID source.",
      },
    ],
    transformRow: (row, accountSource, objectIdSource) => {
      let accountIdVal;
      if (accountSource === "channel_telegram_account_source") {
        accountIdVal = `${row.channel_name || ""} ${row.channel_id || ""}`;
      } else {
        accountIdVal = `${row.post_author || ""} ${row.sender_id || ""}`;
      }

      const contentIdVal = row.message_id;
      const timestampVal = row.date;
      const objectIdSourceVal = row.message_text;

      const isValid = Boolean(
        accountIdVal && contentIdVal && timestampVal && objectIdSourceVal
      );

      if (!isValid) return null;

      // Parse timestamp
      let timestamp = timestampVal;
      if (isNaN(timestampVal)) {
        timestamp = Math.floor(new Date(timestampVal).getTime() / 1000);
      }

      return {
        account_id: String(accountIdVal).trim(),
        content_id: String(contentIdVal).trim(),
        object_id: String(objectIdSourceVal || "").trim(),
        timestamp_share: timestamp,
      };
    },
  },
  [PLATFORMS.PREPROCESSED]: {
    getAccountSourceOptions: () => [],
    getObjectIdSourceOptions: () => [],
    transformRow: (row) => {
      // Already in the correct format, just validate
      const accountIdVal = row.account_id;
      const contentIdVal = row.content_id;
      const objectIdSourceVal = row.object_id;
      const timestampVal = row.timestamp_share;

      const isValid = Boolean(
        accountIdVal && contentIdVal && objectIdSourceVal && timestampVal
      );

      if (!isValid) return null;

      return {
        account_id: String(accountIdVal).trim(),
        content_id: String(contentIdVal).trim(),
        object_id: String(objectIdSourceVal || "").trim(),
        timestamp_share: timestampVal,
      };
    },
  },
  [PLATFORMS.OTHER]: {
    getAccountSourceOptions: () => [],
    getObjectIdSourceOptions: () => [],
    transformRow: () => null,
  },
};

// Main component
export default function PlatformSelector({
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

      // Update the formData with detected platform
      setFormData((prev) => ({
        ...prev,
        platform: detectedPlatform,
      }));

      // Auto-select account sources for platforms with only one option
      if (
        [PLATFORMS.YOUTUBE, PLATFORMS.TIKTOK, PLATFORMS.BLUESKY].includes(
          detectedPlatform
        )
      ) {
        const sourceMap = {
          [PLATFORMS.YOUTUBE]: "channel_title_id_youtube_account_source",
          [PLATFORMS.TIKTOK]: "name_region_tiktok_account_source",
          [PLATFORMS.BLUESKY]: "username_bluesky_account_source",
        };

        const defaultAccountSource = sourceMap[detectedPlatform];
        if (defaultAccountSource) {
          handleAccountSourceChange(defaultAccountSource);
        }
      }

      // Auto-select object ID sources for platforms with only one option
      if ([PLATFORMS.BLUESKY, PLATFORMS.TELEGRAM].includes(detectedPlatform)) {
        const sourceMap = {
          [PLATFORMS.BLUESKY]: "text_bluesky",
          [PLATFORMS.TELEGRAM]: "message_text_telegram",
        };

        const defaultObjectIdSource = sourceMap[detectedPlatform];
        if (defaultObjectIdSource) {
          handleObjectIdSourceChange(defaultObjectIdSource);
        }
      }
    }
  }, [formData.csvHeaders]);

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
      console.log(`Selected account source: ${source}`);
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
      console.log(`Selected object ID source: ${objectId}`);
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
        console.log("Processing large file with chunking...");
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

      console.log(
        `CSV transformation complete. Processed ${transformedData.length} rows.`
      );
      console.log(`Estimated file size: ${estimatedSizeMB.toFixed(2)} MB`);

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

  return (
    <>
      <div className="w-full max-w-7xl h-[95vh] mx-auto p-4 flex flex-col justify-between bg-gray-100 rounded-lg shadow-md">
        {/* Header*/}
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

        {/* Main content area */}
        <div className="flex flex-1 flex-col md:flex-row overflow-y-auto">
          {/* Left sidebar */}
          <div className="w-full md:w-1/4 p-4 bg-gray-200">
            {selectedPlatform !== PLATFORMS.OTHER &&
              selectedPlatform !== "" && (
                <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <h3 className="font-medium text-blue-800">Notes:</h3>
                  <ul className="list-disc pl-5 mt-2 text-sm text-left text-blue-700">
                    <li>
                      The transformed CSV will have the CSDS standardized format
                      with: account_id, content_id, object_id, and
                      timestamp_share fields.
                    </li>

                    <li>
                      Large files may take longer to process. Please be patient.
                    </li>
                  </ul>
                </div>
              )}
          </div>

          {/* Right content area */}
          <div className="w-full md:w-3/4 p-6 bg-white rounded-r-lg">
            {/* Step indicator - Platform detection */}
            <div className="mb-6 flex items-center">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                1
              </div>
              <h2 className="ml-3 text-lg font-medium">
                {selectedPlatform === PLATFORMS.PREPROCESSED
                  ? "Great, your DataSet is preprocessed correctly and ready to use."
                  : selectedPlatform === PLATFORMS.OTHER
                  ? "We couldn't identify your data format automatically. Please check your CSV file."
                  : `We detected that your data is imported from ${selectedPlatform}.`}
              </h2>
            </div>

            {/* Step indicator - Account Source */}
            {selectedPlatform !== PLATFORMS.PREPROCESSED &&
              selectedPlatform !== PLATFORMS.OTHER && (
                <>
                  <div className="mb-6 flex items-center">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                      2
                    </div>

                    <h2 className="ml-3 text-lg font-medium">
                      Choose Account Source:
                    </h2>
                    {/* Account source options */}
                  </div>
                  <div>
                    <div className="flex flex-row overflow-x-auto pb-2 space-x-3">
                      {accountSourceOptions.map((option) => (
                        <div
                          key={option.value}
                          className="ml-3 text-lg font-medium"
                        >
                          {/* Auto-selected platforms don't have radio buttons*/}
                          {![
                            PLATFORMS.YOUTUBE,
                            PLATFORMS.TIKTOK,
                            PLATFORMS.BLUESKY,
                          ].includes(selectedPlatform) ? (
                            <input
                              id={`radio-account-source-${option.value}`}
                              name="accountSource"
                              type="radio"
                              checked={formData.accountSource === option.value}
                              onChange={() =>
                                handleAccountSourceChange(option.value)
                              }
                              disabled={isLoading}
                            />
                          ) : (
                            <span className="text-blue-500 mr-2">•</span>
                          )}
                          <label
                            htmlFor={`radio-account-source-${option.value}`}
                            className="m-2 text-sm font-medium whitespace-normal"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

            {/* Step indicator - Object ID Source */}
            {selectedPlatform !== PLATFORMS.PREPROCESSED &&
              selectedPlatform !== PLATFORMS.OTHER &&
              formData.accountSource && (
                <>
                  <div className="mb-6 flex items-center">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                      3
                    </div>

                    <h2 className="ml-3 text-lg font-medium">
                      Choose Object ID Source:
                    </h2>
                  </div>
                  <div className="flex flex-row overflow-x-auto pb-2 space-x-3">
                    {objectIdSourceOptions.map((option) => (
                      <div
                        key={option.value}
                        className="ml-3 text-lg font-medium"
                      >
                        {/* Auto-selected platforms don't have radio buttons */}
                        {![PLATFORMS.BLUESKY, PLATFORMS.TELEGRAM].includes(
                          selectedPlatform
                        ) && (
                          <input
                            id={`radio-object-id-${option.value}`}
                            name="objectIdSource"
                            type="radio"
                            checked={formData.objectIdSource === option.value}
                            onChange={() =>
                              handleObjectIdSourceChange(option.value)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            disabled={isLoading}
                          />
                        )}
                        <label
                          htmlFor={`radio-object-id-${option.value}`}
                          className={`${
                            ![PLATFORMS.BLUESKY, PLATFORMS.TELEGRAM].includes(
                              selectedPlatform
                            )
                              ? "m-2"
                              : ""
                          }  text-sm font-medium whitespace-normal`}
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </>
              )}

            {/* Warnings and notes section */}
          </div>
        </div>

        {/* Footer with buttons */}
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
              !formData.accountSource ||
              !formData.objectIdSource
            }
            className={`${
              isLoading
                ? "bg-blue-300 cursor-not-allowed"
                : disableButton ||
                  !formData.accountSource ||
                  !formData.objectIdSource
                ? "bg-gray-400 cursor-not-allowed" // Grey background for disabled state
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
      </div>
    </>
  );
}
