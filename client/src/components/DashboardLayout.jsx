import React, { useState } from "react";
import LandingDashboard from "../components/Dashboard/LandingDashboard";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-center flex-grow  bg-indigo">
        {<LandingDashboard /> || children}
      </div>
    </div>
  );
};

export default DashboardLayout;
