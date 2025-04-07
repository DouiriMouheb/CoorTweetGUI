import React from "react";

export default function StepIndicator({ number, title }) {
  return (
    <div className="mb-6 flex items-center">
      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
        {number}
      </div>
      <h2 className="ml-3 text-lg font-medium">{title}</h2>
    </div>
  );
}
