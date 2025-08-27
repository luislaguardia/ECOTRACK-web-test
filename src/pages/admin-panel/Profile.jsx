import React, { useEffect, useState } from "react";
import axios from "axios";

import { BASE_URL } from "../../config"; // adjust the path as needed

export default function Profile() {
  const [admin, setAdmin] = useState({ name: "", email: "", role: "", branch: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [roleOptions, setRoleOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(res.data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    const fetchRoleOptions = async () => {
      try {
        const rolesRes = await axios.get(`${BASE_URL}/api/roles`, {
          headers: { Authorization: `Bearer ${token}` }, // Include token if required
        });
        setRoleOptions(rolesRes.data);
      } catch (error) {
        console.error("Failed to load roles:", error);
      }
    };

    const fetchBranchOptions = async () => {
      try {
        const branchesRes = await axios.get(`${BASE_URL}/api/branches`, {
          headers: { Authorization: `Bearer ${token}` }, // Include token if required
        });
        setBranchOptions(branchesRes.data);
      } catch (error) {
        console.error("Failed to load branches:", error);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchRoleOptions(), fetchBranchOptions()]);
      setLoading(false);
    };

    fetchData();
  }, [token]);

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${BASE_URL}/api/auth/admin/profile`,
        { name: admin.name, email: admin.email, role: admin.role, branch: admin.branch }, // Include role and branch in the update
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("✅ Profile updated successfully.");
    } catch (err) {
      setMessage("❌ Error updating profile.");
      console.error("Update error:", err);
    }
  };

  if (loading) return <p className="p-6">Loading profile information...</p>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Update Profile</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={admin.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={admin.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>

        {/* Role Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            name="role"
            value={admin.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="" disabled>Select Role</option>
            {roleOptions.map((role) => (
              <option key={role.id} value={role.name}>{role.name}</option>
            ))}
          </select>
        </div>

        {/* Branch Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
          <select
            name="branch"
            value={admin.branch}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="" disabled>Select Branch</option>
            {branchOptions.map((branch) => (
              <option key={branch.id} value={branch.name}>{branch.name}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition"
        >
          Save Changes
        </button>
        {message && <p className="text-sm mt-2 text-gray-700">{message}</p>}
      </form>
    </div>
  );
}