import React from "react";

export default function NetworkHistory() {
  return (
    <>
      <div className="w-[90%] h-[95vh] mx-auto p-4 flex flex-col justify-between bg-gray-100 rounded-lg shadow-md">
        {/* Row 1 - 80% height */}
        <div className="flex flex-1">
          {/* Left Column - 20% width */}
          <div className="w-2/6 bg-white p-4 rounded-l-lg shadow">
            <p className="text-center">Left Panel</p>
          </div>

          {/* Right Column - 80% width */}
          <div className="w-4/6 bg-white p-4 rounded-r-lg shadow">
            <p className="text-center">Right Panel</p>
          </div>
        </div>

        {/* Row 2 - Buttons */}
        <div className="flex justify-evenly mt-4">
          <button className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded">
            Back
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
            Next
          </button>
        </div>
      </div>
    </>
  );
}
