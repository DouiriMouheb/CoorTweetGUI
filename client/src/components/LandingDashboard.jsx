import { useState, useEffect, useCallback, useMemo } from "react";
import MultiStepForm from "./MultiStepForm";
import { useAuth } from "../context/authContext";
import axios from "axios";

import { useLogout } from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import ConfirmationModal from "./ConfirmationModal.jsx";
import { useToast } from "./Toast.jsx";
import NetworkGraphComponent from "./NetworkGraphComponent.jsx";

import {
  UserCircleIcon,
  XMarkIcon,
  ArrowLeftEndOnRectangleIcon,
  HomeIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import UserProfile from "./ProfileScreen";

// Create a custom hook for network data fetching and caching
const useNetworks = (userId) => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const { showToast } = useToast();

  // Cache timeout in milliseconds (5 minutes)
  const CACHE_TIMEOUT = 5 * 60 * 1000;

  // Create API instance with defaults
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: "http://localhost:5000/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add response interceptor for error handling
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error);
        showToast(
          "error",
          error.response?.data?.message || "Network error occurred"
        );
        return Promise.reject(error);
      }
    );

    return instance;
  }, [showToast]);

  // Fetch networks function
  const fetchNetworks = useCallback(
    async (force = false) => {
      // Return cached data if available and not forced refresh
      if (
        !force &&
        lastFetched &&
        Date.now() - lastFetched < CACHE_TIMEOUT &&
        networks.length > 0
      ) {
        return networks;
      }

      if (!userId) {
        setLoading(false);
        return [];
      }

      try {
        setLoading(true);
        const response = await api.post("/network/get-networks-names", {
          userId,
        });
        const fetchedNetworks = response.data;

        setNetworks(fetchedNetworks);
        setLastFetched(Date.now());
        setError(null);
        return fetchedNetworks;
      } catch (err) {
        setError("Failed to load networks");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, lastFetched, networks, api]
  );

  // Delete network function
  const deleteNetwork = useCallback(
    async (networkID) => {
      try {
        await api.post("/network/delete-network", { networkID });

        // Update local state without full refetch
        setNetworks((prev) =>
          prev.filter((network) => network.id !== networkID)
        );
        return true;
      } catch (error) {
        console.error("Error deleting network:", error);
        throw error;
      }
    },
    [api]
  );

  // Load networks on component mount
  useEffect(() => {
    if (userId) {
      fetchNetworks();
    }
  }, [userId, fetchNetworks]);

  return {
    networks,
    loading,
    error,
    fetchNetworks,
    deleteNetwork,
  };
};

// Create a custom hook for search and pagination
const useSearchAndPagination = (items, itemsPerPage = 5) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search to avoid excessive re-renders
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 300);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name
        ? item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        : typeof item === "string"
        ? item.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        : false
    );
  }, [items, debouncedSearchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Pagination controls
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    currentItems,
    totalPages,
    nextPage,
    prevPage,
    resetPagination,
    filteredItems,
  };
};

// Skeleton loading component for table rows
const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end space-x-4">
        <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
        <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
      </div>
    </td>
  </tr>
);

