import { useLogout } from "../hooks/useLogout";
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import {
  HomeIcon,
  UserCircleIcon,
  CogIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowLeftEndOnRectangleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "../components/DashboardLayout";

export default function Dashboard({ children }) {
  const { logout } = useLogout();
  const { user } = useAuth();
  const handleClick = () => {
    logout();
  };
  return (
    <>
      <DashboardLayout></DashboardLayout>
    </>
    /* <>
      <DashboardLayout>
        <h1>Dashboard</h1>
        {user && <span>{user.email}</span>}
        <button onClick={handleClick}>Lougout</button>
      </DashboardLayout>
    </>*/
  );
  /* return (
    <>
      <div className="flex h-screen">
        
        <div
          className={`${
            isSidebarOpen ? "w-64" : "w-20"
          } bg-[#2a2d34] text-white p-4 transition-width duration-300 h-full flex flex-col justify-between`}
        >
          <div>
            <div className="flex justify-between items-center">
              <h2
                className={`${
                  isSidebarOpen ? "block" : "hidden"
                } text-lg font-semibold`}
              >
                Dashboard
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

           
            <ul className="mt-6 space-y-4">
              <li>
                <Link
                  to="/dashboard"
                  className={`${
                    isSidebarOpen ? "text-base" : "text-xs"
                  } block py-2 px-3 rounded hover:bg-indigo-700`}
                >
                  <HomeIcon
                    className={`${
                      isSidebarOpen
                        ? "inline-block mr-3"
                        : "inline-block text-xs"
                    } w-5 h-5`}
                  />
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`${
                    isSidebarOpen ? "text-base" : "text-xs"
                  } block py-2 px-3 rounded hover:bg-indigo-700`}
                >
                  <UserCircleIcon
                    className={`${
                      isSidebarOpen
                        ? "inline-block mr-3"
                        : "inline-block text-xs"
                    } w-5 h-5`}
                  />
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`${
                    isSidebarOpen ? "text-base" : "text-xs"
                  } block py-2 px-3 rounded hover:bg-indigo-700`}
                >
                  <CogIcon
                    className={`${
                      isSidebarOpen
                        ? "inline-block mr-3"
                        : "inline-block text-xs"
                    } w-5 h-5`}
                  />
                </Link>
              </li>
            </ul>
          </div>

         
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

     
        <div className="flex-1 p-6 bg-indingo-100 h-full">{children}</div>
      </div>
    </>
  );*/
}
