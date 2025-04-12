import {
  UserCircleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  HomeIcon,
  AdjustmentsHorizontalIcon,
  ArrowLeftEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import UserProfile from "../ProfileScreen";

export default function Header({
  user,
  isExpanded,
  toggleExpand,
  logout,
  setShowDashboard,
  setActiveComponent,
}) {
  return (
    <div className="flex justify-center w-full">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          duration: 0.5,
        }}
        className={`bg-[#00926c] text-white rounded-full flex items-center justify-between shadow-lg ${
          isExpanded ? "w-full max-w-4xl py-3 px-6" : "w-64 py-2 px-4"
        }`}
        style={{ transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
      >
        {!isExpanded ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <UserCircleIcon className="w-6 h-6 mr-2" />
              <span className="font-medium truncate">{user?.username}</span>
            </div>
            <button
              onClick={toggleExpand}
              className="p-1.5 rounded-full hover:bg-white/10"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <UserCircleIcon className="w-6 h-6 mr-2" />
                <span className="font-medium">{user?.username}</span>
              </div>
              <div className="flex space-x-6">
                <button
                  onClick={() => {
                    setShowDashboard(true);
                    setActiveComponent(null);
                    toggleExpand();
                  }}
                  className="flex items-center space-x-2 hover:text-blue-200"
                >
                  <HomeIcon className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    setShowDashboard(false);
                    setActiveComponent(<UserProfile />);
                    toggleExpand();
                  }}
                  className="flex items-center space-x-2 hover:text-blue-200"
                >
                  <AdjustmentsHorizontalIcon className="w-5 h-5" />
                  <span>Profile</span>
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-red-200 hover:text-red-100"
              >
                <ArrowLeftEndOnRectangleIcon className="w-5 h-5" />
                <span>Logout</span>
              </button>
              <button
                onClick={toggleExpand}
                className="p-1.5 rounded-full hover:bg-white/10"
              >
                <ChevronDownIcon className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
