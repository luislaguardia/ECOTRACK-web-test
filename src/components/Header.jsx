import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "./../config";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const [adminName, setAdminName] = useState("Admin");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <>
      {/* Sidebar backdrop on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Burger menu on mobile */}
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

      {/* Header */}
      <header
        className={`bg-white shadow-md px-4 py-3 sticky top-0 z-30 transition-all duration-300 ${
          sidebarOpen ? "md:ml-[250px]" : ""
        }`}
      >
        <div className="w-full flex justify-end items-center pr-6">
          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex flex-col sm:flex-row items-center sm:gap-3 text-center cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
              onClick={toggleDropdown}
            >
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg mb-1 sm:mb-0">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-800 font-medium text-sm sm:text-base leading-tight max-w-[200px] truncate">
                {adminName}
              </span>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;