import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Sidebar, Header } from "./components/Export";
import {
  Dashboard,
  News,
  Users,
  Settings,
  Login,
  AdminManagement,
  UserDetails,
} from "./pages/admin-panel/Export";

import CustomerManagement from "./pages/admin-panel/CustomerManagement";

import {
  AboutUs,
  AdminLogInPage,
  HomePage,
  DownloadApp,
  FAQ,
  Features,
  HowItWorks,
} from "./pages/product-landing-page/Export";

import NotFound from "./pages/admin-panel/404NotFound";
import AuditLogs from "./pages/admin-panel/AuditLogs";
import ActivityLogs from "./pages/admin-panel/ActivityLogs"; //

const AdminLayout = ({ children }) => {
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setLogoutLoading(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      setLogoutLoading(false);
      setShowLogoutModal(false);
      window.location.href = "/login";
    }, 1200);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#f1f5f9",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setShowLogoutModal={setShowLogoutModal}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          {children}
        </main>
      </div>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
            <div className="bg-green-700 px-6 py-3 rounded-t-lg">
              <h2 className="text-white font-semibold text-lg">Confirm Logout</h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-gray-800 text-sm mb-6">
                Are you sure you want to log out? Your session will be terminated.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={logoutLoading}
                  className="px-4 py-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2"
                >
                  {logoutLoading && (
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  )}
                  {logoutLoading ? "Logging out..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));
  const role = adminInfo?.role || "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, [location.pathname]);

  if (isAuthenticated === null) return <div>Loading...</div>;

  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/admin" element={<AdminLogInPage />} />
      <Route path="/download-app" element={<DownloadApp />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/features" element={<Features />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route
        path="/login"
        element={<Login setIsAuthenticated={setIsAuthenticated} />}
      />

      {/* Protected Admin Pages */}
      {isAuthenticated ? (
        <>
          <Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/news" element={<AdminLayout><News /></AdminLayout>} />
          
          {/* User Management Routes */}
          <Route path="/users" element={<AdminLayout><Users /></AdminLayout>} />
          <Route path="/users/:id" element={<AdminLayout><UserDetails /></AdminLayout>} />

          {/* Customer Management Route */}
          <Route path="/customers" element={<AdminLayout><CustomerManagement /></AdminLayout>} />

          <Route path="/settings" element={<AdminLayout><Settings /></AdminLayout>} />
          
          {/* Superadmin specific routes */}
          {role === "superadmin" && (
            <>
              <Route path="/admin-management" element={<AdminLayout><AdminManagement /></AdminLayout>} />
              <Route path="/audit-logs" element={<AdminLayout><AuditLogs /></AdminLayout>} />
            </>
          )}


          {/* Admin specific routes */}
          {role === "admin" && (
            <Route path="/activity-logs" element={<AdminLayout><ActivityLogs /></AdminLayout>} />
          )}
        </>
      ) : null}

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;