const LandingDashboard = ({ children }) => {
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const { logout } = useLogout();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDashboard, setShowDashboard] = useState(true);
  const [activeComponent, setActiveComponent] = useState(null);

  // Use custom hook for fetching and managing networks
  const { networks, loading, error, fetchNetworks, deleteNetwork } =
    useNetworks(user?.userId);

  // Use custom hook for search and pagination
  const {
    searchTerm,
    setSearchTerm,
    currentItems,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    resetPagination,
    filteredItems,
  } = useSearchAndPagination(networks, 4);

  // Delete confirmation dialog state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    projectId: null,
    projectName: "",
  });

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = () => logout();

  // Handle create new project button click
  const handleCreateProject = () => {
    setShowDashboard(false);
    setActiveComponent(
      <MultiStepForm
        onClose={() => {
          setShowDashboard(true);
          // Refresh networks list after creating a new project
          fetchNetworks(true);
        }}
      />
    );
  };

  // Update open/close functions for delete dialog
  const openDeleteDialog = (id, name) => {
    setDeleteConfirmation({
      isOpen: true,
      projectId: id,
      projectName: name,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteConfirmation({
      isOpen: false,
      projectId: null,
      projectName: "",
    });
  };

  // Handle network deletion with optimistic UI update
  const handleDeleteNetwork = async () => {
    const { projectId, projectName } = deleteConfirmation;

    try {
      await deleteNetwork(projectId);
      showToast("success", "Project deleted successfully!");
    } catch (error) {
      // Error is already handled in the hook
      showToast("error", "Failed to delete project. Please try again.");
    } finally {
      closeDeleteDialog();
    }
  };

  // Navigate to network view
  const handleViewNetwork = useCallback(
    (networkId, networkName) => {
      navigate(`/network/${networkId}`, {
        state: { networkName },
      });
    },
    [navigate]
  );

  // Render network count with skeleton loader
  const renderNetworkCount = useMemo(() => {
    if (loading) {
      return (
        <div
          className="h-10 bg-gray-200 rounded animate-pulse"
          style={{ width: "40px" }}
        ></div>
      );
    }
    return (
      <p className="text-3xl font-bold text-blue-600">{networks.length}</p>
    );
  }, [loading, networks.length]);

  // Render table content with loading states
  const renderTableContent = useMemo(() => {
    if (loading && networks.length === 0) {
      return Array(5)
        .fill(0)
        .map((_, index) => <TableRowSkeleton key={`skeleton-${index}`} />);
    }

    if (error) {
      return (
        <tr>
          <td colSpan="2" className="px-6 py-4 text-center text-red-500">
            {error}
            <button
              onClick={() => fetchNetworks(true)}
              className="ml-2 text-blue-500 hover:text-blue-700 underline"
            >
              Retry
            </button>
          </td>
        </tr>
      );
    }

    if (currentItems.length === 0) {
      return (
        <tr>
          <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
            {searchTerm
              ? "No networks found matching your search"
              : "No networks found"}
          </td>
        </tr>
      );
    }

    return currentItems.map((network, index) => (
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
            onClick={() =>
              handleViewNetwork(network.id || network, network.name || network)
            }
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
            onClick={() =>
              openDeleteDialog(network.id || network, network.name || network)
            }
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
    ));
  }, [
    currentItems,
    error,
    fetchNetworks,
    handleViewNetwork,
    loading,
    networks.length,
    openDeleteDialog,
    searchTerm,
  ]);

  return (
    <div className="w-full h-[100vh] mx-auto p-4 flex flex-col bg-gray-100 overflow-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-center w-full ">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            duration: 0.5,
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
                <span className="font-medium truncate">{user?.username}</span>
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
                      setShowDashboard(true);
                      setActiveComponent(null);
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
                      setShowDashboard(false);
                      setActiveComponent(<UserProfile />);
                      toggleExpand();
                    }}
                    className="flex items-center space-x-2 hover:text-blue-200 transition-colors duration-300"
                  >
                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                    <span>Profile</span>
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
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Networks
                    </h3>
                    {renderNetworkCount}
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
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Datasets
                    </h3>
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
                  <span className="text-xl font-semibold">
                    Create New Project
                  </span>
                  <span className="text-sm opacity-90 mt-1">
                    Start a new analysis
                  </span>
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
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    All Networks
                  </h2>
                  {loading && networks.length > 0 && (
                    <div className="ml-3 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {!loading && (
                    <button
                      onClick={() => fetchNetworks(true)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      title="Refresh networks"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Search networks..."
                    className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="absolute right-10 top-2.5"
                      onClick={() => setSearchTerm("")}
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
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
                    {renderTableContent}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1 || filteredItems.length === 0}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === 1 || filteredItems.length === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={
                      currentPage === totalPages || filteredItems.length === 0
                    }
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === totalPages || filteredItems.length === 0
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
        </div>
      ) : (
        activeComponent
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteNetwork}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteConfirmation.projectName}"?`}
        confirmText="Delete"
        confirmColor="red"
      >
        <p className="mt-2 text-sm text-red-600">
          This action cannot be undone. All associated data will be permanently
          removed.
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default LandingDashboard;
