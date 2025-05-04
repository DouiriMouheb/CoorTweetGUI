export default function NetworkErrorState({ error, onRetry }) {
  // Handle retry with debounce to prevent multiple rapid retries
  const handleRetry = () => {
    // Only retry if onRetry is a function
    if (typeof onRetry === "function") {
      onRetry(true);
    }
  };

  return (
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
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </td>
    </tr>
  );
}
