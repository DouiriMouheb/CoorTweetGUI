import { FolderOpen } from "lucide-react";

export default function EmptyNetworksState({ searchTerm, setSearchTerm }) {
  return (
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
            <div className="flex items-center">
              <FolderOpen className="mr-2 w-10 h-10 text-gray-500" />
              <p className="text-gray-500">You don't have any Projects yet</p>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
