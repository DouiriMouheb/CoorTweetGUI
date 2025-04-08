import { useState, useEffect } from "react";
import MultiStepForm from "./MultiStepForm";
import { useAuth } from "../context/authContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import NetworkVisualization from "./NetworkVisualization";
import NetworkScreen from "./NetworkScreen" ;
import LoadingSpinner from "./LoadingSpinner";
import { useLogout } from "../hooks/useLogout";
import { motion } from "framer-motion";
import UserProfileEditor from "./UserProfile";

import {
  UserCircleIcon,
  XMarkIcon,
  ArrowLeftEndOnRectangleIcon,
  HomeIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const LandingDashboard = ({ children }) => {
  
  const [isExpanded, setIsExpanded] = useState(false);
  const handleLogout = () => logout();
  const { logout } = useLogout();

  const { user } = useAuth();
  const [showDashboard, setShowDashboard] = useState(true);
  const [activeComponent, setActiveComponent] = useState(null);
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 5;

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    projectId: null,
    projectName: "",
  });
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  // Open delete confirmation dialog
  const openDeleteDialog = (id, name) => {
    setDeleteDialog({
      isOpen: true,
      projectId: id,
      projectName: name,
    });
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      projectId: null,
      projectName: "",
    });
  };

  // Filter networks based on search term
  const filteredNetworks = networks.filter((network) =>
    network.name
      ? network.name.toLowerCase().includes(searchTerm.toLowerCase())
      : typeof network === "string"
      ? network.toLowerCase().includes(searchTerm.toLowerCase())
      : false
  );

  // Calculate pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentItems = filteredNetworks.slice(
    indexOfFirstProject,
    indexOfLastProject
  );
  const totalPages = Math.ceil(filteredNetworks.length / projectsPerPage);

  // Pagination controls
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle create new project button click
  const handleCreateProject = () => {
    setShowDashboard(false);
    setActiveComponent(
      <MultiStepForm onClose={() => setShowDashboard(true)} />
    );
  };

  // Function to get networks for a user
  const userId = user?.userId;

  const fetchNetworksForUser = async (userId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/network/get-networks-names",
        { userId }
      );
      return response.data; // This will now be an array of {id, name} objects
    } catch (error) {
      console.error("Error fetching networks:", error);
      throw error;
    }
  };

  // Function to get networks for a user
  useEffect(() => {
    // This runs when the component mounts
    if (!userId) return;

    const loadNetworks = async () => {
      try {
        setLoading(true);
        const data = await fetchNetworksForUser(userId);
        setNetworks(data);
        setError(null);
      } catch (err) {
        setError("Failed to load networks");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadNetworks();

    // If needed, you can clean up with a return function
    return () => {
      // Any cleanup code here
    };
  }, [userId]); // Add userId to the dependency array
  // Add this function to your Dashboard component

  // Fix your deleteNetwork function
  const deleteNetwork = async (networkID) => {
    try {
      console.log("Deleting network with ID:", networkID); // Debug log

      // For objects

      await axios.post("http://localhost:5000/api/network/delete-network", {
        networkID,
      });

      // After successful deletion, refresh the networks list
      const updatedNetworks = await fetchNetworksForUser(userId);
      setNetworks(updatedNetworks);
      toast.success("Project Deleted successfully!");
      // Close the dialog
      closeDeleteDialog();
    } catch (error) {
      console.error("Error deleting network:", error);
      toast.error("Error deleting network:", error);
      // You might want to show an error message to the user
      setError("Failed to delete network. Please try again.");
      closeDeleteDialog();
    }
  };
  const handleViewNetwork = (networkId, networkName) => {
    setShowDashboard(false);
    setActiveComponent(
      <NetworkScreen
        networkId={networkId}
        onClose={() => setShowDashboard(true)}
      />
    );
  };
  return (
    <div className="w-full h-[100vh] mx-auto p-4 flex flex-col bg-gray-100 overflow-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-center w-full pt-6 pb-4">
  <motion.div
    initial={{ opacity: 0, y: -20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ 
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.5
    }}
    className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-between shadow-lg ${
      isExpanded ? "w-full max-w-4xl py-3 px-6" : "w-64 py-2 px-4"
    }`}
    style={{
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    }}
  >
    {/* Collapsed view */}
    {!isExpanded && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center">
          <UserCircleIcon className="w-6 h-6 mr-2 transition-transform duration-300" />
          <span className="font-medium truncate">
            {user?.username}
          </span>
        </div>
        <button
          onClick={toggleExpand}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors duration-300"
        >
          <ChevronRightIcon className="w-5 h-5 transition-transform duration-300" />
        </button>
      </motion.div>
    )}

    {/* Expanded view */}
    {isExpanded && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center space-x-8">
          <motion.div
            className="flex items-center"
            transition={{ staggerChildren: 0.1 }}
          >
            <UserCircleIcon className="w-6 h-6 mr-2 transition-transform duration-300" />
            <span className="font-medium">{user.username}</span>
          </motion.div>

          <div className="flex space-x-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => {
                setActiveComponent(<Dashboard />);
                toggleExpand();
              }}
              className="flex items-center space-x-2 hover:text-blue-200 transition-colors duration-300"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Dashboard</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => {
                setActiveComponent(<UserProfileEditor />);
                toggleExpand();
              }}
              className="flex items-center space-x-2 hover:text-blue-200 transition-colors duration-300"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              <span>Parameters</span>
            </motion.button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-200 hover:text-red-100 transition-colors duration-300"
          >
            <ArrowLeftEndOnRectangleIcon className="w-5 h-5" />
            <span>Logout</span>
          </motion.button>

          <button
            onClick={toggleExpand}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors duration-300"
          >
            <ChevronDownIcon className="w-5 h-5 transform rotate-180 transition-transform duration-300" />
          </button>
        </div>
      </motion.div>
    )}
  </motion.div>
</div>

      {showDashboard ? (
        <div className="max-w-7xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Statistics Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-1 space-y-6"
            >
       {/* Networks Card */}
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-white rounded-2xl shadow-lg p-6"
  >
    <div className="flex items-center justify-between">
      <div className="p-4 bg-blue-100 rounded-xl">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-8 h-8 text-blue-600"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
          />
        </svg>
      </div>
      <div className="text-right">
        <h3 className="text-sm font-medium text-gray-500 mb-1">Networks</h3>
        {loading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500" />
        ) : (
          <p className="text-3xl font-bold text-blue-600">{networks.length}</p>
        )}
      </div>
    </div>
  </motion.div>

             {/* Datasets Card */}
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-white rounded-2xl shadow-lg p-6"
  >
    <div className="flex items-center justify-between">
      <div className="p-4 bg-purple-100 rounded-xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-purple-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      </div>
      <div className="text-right">
        <h3 className="text-sm font-medium text-gray-500 mb-1">Datasets</h3>
        <p className="text-3xl font-bold text-purple-600">3</p>
      </div>
    </div>
  </motion.div>

                {/* Create Project Button */}
                <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <button
                  onClick={handleCreateProject}
                  className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center hover:shadow-xl transition-all"
                >
                  <span className="text-2xl font-bold mb-2">+</span>
                  <span className="text-xl font-semibold">Create New Project</span>
                  <span className="text-sm opacity-90 mt-1">Start a new analysis</span>
                </button>
              </motion.div>
            </motion.div>

            {/* Networks Table */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <h2 className="text-xl font-semibold text-gray-800">All Networks</h2>
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Search networks..."
                    className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  <svg
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="overflow-x-auto" style={{ minHeight: "275px" }}>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* ... existing table body logic remains the same, update styling below ... */}
                    {loading ? (
                      <tr>
                        <td colSpan="2" className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500" />
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="2" className="px-6 py-4 text-center text-red-500">
                          {error}
                        </td>
                      </tr>
                    ) : currentItems.length > 0 ? (
                      currentItems.map((network, index) => (
                        <motion.tr
                          key={network.id || `network-${index}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-blue-600">
                            {network.name || network}
                          </td>
                          <td className="px-6 py-4 text-right space-x-4">
                            <button
                              onClick={() => handleViewNetwork(network.id || network, network.name || network)}
                              className="text-gray-500 hover:text-blue-600 transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => openDeleteDialog(network.id || network, network.name || network)}
                              className="text-gray-500 hover:text-red-600 transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                          No networks found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1 || filteredNetworks.length === 0}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === 1 || filteredNetworks.length === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages || filteredNetworks.length === 0}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === totalPages || filteredNetworks.length === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Create Project Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            {/* <button
              onClick={handleCreateProject}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              Create New Project
            </button> */}
     
          </motion.div>
        </div>
      ) : (
        activeComponent
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Delete Project</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteDialog.projectName}</span>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteDialog}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteNetwork(deleteDialog.projectId)}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LandingDashboard;