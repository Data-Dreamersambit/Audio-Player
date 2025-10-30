import React from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import SearchInput from "../../features/search/SearchInput";

import AllAudios from "../../features/audio/AllAudios";


const Explore = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-gray-200">
      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="py-6 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <SearchInput />
        </div>
      </motion.div>

    

      {/* Audio Card Grid */}
      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <AllAudios />
        </div>
      </div>

      {/* Route Outlet */}
      <div className="pt-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Explore;