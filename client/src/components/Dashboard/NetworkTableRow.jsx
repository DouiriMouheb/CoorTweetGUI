import { motion } from "framer-motion";
import { TrashIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
export default function NetworkTableRow({ network, onView, onDelete }) {
  // Check if network is defined before trying to use it
  if (!network) {
    console.error("Network data is undefined");
    return null;
  }

  // Extract id and name safely, with fallbacks
  const id = network.id || network._id || "";
  const name = network.name || "Unnamed Network";
  const dataSetName = network.dataSetName || "Unnamed Dataset";
  const minParticipation = network.minParticipation || 0;
  const timewindow = network.timeWindow || 0;
  const edgeWeight = network.edgeWeight || 0;

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="hover:bg-gray-50"
    >
      <td className="px-6 py-4 text-sm font-medium text-black-600">{name}</td>
      <td className="px-6 py-4 text-sm font-medium text-black-600">
        {minParticipation} -- {timewindow} -- {edgeWeight}
      </td>
      <td className="px-6 py-4 text-right space-x-4">
        <button
          onClick={() => onView(id, name)}
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
          onClick={() => onDelete(id, name)}
          className="text-gray-500 hover:text-red-600 transition-colors"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </td>
    </motion.tr>
  );
}
