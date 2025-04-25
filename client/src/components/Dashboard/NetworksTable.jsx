import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef } from "react";
import TableRowSkeleton from "./TableSkeletons";
import EmptyNetworksState from "./EmptyState";
import NetworkErrorState from "./ErrorState";
import NetworkTableRow from "./NetworkTableRow";

export default function NetworksTable({
  searchTerm,
  setSearchTerm,
  fetchNetworks,
  loading,
  initialLoading,
  error,
  currentItems,
  filteredItems,
  currentPage,
  totalPages,
  nextPage,
  prevPage,
  handleViewNetwork,
  openDeleteDialog,
  openDuplicateDialog,
  onCreateProject,
}) {
  // Track if initial fetch has been performed
  const initialFetchDone = useRef(false);

  // Instead of forcing a fetch on mount, check if we need one
  useEffect(() => {
    if (
      !initialFetchDone.current &&
      !loading &&
      (!currentItems || currentItems.length === 0) &&
      !error
    ) {
      initialFetchDone.current = true;
      fetchNetworks(false); // Use cache if available
    } else {
      initialFetchDone.current = true;
    }
  }, []);

  // Ensure currentItems and filteredItems are arrays
  const safeCurrentItems = Array.isArray(currentItems) ? currentItems : [];
  const safeFilteredItems = Array.isArray(filteredItems) ? filteredItems : [];

  // Helper to determine what content to show
  const getTableContent = () => {
    if (initialLoading) {
      return Array(4)
        .fill(0)
        .map((_, i) => <TableRowSkeleton key={i} />);
    }

    if (error) {
      return (
        <NetworkErrorState error={error} onRetry={() => fetchNetworks(true)} />
      );
    }

    if (!safeCurrentItems || safeCurrentItems.length === 0) {
      return (
        <EmptyNetworksState
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onCreateNew={onCreateProject}
        />
      );
    }

    return safeCurrentItems.map((network, i) => {
      if (!network) {
        console.error("Undefined network in currentItems at index", i);
        return null;
      }
      return (
        <NetworkTableRow
          key={network.id || i}
          network={network}
          onView={handleViewNetwork}
          onDelete={openDeleteDialog}
          onDuplicate={openDuplicateDialog}
        />
      );
    });
  };

  // Prevent refresh button from being spammed
  const handleRefresh = () => {
    if (!loading) {
      fetchNetworks(true);
    }
  };

  return (
    <div className="col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">All Networks</h2>
          {loading && (
            <div className="ml-3 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search networks..."
            className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={initialLoading || loading}
          />
          {searchTerm && (
            <button
              className="absolute right-10 top-2.5"
              onClick={() => setSearchTerm("")}
              disabled={initialLoading || loading}
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto" style={{ minHeight: "275px" }}>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {getTableContent()}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
        <button
          onClick={prevPage}
          disabled={
            currentPage <= 1 ||
            safeFilteredItems.length === 0 ||
            initialLoading ||
            loading
          }
          className={`px-4 py-2 rounded-lg ${
            currentPage <= 1 ||
            safeFilteredItems.length === 0 ||
            initialLoading ||
            loading
              ? "bg-gray-100 text-gray-400"
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
            currentPage >= totalPages ||
            safeFilteredItems.length === 0 ||
            initialLoading ||
            loading
          }
          className={`px-4 py-2 rounded-lg ${
            currentPage >= totalPages ||
            safeFilteredItems.length === 0 ||
            initialLoading ||
            loading
              ? "bg-gray-100 text-gray-400"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
