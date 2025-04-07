import { useState } from "react";

export default function ResultsComponent({ nextStep, prevStep }) {
  const [activeTab, setActiveTab] = useState("graph");

  return (
    <>
      <div className="w-full max-w-7xl h-[95vh] mx-auto p-4 flex flex-col justify-between bg-gray-100 rounded-lg shadow-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Coordinated Sharing Behavior Detection
          </h1>
          <div className="flex items-center mt-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              *
            </div>
            <div className="ml-3 text-xl font-medium text-blue-500">
              Results
            </div>
          </div>
          <div className="w-full h-1 bg-gray-200 mt-4 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>

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
        <div className="mt-8 flex justify-end">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
            Export Results
          </button>
        </div>
      </div>
    </>
  );
}
