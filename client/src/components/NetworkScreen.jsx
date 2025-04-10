import { useState, useEffect } from "react";
import axios from "axios";
import NetworkGraph from "./NetworkGraph";
import ClusterTable from "./ClusterTable";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, ChartBarIcon, TableCellsIcon, CpuChipIcon } from "@heroicons/react/24/outline";
import NetworkGraphComponent from "./NetworkGraphComponent";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
const NetworkScreen = () => {
    const { networkId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
  const [network, setNetwork] = useState(null);
  const [networkName, setNetworkName] = useState(null);
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
        setNetworkName(response.data.networkName)
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


//   // Use the networkId from URL params
//   useEffect(() => {
//     const fetchNetworkData = async () => {
//       try {
//         // Use the networkId from URL
//         const response = await axios.post(
//           "http://localhost:5000/api/network/get-network",
//           { networkId } // Now using the parameter from the URL
//         );
//         setNetwork(response.data);
//       } catch (err) {
//         // Handle error
//       }
//     };

//     fetchNetworkData();
//   }, [networkId]);

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
            <span className="text-xs text-gray-500">ID: {networkId}</span>
          </div>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="h-2 w-2 bg-green-500 rounded-full shadow-sm border border-green-600/30"
        />
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
            <NetworkGraphComponent networkData={network} />
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
                { id: 1, label: "Cluster Summary", icon: TableCellsIcon },
                { id: 2, label: "Object Analysis", icon: ChartBarIcon },
                { id: 3, label: "Node Insights", icon: CpuChipIcon }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-8 py-4 flex items-center space-x-2 transition-colors
                      ${activeTab === tab.id 
                        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
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
            <AnimatePresence mode='wait'>
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
                      Object Coordination Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Add actual coordination metrics here */}
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-gray-900">Metric {item}</h4>
                              <p className="text-sm text-gray-600">Description of metric</p>
                            </div>
                            <span className="text-2xl font-bold text-blue-600">
                              {Math.random().toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold text-gray-900">
                      Node-Level Insights
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {["Centrality", "Connectivity", "Influence"].map((metric, index) => (
                        <div
                          key={metric}
                          className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                              <ChartBarIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{metric}</h4>
                              <p className="text-2xl font-bold text-blue-600 mt-1">
                                {index === 0 && "0.85"}
                                {index === 1 && "124"}
                                {index === 2 && "High"}
                              </p>
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