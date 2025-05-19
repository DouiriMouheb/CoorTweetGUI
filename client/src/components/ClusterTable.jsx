import React, { useMemo, useState, useEffect } from "react";

const ClusterTable = ({ networkData, loading, mode }) => {
  // Pagination state management
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  // Data processing pipeline based on current visualization mode
  const { columns, data } = useMemo(() => {
    // Early return if data isn't loaded
    if (!networkData || !networkData.data) return { columns: [], data: [] };

    // Destructure network data with empty fallbacks
    const { vertices = [], edges = [] } = networkData.data;

    // Helper for safe property access
    const getEdgeProperty = (edge, prop) => edge[prop] || 'N/A';

    // Mode-specific data processing
    switch (mode) {
      case "Cluster": {
        const communityMap = {};

        // Initialize community structure from vertices
        vertices.forEach(vertex => {
          const comm = vertex.community;
          communityMap[comm] = communityMap[comm] || {
            accounts: new Set(),
            posts: 0,
            objects: new Set(),
            timeDeltas: []
          };
          communityMap[comm].accounts.add(vertex.name);
        });

        // Process intra-community edges
        edges.forEach(edge => {
          const fromVertex = vertices.find(v => v.name === edge.from);
          const toVertex = vertices.find(v => v.name === edge.to);

          if (fromVertex?.community === toVertex?.community) {
            const comm = fromVertex.community;
            communityMap[comm].posts += edge.weight || 0;
            communityMap[comm].objects.add(getEdgeProperty(edge, 'n_content_id'));
            communityMap[comm].timeDeltas.push(edge.avg_time_delta || 0);
          }
        });

  // return {
  //       columns: ["Cluster", "Average Coordination Time", "Shared Objects", "Connected Nodes"],
  //       data: Object.entries(communityMap).map(([community, stats]) => ({
  //         "Cluster": community,
  //         "Average Coordination Time": stats.timeDeltas.length > 0 
  //           ? (stats.timeDeltas.reduce((a, b) => a + b, 0) / stats.timeDeltas.length).toFixed(2)
  //           : 0,
  //         "Shared Objects": stats.objects.size,
  //         "Connected Nodes": stats.accounts.size,
  //       })).sort((a, b) => parseInt(a.Cluster) - parseInt(b.Cluster))
  //     };
  //   }

  return {
    columns: ["Cluster", "Average Coordination Time", "Shared Objects", "Connected Nodes"],
    data: Object.entries(communityMap).map(([community, stats]) => ({
      "Cluster": community,
      "Average Coordination Time": stats.timeDeltas.length > 0 
        ? parseFloat(
            (stats.timeDeltas.reduce((a, b) => a + b, 0) / stats.timeDeltas.length)
            .toFixed(2) // Force 2 decimal places
          ).toString() // Remove trailing zeros
        : "0",
      "Shared Objects": stats.objects.size,
      "Connected Nodes": stats.accounts.size,
    })).sort((a, b) => parseInt(a.Cluster) - parseInt(b.Cluster))
  };
}
      case "node": {
        const accountMap = {};
  
        vertices.forEach(vertex => {
          accountMap[vertex.name] = {
            objects: new Set(),
            timeDeltas: [],
            community: vertex.community,
            connectedAccounts: new Set() // NEW: Track connected accounts
          };
        });
  
        edges.forEach(edge => {
          const from = edge.from;
          const to = edge.to;
          
          // Add connection tracking
          if (accountMap[from]) {
            accountMap[from].connectedAccounts.add(to);
            accountMap[from].objects.add(getEdgeProperty(edge, 'n_content_id'));
            accountMap[from].timeDeltas.push(edge.avg_time_delta || 0);
          }
          if (accountMap[to]) {
            accountMap[to].connectedAccounts.add(from);
            accountMap[to].objects.add(getEdgeProperty(edge, 'n_content_id'));
            accountMap[to].timeDeltas.push(edge.avg_time_delta || 0);
          }
        });
  
      //   return {
      //     columns: ["Node Name", "Average Coordination Time", "Objects", "Connected Accounts", "Cluster"],
      //     data: Object.entries(accountMap).map(([account, stats]) => ({
      //       "Node Name": account,
      //       "Objects": stats.objects.size,
      //       "Connected Accounts": stats.connectedAccounts.size,
      //       "Average Coordination Time": stats.timeDeltas.length > 0
      //         ? (stats.timeDeltas.reduce((a, b) => a + b, 0) / stats.timeDeltas.length).toFixed(2)
      //         : 0,
      //       "Cluster": stats.community || 'N/A'
      //     })).sort((a, b) => a["Node Name"].localeCompare(b["Node Name"]))
      //   };
      // }
      return {
        columns: ["Node Name", "Average Coordination Time", "Number of Objects", "Connected Accounts", "Cluster"],
        data: Object.entries(accountMap).map(([account, stats]) => ({
          "Node Name": account,
          "Number of Objects": stats.objects.size, // Changed column name
          "Connected Accounts": stats.connectedAccounts.size,
          "Average Coordination Time": stats.timeDeltas.length > 0
            ? parseFloat(
                (stats.timeDeltas.reduce((a, b) => a + b, 0) / stats.timeDeltas.length)
                .toFixed(2)
              ).toString()
            : "0",
          "Cluster": stats.community || 'N/A'
        })).sort((a, b) => a["Node Name"].localeCompare(b["Node Name"]))
      };
    }
  


    case "object": {
      const shareMap = {}; // NEW: Aggregate by share counts
      
      edges.forEach(edge => {
        const key = `${edge.weight || 0}`; // Using weight as share count
        shareMap[key] = shareMap[key] || {
          nodes: new Set(),
          clusters: new Set(),
          timeDeltas: []
        };
        
        shareMap[key].nodes.add(edge.from);
        shareMap[key].nodes.add(edge.to);
        shareMap[key].timeDeltas.push(edge.avg_time_delta || 0);
  
        // Track clusters
        const fromVertex = vertices.find(v => v.name === edge.from);
        const toVertex = vertices.find(v => v.name === edge.to);
        if (fromVertex) shareMap[key].clusters.add(fromVertex.community);
        if (toVertex) shareMap[key].clusters.add(toVertex.community);
      });
  
      return {
        columns: ["Number of Nodes", "Number of Clusters", "Average Coordination Time"],
        data: Object.entries(shareMap).map(([shares, stats]) => ({
          "Number of Nodes": stats.nodes.size,
          "Number of Clusters": stats.clusters.size,
          "Average Coordination Time": stats.timeDeltas.length > 0
  ? parseFloat(
      (stats.timeDeltas.reduce((a, b) => a + b, 0) / stats.timeDeltas.length)
        .toFixed(2)
    ).toString()
  : "0"
        })).sort((a, b) => b["Number of Nodes"] - a["Number of Nodes"])
      };
    }

      // case "object": {
      //   const objectMap = {};
  
      //   edges.forEach(edge => {
      //     const contentId = getEdgeProperty(edge, 'n_content_id');
      //     const fromVertex = vertices.find(v => v.name === edge.from);
      //     const toVertex = vertices.find(v => v.name === edge.to);
  
      //     objectMap[contentId] = objectMap[contentId] || {
      //       accounts: new Set(),
      //       clusters: new Set(), // NEW: Track clusters
      //       timeDeltas: []
      //     };
          
      //     objectMap[contentId].accounts.add(edge.from);
      //     objectMap[contentId].accounts.add(edge.to);
      //     objectMap[contentId].timeDeltas.push(edge.avg_time_delta || 0);
  
      //     // Track clusters
      //     if (fromVertex) objectMap[contentId].clusters.add(fromVertex.community);
      //     if (toVertex) objectMap[contentId].clusters.add(toVertex.community);
      //   });
  
      //   return {
      //     columns: ["Object ID", "Number of Nodes", "Number of Clusters", "Average Coordination Time"],
      //     data: Object.entries(objectMap).map(([objectId, stats]) => ({
      //       "Object ID": objectId,
      //       "Number of Nodes": stats.accounts.size,
      //       "Number of Clusters": stats.clusters.size,
      //       "Average Coordination Time": stats.timeDeltas.length > 0
      //         ? (stats.timeDeltas.reduce((a, b) => a + b, 0) / stats.timeDeltas.length).toFixed(2)
      //         : 0
      //     }))
      //   };
      // }

      

      default:
        return { columns: [], data: [] };
    }
  }, [networkData, mode]);

  // Development logging for data changes
  useEffect(() => {
    console.log('Processed data:', { columns, data });
  }, [columns, data]);

  // Pagination calculations
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

  // Pagination state management
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Dynamic pagination controls component
  const PaginationControls = () => {
    const getTotalText = () => {
      switch(mode) {
        case 'Cluster': return `Total Clusters: ${data.length}`;
        case 'node': return `Total Nodes: ${data.length}`;
        case 'object': return `Total Objects: ${data.length}`;
        default: return '';
      }
    };

    return (
      <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-gray-600 text-sm">{getTotalText()}</div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {data.length > 0 
              ? `Showing ${indexOfFirstRow + 1}-${Math.min(indexOfLastRow, data.length)} of ${data.length}`
              : "0 items"}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-white text-gray-700 hover:bg-gray-100 border"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages || totalPages === 0 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-white text-gray-700 hover:bg-gray-100 border"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  // CSV export functionality
  const downloadCSV = () => {
    if (data.length === 0) return;
  
    // Create CSV content with Excel/Sheets compatibility
    const csvContent = [
      '\uFEFF' + // UTF-8 BOM for Excel
      'sep=,\n' + // Excel separator directive
      columns.join(','), // Header row
      ...data.map(row => 
        columns.map(col => {
          // Convert to string and sanitize values
          const value = String(row[col])
            .replace(/"/g, '""') // Escape double quotes
            .replace(/\n/g, ' ') // Remove newlines
            .replace(/,/g, '，'); // Replace commas in data with full-width commas
  
          // Quote only fields that need protection
          return value.includes(',') || value.includes('"') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\r\n');
  
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mode}_data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Loading state visualization
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                {["Cluster", "Average Coordination Time", "Shared Objects", "Connected Accounts"]
                  .map((header) => (
                    <th key={header} className="px-4 py-2 text-left">{header}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" className="px-4 py-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00926c]"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="bg-white">
    {/* Add download header section */}
    <div className="flex justify-between items-center mb-4 p-4 border-b">
      <h2 className="text-lg font-semibold text-gray-800">
        {mode.charAt(0).toUpperCase() + mode.slice(1)} View
      </h2>
      <button
        onClick={downloadCSV}
        className="px-4 py-2 bg-[#00926c] text-white rounded-lg hover:bg-[#007a5a] transition-colors flex items-center"
        disabled={data.length === 0}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
        Export CSV
      </button>
    </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              {columns.map((col) => (
                <th key={col} className="px-4 py-2 text-left">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-4 text-center">
                  No data available
                </td>
              </tr>
            ) : (
              currentRows.map((row, index) => (
                <tr key={index} className="border-b">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-2">
                      {col === "Object ID" ? (
                        <a 
                          href={row[col]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#00926c] hover:underline"
                        >
                          {row[col]}
                        </a>
                      ) : (
                        row[col]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {data.length > 0 && <PaginationControls />}
      </div>
    </div>
  );
};

export default ClusterTable;