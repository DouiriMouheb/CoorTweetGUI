import { motion } from "framer-motion";
import {
  ArrowPathRoundedSquareIcon,
  TrashIcon,
  CloudArrowDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import React, { useState, useEffect } from "react";
const apiUrl = import.meta.env.VITE_API_URL;

export default function StatsCards({
  network,
  loading,
  initialLoading,
  onCreateProject,
  userId,
  onDuplicate,
}) {
  const [datasets, setDatasets] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Add state for delete operation

  useEffect(() => {
    if (userId) {
      fetchDatasets();
    }
  }, [userId]);

  const fetchDatasets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Send userId in the request body as shown in your Postman example
      const response = await fetch(`${apiUrl}/stored-csv/csv-files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setDatasets(data.files);
      } else {
        setError("Failed to fetch datasets");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching datasets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (filename) => {
    window.open(`${apiUrl}/stored-csv/csv-files/${filename}`, "_blank");
  };

  const openDeleteModal = (filename) => {
    setFileToDelete(filename);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      // Only allow closing if not currently deleting
      setShowDeleteModal(false);
      setFileToDelete(null);
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true); // Set deleting state to true when starting delete operation

    try {
      const response = await fetch(
        `${apiUrl}/stored-csv/csv-files/${fileToDelete}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        // Remove the deleted file from the state
        setDatasets(datasets.filter((name) => name !== fileToDelete));
        setIsDeleting(false); // Reset deleting state
        closeDeleteModal();
      } else {
        alert("Failed to delete the dataset");
        setIsDeleting(false); // Reset deleting state on error
      }
    } catch (err) {
      alert("Error connecting to server");
      console.error("Error deleting dataset:", err);
      setIsDeleting(false); // Reset deleting state on error
    }
  };

  // Pass the filename to onDuplicate when reusing a dataset
  const handleDuplicate = (filename) => {
    // Extract only the filename without the userId prefix
    //const cleanFilename = filename.replace(`${userId}-`, "");
    onDuplicate(null, "New Analysis", filename);
  };

  const id = userId;

  return (
    <div className="col-span-1 space-y-6">
      {/* Datasets */}
      <motion.div className="bg-white rounded-2xl shadow-lg p-6">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="p-4 bg-[#00926c] rounded-xl">
            <svg
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={` h-5 w-5 text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-right">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Datasets</h3>
            <p className="text-3xl font-bold text-black-600">
              {datasets.length}
            </p>
          </div>
        </div>

        {isOpen && (
          <div className="mt-4 border-t pt-4">
            {isLoading ? (
              <p className="text-center text-gray-500">Loading datasets...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : datasets.length === 0 ? (
              <p className="text-center text-gray-500">No datasets found</p>
            ) : (
              <ul className="space-y-2">
                {datasets.map((filename) => (
                  <li
                    key={filename}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-700 truncate flex-1">
                      {filename.replace(`${userId}-`, "")}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(filename)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Download dataset"
                      >
                        <CloudArrowDownIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(filename)}
                        className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                        title="Reuse dataset"
                      >
                        <ArrowPathRoundedSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(filename)}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete dataset"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </motion.div>

      {/* Create Project */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <button
          onClick={onCreateProject}
          className="w-full bg-[#00926c] text-white p-8 rounded-2xl shadow-lg flex flex-col items-center hover:shadow-xl"
        >
          <span className="text-2xl font-bold mb-2">+</span>
          <span className="text-xl font-semibold">Create New Project</span>
          <span className="text-sm opacity-90 mt-1">Start a new analysis</span>
        </button>
      </motion.div>
      {/* Delete Confirmation Modal with Blur Background */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-30 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Confirm Delete
              </h3>
              <button
                onClick={closeDeleteModal}
                className={`text-gray-500 hover:text-gray-700 ${
                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isDeleting}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {fileToDelete?.replace(`${userId}-`, "")}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className={`px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors ${
                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center min-w-[80px] ${
                  isDeleting ? "opacity-90" : ""
                }`}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
