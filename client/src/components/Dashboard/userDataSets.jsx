import React, { useState, useEffect } from "react";

const UserDatasets = ({ userId }) => {
  const [datasets, setDatasets] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch datasets when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchDatasets();
    }
  }, [userId]);

  const fetchDatasets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/csv-files?userId=${userId}`);
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
    window.open(`/api/csv-files/${filename}`, "_blank");
  };

  const handleDelete = async (filename) => {
    if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
      try {
        const response = await fetch(`/api/csv-files/${filename}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (data.status === "success") {
          // Remove the deleted file from the state
          setDatasets(datasets.filter((name) => name !== filename));
        } else {
          alert("Failed to delete the dataset");
        }
      } catch (err) {
        alert("Error connecting to server");
        console.error("Error deleting dataset:", err);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="p-4 bg-green-600 rounded-xl">
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
        <div className="text-right">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Datasets</h3>
          <p className="text-3xl font-bold text-gray-800">{datasets.length}</p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`ml-2 h-5 w-5 text-gray-500 transition-transform ${
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
                    {filename}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(filename)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Download dataset"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(filename)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Delete dataset"
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
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDatasets;
