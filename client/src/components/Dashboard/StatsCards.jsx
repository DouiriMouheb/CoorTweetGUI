import { motion } from "framer-motion";
import NetworkCountDisplay from "./NetworkCountDisplay";

export default function StatsCards({
  networks,
  loading,
  initialLoading,
  onCreateProject,
}) {
  return (
    <div className="col-span-1 space-y-6">
      {/* Networks */}
      <motion.div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between">
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-medium text-black-500 mb-1">
              Networks
            </h3>
            <NetworkCountDisplay
              loading={loading}
              initialLoading={initialLoading}
              count={networks.length}
            />
          </div>
        </div>
      </motion.div>

      {/* Datasets */}
      {/*  <motion.div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between">
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
          <div className="text-right">
            <h3 className="text-sm font-medium text-black-500 mb-1">
              Datasets
            </h3>
            <p className="text-3xl font-bold text-black-600">3</p>
          </div>
        </div>
      </motion.div>
 */}

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
    </div>
  );
}
