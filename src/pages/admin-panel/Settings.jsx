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
  const [validationErrors, setValidationErrors] = useState({ name: "", email: "" });
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

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.length < 2) {
      return "Name must be at least 2 characters long";
    }
    if (name.length > 50) {
      return "Name must be less than 50 characters";
    }
    // Only allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(name)) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for name field to prevent invalid characters
    if (name === "name") {
      // Only allow letters, spaces, hyphens, and apostrophes
      const filteredValue = value.replace(/[^a-zA-Z\s\-']/g, '');
      setAdmin({ ...admin, [name]: filteredValue });
      
      // Validate the filtered value
      const error = validateName(filteredValue);
      setValidationErrors(prev => ({ ...prev, name: error }));
    } else {
      setAdmin({ ...admin, [name]: value });
      
      // Validate email
      if (name === "email") {
        const error = validateEmail(value);
        setValidationErrors(prev => ({ ...prev, email: error }));
      }
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const levels = [
      { strength: 0, label: "Very Weak", color: "bg-red-500" },
      { strength: 1, label: "Weak", color: "bg-red-400" },
      { strength: 2, label: "Fair", color: "bg-yellow-500" },
      { strength: 3, label: "Good", color: "bg-blue-500" },
      { strength: 4, label: "Strong", color: "bg-green-500" },
      { strength: 5, label: "Very Strong", color: "bg-green-600" }
    ];
    
    return levels[Math.min(strength, 5)];
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
    // Validate before submission
    const nameError = validateName(admin.name);
    const emailError = validateEmail(admin.email);
    
    if (nameError || emailError) {
      setValidationErrors({ name: nameError, email: emailError });
      setMessage({ text: "Please fix the validation errors before saving.", isError: true });
      return;
    }
    
    try {
      await axios.put(
        `${BASE_URL}/api/auth/admin/profile`,
        { name: admin.name.trim(), email: admin.email.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({ text: "Profile updated successfully.", isError: false });
      setValidationErrors({ name: "", email: "" }); // Clear validation errors on success
    } catch (err) {
      console.error("Update error:", err);
      setMessage({ text: "Error updating profile.", isError: true });
    }
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (password.length > 128) {
      return "Password must be less than 128 characters";
    }
    // Check for at least one uppercase letter, one lowercase letter, and one number
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumbers) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const submitPassword = async () => {
    setPasswordMessage({ text: "", isError: false });

    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ text: "All fields are required.", isError: true });
      return;
    }

    // Validate new password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setPasswordMessage({ text: passwordError, isError: true });
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={admin.name}
            onChange={handleProfileChange}
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 ${
              validationErrors.name 
                ? "border-red-300 focus:ring-red-500" 
                : "border-gray-300 focus:ring-green-600"
            }`}
            placeholder="Enter your full name (letters only)"
            required
          />
          {validationErrors.name && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={admin.email}
            onChange={handleProfileChange}
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 ${
              validationErrors.email 
                ? "border-red-300 focus:ring-red-500" 
                : "border-gray-300 focus:ring-green-600"
            }`}
            placeholder="Enter your email address"
            required
          />
          {validationErrors.email && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
          )}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-600"
            placeholder="Enter new password (min 8 characters)"
            required
          />
          {passwords.newPassword && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(passwords.newPassword).color}`}
                    style={{ width: `${(getPasswordStrength(passwords.newPassword).strength / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {getPasswordStrength(passwords.newPassword).label}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Password must contain: uppercase, lowercase, and number
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 ${
              passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword
                ? "border-red-300 focus:ring-red-500" 
                : "border-gray-300 focus:ring-green-600"
            }`}
            placeholder="Confirm your new password"
            required
          />
          {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
          )}
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
