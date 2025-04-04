import { useLogout } from "../hooks/useLogout";
import { useAuth } from "../context/authContext";
import React, { useState } from "react";
import {
  HomeIcon,
  UserCircleIcon,
  CogIcon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftEndOnRectangleIcon,
  PresentationChartBarIcon,
  ArchiveBoxArrowDownIcon,
} from "@heroicons/react/24/outline";
import MultiStepForm from "./MultiStepForm";
import UserProfileEditor from "./UserProfile";
import NetworkHistory from "./NetworkHistory";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeComponent, setActiveComponent] = useState(<MultiStepForm />);

  const { logout } = useLogout();
  const { user } = useAuth();

  const handleClick = () => logout();

  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? "w-50" : "w-10"
          } bg-[#2a2d34] text-white transition-width duration-300 h-full flex flex-col justify-between`}
        >
          <div>
            <div className="flex justify-between items-center">
              <h2
                className={`${
                  isSidebarOpen ? "block" : "hidden"
                } text-lg p-4 font-semibold`}
              >
                {user && <span>{user.username}</span>}
              </h2>

              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-white hover:bg-indigo-700 p-2 rounded"
              >
                {isSidebarOpen ? (
                  <XMarkIcon className="w-5 h-5" />
                ) : (
                  <ArrowRightIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Sidebar Menu */}
            <ul className="mt-6 space-y-4">
              {isSidebarOpen && (
                <li>
                  <button
                    o
                    onClick={() => setActiveComponent(<UserProfileEditor />)}
                    className="flex items-center justify-center py-3 mt-6 text-sm font-medium text-white hover:bg-indigo-700 rounded-md w-full"
                  >
                    <UserCircleIcon className="inline-block w-5 h-5" />
                    <span
                      className={`${isSidebarOpen ? "inline" : "hidden"} ml-2`}
                    >
                      Profile
                    </span>
                  </button>
                </li>
              )}
              {isSidebarOpen && (
                <li>
                  <button
                    onClick={() => setActiveComponent(<MultiStepForm />)}
                    className="flex items-center justify-center py-3 mt-6 text-sm font-medium text-white hover:bg-indigo-700 rounded-md w-full"
                  >
                    <PresentationChartBarIcon className="inline-block w-5 h-5" />
                    <span
                      className={`${isSidebarOpen ? "inline" : "hidden"} ml-2`}
                    >
                      Network
                    </span>
                  </button>
                </li>
              )}
              {isSidebarOpen && (
                <li>
                  <button
                    onClick={() => setActiveComponent(<NetworkHistory />)}
                    className="flex items-center justify-center py-3 mt-6 text-sm font-medium text-white hover:bg-indigo-700 rounded-md w-full"
                  >
                    <ArchiveBoxArrowDownIcon className="inline-block w-5 h-5" />
                    <span
                      className={`${isSidebarOpen ? "inline" : "hidden"} ml-2`}
                    >
                      History
                    </span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Logout Button */}
          {isSidebarOpen && (
            <button
              onClick={handleClick}
              className="flex items-center justify-center py-3 mt-6 text-sm font-medium text-white hover:bg-indigo-700 rounded-md w-full"
            >
              <ArrowLeftEndOnRectangleIcon className="w-5 h-5 mr-3" />
              Logout
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-screen w-full bg-indigo">
          {activeComponent || children}
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
