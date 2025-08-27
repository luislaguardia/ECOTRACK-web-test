import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import barangaysInNasugbu from "../../data/barangays";
import { BASE_URL } from "../../config";

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", barangay: "", status: "" });
  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          barangay: res.data.barangay || "",
          status: res.data.isVerified ? "Verified" : "Not Verified",
        });
      } catch (err) {
        console.error("Error fetching user details:", err.response?.data || err.message);
      }
    };
    fetchUser();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.barangay.trim()) newErrors.barangay = "Barangay is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${BASE_URL}/api/users/${id}`, {
        name: formData.name,
        email: formData.email,
        barangay: formData.barangay,
        isVerified: formData.status === "Verified",
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowEditModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return <div className="p-4 text-center text-gray-500">Loading user data...</div>;

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <Link to="/users" className="text-[#0A8F28] hover:underline text-sm font-medium inline-block mb-4">
          ← Back to Users
        </Link>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">User Details</h2>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-yellow-400 text-yellow-900 font-semibold rounded hover:bg-yellow-500 transition"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 font-inter text-[15px] text-gray-700">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
              <p className="text-lg font-semibold text-gray-800">{user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
              <p className="text-lg font-semibold text-gray-800">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
              <p className="text-lg font-semibold text-gray-800">{user.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Barangay</p>
              <p className="text-lg font-semibold text-gray-800">{user.barangay || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${user.isVerified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {user.isVerified ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Devices</p>
              <p className="text-lg font-semibold text-gray-800">{user.devices?.length ? user.devices.join(", ") : "None"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Energy Savings</p>
              <p className="text-lg font-semibold text-gray-800">{user.energySavings || 0} kWh</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Date Registered</p>
              <p className="text-lg font-semibold text-gray-800">{new Date(user.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-gray-700">Barangay</label>
                <select
                  value={formData.barangay}
                  onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                  className={`w-full p-2 border ${errors.barangay ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  <option value="">Select Barangay</option>
                  {barangaysInNasugbu.map((brgy) => (
                    <option key={brgy} value={brgy}>{brgy}</option>
                  ))}
                </select>
                {errors.barangay && <p className="text-red-500 text-sm mt-1">{errors.barangay}</p>}
              </div>
              <div>
                <label className="block text-gray-700">Verification Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Verified">Verified</option>
                  <option value="Not Verified">Not Verified</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 mr-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition flex items-center justify-center gap-2"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;