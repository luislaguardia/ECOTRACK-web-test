import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FiSearch, FiEdit, FiTrash2, FiArchive } from "react-icons/fi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { BASE_URL } from "../../config";

export default function AdminManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [savingEditId, setSavingEditId] = useState(null);
  const [archivingId, setArchivingId] = useState(null);
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState(null); // "csv" or "pdf"
  const [isExporting, setIsExporting] = useState(false);

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
  const token = localStorage.getItem("token");

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
    setSavingEditId(id); // start spinner
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
      setSavingEditId(null); // stop spinner
      cancelEdit();
    }
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/admin/create`, newAdmin, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Admin created.");
      setShowModal(false);
      setNewAdmin({ name: "", email: "" });
      fetchAdmins();
    } catch (err) {
      console.error("Create error:", err);
      setMessage("Failed to create admin.");
    } finally {
      setIsAdding(false);
    }
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const csvRows = [
        ["Name", "Email", "Role"],
        ...admins.map((a) => [a.name, a.email, a.role]),
      ];
      const csvContent = csvRows.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "admins.csv";
      link.click();
    } catch (err) {
      console.error("CSV export failed:", err);
      alert("CSV export failed");
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };
  
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [["Name", "Email", "Role"]],
        body: admins.map((a) => [a.name, a.email, a.role]),
      });
      doc.save("admins.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed");
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-3xl font-semibold font-inter text-gray-800">
          Admin Management
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all font-inter"
        >
          + Add Admin
        </button>
      </div>

      {message && <p className="text-green-600 mb-4">{message}</p>}

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
        {/* <div className="flex gap-2 ml-4">
          <button
            onClick={exportAdminsToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={exportAdminsToPDF}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Export PDF
          </button>
        </div> */}
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
                    className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => startEdit(admin)}
                    className="bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                    title="Edit"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
  title="Archive Admin"
  className="text-red-500 hover:text-red-700"
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


{/* mew */}


{/* <div className="flex justify-end mt-4 gap-2">
    <button
      onClick={() => {
        setExportType("csv");
        setShowExportModal(true);
      }}
      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
    >
      Export CSV
    </button>

    <button
      onClick={() => {
        setExportType("pdf");
        setShowExportModal(true);
      }}
      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
    >
      Export PDF
    </button>
</div> */}

{showExportModal && (
  <div className="fixed inset-0 bg-blur backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
      <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">Confirm Export</h2>
      </div>
      <div className="px-6 py-6">
        <p className="mb-6 text-gray-700">
          Are you sure you want to export the admin data as{" "}
          <strong>{exportType?.toUpperCase()}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowExportModal(false)}
            className="px-4 py-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              exportType === "csv" ? exportToCSV() : exportToPDF()
            }
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center justify-center gap-2"
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
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
{/* mew */}
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
        <input
          type="text"
          placeholder="Full Name"
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          value={newAdmin.name}
          onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          value={newAdmin.email}
          onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
          required
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md"
            disabled={isAdding}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center"
            disabled={isAdding}
          >
            {isAdding ? (
              <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
            ) : (
              "Create"
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