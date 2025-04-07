import React from "react";
import { PLATFORMS } from "../constants";

export default function PlatformInfo({ selectedPlatform }) {
  if (selectedPlatform === PLATFORMS.OTHER || selectedPlatform === "") {
    return null;
  }

  return (
    <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
      <h3 className="font-medium text-blue-800">Notes:</h3>
      <ul className="list-disc pl-5 mt-2 text-sm text-left text-blue-700">
        <li>
          The transformed CSV will have the CSDS standardized format with:
          account_id, content_id, object_id, and timestamp_share fields.
        </li>
        <li>Large files may take longer to process. Please be patient.</li>
      </ul>
    </div>
  );
}
