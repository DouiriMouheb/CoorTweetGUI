import { useState, useEffect } from "react";
import NetworkGraph from "./NetworkGraph";
import ClusterTable from "./ClusterTable";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  TableCellsIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api"; // Import our API service
import { toast } from "react-hot-toast";

const NetworkScreen = () => {
  const { networkId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [network, setNetwork] = useState(null);
  const [networkName, setNetworkName] = useState(null);
  const [edgeWeight, setEdgeWeight] = useState(null);
  const [minParticipation, setMinParticipation] = useState(null);
  const [timeWindow, setTimeWindow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(1);

  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        setLoading(true);
        // Use our API service which automatically adds auth headers
        const response = await api.post(`${apiUrl}/api/network/get-network`, {
          networkId,
        });

        console.log("Network data received:", response.data);
        setNetwork(response.data);
        setNetworkName(response.data.networkName);
        setTimeWindow(response.data.timeWindow);
        setEdgeWeight(response.data.edgeWeight);
        setMinParticipation(response.data.minParticipation);
        setError(null);
      } catch (err) {
        console.error("Error fetching network data:", err);

        // Handle different error types
        if (err.response?.status === 401) {
          toast.error("Authentication error. Please log in again.");
          // Redirect to login page after a short delay
          setTimeout(() => navigate("/login"), 1500);
        } else if (err.response?.status === 404) {
          setError("Network not found. It may have been deleted.");
          toast.error("Network not found.");
        } else {
          setError("Failed to load network data. Please try again.");
          toast.error("Failed to load network data.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (networkId) {
      fetchNetworkData();
    }
  }, [networkId, navigate, apiUrl]);

  // Update the back button to use navigation
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Dynamic Island-inspired Header */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="flex items-center bg-white/90 backdrop-blur-xl rounded-full shadow-xl border border-gray-200/50 px-4 py-2 space-x-4">
          {/* Back Button */}
          <motion.button
            onClick={handleBack}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </motion.button>

          {/* Network Status Indicator */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex items-center space-x-2"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-blue-500/10 blur rounded-full" />
              <CpuChipIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800 truncate max-w-[160px]">
                {networkName || "Loading..."}
              </span>
              {/*<span className="text-xs text-gray-500">ID: {networkId}</span> */}
            </div>
          </motion.div>
        </div>
      </motion.div>
      <div className="pt-20">
        {/* Main Visualization */}
        <div className="relative h-[70vh] w-full bg-gradient-to-br from-blue-100 to-purple-100">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
            </div>
          ) : network ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full p-6"
            >
              <NetworkGraph networkData={network} />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              No network data available
            </div>
          )}
        </div>
      </div>

      {/* Data Analysis Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: 1, label: "Summary", icon: TableCellsIcon },
                { id: 2, label: "Parameters", icon: AdjustmentsHorizontalIcon },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-8 py-4 flex items-center space-x-2 transition-colors
                      ${
                        activeTab === tab.id
                          ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 1 && (
                  <div className="overflow-x-auto rounded-lg shadow-inner">
                    <ClusterTable
                      networkData={network}
                      loading={loading}
                      className="min-w-full divide-y divide-gray-200"
                    />
                  </div>
                )}

                {activeTab === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold text-gray-900">
                      Parameters used to analyse the dataset
                    </h3>
                    <div className="grid grid-cols-3 gap-6 w-full">
                      {network &&
                        network.data &&
                        [
                          {
                            name: "Minimum participation",
                            description:
                              "The threshold for the minimum level of coordinated participation required for inclusion in the analysis.",
                            value: minParticipation,
                          },
                          {
                            name: "Time Window (seconds)",
                            description:
                              "The time window indicates the interval considered for calculating co-shares",
                            value: timeWindow,
                          },
                          {
                            name: "Edge Weight",
                            description:
                              "The edge threshold defines the minimum frequency of co-sharing required for a connection to be made.",
                            value: edgeWeight,
                          },
                        ].map((metric, index) => (
                          <div
                            key={index}
                            className="p-6 bg-[#00926c] rounded-xl border border-blue-100 w-full max-w-md"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium text-white">
                                  {metric.name} :
                                  <span className="text-2xl font-bold pl-4 text-black-600">
                                    {metric.value !== undefined &&
                                    metric.value !== null
                                      ? typeof metric.value === "number"
                                        ? String(metric.value)
                                        : metric.value
                                      : "N/A"}
                                  </span>
                                </h4>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkScreen;
