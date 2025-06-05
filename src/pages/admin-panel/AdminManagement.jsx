// FRONTEND FIX - AdminManagement.jsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FiSearch, FiEdit, FiTrash2, FiArchive } from "react-icons/fi";
// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";
import { BASE_URL } from "../../config";

export default function AdminManagement() {
  const [createErrors, setCreateErrors] = useState({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [savingEditId, setSavingEditId] = useState(null);
  const [archivingId, setArchivingId] = useState(null);
  
  // const [showExportModal, setShowExportModal] = useState(false);
  // const [exportType, setExportType] = useState(null);
  // const [isExporting, setIsExporting] = useState(false);

  const [admins, setAdmins] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", email: "" });
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminIdToDelete, setAdminIdToDelete] = useState(null);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "" });

  const adminTableRef = useRef(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("No token found.");
      return;
    }
  
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = res.data || [];
      setAdmins(data);
      setFiltered(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("Failed to fetch admins");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const results = admins.filter(
      (a) =>
        a.name.toLowerCase().includes(value) ||
        a.email.toLowerCase().includes(value)
    );
    setFiltered(results);
  };

  const deleteAdmin = async () => {
    if (!adminIdToDelete) return;
    const token = localStorage.getItem("token");
    setArchivingId(adminIdToDelete);
    try {
      await axios.delete(`${BASE_URL}/api/auth/admin/${adminIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setAdmins((prev) => prev.filter((a) => a._id !== adminIdToDelete));
      setFiltered((prev) => prev.filter((a) => a._id !== adminIdToDelete));
      setMessage("Admin archived");
    } catch (err) {
      console.error("Archive error:", err);
      setMessage("Failed to archive admin");
    } finally {
      setShowDeleteModal(false);
      setAdminIdToDelete(null);
      setArchivingId(null);
    }
  };

  const startEdit = (admin) => {
    setEditingId(admin._id);
    setEditValues({ name: admin.name, email: admin.email });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: "", email: "" });
  };

  const saveEdit = async (id) => {
    const token = localStorage.getItem("token");
    setSavingEditId(id);
    try {
      await axios.put(`${BASE_URL}/api/auth/admin/${id}`, editValues, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Updated successfully");
      cancelEdit();
      fetchAdmins();
    } catch (err) {
      console.error("Edit error:", err);
      setMessage("Failed to update");
    } finally {
      setSavingEditId(null);
      cancelEdit();
    }
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    
    console.log("🔍 Starting createAdmin function");
    console.log("📝 Form data:", newAdmin);

    // Reset validation errors
    setCreateErrors({ name: "", email: "" });

    const { name, email } = newAdmin;
    let hasError = false;

    // Frontend validation
    if (!name || !name.trim()) {
      console.log("❌ Name validation failed");
      setCreateErrors((prev) => ({ ...prev, name: "Name is required." }));
      hasError = true;
    }

    if (!email || !email.trim()) {
      console.log("❌ Email required validation failed");
      setCreateErrors((prev) => ({ ...prev, email: "Email is required." }));
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        console.log("❌ Email format validation failed");
        setCreateErrors((prev) => ({
          ...prev,
          email: "Invalid email format.",
        }));
        hasError = true;
      }
    }

    if (hasError) {
      console.log("❌ Frontend validation failed, stopping");
      return;
    }

    console.log("✅ Frontend validation passed, sending to backend");

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("❌ No token found");
      setCreateErrors((prev) => ({ ...prev, email: "Authentication required." }));
      return;
    }

    setIsAdding(true);
    
    try {
      console.log("📡 Sending request to backend...");
      console.log("🔗 URL:", `${BASE_URL}/api/auth/admin/create`);
      console.log("📦 Payload:", { name: name.trim(), email: email.trim() });

      const response = await axios.post(
        `${BASE_URL}/api/auth/admin/create`,
        { 
          name: name.trim(), 
          email: email.trim() 
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("✅ Success response:", response.data);
      
      setMessage(response.data.message || "Admin created successfully!");
      setShowModal(false);
      setNewAdmin({ name: "", email: "" });
      setCreateErrors({ name: "", email: "" });
      fetchAdmins();
      
    } catch (err) {
      console.error("❌ Error occurred:", err);
      
      if (err.response) {
        console.log("📡 Error response status:", err.response.status);
        console.log("📡 Error response data:", err.response.data);
        
        const errorMessage = err.response.data?.message || "Failed to create admin.";
        console.log("📝 Error message:", errorMessage);
        
        // More specific error handling
        if (err.response.status === 400) {
          const msg = errorMessage.toLowerCase();
          
          if (msg.includes("already exists") || 
              msg.includes("exist") || 
              msg.includes("duplicate") ||
              msg.includes("email") && (msg.includes("taken") || msg.includes("used"))) {
            console.log("📧 Email already exists error");
            setCreateErrors((prev) => ({ ...prev, email: errorMessage }));
          } else if (msg.includes("invalid") && msg.includes("email")) {
            console.log("📧 Invalid email format error");
            setCreateErrors((prev) => ({ ...prev, email: errorMessage }));
          } else if (msg.includes("name")) {
            console.log("👤 Name related error");
            setCreateErrors((prev) => ({ ...prev, name: errorMessage }));
          } else if (msg.includes("required")) {
            console.log("📝 Required field error");
            if (msg.includes("email")) {
              setCreateErrors((prev) => ({ ...prev, email: errorMessage }));
            } else if (msg.includes("name")) {
              setCreateErrors((prev) => ({ ...prev, name: errorMessage }));
            } else {
              setCreateErrors((prev) => ({ ...prev, email: errorMessage }));
            }
          } else {
            console.log("📧 Default to email field error");
            setCreateErrors((prev) => ({ ...prev, email: errorMessage }));
          }
        } else if (err.response.status === 403) {
          console.log("🚫 Access denied error");
          setCreateErrors((prev) => ({ ...prev, email: "Access denied. Check your permissions." }));
        } else {
          console.log("❓ Other HTTP error");
          setCreateErrors((prev) => ({ ...prev, email: errorMessage }));
        }
      } else if (err.request) {
        console.log("🌐 Network error - no response received");
        setCreateErrors((prev) => ({ 
          ...prev, 
          email: "Network error. Please check your connection." 
        }));
      } else {
        console.log("❓ Unknown error");
        setCreateErrors((prev) => ({ 
          ...prev, 
          email: "Something went wrong. Please try again." 
        }));
      }
    } finally {
      setIsAdding(false);
      console.log("🏁 Request completed");
    }
  };

  // const exportToCSV = async () => {
  //   setIsExporting(true);
  //   try {
  //     const csvRows = [
  //       ["Name", "Email", "Role"],
  //       ...admins.map((a) => [a.name, a.email, a.role]),
  //     ];
  //     const csvContent = csvRows.map((row) => row.join(",")).join("\n");
  //     const blob = new Blob([csvContent], { type: "text/csv" });
  //     const link = document.createElement("a");
  //     link.href = URL.createObjectURL(blob);
  //     link.download = "admins.csv";
  //     link.click();
  //   } catch (err) {
  //     console.error("CSV export failed:", err);
  //     alert("CSV export failed");
  //   } finally {
  //     setIsExporting(false);
  //     setShowExportModal(false);
  //   }
  // };
  
  // const exportToPDF = async () => {
  //   setIsExporting(true);
  //   try {
  //     const doc = new jsPDF();
  //     autoTable(doc, {
  //       head: [["Name", "Email", "Role"]],
  //       body: admins.map((a) => [a.name, a.email, a.role]),
  //     });
  //     doc.save("admins.pdf");
  //   } catch (err) {
  //     console.error("PDF export failed:", err);
  //     alert("PDF export failed");
  //   } finally {
  //     setIsExporting(false);
  //     setShowExportModal(false);
  //   }
  // };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-3xl font-semibold font-inter text-gray-800">
          Admin Management
        </h2>
        <button
          onClick={() => {
            console.log("🔘 Opening create admin modal");
            setShowModal(true);
            setCreateErrors({ name: "", email: "" });
            setNewAdmin({ name: "", email: "" });
            setMessage("");
          }}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all font-inter"
        >
          + Add Admin
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full md:w-[500px] mb-4">
          <FiSearch className="text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"   
            placeholder="Search admins..."
            value={search}
            onChange={handleSearch}
            className="p-2 pl-10 border border-gray-500 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0A8F28] font-inter w-full"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
        </div>
      ) : (
        <div
          ref={adminTableRef}
          className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200 max-h-[490px] overflow-y-auto"
        >
          <table className="min-w-full text-sm table-fixed">
            <thead className="bg-[#F5F5F5] border-b border-gray-200 font-inter">
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
                  <td className="px-6 py-4 font-inter text-gray-700">{index + 1}</td>
                  <td className="px-6 py-4 font-inter">
                    {editingId === admin._id ? (
                      <input
                        value={editValues.name}
                        onChange={(e) =>
                          setEditValues({ ...editValues, name: e.target.value })
                        }
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      admin.name
                    )}
                  </td>
                  <td className="px-6 py-4 font-inter">
                    {editingId === admin._id ? (
                      <input
                        value={editValues.email}
                        onChange={(e) =>
                          setEditValues({ ...editValues, email: e.target.value })
                        }
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      admin.email
                    )}
                  </td>
                  <td className="px-6 py-4 capitalize font-inter">{admin.role}</td>
                  <td className="px-6 py-4 font-inter text-center">
                    {admin.role === "superadmin" ? (
                      <div className="text-gray-400 italic">Protected</div>
                    ) : editingId === admin._id ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => saveEdit(admin._id)}
                          disabled={savingEditId === admin._id}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                          {savingEditId === admin._id ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                              Saving...
                            </>
                          ) : (
                            "Save"
                          )}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md"
                          disabled={savingEditId === admin._id}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => startEdit(admin)}
                          className="bg-yellow-100 text-yellow-800 p-2 rounded-md hover:bg-yellow-200"
                          title="Edit"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          title="Archive Admin"
                          className="text-red-500 hover:text-red-700 p-2"
                          onClick={() => {
                            setAdminIdToDelete(admin._id);
                            setShowDeleteModal(true);
                          }}
                        >
                          <FiArchive className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm flex items-center justify-center z-50 transition duration-300 ease-in-out">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-[#0A8F28] rounded-t-lg py-3 px-6">
              <h3 className="text-lg font-semibold text-white">Confirm Archive</h3>              
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to archive this admin? They will no longer appear in the list.
              </p>
            </div>
            <div className="flex justify-end gap-4 mb-6 mr-5">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAdminIdToDelete(null);
                }}
                className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteAdmin}
                disabled={archivingId === adminIdToDelete}
                className={`px-6 py-2 rounded-md text-white transition-colors flex items-center justify-center ${
                  archivingId === adminIdToDelete
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {archivingId === adminIdToDelete ? (
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                ) : (
                  "Archive"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm flex items-center justify-center z-50 transition duration-300 ease-in-out">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Create Admin</h3>
            <form onSubmit={createAdmin} className="space-y-4">
              
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    createErrors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  value={newAdmin.name}
                  onChange={(e) => {
                    setNewAdmin({ ...newAdmin, name: e.target.value });
                    // Clear error when user starts typing
                    if (createErrors.name) {
                      setCreateErrors(prev => ({ ...prev, name: "" }));
                    }
                  }}
                />
                {createErrors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="mr-1"></span>
                    {createErrors.name}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    createErrors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  value={newAdmin.email}
                  onChange={(e) => {
                    setNewAdmin({ ...newAdmin, email: e.target.value });
                    // Clear error when user starts typing
                    if (createErrors.email) {
                      setCreateErrors(prev => ({ ...prev, email: "" }));
                    }
                  }}
                />
                {createErrors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="mr-1"></span>
                    {createErrors.email}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    console.log("Closing create admin modal");
                    setShowModal(false);
                    setNewAdmin({ name: "", email: "" });
                    setCreateErrors({ name: "", email: "" });
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                  disabled={isAdding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <>
                      <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    "Create Admin"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
