import { useLogout } from "../hooks/useLogout";
import { useAuth } from "../context/authContext";
import React, { useState } from "react";
import {
  UserCircleIcon,
  XMarkIcon,
  ArrowLeftEndOnRectangleIcon,
  HomeIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import MultiStepForm from "./MultiStepForm";
import UserProfileEditor from "./UserProfile";
import NetworkHistory from "./NetworkHistory";
import Dashboard from "./Dashboard";

const DashboardLayout = ({ children }) => {
  const [activeComponent, setActiveComponent] = useState(<Dashboard />);
  const [isExpanded, setIsExpanded] = useState(false);
  const { logout } = useLogout();
  const { user } = useAuth();

  const handleLogout = () => logout();
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Dynamic Island 
       <div className="flex justify-center w-full pt-6 pb-4">
        <div
          className={`bg-black text-white rounded-full flex items-center justify-between transition-all duration-300 shadow-lg ${
            isExpanded ? "w-full max-w-3xl py-3 px-6" : "w-64 py-2 px-4"
          }`}
        >
          {/* Collapsed view }
          {!isExpanded && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <UserCircleIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {user && <span>{user.username}</span>}
                </span>
              </div>
              <button
                onClick={toggleExpand}
                className="p-1 rounded-full hover:bg-gray-800"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Expanded view }
          {isExpanded && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="flex items-center mr-6">
                  <UserCircleIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">{user.username}</span>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setActiveComponent(<Dashboard />);
                      toggleExpand();
                    }}
                    className="flex items-center hover:text-blue-400 transition-colors"
                  >
                    <HomeIcon className="w-4 h-4 mr-1" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveComponent(<UserProfileEditor />);
                      toggleExpand();
                    }}
                    className="flex items-center hover:text-blue-400 transition-colors"
                  >
                    <AdjustmentsHorizontalIcon className="w-4 h-4 mr-1" />
                    <span>Parameters</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-400 hover:text-red-300 transition-colors mr-4"
                >
                  <ArrowLeftEndOnRectangleIcon className="w-4 h-4 mr-1" />
                  <span>Logout</span>
                </button>

                <button
                  onClick={toggleExpand}
                  className="p-1 rounded-full hover:bg-gray-800"
                >
                  <ChevronDownIcon className="w-4 h-4 transform rotate-180" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      
      */}

      {/* Main Content */}
      <div className="flex items-center justify-center flex-grow w-full bg-indigo">
        {activeComponent || children}
      </div>
    </div>
  );
};

export default DashboardLayout;
