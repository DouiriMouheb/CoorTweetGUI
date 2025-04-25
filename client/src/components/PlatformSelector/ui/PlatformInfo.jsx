import React from "react";
import { PLATFORMS } from "../constants";

export default function PlatformInfo({ selectedPlatform }) {
  if (selectedPlatform === PLATFORMS.OTHER || selectedPlatform === "") {
    return null;
  }

  return (
    <ul className="list-disc pl-5 mt-2 text-sm text-left text-black-700">
      <li>Large files may take longer to process. Please be patient.</li>
    </ul>
  );
}
