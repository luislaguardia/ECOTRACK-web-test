import { useEffect, useState } from "react";
import axios from "axios";
import { FiSearch, FiEdit } from "react-icons/fi";
import { BASE_URL } from "../../config";

export default function AdminManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [activeTab, setActiveTab] = useState("active");
  const [adminToToggle, setAdminToToggle] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", email: "" });
  const [editErrors, setEditErrors] = useState({ name: "", email: "" }); // Validation errors for edit form
  const [showConfirmToggle, setShowConfirmToggle] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "" });
  const [newAdminErrors, setNewAdminErrors] = useState({ name: "", email: "" }); // Validation errors for create form
  const [createError, setCreateError] = useState(""); // Specific error for create modal
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    const isInactiveTab = activeTab === "inactive";
    const filteredByStatus = admins.filter((admin) =>
      isInactiveTab ? admin.isArchived : !admin.isArchived
    );
    const searched = filteredByStatus.filter((admin) =>
      `${admin.name} ${admin.email}`.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(searched);
  }, [activeTab, search, admins]);

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Auto-hide create error after 5 seconds
  useEffect(() => {
    if (createError) {
      const timer = setTimeout(() => {
        setCreateError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [createError]);

  // Validation functions
  const validateFullName = (name) => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return "Full name is required";
    }
    
    if (trimmedName.length < 2) {
      return "Full name must be at least 2 characters long";
    }
    
    if (trimmedName.length > 50) {
      return "Full name must be less than 50 characters";
    }
    
    // Check for numbers
    if (/\d/.test(trimmedName)) {
      return "Full name cannot contain numbers";
    }
    
    // Check for special characters (allow only letters, spaces, hyphens, and apostrophes)
    if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
      return "Full name can only contain letters, spaces, hyphens, and apostrophes";
    }
    
    // Check for consecutive spaces
    if (/\s{2,}/.test(trimmedName)) {
      return "Full name cannot contain consecutive spaces";
    }
    
    // Check for leading/trailing spaces (should be handled by trim, but just in case)
    if (name !== trimmedName) {
      return "Full name cannot have leading or trailing spaces";
    }
    
    // Split into words and validate each word
    const words = trimmedName.split(/\s+/).filter(word => word.length > 0);
    
    // Must have at least 2 words (First Name + Last Name)
    if (words.length < 2) {
      return "Please enter both first and last name";
    }
    
    // Each word must be at least 2 characters long
    if (words.some(word => word.length < 2)) {
      return "Each name part must be at least 2 characters long";
    }
    
    // Each word must start with a capital letter (best practice for names)
    if (words.some(word => !/^[A-Z]/.test(word))) {
      return "Each name part should start with a capital letter";
    }
    
    // Check for common invalid patterns
    const invalidPatterns = [
      /^[A-Z]{1}$/, // Single capital letter
      /^[A-Z]{2}$/, // Two capital letters (like "AB")
      /^[A-Za-z]{1,2}$/, // 1-2 letter words
    ];
    
    if (words.some(word => invalidPatterns.some(pattern => pattern.test(word)))) {
      return "Please enter a proper name (minimum 3 characters per name part)";
    }
    
    // Check for repeated characters (like "AAA" or "John John")
    if (words.some(word => /(.)\1{2,}/.test(word))) {
      return "Name contains invalid repeated characters";
    }
    
    // Check for common test/invalid names
    const invalidNames = ['test', 'admin', 'user', 'demo', 'sample', 'example', 'temp', 'temporary'];
    if (words.some(word => invalidNames.includes(word.toLowerCase()))) {
      return "Please enter a real name, not a placeholder";
    }
    
    return "";
  };

  const validateEmail = (email, excludeId = null) => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      return "Email is required";
    }
    
    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return "Please enter a valid email address";
    }
    
    // Check for duplicate emails (exclude current admin if editing)
    const isEmailTaken = admins.some(
      (admin) =>
        admin.email.toLowerCase() === trimmedEmail.toLowerCase() && 
        admin._id !== excludeId
    );
    
    if (isEmailTaken) {
      return "Email is already in use by another admin";
    }
    
    // Check email length
    if (trimmedEmail.length > 100) {
      return "Email must be less than 100 characters";
    }
    
    return "";
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
  };

  const fetchAdmins = async () => {
    if (!token) return showMessage("No token found.", "error");
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data || []);
    } catch (err) {
      console.error(err);
      showMessage("Failed to fetch admins", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (admin) => {
    setEditingId(admin._id);
    setEditValues({ name: admin.name, email: admin.email });
    setEditErrors({ name: "", email: "" }); // Clear any previous errors
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: "", email: "" });
    setEditErrors({ name: "", email: "" }); // Clear any previous errors
  };

