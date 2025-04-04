import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function PlatformSelector({
  nextStep,
  prevStep,
  formData,
  setFormData,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");

  // Improved function to identify data source based on distinctive headers
  function identifyDataSource(headers) {
    if (!headers || headers.length === 0) return "Unknown";

    // Convert headers to lowercase for case-insensitive matching
    const lowercaseHeaders = headers.map((h) => h.toLowerCase());

    // Check for preprocessed data
    if (
      lowercaseHeaders.includes("account_id") &&
      lowercaseHeaders.includes("content_id") &&
      lowercaseHeaders.includes("object_id") &&
      lowercaseHeaders.includes("timestamp_share")
    ) {
      return "Preprocessed";
    }

    // Check for YouTube
    if (lowercaseHeaders.includes("videoid")) {
      return "Youtube";
    }

    // Check for TikTok
    if (
      lowercaseHeaders.includes("video_id") &&
      lowercaseHeaders.includes("author_name")
    ) {
      return "Tiktok";
    }

    // Check for Meta/Facebook
    if (
      lowercaseHeaders.includes("surface.id") ||
      lowercaseHeaders.includes("surface.name")
    ) {
      return "Facebook";
    }

    // Check for Instagram
    if (
      lowercaseHeaders.includes("post_owner.id") &&
      lowercaseHeaders.includes("post_owner.name") &&
      !lowercaseHeaders.includes("surface.id") &&
      !lowercaseHeaders.includes("surface.name")
    ) {
      return "Instagram";
    }

    // Check for Telegram
    if (
      lowercaseHeaders.includes("channel_id") ||
      lowercaseHeaders.includes("channel_name")
    ) {
      return "Telegram";
    }

    // Check for BlueSky
    if (
      lowercaseHeaders.includes("username") &&
      lowercaseHeaders.includes("id") &&
      lowercaseHeaders.length <= 4
    ) {
      return "Bluesky";
    }

    return "Other";
  }

  // Use the new function to detect the platform type
  useEffect(() => {
    if (formData.csvHeaders && formData.csvHeaders.length > 0) {
      const detectedPlatform = identifyDataSource(formData.csvHeaders);

      setSelectedPlatform(detectedPlatform);

      // Update the formData with detected platform
      setFormData((prev) => ({
        ...prev,
        platform: detectedPlatform,
      }));
    }
  }, [formData.csvHeaders, setFormData]);

  // Get account source options based on selected platform
  const getAccountSourceOptions = () => {
    switch (selectedPlatform) {
      case "Facebook":
        return [
          {
            value: "post_owner_facebook_account_source",
            label: "Post Owner (post_owner.id, post_owner.name)",
          },
          {
            value: "surface_account_source",
            label: "Surface (surface.id, surface.name)",
          },
        ];
      case "Instagram":
        return [
          {
            value: "post_owner_instagram_account_source",
            label: "Post Owner (post_owner.id, post_owner.name)",
          },
        ];
      case "Youtube":
        return [
          {
            value: "channel_title_id_youtube_account_source",
            label:
              "For YouTube, 'channel' (Title + ID) is automatically selected as the account source.",
          },
        ];
      case "Tiktok":
        return [
          {
            value: "name_region_tiktok_account_source",
            label:
              "For TikTok, 'author' (Name + Region) is automatically selected as the account source.",
          },
        ];
      case "BlueSky":
        return [
          {
            value: "username_bluesky_account_source",
            label:
              "For BlueSky, 'username' is automatically selected as the account source.",
          },
        ];
      case "Telegram":
        return [
          {
            value: "channel_telegram_account_source",
            label: "Channel (channel_name, channel_id)",
          },
          {
            value: "author_telegram_account_source",
            label: "Author (post_author,sender_id)",
          },
        ];
      default:
        return [];
    }
  };
  const getObjectIdSourceOptions = () => {
    switch (selectedPlatform) {
      case "Facebook":
        return [
          {
            value: "text_facebook",
            label: "Text content (text)",
          },
          {
            value: "link_attachment.link_facebook",
            label: "Link attachment (link_attachment.link)",
          },
        ];
      case "Instagram":
        return [
          {
            value: "text_instagram",
            label: "Text content (text)",
          },
        ];
      case "Youtube":
        return [
          {
            value: "video_title_youtube",
            label: "Video Title.",
          },
          {
            value: "video_description_youtube",
            label: "Video Discription.",
          },
          {
            value: "video_tags_youtube",
            label: "Tags.",
          },
        ];
      case "Tiktok":
        return [
          {
            value: "video_description_tiktok",
            label: "Video Description.",
          },
          {
            value: "video_to_text_tiktok",
            label: "Voice To Text.",
          },
          {
            value: "video_url_tiktok",
            label: "Video URL.",
          },
          {
            value: "video_effect_ids_tiktok",
            label: "Effect IDs.",
          },
          {
            value: "video_music_id_tiktok",
            label: "Music Id.",
          },
          {
            value: "video_hashtag_names_tiktok",
            label: "Hashtag Names",
          },
        ];
      case "BlueSky":
        return [
          {
            value: "text_bluesky",
            label:
              "For BlueSky, 'text' (post content) is automatically selected as the Object ID.",
          },
        ];
      case "Telegram":
        return [
          {
            value: "message_text_telegram",
            label:
              "For Telegram, 'message_text' is automatically selected as the Object ID source.",
          },
        ];
      default:
        return [];
    }
  };

  // Handle account source selection
  const handleAccountSourceChange = (source) => {
    setFormData((prev) => ({
      ...prev,
      accountSource: source,
    }));
  };
  // Handle object ID source selection
  const handleObjectIdSourceChange = (objectId) => {
    setFormData((prev) => ({
      ...prev,
      objectIdSource: objectId,
    }));
  };

  return (
    <>
      <h1 className="text-xl font-semibold text-center">
        Coordinated Sharing Behaviour Detection
      </h1>
      <h2 className="text-lg font-bold mb-4">Phase 2: CSDS Pre-processor</h2>

      {/* Info banner 
      <div className="bg-blue-50 p-4 rounded-md mb-6 flex items-start">
        <p className="text-sm">
          Your data is processed entirely in your browser — no CSV content is
          sent to any server or third party. <br /> The tool generates a
          standardized CSV file with the following columns:
          <br /> account_id <br />
          content_id <br /> object_id <br /> timestamp_share
        </p>
      </div>*/}

      {/* Detection message */}
      {/*detectionMessage && (
        <div className="bg-green-50 p-3 rounded-md mb-4 text-green-800">
          {detectionMessage}
        </div>
      )*/}

      {/* Step indicator - Platform detection */}
      <div className="mb-4 flex items-center">
        <div className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
          1
        </div>
        <h2 className="ml-2 text-lg font-medium text-gray-800">
          {selectedPlatform === "Preprocessed"
            ? "Great, your DataSet is preprocessed correctly and ready to use."
            : selectedPlatform === "Facebook"
            ? "We detected that your data is imported from Facebook."
            : selectedPlatform === "Instagram"
            ? "We detected that your data is imported from Instagram."
            : selectedPlatform === "Tiktok"
            ? "We detected that your data is imported from Tiktok"
            : selectedPlatform === "Youtube"
            ? "We detected that your data is imported from Youtube"
            : selectedPlatform === "Bluesky"
            ? "We detected that your data is imported from BlueSky"
            : selectedPlatform === "Telegram"
            ? "We detected that your data is imported from Telegram"
            : "We couldn't identify your data format automatically. Please select a platform."}
        </h2>
      </div>

      {/* Manual platform selection (only shown if needed) */}
      {/*selectedPlatform === "Other" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Platform
          </label>
          <div className="grid grid-cols-3 gap-3">
            {platforms.map((platform) => (
              <button
                key={platform}
                type="button"
                onClick={() => setSelectedPlatform(platform)}
                className={`flex items-center justify-center px-4 py-2 border rounded-md ${
                  selectedPlatform === platform
                    ? "bg-blue-100 border-blue-500"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      )*/}

      {/* Step indicator - Account Source */}
      {selectedPlatform !== "Preprocessed" &&
        selectedPlatform !== "Other" &&
        selectedPlatform !== "Youtube" &&
        selectedPlatform !== "TikTok" &&
        selectedPlatform !== "BlueSky" && (
          <div className="mb-4 flex items-center">
            <div className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div className="ml-2 w-full">
              {/* Account source radio buttons */}
              {getAccountSourceOptions().length > 0 && (
                <div className="flex space-x-6">
                  <h2 className="m-2 text-lg font-medium text-gray-800">
                    Choose Account Source :
                  </h2>
                  {getAccountSourceOptions().map((option) => (
                    <div key={option.value} className="ml-2 flex items-center">
                      <input
                        id={`radio-acount-source-${option.value}`}
                        name="accountSource"
                        type="radio"
                        checked={formData.accountSource === option.value}
                        onChange={() => handleAccountSourceChange(option.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <label
                        htmlFor={`radio-${option.value}`}
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Show description of automatic selection for non-Facebook platforms */}
            </div>
          </div>
        )}
      {selectedPlatform !== "Preprocessed" &&
        selectedPlatform !== "Other" &&
        selectedPlatform !== "Facebook" &&
        selectedPlatform !== "Instagram" &&
        selectedPlatform !== "Telegram" && (
          <div className="mb-4 flex items-center">
            <div className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div className="ml-2 w-full">
              {/* Account source radio buttons */}
              {getAccountSourceOptions().length > 0 && (
                <div className="flex space-x-6">
                  <h2 className="m-2 text-lg font-medium text-gray-800">
                    Choose Account Source :
                  </h2>
                  {getAccountSourceOptions().map((option) => (
                    <div key={option.value} className="ml-2 flex items-center">
                      <label
                        htmlFor={`radio-acount-source-${option.value}`}
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Show description of automatic selection for non-Facebook platforms */}
            </div>
          </div>
        )}
      {selectedPlatform !== "Preprocessed" &&
        selectedPlatform !== "Other" &&
        selectedPlatform !== "BlueSky" &&
        selectedPlatform !== "Telegram" &&
        formData.accountSource && (
          <div className="mb-4 flex items-center">
            <div className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div className="ml-2 w-full">
              {/* Account source radio buttons */}
              {getObjectIdSourceOptions().length > 0 && (
                <div className="flex space-x-6">
                  <h2 className="m-2 text-lg font-medium text-gray-800">
                    Choose Object ID Source :
                  </h2>
                  {getObjectIdSourceOptions().map((option) => (
                    <div key={option.value} className="ml-2 flex items-center">
                      <input
                        id={`radio-${option.value}`}
                        name="objectid"
                        type="radio"
                        checked={formData.objectIdSource === option.value}
                        onChange={() =>
                          handleObjectIdSourceChange(option.value)
                        }
                        disabled={isLoading}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`radio-${option.value}`}
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Show description of automatic selection for non-Facebook platforms */}
            </div>
          </div>
        )}
      {selectedPlatform !== "Preprocessed" &&
        selectedPlatform !== "Other" &&
        selectedPlatform !== "Facebook" &&
        selectedPlatform !== "Instagram" &&
        selectedPlatform !== "TikTok" &&
        selectedPlatform !== "Youtube" && (
          <div className="mb-4 flex items-center">
            <div className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div className="ml-2 w-full">
              {/* Account source radio buttons */}
              {getObjectIdSourceOptions().length > 0 && (
                <div className="flex space-x-6">
                  <h2 className="m-2 text-lg font-medium text-gray-800">
                    Choose Object ID Source :
                  </h2>
                  {getObjectIdSourceOptions().map((option) => (
                    <div key={option.value} className="ml-2 flex items-center">
                      <label
                        htmlFor={`radio-${option.value}`}
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          onClick={prevStep}
        >
          Back
        </button>

        <button
          disabled={
            isLoading ||
            (selectedPlatform !== "Preprocessed" &&
              selectedPlatform !== "Other" &&
              !formData.objectIdSource)
          }
          className={`${
            isLoading ||
            (selectedPlatform !== "Preprocessed" &&
              selectedPlatform !== "Other" &&
              !formData.objectIdSource)
              ? "bg-blue-300"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white px-4 py-2 rounded`}
          onClick={() => {
            setIsLoading(true);
            // Simulate processing delay
            setTimeout(() => {
              setIsLoading(false);
              nextStep();
            }, 1000);
          }}
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
