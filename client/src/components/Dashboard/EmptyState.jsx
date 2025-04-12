export default function EmptyNetworksState({
  searchTerm,
  setSearchTerm,
  onCreateNew,
}) {
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
                You don't have any networks yet, try creating a new project
              </p>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
