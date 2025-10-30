import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaSearch, FaTimes, FaBars, FaUser } from "react-icons/fa";
import { MdLibraryAdd } from "react-icons/md";
import { motion } from "framer-motion";

const navItems = [
  { to: "/", icon: FaHome, text: "Home" },
  { to: "/explore", icon: FaSearch, text: "Explore" },
  { to: "/library", icon: MdLibraryAdd, text: "Library" },
  { to: "/user-profile", icon: FaUser, text: "Profile" },
];

function NavigatorBar({ isSidebarOpen, setIsSidebarOpen }) {
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Sidebar for PC */}
      <div
        className={`hidden lg:block fixed inset-y-0 left-0 bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 ease-in-out z-50 ${
          isSidebarOpen ? "w-64" : "w-24"
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          <button
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            className="self-end p-2 rounded-full hover:bg-slate-600 transition-all duration-300 focus:ring-2 focus:ring-amber-300 focus:outline-none"
          >
            {isSidebarOpen ? (
              <FaTimes className="text-xl" />
            ) : (
              <FaBars className="text-xl" />
            )}
          </button>

          <nav className="mt-8 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-3 rounded-lg hover:bg-slate-600 hover:text-amber-300 hover:shadow-md transition-all duration-300 group relative focus:ring-2 focus:ring-amber-300 focus:outline-none ${
                      isActive ? "bg-slate-600 text-amber-300 shadow-md" : ""
                    } ${isSidebarOpen ? "justify-start" : "justify-center"}`
                  }
                  aria-current={({ isActive }) =>
                    isActive ? "page" : undefined
                  }
                >
                  <div className="relative">
                    <item.icon className="text-xl lg:text-2xl" />
                    {!isSidebarOpen && (
                      <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-slate-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {item.text}
                      </span>
                    )}
                  </div>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm lg:text-base"
                    >
                      {item.text}
                    </motion.span>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Bottom Navbar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white z-50 shadow-lg border-t border-slate-700">
        <nav className="flex justify-around items-center p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 rounded-lg hover:bg-slate-600 hover:text-amber-300 hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-amber-300 focus:outline-none ${
                  isActive ? "bg-slate-600 text-amber-300 shadow-md" : ""
                }`
              }
              aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            >
              <item.icon className="text-base sm:text-lg" />
              <span className="text-xs sm:text-sm">{item.text}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}

export default NavigatorBar;