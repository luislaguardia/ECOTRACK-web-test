import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config";

export default function Settings() {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [tab, setTab] = useState("profile");
  const [admin, setAdmin] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", isError: false });
  const [passwordMessage, setPasswordMessage] = useState({ text: "", isError: false });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const token = localStorage.getItem("token");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState(""); // 'profile' or 'password'

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(res.data);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setMessage({ text: "Failed to load profile.", isError: true });
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfile();
  }, [token]);

  const handleProfileChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const triggerConfirmation = (type) => {
    setConfirmType(type);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    setConfirmLoading(true);
    try {
      if (confirmType === "profile") {
        await submitProfile();
      } else if (confirmType === "password") {
        await submitPassword();
      }
    } finally {
      setConfirmLoading(false);
      setShowConfirmModal(false);
      setConfirmType("");
    }
  };

  const submitProfile = async () => {
    try {
      await axios.put(
        `${BASE_URL}/api/auth/admin/profile`,
        { name: admin.name, email: admin.email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({ text: "Profile updated successfully.", isError: false });
    } catch (err) {
      console.error("Update error:", err);
      setMessage({ text: "Error updating profile.", isError: true });
    }
  };

  const submitPassword = async () => {
    setPasswordMessage({ text: "", isError: false });

    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ text: "All fields are required.", isError: true });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "New passwords do not match.", isError: true });
      return;
    }

    try {
      const res = await axios.put(
        `${BASE_URL}/api/auth/admin/change-password`,
        {
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
          confirmPassword: confirmPassword.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPasswordMessage({
        text: res.data.message || "Password changed successfully.",
        isError: false,
      });

      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to change password.";
      setPasswordMessage({ text: errorMsg, isError: true });
      console.error("Change password error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-4 py-6">
  <div className="w-full flex justify-center">
    <div className="w-full max-w-4xl">
      <h2 className="text-3xl font-semibold font-inter text-gray-800 mb-7">Account Settings</h2>

      <div className="flex border mb-6 w-full">
        {["profile", "security"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 font-semibold text-sm ${
              tab === t ? "bg-green-600 text-white" : "bg-white text-gray-700"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
    </div>
  </div>

{tab === "profile" && (
  <div className="w-full flex justify-center">
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full mb-10">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Update Profile</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          triggerConfirmation("profile");
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={admin.name}
            onChange={handleProfileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={admin.email}
            onChange={handleProfileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <input
            type="text"
            disabled
            value={admin.role === "superadmin" ? "Super Administrator" : "Administrator"}
            className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
        >
          Save Changes
        </button>
        {message.text && (
          <p className={`text-sm mt-2 ${message.isError ? "text-red-600" : "text-green-600"}`}>
            {message.text}
          </p>
        )}
      </form>
    </div>
  </div>
)}

{tab === "security" && (
  <div className="w-full flex justify-center">
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Change Password</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          triggerConfirmation("password");
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-600"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
        >
          Update Password
        </button>
        {passwordMessage.text && (
          <p className={`text-sm mt-2 ${passwordMessage.isError ? "text-red-600" : "text-green-600"}`}>
            {passwordMessage.text}
          </p>
        )}
      </form>
    </div>
  </div>
)}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-semibold">Confirm {confirmType === "profile" ? "Update Profile" : "Change Password"}</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-gray-800 mb-4">
                Are you sure you want to proceed with this action?
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={confirmLoading}
                  className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmAction}
                  disabled={confirmLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  {confirmLoading && (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {confirmLoading ? "Processing..." : "Confirm"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
