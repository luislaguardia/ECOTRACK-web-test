import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiSearch, FiTrash2, FiEdit, FiEye, FiArchive } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import barangaysInNasugbu from "../../data/barangays";
import { FaChevronDown } from 'react-icons/fa';


// note: to remove user ID
// may19
import { BASE_URL } from "../../config";

const Users = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  // const [exportingType, setExportingType] = useState(null); // "csv", "pdf", or null
  const [exportingType, setExportingType] = useState(null); // used to show Confirm button loading // here
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newThisMonth: 0,
    inactiveUsers: 0, // renamed
  });

  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    devices: "",
    status: "Active",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [barangays, setBarangays] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState(null); // here
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
    setBarangays(barangaysInNasugbu);
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mappedUsers = res.data.map(user => ({
        ...user,
        name: user.name,
        email: user.email,
        location: user.barangay,
        status: user.isVerified ? "Active" : "Inactive",
      }));
      setUsers(mappedUsers);
      calculateMetrics(mappedUsers);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
    } finally {
      setIsLoading(false); // Stop spinner
    }
  };

  const calculateMetrics = (usersData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    setMetrics({
      totalUsers: usersData.length,
      activeUsers: usersData.filter((user) => user.status === "Active").length,
      newThisMonth: usersData.filter((user) => {
        const userDate = new Date(user.createdAt || user.dateAdded);
        return (
          userDate.getMonth() === currentMonth &&
          userDate.getFullYear() === currentYear
        );
      }).length,
      inactiveUsers: usersData.filter((user) => user.status === "Inactive").length,
    });
  };

  const filteredUsers = users.filter((u) => {
    const searchLower = search.toLowerCase();
    const nameLower = (u.name || "").toLowerCase();
    const emailLower = (u.email || "").toLowerCase();
    const idLower = (u._id || "").toLowerCase();
    const statusLower = (u.status || "").toLowerCase();
    const locationLower = (u.location || "").toLowerCase();

    const matchesSearch =
      nameLower.includes(searchLower) ||
      emailLower.includes(searchLower) ||
      idLower.includes(searchLower) ||
      statusLower.includes(searchLower) ||
      locationLower.includes(searchLower);

    const matchesBarangay = !selectedBarangay || locationLower === selectedBarangay.toLowerCase();

    return matchesSearch && matchesBarangay;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      location: user.location || "",
      devices: user.devices || "",
      status: user.status || "Active",
    });
  };

  const handleUpdate = async () => {
    setIsUpdating(true); // Start spinner
    try {
      const token = localStorage.getItem("token");
      const updateData = {
        name: formData.name,
        email: formData.email,
        barangay: formData.location,
        isVerified: formData.status === "Active",
      };
  
      await axios.put(`${BASE_URL}/api/users/${editingUser}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        location: "",
        devices: "",
        status: "Active",
      });
  
      fetchUsers();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Update failed");
    } finally {
      setIsUpdating(false); // End spinner
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
    setIsDeleting(true); // Start spinner
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${BASE_URL}/api/users/${userToDelete}`, { isArchived: true }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting user:", err.response?.data || err.message);
      alert("Delete failed");
    } finally {
      setIsDeleting(false); // Stop spinner
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.trim().toLowerCase();
    return normalizedStatus === "active" ? "text-green-600" : "text-red-600";
  };

  const exportToCSV = async () => {
    setExportingType("csv");
    try {
      const csvRows = [
        ["UserID", "Name", "Email", "Location", "Status"],
        ...filteredUsers.map((u) => [
          u._id,
          u.name,
          u.email,
          u.location,
          u.status,
        ]),
      ];
      const csvContent = csvRows.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "users.csv";
      link.click();
    } catch (err) {
      console.error("CSV export failed:", err);
    } finally {
      setExportingType(null);
      setShowExportModal(false);
    }
  };
  
  const exportToPDF = async () => {
    setExportingType("pdf");
    try {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [["UserID", "Name", "Email", "Location", "Status"]],
        body: filteredUsers.map((u) => [
          u._id,
          u.name,
          u.email,
          u.location,
          u.status,
        ]),
      });
      doc.save("users.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExportingType(null);
      setShowExportModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <h2 className="text-3xl font-semibold font-inter text-gray-800 mb-5">
        User Management
      </h2>

      {/* Metrics Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
  <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
    <h4 className="text-lg text-gray-500 font-inter mb-2">Total Users</h4>
    <div className="flex justify-between items-center">
      <span className="text-3xl font-semibold text-gray-800 font-inter">{metrics.totalUsers}</span>
    </div>
  </div>

  <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
    <h4 className="text-lg text-gray-500 font-inter mb-2">Total Verified Users</h4>
    <div className="flex justify-between items-center">
      <span className="text-3xl font-semibold text-gray-800 font-inter">{metrics.activeUsers}</span>
    </div>
  </div>

  <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
    <h4 className="text-lg text-gray-500 font-inter mb-2">New This Month</h4>
    <div className="flex justify-between items-center">
      <span className="text-3xl font-semibold text-gray-800 font-inter">{metrics.newThisMonth}</span>
    </div>
  </div>

  <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
    <h4 className="text-lg text-gray-500 font-inter mb-2">Inactive Users</h4>
    <div className="flex justify-between items-center">
      <span className="text-3xl font-semibold text-gray-800 font-inter">{metrics.inactiveUsers}</span>
    </div>
  </div>
</div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      {/* <div className="flex flex-col sm:flex-col md:flex-row justify-between gap-4 mb-6"> */}
        <div className="flex items-center relative">
          <FiSearch className="text-gray-500 absolute left-2 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 pl-8 border border-gray-500 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0A8F28] font-inter w-full md:w-[500px]"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <select
              className="p-2 border bg-white border-gray-300 rounded-md font-inter shadow-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-[#0A8F28]"
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
            >
              <option value="">All Barangays</option>
              {barangays.map(barangay => (
                <option key={barangay} value={barangay}>{barangay}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <FaChevronDown className="text-gray-500 " />
            </div>
          </div>
          {/* <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all font-inter">
            + Add User
          </button> */}
        </div>
      </div>

      {/* Scrollable Table Container */}
      
        {/* Scrollable Table Container */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200 max-h-[370px] overflow-y-auto text-xs sm:text-sm">
            <table className="min-w-full table-auto">
              <thead className="bg-[#F5F5F5] border-b border-gray-200">
                <tr className="text-left align-middle">
                  <th className="px-4 py-3 font-bold text-gray-500">#</th>
                  <th className="px-4 py-3 font-bold text-gray-500">User Name</th>
                  <th className="px-4 py-3 font-bold text-gray-500">Email</th>
                  <th className="px-4 py-3 font-bold text-gray-500">Location</th>
                  <th className="px-4 py-3 font-bold text-gray-500">Status</th>
                  <th className="px-4 py-3 font-bold text-gray-500 text-center align-middle">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50 align-middle">
                    <td className="px-4 py-4">{index + 1}</td>
                    <td className="px-4 py-4 break-words max-w-[150px]">{user.name}</td>
                    <td className="px-4 py-4 break-words max-w-[150px]">{user.email}</td>
                    <td className="px-4 py-4 break-words max-w-[100px]">{user.location || "N/A"}</td>
                    <td className="px-4 py-4">
                      <span className={`font-medium ${getStatusColor(user.status)}`}>
                        {user.status || "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/users/${user._id}`}
                          className="text-blue-800 hover:text-[#0A7F24] p-2 rounded-full flex items-center justify-center"
                          title="View"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleEdit(user)}
                          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 p-2 rounded-full flex items-center justify-center"
                          title="Edit"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openDeleteModal(user._id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full flex items-center justify-center"
                          title="Archive"
                        >
                          <FiArchive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* <div className="flex justify-end mt-4 gap-2"> */}
      <div className="flex flex-col sm:flex-row justify-end mt-4 gap-2">
        <button
          onClick={() => {
            setExportType("csv");
            setShowExportModal(true);
          }}
          className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all font-inter"
          >
          Export CSV
        </button>
        <button
          onClick={() => {
            setExportType("pdf");
            setShowExportModal(true);
          }}
          // className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all font-inter"
          className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all font-inter"

        >
          Export PDF
        </button>
      </div>

      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            {/* Green header */}
            <div className="bg-green-600 rounded-t-lg px-6 py-4">
              <h2 className="text-white text-xl font-semibold">Confirm Export</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <p className="text-gray-800 text-base mb-6">
                Are you sure you want to export the dashboard data as <strong>{exportType?.toUpperCase()}</strong>? The file will be downloaded immediately.
              </p>

              {/* Buttons */}
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

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            {/* Red header */}
            <div className="bg-green-600 rounded-t-lg px-6 py-4">
              <h2 className="text-white text-xl font-semibold">Confirm Delete</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <p className="text-gray-800 text-base mb-6">
                Are you sure you want to delete this user?
              </p>

              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                
                <button
  onClick={confirmDeleteUser}
  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center justify-center gap-2"
  disabled={isDeleting}
>
  {isDeleting ? (
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
      Deleting...
    </>
  ) : (
    "Delete"
  )}
</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">

          <div className="bg-white rounded-lg p-6 w-full max-w-md" style={{ boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)' }}>
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700">Location</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700">Status</label>
                <div className="relative"> 
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-[#0A8F28]" 
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                    <FaChevronDown className="text-gray-500" /> 
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
  onClick={handleUpdate}
  className="bg-green-600 text-white ml-2 px-6 py-2 rounded-md hover:bg-green-700 transition flex items-center justify-center gap-2"
  disabled={isUpdating}
>
  {isUpdating ? (
    <>
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
