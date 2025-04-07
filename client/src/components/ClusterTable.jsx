import React, { useMemo, useState } from "react";

const ClusterTable = ({ networkData, loading }) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  // Process the network data to generate cluster statistics
  const clusterStats = useMemo(() => {
    if (!networkData || !networkData.data) return [];

    const data = networkData.data;
    const vertices = data.vertices || [];
    const edges = data.edges || [];

    // Group vertices by community/cluster
    const communities = {};
    vertices.forEach((vertex) => {
      const communityId = vertex.community;
      if (!communities[communityId]) {
        communities[communityId] = {
          id: communityId,
          vertices: [],
          connectedAccounts: new Set(),
          sharedObjects: new Set(),
          coordinationTimes: [],
        };
      }
      communities[communityId].vertices.push(vertex);
      communities[communityId].connectedAccounts.add(vertex.name);
    });

    // Process edges to calculate shared objects and coordination times
    edges.forEach((edge) => {
      const sourceVertex = vertices.find((v) => v.name === edge.from);
      const targetVertex = vertices.find((v) => v.name === edge.to);

      if (sourceVertex && targetVertex) {
        // If edge connects vertices in the same community
        if (sourceVertex.community === targetVertex.community) {
          const communityId = sourceVertex.community;

          // Count shared objects (assuming the edge represents an object interaction)
          communities[communityId].sharedObjects.add(edge.object || edge.id);

          // Add coordination time if available
          if (edge.weight || edge.time) {
            communities[communityId].coordinationTimes.push(
              edge.weight || edge.time
            );
          }
        }
      }
    });

    // Calculate statistics for each community
    return Object.values(communities)
      .map((community) => ({
        id: community.id,
        averageCoordinationTime: community.coordinationTimes.length
          ? (
              community.coordinationTimes.reduce((sum, time) => sum + time, 0) /
              community.coordinationTimes.length
            ).toFixed(2)
          : 0,
        sharedObjects: community.sharedObjects.size,
        connectedAccounts: community.connectedAccounts.size,
      }))
      .sort((a, b) => a.id - b.id);
  }, [networkData]);

  // Pagination calculations
  const totalPages = Math.ceil(clusterStats.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = clusterStats.slice(indexOfFirstRow, indexOfLastRow);

  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to export table data as CSV
  const downloadCSV = () => {
    if (!clusterStats.length) return;

    // Create CSV headers
    const headers = [
      "Cluster",
      "Average Coordination Time",
      "Shared Objects",
      "Connected Accounts",
    ];

    // Convert data to CSV format
    const csvRows = [headers];
    clusterStats.forEach((stat) => {
      csvRows.push([
        stat.id,
        stat.averageCoordinationTime,
        stat.sharedObjects,
        stat.connectedAccounts,
      ]);
    });

    // Convert to CSV string
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "cluster_statistics.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Generate color for each cluster (similar to graph visualization)
  const getClusterColor = (clusterId) => {
    const colors = [
      "#E34A4A", // red (0)
      "#4AE54A", // green (1)
      "#9F50E8", // purple (2)
      "#E8E850", // yellow (3)
      "#50E8E8", // cyan (4)
      "#E850C9", // pink (5)
      "#50B4E8", // light blue (6)
      "#5A6BE8", // royal blue (7)
      "#E89B50", // orange (8)
      "#50E87F", // mint (9)
    ];

    // Use modulo to handle more clusters than colors
    return colors[clusterId % colors.length];
  };

  // Pagination controls component
  const PaginationControls = () => {
    return (
      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="text-gray-600">
          {clusterStats.length > 0 ? (
            <>
              {indexOfFirstRow + 1}-
              {Math.min(indexOfLastRow, clusterStats.length)} of{" "}
              {clusterStats.length}
            </>
          ) : (
            "0 items"
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span>Rows per page: {rowsPerPage}</span>
          <div className="flex">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              &lt;
            </button>
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-2 py-1 rounded ${
                currentPage === totalPages || totalPages === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        {/*  <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Cluster Statistics</h3>
          <button
            className="px-3 py-1 text-sm bg-gray-100 text-gray-500 rounded hover:bg-gray-200 cursor-not-allowed opacity-60"
            disabled
          >
            Download CSV
          </button>
        </div>*/}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Cluster</th>
                <th className="px-4 py-2 text-left">
                  Average Coordination Time
                </th>
                <th className="px-4 py-2 text-left">Shared Objects</th>
                <th className="px-4 py-2 text-left">Connected Accounts</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" className="px-4 py-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white  ">
      {/*   <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Cluster Statistics</h3>
        <button
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          onClick={downloadCSV}
        >
          Download CSV
        </button>
      </div>*/}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Cluster</th>
              <th className="px-4 py-2 text-left">Average Coordination Time</th>
              <th className="px-4 py-2 text-left">Shared Objects</th>
              <th className="px-4 py-2 text-left">Connected Accounts</th>
            </tr>
          </thead>
          <tbody>
            {clusterStats.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-4 text-center">
                  No cluster data available
                </td>
              </tr>
            ) : (
              currentRows.map((stat) => (
                <tr key={stat.id} className="border-b">
                  <td className="px-4 py-2 flex items-center">
                    <span
                      className="inline-block w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: getClusterColor(stat.id) }}
                    />
                    {stat.id}
                  </td>
                  <td className="px-4 py-2">{stat.averageCoordinationTime}</td>
                  <td className="px-4 py-2">{stat.sharedObjects}</td>
                  <td className="px-4 py-2">{stat.connectedAccounts}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {clusterStats.length > 0 && <PaginationControls />}
      </div>
    </div>
  );
};

export default ClusterTable;
