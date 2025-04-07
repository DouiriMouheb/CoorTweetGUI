import React from "react";
import { PLATFORMS } from "../constants";
import StepIndicator from "./StepIndicator";

export default function AccountSourceSelector({
  selectedPlatform,
  accountSourceOptions,
  formData,
  handleAccountSourceChange,
  isLoading,
}) {
  // Auto-selected platforms
  const autoSelectPlatforms = [
    PLATFORMS.YOUTUBE,
    PLATFORMS.TIKTOK,
    PLATFORMS.BLUESKY,
  ];

  if (!accountSourceOptions.length) return null;

  return (
    <>
      <StepIndicator number={2} title="Choose Account Source:" />

      <div className="flex flex-row overflow-x-auto pb-2 space-x-3">
        {accountSourceOptions.map((option) => (
          <div key={option.value} className="ml-3 text-lg font-medium">
            {!autoSelectPlatforms.includes(selectedPlatform) ? (
              <input
                id={`radio-account-source-${option.value}`}
                name="accountSource"
                type="radio"
                checked={formData.accountSource === option.value}
                onChange={() => handleAccountSourceChange(option.value)}
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
    </>
  );
}
