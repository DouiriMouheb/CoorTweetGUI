// Redesigned NetworkVisualization.jsx with improved layout and table styling
import { useState, useEffect } from "react";
import axios from "axios";
import NetworkGraph from "./NetworkGraph";
import ClusterTable from "./ClusterTable";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const NetworkScreen = ({ networkId, onClose }) => {
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(1);

  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:5000/api/network/get-network",
          { networkId }
        );
        setNetwork(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load network data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkData();
  }, [networkId]);

  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="w-full h-[95vh] mx-auto px-6 py-4 bg-gradient-to-br from-gray-100 to-white rounded-xl shadow-inner">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onClose}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 h-full">
        {/* Left Panel - Tabs and Content */}
        <div className="xl:col-span-2 flex flex-col bg-white rounded-2xl shadow-lg h-full overflow-hidden">
          <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-2xl">
            {["Cluster Summary", "Object Analysis", "Node Insights"].map((label, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx + 1)}
                className={`flex-1 p-4 text-sm font-semibold text-center transition-colors
                  ${activeTab === idx + 1 ? "text-blue-600 border-b-2 border-blue-600 bg-white" : "text-gray-500 hover:text-gray-700"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-6 custom-scrollbar">
            {activeTab === 1 && (
              <div className="overflow-x-auto rounded-lg">
                <div className="min-w-full text-sm">
                  <ClusterTable networkData={network} loading={loading} />
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Object Analysis</h3>
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">
                    Detailed object-level coordination metrics and patterns.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Node Insights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["Metric 1", "Metric 2", "Metric 3"].map((metric, index) => (
                    <div
                      key={metric}
                      className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                    >
                      <span className="text-gray-600">{metric}</span>
                      <span className="font-bold text-blue-600">Value {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Graph */}
        <div className="xl:col-span-3 bg-white rounded-2xl shadow-xl p-6 flex items-center justify-center h-full">
          {loading ? (
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
          ) : network ? (
            <div className="w-full h-[70vh]">
              <NetworkGraph networkData={network} />
            </div>
          ) : (
            <div className="text-gray-500">No network data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkScreen;
