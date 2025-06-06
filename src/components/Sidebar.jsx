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

  useEffect(() => {
    setActiveItem(location.pathname);
    const storedInfo = JSON.parse(localStorage.getItem("adminInfo"));
    if (storedInfo?.role) {
      setRole(storedInfo.role);
    }
  }, [location.pathname]);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: menu, size: 'w-6 h-6.5' },
    { name: "News & Updates", path: "/news", icon: megaphone, size: 'w-7 h-7' },
    { name: "User Management", path: "/users", icon: user, size: 'w-7 h-6.5' },
    ...(role === "superadmin"
      ? [{ name: "Admin Management", path: "/admin-management", icon: admin, size: 'w-6 h-7' }]
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

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => {
              setActiveItem(item.path);
              setSidebarOpen(false); // Close sidebar on mobile
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

      {/* Logout Button */}
      <div className="mt-60 mb-6">
        <div
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center px-9 py-4 cursor-pointer hover:bg-[#0A7F24]"
        >
          <img src={logout} alt="Logout" className="w-6 h-6 mr-4 opacity-80" />
          <span className="text-lg font-inter">Log Out</span>
        </div>
      </div>
    </div>
  );
}
