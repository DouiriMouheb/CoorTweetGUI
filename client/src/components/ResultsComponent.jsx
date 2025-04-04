import { useState } from "react";

export default function ResultsComponent({ nextStep, prevStep }) {
  const [activeTab, setActiveTab] = useState("graph");

  return (
    <>
      <h2 className="text-xl font-semibold text-center">
        Coordinated Sharing Behaviour Detection
      </h2>

      {/* Tabs */}
      <div className="flex border-b mt-6 space-x-4">
        {[
          "Graph View",
          "Coordinated Accounts",
          "Coordinated Networks",
          "Coordinated Posts",
        ].map((tab, index) => {
          const tabKey = tab.toLowerCase().replace(/\s/g, "-");
          return (
            <button
              key={index}
              className={`pb-2 ${
                activeTab === tabKey
                  ? "border-b-2 border-blue-500 font-semibold text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tabKey)}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-4">
        {activeTab === "graph-view" ? (
          <div className="h-60 bg-gray-100 flex items-center justify-center rounded-md">
            Graph Visualization Area
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Column 1
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Column 2
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Column 3
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Data 1</td>
                  <td className="border border-gray-300 px-4 py-2">Data 2</td>
                  <td className="border border-gray-300 px-4 py-2">Data 3</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Data 4</td>
                  <td className="border border-gray-300 px-4 py-2">Data 5</td>
                  <td className="border border-gray-300 px-4 py-2">Data 6</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={prevStep}
        >
          Back
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
          Export Results
        </button>
      </div>
    </>
  );
}
