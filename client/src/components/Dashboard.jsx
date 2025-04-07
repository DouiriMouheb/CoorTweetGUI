import { useState, useEffect } from "react";
import MultiStepForm from "./MultiStepForm";
import { useAuth } from "../context/authContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import NetworkVisualization from "./NetworkVisualization";
import LoadingSpinner from "./LoadingSpinner";
import { useLogout } from "../hooks/useLogout";
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
const Dashboard = ({ children }) => {
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
      <NetworkVisualization
        networkId={networkId}
        onClose={() => setShowDashboard(true)}
      />
    );
  };
  return (
    <div className="w-full max-w-7xl h-[95vh] mx-auto p-4 flex flex-col justify-between bg-gray-100 rounded-lg shadow-md overflow-auto">
      <div className="flex justify-center w-full pt-6 pb-4">
        <div
          className={`bg-black text-white rounded-full flex items-center justify-between transition-all duration-300 shadow-lg ${
            isExpanded ? "w-full max-w-3xl py-3 px-6" : "w-64 py-2 px-4"
          }`}
        >
          {/* Collapsed view */}
          {!isExpanded && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <UserCircleIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {user && <span>{user.username}</span>}
                </span>
              </div>
              <button
                onClick={toggleExpand}
                className="p-1 rounded-full hover:bg-gray-800"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Expanded view */}
          {isExpanded && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="flex items-center mr-6">
                  <UserCircleIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">{user.username}</span>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setActiveComponent(<Dashboard />);
                      toggleExpand();
                    }}
                    className="flex items-center hover:text-blue-400 transition-colors"
                  >
                    <HomeIcon className="w-4 h-4 mr-1" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveComponent(<UserProfileEditor />);
                      toggleExpand();
                    }}
                    className="flex items-center hover:text-blue-400 transition-colors"
                  >
                    <AdjustmentsHorizontalIcon className="w-4 h-4 mr-1" />
                    <span>Parameters</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-400 hover:text-red-300 transition-colors mr-4"
                >
                  <ArrowLeftEndOnRectangleIcon className="w-4 h-4 mr-1" />
                  <span>Logout</span>
                </button>

                <button
                  onClick={toggleExpand}
                  className="p-1 rounded-full hover:bg-gray-800"
                >
                  <ChevronDownIcon className="w-4 h-4 transform rotate-180" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showDashboard ? (
        <div className="p-6 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Project Statistics Cards */}
            <div className="md:w-1/4">
              <div className="bg-white rounded-lg shadow mb-4">
                {loading ? (
                  <div className="p-6 h-32 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                      Networks
                    </h3>
                    <div className="flex-grow flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 h-32 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                      Networks
                    </h3>
                    <div className="flex-grow flex justify-center items-center">
                      <p className="text-3xl font-bold">{networks.length}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">
                    Datasets
                  </h3>
                  <p className="text-3xl font-bold">3</p>
                </div>
              </div>
            </div>

            {/* Networks Table - Wider */}
            <div className="md:w-3/4">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold">All Networks</h2>
                  {/* Search input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name..."
                      className="p-2 pl-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page on search
                      }}
                    />
                    <svg
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="overflow-x-auto" style={{ minHeight: "275px" }}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan="2" className="px-4 py-4 text-center">
                            <div className="flex justify-center items-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td
                            colSpan="2"
                            className="px-4 py-4 text-center text-red-500"
                          >
                            {error}
                            test
                          </td>
                        </tr>
                      ) : currentItems.length > 0 ? (
                        <>
                          {currentItems.map((network, index) => (
                            <tr
                              key={network.id || `network-${index}`}
                              className="hover:bg-gray-50"
                              style={{ height: "45px" }}
                            >
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                                {network.name || network}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                    title="View network"
                                    onClick={() =>
                                      handleViewNetwork(
                                        network.id || network._id || network,
                                        network.name || network
                                      )
                                    }
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
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
                                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                    title="Delete network"
                                    onClick={() =>
                                      openDeleteDialog(
                                        network.id || network,
                                        network.name || network
                                      )
                                    }
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {/* Add empty rows to maintain height when fewer than 5 items */}
                          {currentItems.length < 5 &&
                            Array.from({
                              length: 5 - currentItems.length,
                            }).map((_, index) => (
                              <tr
                                key={`empty-${index}`}
                                style={{ height: "45px" }}
                              >
                                <td
                                  colSpan="2"
                                  className="border-b border-gray-200"
                                ></td>
                              </tr>
                            ))}
                        </>
                      ) : (
                        <>
                          <tr style={{ height: "45px" }}>
                            <td
                              colSpan="2"
                              className="px-4 text-center text-gray-500"
                            >
                              No networks found.
                            </td>
                          </tr>
                          {/* Add empty rows to maintain height when no results */}
                          {Array.from({ length: 4 }).map((_, index) => (
                            <tr
                              key={`empty-no-results-${index}`}
                              style={{ height: "45px" }}
                            >
                              <td
                                colSpan="2"
                                className="border-b border-gray-200"
                              ></td>
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination controls - Always visible */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={prevPage}
                      disabled={
                        currentPage === 1 || filteredNetworks.length === 0
                      }
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1 || filteredNetworks.length === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={nextPage}
                      disabled={
                        currentPage === Math.max(1, totalPages) ||
                        filteredNetworks.length === 0
                      }
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === Math.max(1, totalPages) ||
                        filteredNetworks.length === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        {filteredNetworks.length > 0 ? (
                          <>
                            Showing{" "}
                            <span className="font-medium">
                              {indexOfFirstProject + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {Math.min(
                                indexOfLastProject,
                                filteredNetworks.length
                              )}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium">
                              {filteredNetworks.length}
                            </span>{" "}
                            results
                          </>
                        ) : (
                          <>
                            Showing <span className="font-medium">0</span> out
                            of <span className="font-medium">0</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={prevPage}
                          disabled={
                            currentPage === 1 || filteredNetworks.length === 0
                          }
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 ${
                            currentPage === 1 || filteredNetworks.length === 0
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        {filteredNetworks.length > 0 ? (
                          Array.from(
                            { length: Math.max(1, totalPages) },
                            (_, i) => (
                              <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`relative inline-flex items-center px-4 py-2 border ${
                                  currentPage === i + 1
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {i + 1}
                              </button>
                            )
                          )
                        ) : (
                          <button className="relative inline-flex items-center px-4 py-2 border z-10 bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed">
                            1
                          </button>
                        )}
                        <button
                          onClick={nextPage}
                          disabled={
                            currentPage === Math.max(1, totalPages) ||
                            filteredNetworks.length === 0
                          }
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${
                            currentPage === Math.max(1, totalPages) ||
                            filteredNetworks.length === 0
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Project Button - Below both cards and table */}
          <div className="text-center">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded"
              onClick={handleCreateProject}
            >
              Create a new project
            </button>
          </div>
        </div>
      ) : (
        // Render the MultiStepForm component when showDashboard is false
        activeComponent
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Confirm Deletion
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{deleteDialog.projectName}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                onClick={closeDeleteDialog}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                onClick={() => {
                  deleteNetwork(deleteDialog.projectId);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
