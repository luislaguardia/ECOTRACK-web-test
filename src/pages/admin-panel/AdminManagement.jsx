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
  const [activeTab, setActiveTab] = useState("active");
  const [adminToToggle, setAdminToToggle] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", email: "" });
  const [showConfirmToggle, setShowConfirmToggle] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "" });
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

  const fetchAdmins = async () => {
    if (!token) return setMessage("No token found.");
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data || []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch admins");
    } finally {
      setIsLoading(false);
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
    try {
      await axios.put(`${BASE_URL}/api/auth/admin/${id}`, editValues, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Admin updated successfully.");
      await fetchAdmins();
    } catch (err) {
      console.error("Edit error:", err);
      setMessage("Failed to update admin.");
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
      setMessage(`Admin successfully ${adminToToggle.isArchived ? "restored" : "archived"}.`);
      await fetchAdmins();
    } catch (err) {
      console.error("Toggle error:", err);
      setMessage("Failed to toggle admin status");
    } finally {
      setTogglingId(null);
      setAdminToToggle(null);
      setShowConfirmToggle(false);
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

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-3xl font-semibold text-gray-800">Admin Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          + Add Admin
        </button>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="relative w-full md:w-[400px]">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search admins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 pl-10 border border-gray-300 bg-white rounded-md shadow-sm w-full"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded ${
              activeTab === "active"
                ? "bg-green-600 text-white"
                : "bg-white border border-gray-300 text-gray-700"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("inactive")}
            className={`px-4 py-2 rounded ${
              activeTab === "inactive"
                ? "bg-green-600 text-white"
                : "bg-white border border-gray-300 text-gray-700"
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
        </div>
      ) : (
        
<div
  className={`overflow-x-auto bg-white rounded-lg shadow border ${
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
      {filtered.slice(0, 10).map((admin, index) => (
        <tr key={admin._id} className="hover:bg-gray-50">
          <td className="px-6 py-4">{index + 1}</td>
          <td className="px-6 py-4">
            {editingId === admin._id ? (
              <input
                value={editValues.name}
                onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                className="border px-2 py-1 rounded w-full"
              />
            ) : (
              admin.name
            )}
          </td>
          <td className="px-6 py-4">
            {editingId === admin._id ? (
              <input
                value={editValues.email}
                onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                className="border px-2 py-1 rounded w-full"
              />
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
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
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
                  className="bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                >
                  <FiEdit className="w-4 h-4" />
                </button>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!admin.isArchived}
                    onChange={() => {
                      setAdminToToggle(admin);
                      setShowConfirmToggle(true);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:bg-green-500 relative transition-all duration-300">
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5" />
                  </div>
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
              Confirm {adminToToggle?.isArchived ? "Restore" : "Archive"}
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to {adminToToggle?.isArchived ? "restore" : "archive"} this admin?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirmToggle(false)}
                  className="px-6 py-2 border rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={togglingId === adminToToggle?._id}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  disabled={isAdding}
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