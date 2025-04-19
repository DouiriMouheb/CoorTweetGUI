import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import MultiStepForm from "./MultiStepForm";
import { useAuth } from "../context/authContext";
import axios from "axios";

import { useLogout } from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import ConfirmationModal from "./ConfirmationModal.jsx";
import { useToast } from "./Toast.jsx";

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

// Enhanced custom hook for network data fetching and caching
const useNetworks = (userId) => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const { showToast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Increased cache timeout to 15 minutes for better performance
  const CACHE_TIMEOUT = 15 * 60 * 1000;

  // Reference to track if component is mounted
  const isMounted = useRef(true);

  // Create API instance with defaults and better timeout
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: `${apiUrl}/api`,
      timeout: 300000, // Increased timeout to 30 seconds for reliability
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Enhanced response interceptor with better error handling
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error);

        // Handle network connectivity issues
        if (!error.response) {
          showToast(
            "error",
            "Network connection error. Please check your internet connection."
          );
          return Promise.reject(new Error("Network connection error"));
        }

        // Handle server-side errors with clear messages
        if (error.response?.status >= 500) {
          showToast("error", "Server error occurred. Please try again later.");
        } else {
          // Handle client-side errors with specific messages
          showToast(
            "error",
            error.response?.data?.message || "An unexpected error occurred"
          );
        }

        return Promise.reject(error);
      }
    );

    return instance;
  }, [showToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Enhanced fetch networks function with better caching and error handling
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

      // Handle case with no user ID
      if (!userId) {
        if (isMounted.current) {
          setInitialLoading(false);
          setLoading(false);
          setNetworks([]);
          setError(null);
        }
        return [];
      }

      // Only set loading if this isn't the initial load
      // This prevents UI flicker when refreshing data
      if (!initialLoading) {
        setLoading(true);
      }

      try {
        const response = await api.post("/network/get-networks-names", {
          userId,
        });

        // Validate response data
        const fetchedNetworks = Array.isArray(response.data)
          ? response.data
          : [];

        if (isMounted.current) {
          setNetworks(fetchedNetworks);
          setLastFetched(Date.now());
          setError(null);
          setLoading(false);
          setInitialLoading(false);
        }

        return fetchedNetworks;
      } catch (err) {
        if (isMounted.current) {
          setError(
            err.message === "Network connection error"
              ? "Connection error. Please check your internet connection."
              : "Failed to load networks. Please try again."
          );
          setLoading(false);
          setInitialLoading(false);

          // Keep old networks data on error instead of clearing it
          // This allows users to still see and interact with cached data
        }
        throw err;
      }
    },
    [userId, lastFetched, networks, api]
  );

  // Enhanced delete network function with optimistic updates and rollback
  const deleteNetwork = useCallback(
    async (networkID) => {
      if (!networkID) {
        showToast("error", "Invalid network ID");
        return false;
      }

      setLoadingDelete(true);

      // Store previous state for rollback if needed
      const previousNetworks = [...networks];

      try {
        // Optimistic UI update - remove network immediately
        setNetworks((prev) =>
          prev.filter((network) => network.id !== networkID)
        );

        // Attempt the actual deletion
        await api.post("/network/delete-network", { networkID });

        showToast("success", "Project deleted successfully!");

        return true;
      } catch (error) {
        console.error("Error deleting network:", error);

        // Rollback on error - restore previous state
        setNetworks(previousNetworks);

        showToast("error", "Failed to delete project. Please try again.");

        return false;
      } finally {
        if (isMounted.current) {
          setLoadingDelete(false);
        }
      }
    },
    [api, networks, showToast]
  );

  // Load networks on component mount with debounced retry
  useEffect(() => {
    let retryTimeout;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const loadNetworks = async () => {
      if (!userId) return;

      try {
        await fetchNetworks();
      } catch (err) {
        // Implement exponential backoff for retries
        if (retryCount < MAX_RETRIES) {
          const delay = Math.min(1000 * 2 ** retryCount, 8000);
          retryCount++;

          retryTimeout = setTimeout(loadNetworks, delay);
        }
      }
    };

    loadNetworks();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [userId, fetchNetworks]);

  return {
    networks,
    loading: loading || initialLoading,
    initialLoading,
    error,
    fetchNetworks,
    deleteNetwork,
    loadingDelete,
    hasNetworks: networks.length > 0,
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

// Enhanced TableRowSkeleton with more realistic appearance
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

// Enhanced network count display component
const NetworkCountDisplay = ({ loading, initialLoading, count }) => {
  if (initialLoading) {
    return (
      <div
        className="h-10 bg-gray-200 rounded animate-pulse"
        style={{ width: "40px" }}
      ></div>
    );
  }

  return (
    <p className="text-3xl font-bold text-black-600">
      {count}
      {loading && !initialLoading && (
        <span className="ml-2 text-xs text-gray-500">(updating...)</span>
      )}
    </p>
  );
};

// Empty state component for better UX
const EmptyNetworksState = ({ searchTerm, onCreateNew, setSearchTerm }) => (
  <tr>
    <td colSpan="2" className="px-6 py-8 text-center">
      <div className="flex flex-col items-center justify-center">
        {searchTerm ? (
          <>
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-500 mb-1">
              No networks found matching "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          </>
        ) : (
          <>
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-gray-500 mb-3">
              You don't have any networks yet
            </p>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-[#00926c] text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Create your first project
            </button>
          </>
        )}
      </div>
    </td>
  </tr>
);

// Network error component with retry functionality
const NetworkErrorState = ({ error, onRetry }) => (
  <tr>
    <td colSpan="2" className="px-6 py-6 text-center">
      <div className="flex flex-col items-center justify-center">
        <svg
          className="w-10 h-10 text-red-500 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-red-500 font-medium mb-1">{error}</p>
        <button
          onClick={() => onRetry(true)}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
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

  // Use enhanced custom hook for fetching and managing networks
  const {
    networks,
    loading,
    initialLoading,
    error,
    fetchNetworks,
    deleteNetwork,
    loadingDelete,
    hasNetworks,
  } = useNetworks(user?.userId);

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

  const handleDeleteNetwork = async () => {
    const { projectId, projectName } = deleteConfirmation;

    if (!projectId) {
      showToast("error", "Invalid project selected");
      closeDeleteDialog();
      return;
    }

    try {
      const result = await deleteNetwork(projectId);

      if (result) {
        showToast("success", "Project deleted successfully!");
      }

      // Close the dialog regardless of result
      closeDeleteDialog();
    } catch (error) {
      console.error("Error in delete handler:", error);
      showToast("error", "Failed to delete project. Please try again.");
      closeDeleteDialog();
    }
  };

  // Navigate to network view
  const handleViewNetwork = useCallback(
    (networkId, networkName) => {
      if (!networkId) {
        showToast("error", "Invalid network selected");
        return;
      }

      navigate(`/network/${networkId}`, {
        state: { networkName },
      });
    },
    [navigate, showToast]
  );

  // Enhanced table content rendering with better loading and error states
  const renderTableContent = useMemo(() => {
    // Initial loading state (first load)
    if (initialLoading) {
      return Array(4)
        .fill(0)
        .map((_, index) => <TableRowSkeleton key={`skeleton-${index}`} />);
    }

    // Error state
    if (error) {
      return <NetworkErrorState error={error} onRetry={fetchNetworks} />;
    }

    // Empty state - either no search results or no networks at all
    if (currentItems.length === 0) {
      return (
        <EmptyNetworksState
          searchTerm={searchTerm}
          onCreateNew={handleCreateProject}
          setSearchTerm={setSearchTerm}
        />
      );
    }

    // Populated network list
    return currentItems.map((network, index) => (
      <motion.tr
        key={network.id || `network-${index}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hover:bg-gray-50"
      >
        <td className="px-6 py-4 text-sm font-medium text-black-600">
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
    initialLoading,
    error,
    currentItems,
    searchTerm,
    fetchNetworks,
    handleCreateProject,
    handleViewNetwork,
    openDeleteDialog,
    setSearchTerm,
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
          className={`bg-[#00926c] text-white rounded-full flex items-center justify-between shadow-lg ${
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
                  <span className="font-medium">{user?.username}</span>
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
                  className="flex items-center space-x-2 text-black-200 hover:text-black-100 transition-colors duration-300"
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
                  <div className="p-4 bg-[#00926c] rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 text-white"
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
                    <h3 className="text-sm font-medium text-black-500 mb-1">
                      Networks
                    </h3>
                    <NetworkCountDisplay
                      loading={loading}
                      initialLoading={initialLoading}
                      count={networks.length}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Datasets Card */}

              {/*  <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="p-4 bg-[#00926c] rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 text-white"
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
                    <h3 className="text-sm font-medium text-black-500 mb-1">
                      Datasets
                    </h3>
                    <p className="text-3xl font-bold text-black-600">3</p>
                  </div>
                </div>
              </motion.div> */}
              {/* Create Project Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <button
                  onClick={handleCreateProject}
                  className="w-full h-full bg-[#00926c] text-white p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center hover:shadow-xl transition-all"
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
                      className="ml-2 text-black-500 hover:text-blue-700"
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
        disabled={loadingDelete}
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
