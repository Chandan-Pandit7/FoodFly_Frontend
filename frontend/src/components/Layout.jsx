// components/Layout.jsx
import React from "react";
import Navbar from "./Navbar.jsx";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col w-full">
      <Navbar />
      <main className="flex-1 p-6 md:p-8">{children}</main>
      <footer className="mt-auto bg-white dark:bg-gray-800 text-center p-4 shadow-inner">
        <p className="text-gray-600 dark:text-gray-300">
          Made by Chandan <span className="text-red-500">♥</span> &copy;{" "}
          {new Date().getFullYear()} FoodFly. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Layout;
