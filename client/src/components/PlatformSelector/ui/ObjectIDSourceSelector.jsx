import React from "react";
import { PLATFORMS } from "../constants";
import StepIndicator from "./StepIndicator";

export default function ObjectIDSourceSelector({
  selectedPlatform,
  objectIdSourceOptions,
  formData,
  handleObjectIdSourceChange,
  isLoading,
}) {
  // Auto-selected platforms
  const autoSelectPlatforms = [PLATFORMS.BLUESKY, PLATFORMS.TELEGRAM];

  if (!objectIdSourceOptions.length) return null;

  return (
    <>
      <StepIndicator number={3} title="Choose Object ID Source:" />

      <div className="flex flex-row overflow-x-auto pb-2 space-x-3">
        {objectIdSourceOptions.map((option) => (
          <div key={option.value} className="ml-3 text-lg font-medium">
            {!autoSelectPlatforms.includes(selectedPlatform) && (
              <input
                id={`radio-object-id-${option.value}`}
                name="objectIdSource"
                type="radio"
                checked={formData.objectIdSource === option.value}
                onChange={() => handleObjectIdSourceChange(option.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
            )}
            <label
              htmlFor={`radio-object-id-${option.value}`}
              className={`${
                !autoSelectPlatforms.includes(selectedPlatform) ? "m-2" : ""
              } text-sm font-medium whitespace-normal`}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </>
  );
}
