// NetworkVisualization.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import NetworkGraph from "./NetworkGraph";
import ClusterTable from "./ClusterTable";
import {
  UserCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowLeftEndOnRectangleIcon,
  PresentationChartBarIcon,
  ArchiveBoxArrowDownIcon,
} from "@heroicons/react/24/outline";

const NetworkVisualization = ({ networkId, onClose }) => {
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add state for active tab
  const [activeTab, setActiveTab] = useState(1);
  // Function to toggle tabs
  const toggleTab = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  useEffect(() => {
    const fetchNetworkData = async () => {
      console.log(networkId, "-********************-");
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

  console.log(network, "network data");

  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="w-full max-w-7xl h-[95vh] mx-auto flex flex-col justify-between rounded-lg">
      <div className="pb-4 text-left">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          onClick={onClose}
        >
          <ArrowLeftIcon className="w-4 h-4 " />
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="md:w-2/4">
          <div className="bg-white rounded-lg shadow mb-4">
            <div className="overflow-auto">
              {/* Tab headers */}

              <div className="flex border-b">
                <button
                  className={`py-2 px-4 flex-1 text-center ${
                    activeTab === 1
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "bg-gray-50"
                  }`}
                  onClick={() => toggleTab(1)}
                >
                  Summary by Cluster
                </button>
                <button
                  className={`py-2 px-4 flex-1 text-center ${
                    activeTab === 2
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "bg-gray-50"
                  }`}
                  onClick={() => toggleTab(2)}
                >
                  Summary by Object
                </button>
                <button
                  className={`py-2 px-4 flex-1 text-center ${
                    activeTab === 3
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "bg-gray-50"
                  }`}
                  onClick={() => toggleTab(3)}
                >
                  Summary by Node
                </button>
              </div>

              {/* Tab content */}
              <div className="p-4">
                {activeTab === 1 && (
                  <div>
                    <ClusterTable networkData={network} loading={loading} />
                  </div>
                )}

                {activeTab === 2 && (
                  <div>
                    <h3 className="font-medium mb-2">Tab 2 Content</h3>
                    <p>
                      Here is the content for the second tab. This could display
                      different network statistics or properties.
                    </p>
                    <div className="mt-3 p-3 bg-gray-100 rounded">
                      <p>Additional details or metrics can go here.</p>
                    </div>
                  </div>
                )}

                {activeTab === 3 && (
                  <div>
                    <h3 className="font-medium mb-2">Tab 3 Content</h3>
                    <p>
                      And finally, content for the third tab. Perhaps this could
                      show user interactions or activity.
                    </p>
                    <div className="mt-3">
                      <div className="flex justify-between border-b py-2">
                        <span>Metric 1</span>
                        <span>Value 1</span>
                      </div>
                      <div className="flex justify-between border-b py-2">
                        <span>Metric 2</span>
                        <span>Value 2</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span>Metric 3</span>
                        <span>Value 3</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="md:w-2/4">
          {loading ? (
            <div className="bg-white rounded-lg shadow mb-4 p-6 flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : network ? (
            <div className="bg-white rounded-lg shadow mb-4">
              <NetworkGraph networkData={network} />
            </div>
          ) : (
            <div className="text-center p-6 bg-white rounded-lg shadow">
              No network data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkVisualization;
