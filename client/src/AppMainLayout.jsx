// src/layout/MainLayout.jsx
import React, { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";

import Header from "./components/Header";
import NavigatorBar from "./components/NavigatorBar";

export default function MainLayout() {
  // local sidebar state (no props needed)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // memoised toggle to avoid useless re-renders
  const toggleSidebar = useCallback(
    () => setIsSidebarOpen((prev) => !prev),
    []
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <Header toggleSidebar={toggleSidebar} />

      {/* Body */}
      <div className="flex flex-1 pl-6 pb-10">
        {/* Sidebar (width handled inside <NavigatorBar/>) */}
        <NavigatorBar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Main area shifts with margin exactly like your old code */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "ml-0 lg:ml-64" : "ml-0 lg:ml-20"
          }`}
        >
          {/* Child routes render here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}