const saveEdit = async (id) => {
  const { name, email } = editValues;

  // Validate using the new validation functions
  const nameError = validateFullName(name);
  const emailError = validateEmail(email, id);

  // Set validation errors
  setEditErrors({ name: nameError, email: emailError });

  // If there are validation errors, don't proceed
  if (nameError || emailError) {
    return;
  }

  // Proceed to update
  try {
    await axios.put(`${BASE_URL}/api/auth/admin/${id}`, editValues, {
      headers: { Authorization: `Bearer ${token}` },
    });
    showMessage("Admin updated successfully.", "success");
    await fetchAdmins();
  } catch (err) {
    console.error("Edit error:", err);
    const errorMsg = err.response?.data?.message || "Failed to update admin.";
    showMessage(errorMsg, "error");
  } finally {
    cancelEdit();
  }
};


  const handleToggleStatus = async () => {
    if (!adminToToggle) return;
    setTogglingId(adminToToggle._id);
    try {
      await axios.patch(
        `${BASE_URL}/api/auth/admin/toggle/${adminToToggle._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage(`Admin successfully ${adminToToggle.isArchived ? "restored" : "archived"}.`, "success");
      await fetchAdmins();
    } catch (err) {
      console.error("Toggle error:", err);
      const errorMsg = err.response?.data?.message || "Failed to toggle admin status";
      showMessage(errorMsg, "error");
    } finally {
      setTogglingId(null);
      setAdminToToggle(null);
      setShowConfirmToggle(false);
    }
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setCreateError(""); // Clear previous errors
    
    // Validate using the new validation functions
    const nameError = validateFullName(newAdmin.name);
    const emailError = validateEmail(newAdmin.email);

    // Set validation errors
    setNewAdminErrors({ name: nameError, email: emailError });

    // If there are validation errors, don't proceed
    if (nameError || emailError) {
      setIsAdding(false);
      return;
    }
    
    try {
      await axios.post(`${BASE_URL}/api/auth/admin/create`, newAdmin, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMessage("Admin created successfully and credentials sent via email.", "success");
      setShowModal(false);
      setNewAdmin({ name: "", email: "" });
      setNewAdminErrors({ name: "", email: "" }); // Clear validation errors
      fetchAdmins();
    } catch (err) {
      console.error("Create error:", err);
      const errorMsg = err.response?.data?.message || "Failed to create admin.";
      setCreateError(errorMsg); // Set error specifically for the modal
    } finally {
      setIsAdding(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewAdmin({ name: "", email: "" });
    setNewAdminErrors({ name: "", email: "" }); // Clear validation errors
    setCreateError(""); // Clear errors when closing modal
  };

  // Helper function to format names properly
  const formatName = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Real-time validation handlers
  const handleNewAdminNameChange = (value) => {
    // Auto-format the name as user types
    const formattedValue = formatName(value);
    setNewAdmin({ ...newAdmin, name: formattedValue });
    // Clear error when user starts typing
    if (newAdminErrors.name) {
      setNewAdminErrors({ ...newAdminErrors, name: "" });
    }
  };

  const handleNewAdminEmailChange = (value) => {
    setNewAdmin({ ...newAdmin, email: value });
    // Clear error when user starts typing
    if (newAdminErrors.email) {
      setNewAdminErrors({ ...newAdminErrors, email: "" });
    }
  };

  const handleEditNameChange = (value) => {
    // Auto-format the name as user types
    const formattedValue = formatName(value);
    setEditValues({ ...editValues, name: formattedValue });
    // Clear error when user starts typing
    if (editErrors.name) {
      setEditErrors({ ...editErrors, name: "" });
    }
  };

  const handleEditEmailChange = (value) => {
    setEditValues({ ...editValues, email: value });
    // Clear error when user starts typing
    if (editErrors.email) {
      setEditErrors({ ...editErrors, email: "" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-3xl font-semibold text-gray-800">Admin Management</h2>
      </div>

      {/* Global Message Display */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg border ${
          messageType === "error" 
            ? "bg-red-50 border-red-200 text-red-800" 
            : "bg-green-50 border-green-200 text-green-800"
        }`}>
          <div className="flex justify-between items-center">
            <span>{message}</span>
            <button 
              onClick={() => {setMessage(""); setMessageType("");}}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Search and Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap mb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-wrap">
          {/* Search Input */}
          <div className="relative w-full md:w-[400px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search admins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 pl-8 border border-gray-500 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2  focus:ring-green-500 font-inter w-full"
            />
          </div>

          {/* Tabs: Active / Inactive */}             
          <div className="flex border border-gray-500 rounded-md overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-6 py-2 ${
                activeTab === "active"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab("inactive")}
              className={`px-6 py-2 ${
                activeTab === "inactive"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Right: Add Admin Button */}
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 self-start md:self-auto"
        >
          + Add Admin
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
        </div>
      ) : (
        <div
          className={`overflow-x-auto bg-white rounded-lg shadow border border-gray-200 ${
            filtered.length > 10 ? "max-h-[600px] overflow-y-auto" : ""
          }`}
        >
          <table className="min-w-full text-sm table-fixed">
            <thead className="bg-[#F5F5F5] border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-bold text-gray-500">#</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Username</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Email</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Role</th>
                <th className="px-6 py-3 text-center font-bold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((admin, index) => (        
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">
                    {editingId === admin._id ? (
                      <div>
                        <input
                          value={editValues.name}
                          onChange={(e) => handleEditNameChange(e.target.value)}
                          className={`border px-2 py-1 rounded w-full focus:outline-none focus:ring-2 ${
                            editErrors.name 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-green-500'
                          }`}
                        />
                        {editErrors.name && (
                          <p className="text-red-500 text-xs mt-1">{editErrors.name}</p>
                        )}
                      </div>
                    ) : (
                      admin.name
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === admin._id ? (
                      <div>
                        <input
                          value={editValues.email}
                          onChange={(e) => handleEditEmailChange(e.target.value)}
                          className={`border px-2 py-1 rounded w-full focus:outline-none focus:ring-2 ${
                            editErrors.email 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-green-500'
                          }`}
                        />
                        {editErrors.email && (
                          <p className="text-red-500 text-xs mt-1">{editErrors.email}</p>
                        )}
                      </div>
                    ) : (
                      admin.email
                    )}
                  </td>
                  <td className="px-6 py-4 capitalize">{admin.role}</td>
                  <td className="px-6 py-4 text-center">
                    {admin.role === "superadmin" ? (
                      <div className="text-gray-400 italic">Protected</div>
                    ) : editingId === admin._id ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => saveEdit(admin._id)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                          disabled={editErrors.name || editErrors.email || !editValues.name.trim() || !editValues.email.trim()}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 border text-gray-700 rounded hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => startEdit(admin)}
                          className="bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 p-2"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>

                        {/* Toggle Switch */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!admin.isArchived}
                            onChange={() => {
                              setAdminToToggle(admin);
                              setShowConfirmToggle(true);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:ring-green-500  dark:bg-gray-700 peer-checked:bg-green-600 relative transition-all duration-300"></div>
                          <div className="absolute top-2 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-5" ></div>
                        </label>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmToggle && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-green-600 py-3 px-6 text-white font-semibold rounded-t-lg">
              Confirm {adminToToggle?.isArchived ? "Activation" : "Deactivation"}
            </div>
            <div className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-blue-600">
                    {adminToToggle && adminToToggle.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Are you sure you want to {adminToToggle?.isArchived ? "activate" : "deactivate"} this admin account?
                  </h3>
                  <p className="text-gray-600">
                    <span className="font-medium">{adminToToggle && adminToToggle.name}</span>
                    <span className="text-gray-500"> ({adminToToggle && adminToToggle.email})</span>
                  </p>
                  {/* <p className="text-sm text-gray-500 mt-1">
                    Role: <span className="font-medium capitalize">{adminToToggle && adminToToggle.role}</span>
                  </p> */}
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowConfirmToggle(false)}
                  className="px-6 py-2 border rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2  focus:ring-green-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={togglingId === adminToToggle?._id}
                  className={`px-6 py-2 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 ${
                    adminToToggle?.isArchived 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {togglingId === adminToToggle?._id ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Create Admin</h3>
            
            {/* Error Message in Modal */}
            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{createError}</span>
                  <button 
                    onClick={() => setCreateError("")}
                    className="text-red-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={createAdmin} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    newAdminErrors.name 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-green-500'
                  }`}
                  value={newAdmin.name}
                  onChange={(e) => handleNewAdminNameChange(e.target.value)}
                  required
                  disabled={isAdding}
                />
                {newAdminErrors.name ? (
                  <p className="text-red-500 text-xs mt-1">{newAdminErrors.name}</p>
                ) : (
                  <p className="text-gray-500 text-xs mt-1">Enter first and last name (minimum 3 characters each, proper capitalization)</p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    newAdminErrors.email 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-green-500'
                  }`}
                  value={newAdmin.email}
                  onChange={(e) => handleNewAdminEmailChange(e.target.value)}
                  required
                  disabled={isAdding}
                />
                {newAdminErrors.email ? (
                  <p className="text-red-500 text-xs mt-1">{newAdminErrors.email}</p>
                ) : (
                  <p className="text-gray-500 text-xs mt-1">Enter a valid email address</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2  focus:ring-green-500"
                  disabled={isAdding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md focus:outline-none focus:ring-2  focus:ring-green-500 disabled:opacity-50"
                  disabled={isAdding || newAdminErrors.name || newAdminErrors.email || !newAdmin.name.trim() || !newAdmin.email.trim()}
                >
                  {isAdding ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}