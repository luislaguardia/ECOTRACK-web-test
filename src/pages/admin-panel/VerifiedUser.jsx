import React, { useState, useEffect } from "react";
import { FiSearch, FiFile, FiRefreshCw } from "react-icons/fi";
import axios from "axios";
import { BASE_URL } from "../../config";

const VerifiedUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch verified users from the backend
  const fetchVerifiedUsers = async () => {
    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      // Use the existing backend endpoint without isVerified parameter
      const res = await axios.get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          limit: 1000 // Fetch a large number to get all users, then filter on frontend
        },
      });
      
      // Filter for verified users on the frontend
      const allUsers = res.data.users || [];
      const verifiedUsers = allUsers.filter(user => 
        user.verificationStatus === 'auto_verified' || 
        user.verificationStatus === 'manually_verified'
      );
      
      setUsers(verifiedUsers);
    } catch (err) {
      console.error("Error fetching verified users:", err);
      setError(err.response?.data?.message || "Failed to fetch verified users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifiedUsers();
  }, []);

  // Filter users based on the search term
  const filteredUsers = users.filter((user) =>
    [
      user.accountNumber,
      user.name,
      user.username,
      user.barangay,
      user.email,
      user.phone
    ].some(field => 
      field && field.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Get verification status display
  const getVerificationBadge = (user) => {
    if (user.verificationStatus === 'auto_verified') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Auto Verified
        </span>
      );
    } else if (user.verificationStatus === 'manually_verified') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Manual Verified
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-3xl font-semibold text-gray-800">Verified Users</h2>
        
        {/* Refresh Button */}
        <button
          onClick={fetchVerifiedUsers}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative w-full md:w-[400px]">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 pl-8 border border-gray-500 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-inter w-full"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 font-medium">Error: {error}</p>
          <button
            onClick={fetchVerifiedUsers}
            className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading verified users...</p>
          </div>
        </div>
      ) : (
        /* Table */
        <div
          className={`overflow-x-auto bg-white rounded-lg shadow border border-gray-200 ${
            filteredUsers.length > 10 ? "max-h-[600px] overflow-y-auto" : ""
          }`}
        >
          <table className="min-w-full text-sm table-fixed">
            <thead className="bg-[#F5F5F5] border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Account No.</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Name</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Username</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Barangay</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Phone</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Email</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Date Registered</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{user.accountNumber || "-"}</td>
                    <td className="px-6 py-4">{user.name && user.name !== 'null' ? user.name : "-"}</td>
                    <td className="px-6 py-4">{user.username || "-"}</td>
                    <td className="px-6 py-4">{user.barangay && user.barangay !== 'null' ? user.barangay : "-"}</td>
                    <td className="px-6 py-4">{user.phone && user.phone !== 'null' ? user.phone : "-"}</td>
                    <td className="px-6 py-4">{user.email || "-"}</td>
                    <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4">{getVerificationBadge(user)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FiFile className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-400 mb-2">
                        {searchTerm ? "No matching verified users" : "No verified users"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {searchTerm 
                          ? "Try adjusting your search filter"
                          : "There are currently no users with verified status."
                        }
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="mt-3 text-sm text-green-600 hover:text-green-800 underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VerifiedUser;