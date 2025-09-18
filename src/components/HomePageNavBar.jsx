import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../styles/fonts.css";

const HomePageNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="w-full border border-gray-200 font-proxima">
      {/* Customer/Admin Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            className={`px-4 lg:px-8 py-3 lg:py-4 ${
              !isAdmin ? "text-black" : "text-gray-400"
            } font-bold text-sm lg:text-base`}
            onClick={() => navigate("/")}
          >
            For Customers
          </button>
          
          <button
            className={`px-4 lg:px-8 py-3 lg:py-4 ${
              isAdmin ? "text-black" : "text-gray-400"
            } font-bold border-l border-gray-200 text-sm lg:text-base`}
            onClick={() => navigate("/login")}
          >
            For Admins
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="p-4 flex items-center justify-between min-h-[60px] lg:min-h-[80px]">
  {/* Logo */}
  <div className="flex items-center">
  <Link to="/">
    <img
      src="/images/ecotracklogofinal.png"
      alt="EcoTrack Logo"
      className="h-8 w-auto lg:h-10"
      onClick={() => navigate("/")}
    />
  </Link>
  </div>

        {/* Desktop Navigation Links - hidden on mobile/tablet and /admin */}
        {!isAdmin && (
          <div className="hidden lg:flex lg:flex-row lg:space-x-8">
            <Link
              to="/features"
              className={`font-bold font-proxima text-lg ${
                location.pathname === "/features"
                  ? "text-[#119718]"
                  : "text-gray-900"
              }`}
            >
              Features
            </Link>
            <Link
              to="/how-it-works"
              className={`font-bold font-proxima text-lg ${
                location.pathname === "/how-it-works"
                  ? "text-[#119718]"
                  : "text-gray-900"
              }`}
            >
              How It Works
            </Link>
            <Link
              to="/about"
              className={`font-bold font-proxima text-lg ${
                location.pathname === "/about"
                  ? "text-[#119718]"
                  : "text-gray-900"
              }`}
            >
              About Us
            </Link>
            <Link
              to="/faq"
              className={`font-bold font-proxima text-lg ${
                location.pathname === "/faq"
                  ? "text-[#119718]"
                  : "text-gray-900"
              }`}
            >
              FAQs
            </Link>
          </div>
        )}

        {/* Download Button - desktop only */}
        {!isAdmin && (
          <div className="hidden lg:block">
            <button
              className="bg-[#119718] hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition"
              onClick={() => navigate("/download-app")}
            >
              Download App
            </button>
          </div>
        )}

        {/* Mobile/Tablet Menu Button - only show on non-admin pages */}
        {!isAdmin && (
          <button
            className="lg:hidden text-gray-900"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="w-6 h-6 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: mobileMenuOpen ? 'rotate(90deg)' : 'rotate(0)' }}
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        )}
      </nav>

      {/* Mobile/Tablet Menu - with animation */}
      {!isAdmin && (
        <div 
          className={`lg:hidden border-t border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col py-2">
            <Link
              to="/features"
              className={`py-3 px-4 ${
                location.pathname === "/features"
                  ? "text-[#119718]"
                  : "text-gray-900"
              } font-bold text-lg border-b border-gray-100`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/how-it-works"
              className={`py-3 px-4 ${
                location.pathname === "/how-it-works"
                  ? "text-[#119718]"
                  : "text-gray-900"
              } font-bold text-lg border-b border-gray-100`}
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="/about"
              className={`py-3 px-4 ${
                location.pathname === "/about"
                  ? "text-[#119718]"
                  : "text-gray-900"
              } font-bold text-lg border-b border-gray-100`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/faq"
              className={`py-3 px-4 ${
                location.pathname === "/faq"
                  ? "text-[#119718]"
                  : "text-gray-900"
              } font-bold text-lg border-b border-gray-100`}
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQs
            </Link>
            <div className="p-4">
              <button
                className="bg-[#119718] hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition w-full"
                onClick={() => {
                  navigate("/download-app");
                  setMobileMenuOpen(false);
                }}
              >
                Download App
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePageNavBar;