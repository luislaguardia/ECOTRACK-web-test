import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ecotrackLogo from '../assets/ecotracklogo.png';
import logout from '../assets/SidebarLogo/logout.png';
import admin from '../assets/SidebarLogo/admin.png';
import user from '../assets/SidebarLogo/user.png';
import megaphone from '../assets/SidebarLogo/megaphone.png';
import menu from '../assets/SidebarLogo/menu.png';
import setting from '../assets/SidebarLogo/setting.png';

export default function Sidebar({ sidebarOpen, setSidebarOpen, setShowLogoutModal }) {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [role, setRole] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false); // State for user submenu toggle

  useEffect(() => {
    setActiveItem(location.pathname);
    const storedInfo = JSON.parse(localStorage.getItem("adminInfo"));
    if (storedInfo?.role) {
      setRole(storedInfo.role);
    }

    // Auto-expand submenu if already inside a user route
    if (location.pathname.includes("/users")) {
      setUserMenuOpen(true);
    }
  }, [location.pathname]);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: menu, size: 'w-6 h-6.5' },
    { name: "News & Updates", path: "/news", icon: megaphone, size: 'w-7 h-7' },
    { name: "Customer Management", path: "/customers", icon: user, size: 'w-7 h-6.5' }, // ✅ Added Customer Management
    ...(role === "superadmin"
      ? [
          { name: "Admin Management", path: "/admin-management", icon: admin, size: 'w-6 h-7' },
          { name: "Audit Logs", path: "/audit-logs", icon: setting, size: 'w-6 h-6.4' },
        ]
      : []),
    { name: "Account Settings", path: "/settings", icon: setting, size: 'w-6 h-6.4' },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-screen z-50 bg-[#0A8F28] text-white w-72 transition-transform duration-300 ease-in-out
        flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block`}
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <img
          src={ecotrackLogo}
          alt="EcoTrack Logo"
          className="h-12 w-auto object-contain"
        />
      </div>

      {/* Menu Items - Now with flex-1 and overflow for proper spacing */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="flex-1">
          {/* First two menu items (Dashboard, News & Updates) */}
          {menuItems.slice(0, 2).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                setActiveItem(item.path);
                setSidebarOpen(false);
              }}
              className={`flex items-center px-9 py-5 cursor-pointer ${
                activeItem === item.path ? "bg-[#0A7F24]" : "hover:bg-[#0A7F24]"
              }`}
            >
              <img
                src={item.icon}
                alt={`${item.name} Icon`}
                className={`${item.size} mr-4 transition-transform duration-200 ${
                  activeItem === item.path ? "scale-110" : "opacity-80"
                }`}
              />
              <span className="text-lg font-inter font-light">{item.name}</span>
            </Link>
          ))}

          {/* Customer Management (third item) */}
          <Link
            to="/customers"
            onClick={() => {
              setActiveItem("/customers");
              setSidebarOpen(false);
            }}
            className={`flex items-center px-9 py-5 cursor-pointer ${
              activeItem === "/customers" ? "bg-[#0A7F24]" : "hover:bg-[#0A7F24]"
            }`}
          >
            <img
              src={user}
              alt="Customer Management Icon"
              className={`w-7 h-6.5 mr-4 transition-transform duration-200 ${
                activeItem === "/customers" ? "scale-110" : "opacity-80"
              }`}
            />
            <span className="text-lg font-inter font-light">Customer Management</span>
          </Link>

          {/* User Management with Submenu */}
          <Link
            to="/users"
            onClick={() => {
              setActiveItem("/users");
              setSidebarOpen(false);
              setUserMenuOpen(!userMenuOpen); // still toggle submenu
            }}
            className={`flex items-center px-9 py-5 cursor-pointer ${
              activeItem === "/users" || activeItem.includes("/users/")
                ? "bg-[#0A7F24]"
                : "hover:bg-[#0A7F24]"
            }`}
          >
            <img
              src={user}
              alt="User Management Icon"
              className={`w-7 h-6.5 mr-4 transition-transform duration-200 ${
                activeItem === "/users" || activeItem.includes("/users/")
                  ? "scale-110"
                  : "opacity-80"
              }`}
            />
            <span className="text-lg font-inter font-light">User Management</span>
          </Link>

          {/* {userMenuOpen && (
            <div className="bg-[#0A7F24]">
              <Link
                to="/users/verified"
                onClick={() => {
                  setActiveItem("/users/verified");
                  setSidebarOpen(false);
                }}
                className={`block pl-20 py-3 text-sm ${
                  activeItem === "/users/verified" ? "bg-[#08691B]" : "hover:bg-[#08691B]"
                }`}
              >
                Verified Users
              </Link>
              <Link
                to="/users/non-verified"
                onClick={() => {
                  setActiveItem("/users/non-verified");
                  setSidebarOpen(false);
                }}
                className={`block pl-20 py-3 text-sm ${
                  activeItem === "/users/non-verified" ? "bg-[#08691B]" : "hover:bg-[#08691B]"
                }`}
              >
                Non-Verified Users
              </Link>
            </div>
          )} */}

          {/* Remaining Menu Items (skip Customer Management since we already added it) */}
          {menuItems.slice(3).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                setActiveItem(item.path);
                setSidebarOpen(false);
              }}
              className={`flex items-center px-9 py-5 cursor-pointer ${
                activeItem === item.path ? "bg-[#0A7F24]" : "hover:bg-[#0A7F24]"
              }`}
            >
              <img
                src={item.icon}
                alt={`${item.name} Icon`}
                className={`${item.size} mr-4 transition-transform duration-200 ${
                  activeItem === item.path ? "scale-110" : "opacity-80"
                }`}
              />
              <span className="text-lg font-inter font-light">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Logout Button - Now properly positioned at bottom */}
        <div className="border-t border-[#0A7F24] mt-auto">
          <div
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center px-9 py-4 cursor-pointer hover:bg-[#0A7F24]"
          >
            <img src={logout} alt="Logout" className="w-6 h-6 mr-4 opacity-80" />
            <span className="text-lg font-inter">Log Out</span>
          </div>
        </div>
      </div>
    </div>
  );
}