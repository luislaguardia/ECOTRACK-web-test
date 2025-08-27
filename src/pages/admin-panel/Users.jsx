import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiSearch, FiTrash2, FiEdit, FiEye, FiArchive, FiRotateCw, FiCheck, FiX, FiClock } from 'react-icons/fi';
import barangaysInNasugbu from "../../data/barangays";
import { FaChevronDown } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
// line 708, {showViewModal && (
const Users = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    autoVerified: 0,
    manuallyVerified: 0,
    pendingManual: 0,
    unverified: 0,
    rejected: 0,
    verifiedUsers: 0,
    basicUsers: 0
  });
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    verificationStatus: "unverified",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 20;
  const [barangays, setBarangays] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationAction, setVerificationAction] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [exportingType, setExportingType] = useState(null);
  
  // New states for view modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [batelecAccount, setBatelecAccount] = useState(null);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchUserStatistics();
    setBarangays(barangaysInNasugbu);
  }, [currentPage, search, verificationFilter, userRoleFilter, activeTab]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: currentPage,
        limit: usersPerPage,
      });

      if (search) params.append('search', search);
      if (verificationFilter) params.append('verificationStatus', verificationFilter);
      if (userRoleFilter) params.append('userRole', userRoleFilter);
      
      // Add includeArchived parameter based on active tab
      if (activeTab === "inactive") {
        params.append('includeArchived', 'true');
      }

      const res = await axios.get(`${BASE_URL}/api/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let fetchedUsers = res.data.users || [];
      
      // If we need archived users but the backend doesn't support includeArchived param,
      // we need to fetch all users and filter client-side
      if (activeTab === "inactive" && fetchedUsers.length === 0) {
        // Try fetching all users including archived ones
        const allUsersRes = await axios.get(`${BASE_URL}/api/users?page=1&limit=1000`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchedUsers = allUsersRes.data.users || [];
      }

      setUsers(fetchedUsers);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStatistics = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/users/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatistics(res.data);
    } catch (err) {
      console.error("Error fetching statistics:", err.response?.data || err.message);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setIsLoadingUserDetails(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViewingUser(res.data.user);
      setBatelecAccount(res.data.batelecAccount);
    } catch (err) {
      console.error("Error fetching user details:", err.response?.data || err.message);
    } finally {
      setIsLoadingUserDetails(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesBarangay = !selectedBarangay || 
      (u.barangay && u.barangay.toLowerCase() === selectedBarangay.toLowerCase());

    const matchesTab = 
      (activeTab === "active" && !u.isArchived) ||
      (activeTab === "inactive" && u.isArchived);

    return matchesBarangay && matchesTab;
  });

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleView = async (user) => {
    setShowViewModal(true);
    await fetchUserDetails(user._id);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingUser(null);
    setBatelecAccount(null);
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      location: user.barangay || "",
      verificationStatus: user.verificationStatus || "unverified",
    });
  };

  const handleUpdateVerificationStatus = async (userId, newStatus, notes = "") => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${BASE_URL}/api/users/${userId}/verification-status`, {
        verificationStatus: newStatus,
        adminNotes: notes
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      fetchUsers();
      fetchUserStatistics();
    } catch (err) {
      console.error("Error updating verification status:", err.response?.data || err.message);
      alert("Update failed");
    }
  };

  const handleManualVerification = async (userId, action, notes = "") => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${BASE_URL}/api/users/verify-user/${userId}`, {
        action,
        adminNotes: notes
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      fetchUsers();
      fetchUserStatistics();
    } catch (err) {
      console.error("Error with manual verification:", err.response?.data || err.message);
      alert("Verification action failed");
    }
  };

  const handleResetVerification = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${BASE_URL}/api/users/${userId}/reset-verification`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      fetchUsers();
      fetchUserStatistics();
    } catch (err) {
      console.error("Error resetting verification:", err.response?.data || err.message);
      alert("Reset failed");
    }
  };

  const openDeleteModal = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setShowDeleteModal(false);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${BASE_URL}/api/users/${userToDelete}/toggle-archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      fetchUserStatistics();
      closeDeleteModal();
    } catch (err) {
      console.error("Error archiving/restoring user:", err.response?.data || err.message);
      alert("Operation failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const openVerificationModal = (user, action) => {
    setVerificationAction({ user, action });
    setAdminNotes("");
    setShowVerificationModal(true);
  };

  const closeVerificationModal = () => {
    setVerificationAction(null);
    setAdminNotes("");
    setShowVerificationModal(false);
  };

  const confirmVerificationAction = async () => {
    if (!verificationAction) return;
    
    const { user, action } = verificationAction;
    
    if (action === 'approve' || action === 'reject') {
      await handleManualVerification(user._id, action, adminNotes);
    } else if (action === 'reset') {
      await handleResetVerification(user._id);
    }
    
    closeVerificationModal();
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'auto_verified':
      case 'manually_verified':
        return "text-green-600 bg-green-100";
      case 'pending_manual':
        return "text-yellow-600 bg-yellow-100";
      case 'rejected':
        return "text-red-600 bg-red-100";
      case 'unverified':
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getVerificationStatusText = (status) => {
    switch (status) {
      case 'auto_verified':
        return "Auto Verified";
      case 'manually_verified':
        return "Manually Verified";
      case 'pending_manual':
        return "Pending Review";
      case 'rejected':
        return "Rejected";
      case 'unverified':
      default:
        return "Unverified";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const exportToCSV = () => {
    setExportingType("csv");
    const csvContent = [
      ["Name", "Email", "Barangay", "Verification Status", "User Role", "Account Number", "Created At"],
      ...filteredUsers.map(user => [
        user.name || "",
        user.email || "",
        user.barangay || "",
        getVerificationStatusText(user.verificationStatus),
        user.userRole || "",
        user.accountNumber || "",
        new Date(user.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    setTimeout(() => {
      setExportingType(null);
      setShowExportModal(false);
    }, 1000);
  };

  const exportToPDF = () => {
    setExportingType("pdf");
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("User Management Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableData = filteredUsers.map(user => [
      user.name || "",
      user.email || "",
      user.barangay || "",
      getVerificationStatusText(user.verificationStatus),
      user.userRole || "",
      user.accountNumber || ""
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["Name", "Email", "Barangay", "Status", "Role", "Account #"]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 197, 94] }
    });

    doc.save(`users_report_${new Date().toISOString().split('T')[0]}.pdf`);
    
    setTimeout(() => {
      setExportingType(null);
      setShowExportModal(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <h2 className="text-3xl font-semibold font-inter text-gray-800 mb-5">
        User Management
      </h2>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h4 className="text-sm text-gray-500 font-inter mb-2">Total Users</h4>
          <span className="text-2xl font-semibold text-gray-800 font-inter">{statistics.totalUsers}</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h4 className="text-sm text-gray-500 font-inter mb-2">Auto Verified</h4>
          <span className="text-2xl font-semibold text-green-600 font-inter">{statistics.autoVerified}</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h4 className="text-sm text-gray-500 font-inter mb-2">Manually Verified</h4>
          <span className="text-2xl font-semibold text-blue-600 font-inter">{statistics.manuallyVerified}</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h4 className="text-sm text-gray-500 font-inter mb-2">Pending Review</h4>
          <span className="text-2xl font-semibold text-yellow-600 font-inter">{statistics.pendingManual}</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h4 className="text-sm text-gray-500 font-inter mb-2">Unverified</h4>
          <span className="text-2xl font-semibold text-gray-600 font-inter">{statistics.unverified}</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h4 className="text-sm text-gray-500 font-inter mb-2">Rejected</h4>
          <span className="text-2xl font-semibold text-red-600 font-inter">{statistics.rejected}</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h4 className="text-sm text-gray-500 font-inter mb-2">Verified Role</h4>
          <span className="text-2xl font-semibold text-green-600 font-inter">{statistics.verifiedUsers}</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h4 className="text-sm text-gray-500 font-inter mb-2">Basic Role</h4>
          <span className="text-2xl font-semibold text-blue-600 font-inter">{statistics.basicUsers}</span>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">
          {/* Search Input */}
          <div className="relative w-full md:w-[400px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search users by name, email, username, or account number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-3 pl-10 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-inter w-full"
            />
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setExportType("csv");
                setShowExportModal(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Export CSV
            </button>
            <button
              onClick={() => {
                setExportType("pdf");
                setShowExportModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Active/Inactive Tabs */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-6 py-2 ${
                activeTab === "active"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Active ({statistics.totalUsers})
            </button>
            <div className="border-l border-gray-300"></div>
            <button
              onClick={() => setActiveTab("inactive")}
              className={`px-6 py-2 ${
                activeTab === "inactive"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Archived ({statistics.archivedUsers || 0})
            </button>
          </div>

          {/* Verification Status Filter */}
          <div className="relative min-w-[180px]">
            <select
              className="p-2 border bg-white border-gray-300 rounded-md font-inter shadow-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
            >
              <option value="">All Verification Status</option>
              <option value="auto_verified">Auto Verified</option>
              <option value="manually_verified">Manually Verified</option>
              <option value="pending_manual">Pending Review</option>
              <option value="unverified">Unverified</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <FaChevronDown className="text-gray-500" />
            </div>
          </div>

          {/* User Role Filter */}
          <div className="relative min-w-[140px]">
            <select
              className="p-2 border bg-white border-gray-300 rounded-md font-inter shadow-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="verified">Verified</option>
              <option value="basic">Basic</option>
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <FaChevronDown className="text-gray-500" />
            </div>
          </div>

          {/* Barangay Filter */}
          <div className="relative min-w-[180px]">
            <select
              className="p-2 border bg-white border-gray-300 rounded-md font-inter shadow-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
            >
              <option value="">All Barangays</option>
              {barangays.map(barangay => (
                <option key={barangay} value={barangay}>{barangay}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <FaChevronDown className="text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Users Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-[#F5F5F5] border-b border-gray-200 sticky top-0">
                <tr className="text-left align-middle">
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm">#</th>
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm">Name</th>
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm">Email</th>
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm">Account #</th>
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm">Barangay</th>
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm">Verification</th>
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm">Role</th>
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50 align-middle">
                    <td className="px-4 py-4 text-sm">{((currentPage - 1) * usersPerPage) + index + 1}</td>
                    <td className="px-4 py-4 text-sm font-medium">{user.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-4 text-sm">{user.accountNumber || "N/A"}</td>
                    <td className="px-4 py-4 text-sm">{user.barangay || "N/A"}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVerificationStatusColor(user.verificationStatus)}`}>
                        {getVerificationStatusText(user.verificationStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.userRole === 'verified' ? 'text-green-800 bg-green-100' : 'text-blue-800 bg-blue-100'
                      }`}>
                        {user.userRole || 'basic'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(user)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>

                        {user.verificationStatus === 'pending_manual' && (
                          <>
                            <button
                              onClick={() => openVerificationModal(user, 'approve')}
                              className="text-green-600 hover:text-green-800 p-1 rounded"
                              title="Approve"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openVerificationModal(user, 'reject')}
                              className="text-red-600 hover:text-red-800 p-1 rounded"
                              title="Reject"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {(user.verificationStatus === 'rejected' || user.verificationStatus === 'manually_verified') && (
                          <button
                            onClick={() => openVerificationModal(user, 'reset')}
                            className="text-yellow-600 hover:text-yellow-800 p-1 rounded"
                            title="Reset Verification"
                          >
                            <FiRotateCw className="w-4 h-4" />
                          </button>
                        )}

                        {/* Archive/Restore Toggle */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!user.isArchived}
                            onChange={() => openDeleteModal(user._id)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:bg-green-600 transition-all"></div>
                          <div className="absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-all peer-checked:translate-x-4"></div>
                        </label>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, statistics.totalUsers)} of {statistics.totalUsers} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === pageNum
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View User Details Modal */}
{/* Redesigned View User Details Modal */}
{showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <FiEye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-2xl font-bold">
                      {isLoadingUserDetails ? "Loading User Details..." : viewingUser?.name || "User Profile"}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {viewingUser?.email || "User information and verification status"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeViewModal}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {isLoadingUserDetails ? (
              <div className="flex flex-col justify-center items-center h-[500px] bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
                <p className="text-gray-600 text-lg">Loading user details...</p>
              </div>
            ) : viewingUser ? (
              <div className="max-h-[calc(95vh-120px)] overflow-y-auto">
                {/* Status Banner */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-4 border-b">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        viewingUser.isArchived ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {viewingUser.isArchived ? 'Archived' : 'Active'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Verification:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVerificationStatusColor(viewingUser.verificationStatus)}`}>
                        {getVerificationStatusText(viewingUser.verificationStatus)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Role:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        viewingUser.userRole === 'verified' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {viewingUser.userRole || 'basic'}
                      </span>
                    </div>
                    {viewingUser.canAccessBatelecData && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">BATELEC Access:</span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          Enabled
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-8">
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left Column - Personal Information */}
                    <div className="xl:col-span-1">
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="group">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Full Name</label>
                            <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-lg group-hover:bg-gray-100 transition-colors">
                              {viewingUser.name}
                            </p>
                          </div>
                          
                          <div className="group">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Email Address</label>
                            <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg group-hover:bg-gray-100 transition-colors break-all">
                              {viewingUser.email}
                            </p>
                          </div>
                          
                          <div className="group">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Username</label>
                            <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg group-hover:bg-gray-100 transition-colors">
                              {viewingUser.username || "Not set"}
                            </p>
                          </div>
                          
                          <div className="group">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Phone Number</label>
                            <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg group-hover:bg-gray-100 transition-colors">
                              {viewingUser.phone || "Not provided"}
                            </p>
                          </div>
                          
                          <div className="group">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Barangay</label>
                            <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg group-hover:bg-gray-100 transition-colors">
                              {viewingUser.barangay || "Not provided"}
                            </p>
                          </div>
                          
                          <div className="pt-4 border-t border-gray-200">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Registration Date</label>
                            <div className="flex items-center gap-2 text-gray-900 bg-gray-50 p-3 rounded-lg">
                              <FiClock className="w-4 h-4 text-gray-500" />
                              <span className="text-lg">{formatDate(viewingUser.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Column - Verification Details */}
                    <div className="xl:col-span-1">
                      <div className="space-y-6">
                        {/* Verification Status Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <FiCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Verification Status</h3>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-200">
                              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${getVerificationStatusColor(viewingUser.verificationStatus)}`}>
                                {viewingUser.verificationStatus === 'auto_verified' && <FiCheck className="w-5 h-5" />}
                                {viewingUser.verificationStatus === 'manually_verified' && <FiCheck className="w-5 h-5" />}
                                {viewingUser.verificationStatus === 'pending_manual' && <FiClock className="w-5 h-5" />}
                                {viewingUser.verificationStatus === 'rejected' && <FiX className="w-5 h-5" />}
                                {getVerificationStatusText(viewingUser.verificationStatus)}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Account Verified</p>
                                <p className={`font-semibold ${viewingUser.accountVerified ? 'text-green-600' : 'text-red-600'}`}>
                                  {viewingUser.accountVerified ? 'Yes' : 'No'}
                                </p>
                              </div>
                              <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">BATELEC Access</p>
                                <p className={`font-semibold ${viewingUser.canAccessBatelecData ? 'text-green-600' : 'text-red-600'}`}>
                                  {viewingUser.canAccessBatelecData ? 'Enabled' : 'Disabled'}
                                </p>
                              </div>
                            </div>
                            
                            {viewingUser.accountNumber && (
                              <div className="mt-4">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">BATELEC Account Number</label>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-500">
                                  <p className="text-xl font-mono font-bold text-blue-800">{viewingUser.accountNumber}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Manual Verification Request */}
                        {viewingUser.manualVerificationRequest && viewingUser.manualVerificationRequest.requested && (
                          <div className="bg-white border border-orange-200 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="bg-orange-100 p-2 rounded-lg">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-bold text-gray-900">Manual Verification Request</h3>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                                <p className="text-sm font-medium text-orange-800 mb-2">Request Date</p>
                                <p className="text-orange-900">{formatDate(viewingUser.manualVerificationRequest.requestedAt)}</p>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Reason for Request</label>
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                  <p className="text-gray-800 leading-relaxed">
                                    {viewingUser.manualVerificationRequest.reason || "No reason provided"}
                                  </p>
                                </div>
                              </div>
                              
                              {viewingUser.manualVerificationRequest.adminNotes && (
                                <div>
                                  <label className="text-sm font-medium text-gray-700 mb-2 block">Admin Notes</label>
                                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                    <p className="text-blue-900">{viewingUser.manualVerificationRequest.adminNotes}</p>
                                  </div>
                                </div>
                              )}
                              
                              {viewingUser.manualVerificationRequest.reviewedBy && (
                                <div className="flex items-center justify-between text-sm bg-gray-100 p-3 rounded-lg">
                                  <span className="text-gray-600">Reviewed by:</span>
                                  <span className="font-medium text-gray-900">{viewingUser.manualVerificationRequest.reviewedBy.name}</span>
                                </div>
                              )}
                              
                              {viewingUser.manualVerificationRequest.reviewedAt && (
                                <div className="flex items-center justify-between text-sm bg-gray-100 p-3 rounded-lg">
                                  <span className="text-gray-600">Reviewed at:</span>
                                  <span className="font-medium text-gray-900">{formatDate(viewingUser.manualVerificationRequest.reviewedAt)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - BATELEC Account Information */}
                    <div className="xl:col-span-1">
                      {batelecAccount ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="bg-purple-100 p-2 rounded-lg">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">BATELEC Account</h3>
                          </div>
                          
                          <div className="space-y-6">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border">
                              <div className="grid grid-cols-1 gap-4">
                                <div>
                                  <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1 block">Account Number</label>
                                  <p className="text-xl font-mono font-bold text-purple-900">{batelecAccount.accountNumber}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1 block">Meter Number</label>
                                  <p className="text-xl font-mono font-bold text-purple-900">{batelecAccount.meterNumber}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Customer Name</label>
                              <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">
                                {batelecAccount.customerName}
                              </p>
                            </div>
                            
                            <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
                              <label className="text-sm font-semibold text-blue-700 mb-2 block">Latest Reading</label>
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-xl font-bold text-blue-800">
                                  {batelecAccount.latestReading ? `${batelecAccount.latestReading} kWh` : 'No reading available'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Registration Status</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                batelecAccount.isRegistered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {batelecAccount.isRegistered ? 'Registered' : 'Not Registered'}
                              </span>
                            </div>
                            
                            {batelecAccount.lastUpdated && (
                              <div className="pt-4 border-t border-gray-200">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Last Updated</label>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <FiClock className="w-4 h-4" />
                                  <span>{formatDate(batelecAccount.lastUpdated)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                          <div className="text-center py-12">
                            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No BATELEC Account</h3>
                            <p className="text-gray-500">This user has not linked a BATELEC account yet.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer with Actions */}
                <div className="bg-gray-50 px-8 py-6 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      User ID: <span className="font-mono font-medium">{viewingUser._id}</span>
                    </div>
                    <div className="flex gap-3">
                      {viewingUser.verificationStatus === 'pending_manual' && (
                        <>
                          <button
                            onClick={() => {
                              closeViewModal();
                              openVerificationModal(viewingUser, 'approve');
                            }}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <FiCheck className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              closeViewModal();
                              openVerificationModal(viewingUser, 'reject');
                            }}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <FiX className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={closeViewModal}
                        className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 h-[500px] flex items-center justify-center">
                <div>
                  <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">User Details Unavailable</h3>
                  <p className="text-gray-500">Unable to load user information at this time.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="bg-green-600 rounded-t-lg px-6 py-4">
              <h2 className="text-white text-xl font-semibold">Confirm Export</h2>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-800 text-base mb-6">
                Are you sure you want to export the user data as <strong>{exportType?.toUpperCase()}</strong>?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (exportType === "csv") exportToCSV();
                    else if (exportType === "pdf") exportToPDF();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center justify-center gap-2"
                  disabled={exportingType !== null}
                >
                  {exportingType ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive/Restore Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="bg-green-600 rounded-t-lg px-6 py-4">
              <h2 className="text-white text-xl font-semibold">
                {activeTab === "active" ? "Confirm Archive" : "Confirm Restore"}
              </h2>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-800 text-base mb-6">
                Are you sure you want to {activeTab === "active" ? "archive" : "restore"} this user?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className={`px-4 py-2 text-white rounded-md transition flex items-center justify-center gap-2 ${
                    activeTab === "active"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                      {activeTab === "active" ? "Archiving..." : "Restoring..."}
                    </>
                  ) : (
                    activeTab === "active" ? "Archive" : "Restore"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Action Modal */}
      {showVerificationModal && verificationAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="bg-green-600 rounded-t-lg px-6 py-4">
              <h2 className="text-white text-xl font-semibold">
                {verificationAction.action === 'approve' && 'Approve Verification'}
                {verificationAction.action === 'reject' && 'Reject Verification'}
                {verificationAction.action === 'reset' && 'Reset Verification'}
              </h2>
            </div>
            <div className="px-6 py-6">
              <div className="mb-4">
                <p className="text-gray-800 text-base mb-2">
                  User: <strong>{verificationAction.user.name}</strong>
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  Account: {verificationAction.user.accountNumber || 'N/A'}
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  {verificationAction.action === 'reset' ? 'Reset Reason (Optional)' : 'Admin Notes (Optional)'}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={
                    verificationAction.action === 'approve' ? 'Enter approval notes...' :
                    verificationAction.action === 'reject' ? 'Enter rejection reason...' :
                    'Enter reset reason...'
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeVerificationModal}
                  className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmVerificationAction}
                  className={`px-4 py-2 text-white rounded-md transition flex items-center justify-center gap-2 ${
                    verificationAction.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    verificationAction.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      {verificationAction.action === 'approve' && 'Approve'}
                      {verificationAction.action === 'reject' && 'Reject'}
                      {verificationAction.action === 'reset' && 'Reset'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                {!formData.name && (
                  <p className="text-red-600 text-sm mt-1">Name is required.</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                {!formData.email && (
                  <p className="text-red-600 text-sm mt-1">Email is required.</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700">Barangay</label>
                <div className="relative">
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Barangay</option>
                    {barangays.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                    <FaChevronDown className="text-gray-500" />
                  </div>
                </div>
                {!formData.location && (
                  <p className="text-red-600 text-sm mt-1">Barangay is required.</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700">Verification Status</label>
                <div className="relative">
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.verificationStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, verificationStatus: e.target.value })
                    }
                  >
                    <option value="unverified">Unverified</option>
                    <option value="auto_verified">Auto Verified</option>
                    <option value="manually_verified">Manually Verified</option>
                    <option value="pending_manual">Pending Manual Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                    <FaChevronDown className="text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsUpdating(true);
                  await handleUpdateVerificationStatus(editingUser, formData.verificationStatus, 'Updated via admin panel');
                  setEditingUser(null);
                  setIsUpdating(false);
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition flex items-center justify-center gap-2"
                disabled={isUpdating || !formData.name || !formData.email || !formData.location}
              >
                {isUpdating ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;