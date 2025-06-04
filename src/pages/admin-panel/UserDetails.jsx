import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

import { BASE_URL } from "../../config"; // Make sure this points to your actual config file

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user details:", err.response?.data || err.message);
      }
    };

    fetchUser();
  }, [id]);

  if (!user) return <div className="p-4 text-center text-gray-500">Loading user data...</div>;

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <Link
          to="/users"
          className="text-[#0A8F28] hover:underline text-sm font-medium inline-block mb-4"
        >
          ← Back to Users
        </Link>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">User Details</h2>

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
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  user.isVerified
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.isVerified ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Devices</p>
              <p className="text-lg font-semibold text-gray-800">
                {user.devices?.length ? user.devices.join(", ") : "None"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Energy Savings</p>
              <p className="text-lg font-semibold text-gray-800">
                {user.energySavings || 0} kWh
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Date Registered</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
