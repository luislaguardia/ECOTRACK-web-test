import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./../config";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const fetchAdminProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${BASE_URL}/api/auth/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data?.name) {
          setAdminName(res.data.name);
        }
      } catch (err) {
        console.error("Error fetching admin profile:", err);
      }
    };

    fetchAdminProfile();
  }, []);

  return (
    <>
      {/* Sidebar backdrop on mobile */}
      {sidebarOpen && (
        <div
        className="fixed inset-0 backdrop-blur-sm z-40 md:hidden"
        onClick={() => setSidebarOpen(false)}
        ></div>
      )}
  
      {/* Burger button - visible only when sidebar is closed on mobile */}
      {!sidebarOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
          onClick={() => setSidebarOpen(true)}
        >
          <svg
            className="w-6 h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}
  
      {/* Header content */}
      <header
        className={`bg-white shadow-md p-4 sticky top-0 z-30 transition-all duration-300 ${
          sidebarOpen ? "md:ml-[250px]" : ""
        }`}
      >
        <div className="max-w-screen-xl mx-auto flex justify-end items-center pr-6">
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium truncate max-w-[180px] text-right">
              {adminName}
            </span>
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
              {adminName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;