import { Outlet } from "react-router-dom";
import React from "react";

export default function AuthLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <main className="flex-1 flex items-center justify-center">
        <Outlet /> {/* Login / Signup will render here */}
      </main>
    </div>
  );
}