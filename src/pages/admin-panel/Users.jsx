/* eslint-disable no-irregular-whitespace */
import axios from "axios";
import { FiSearch, FiEye, FiCheck, FiX, FiLink, FiMail, FiSmartphone, FiAlertTriangle } from 'react-icons/fi';
import { FaChevronDown } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import barangaysInNasugbu from "../../data/barangays";

const Users = () => {
  // State management
  const [state, setState] = useState({
    isLoading: true,
    users: [],
    statistics: { totalUsers: 0, autoVerified: 0, manuallyVerified: 0, pendingManual: 0, unverified: 0, rejected: 0, verifiedUsers: 0, basicUsers: 0, archivedUsers: 0 },
    search: "",
    currentPage: 1,
    totalPages: 1,
    activeTab: "all", // ✅ Now can be 'all', 'active', 'inactive', 'pending', 'rejected'
    showRejectionModal: false,
    showConfirmRejectionModal: false,
    selectedRejectionReason: '',
    rejectionNotes: '',
    verificationFilter: "",
    userTypeFilter: "",
    selectedBarangay: "",
    rejectionFilter: "", // For filtering Rejected/Final vs Review users
    activeFilter: "", // For filtering Manually Verified vs Auto Verified users
    
    // Modal states
    showViewModal: false,
    viewingUser: null,
    batelecAccount: null,
    isLoadingUserDetails: false,
    
    showDeleteModal: false,
    userToDelete: null,
    isDeleting: false,
    
    showVerificationModal: false,
    verificationAction: null,
    adminNotes: "",
    isUpdating: false,
    
    // New states for account linking
    showAccountLinkModal: false,
    batelecAccounts: [],
    isLoadingAccounts: false
  });

  const usersPerPage = 20;

  // API calls
  const fetchUsers = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const token = localStorage.getItem("token");

      // ✅ SIMPLIFIED: Send the activeTab directly to the backend
      const params = new URLSearchParams({
        page: state.currentPage,
        limit: usersPerPage,
        filterTab: state.activeTab,
        ...(state.search && { search: state.search }),
        ...(state.verificationFilter && state.activeTab !== 'pending' && state.activeTab !== 'rejected' && state.activeTab !== 'active' && { verificationStatus: state.verificationFilter }),
        ...(state.userTypeFilter && { userType: state.userTypeFilter }),
        ...(state.selectedBarangay && { barangay: state.selectedBarangay }),
        ...(state.rejectionFilter && state.activeTab === 'rejected' && { verificationStatus: state.rejectionFilter }),
        ...(state.activeFilter && state.activeTab === 'active' && { verificationStatus: state.activeFilter }),
        ...(state.activeFilter && state.activeTab === 'inactive' && { verificationStatus: state.activeFilter }),
      });

      // Debug logging
      console.log('🔍 Frontend API call params:', {
        activeTab: state.activeTab,
        rejectionFilter: state.rejectionFilter,
        activeFilter: state.activeFilter,
        verificationStatus: state.rejectionFilter && state.activeTab === 'rejected' ? state.rejectionFilter : 
                           state.activeFilter && (state.activeTab === 'active' || state.activeTab === 'inactive') ? state.activeFilter : undefined
      });

      const res = await axios.get(`${BASE_URL}/api/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setState(prev => ({
        ...prev,
        users: res.data.users || [],
        totalPages: res.data.totalPages || 1,
        isLoading: false
      }));
    } catch (err) {
      console.error("Error fetching users:", err);
      setState(prev => ({ ...prev, users: [], isLoading: false }));
    }
  };

  const fetchUserStatistics = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/users/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setState(prev => ({ ...prev, statistics: res.data }));
    } catch (err) {
      console.error("Error fetching statistics:", err);
    }
  };
  
  // ... (All other functions like fetchUserDetails, handleView, handleApproveUser, etc. remain the same)
  const fetchUserDetails = async (userId) => {
    try {
      setState(prev => ({ ...prev, isLoadingUserDetails: true }));
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setState(prev => ({
        ...prev,
        viewingUser: res.data.user,
        batelecAccount: res.data.batelecAccount,
        isLoadingUserDetails: false
      }));
    } catch (err) {
      console.error("Error fetching user details:", err);
      setState(prev => ({ ...prev, isLoadingUserDetails: false }));
    }
  };

  const fetchBatelecAccounts = async () => {
    try {
      setState(prev => ({ ...prev, isLoadingAccounts: true }));
      const token = localStorage.getItem("token");
      // Only fetch unlinked accounts for account linking modal
      const res = await axios.get(`${BASE_URL}/api/batelec/accounts?unlinkedOnly=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setState(prev => ({
        ...prev,
        batelecAccounts: res.data || [],
        isLoadingAccounts: false
      }));
    } catch (err) {
      console.error("Error fetching BATELEC accounts:", err);
      setState(prev => ({ ...prev, batelecAccounts: [], isLoadingAccounts: false }));
    }
  };

  // Helper functions
  const formatLabel = (str) => {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Function to get full rejection reason details
  const getRejectionReasonDetails = (reasonKey) => {
    const rejectionReasons = {
      // CATEGORY 1: RETRY ALLOWED - Technical/Format Issues
      'api_connection_failed': {
        title: 'Internet Connection Timeout',
        category: 'retry',
        message: `Your Ecotrack account creation request has been rejected due to an internet connection timeout during verification.

To resolve this issue:
1. Wait 30 minutes before trying again
2. Ensure your internet connection is stable
3. Double-check all information is entered correctly
4. Contact customer service if the problem persists
5. Once resolved, you may submit a new account creation request`
      },
      'system_timeout': {
        title: 'System Timeout',
        category: 'retry',
        message: `Your Ecotrack account creation request has been rejected because the verification process timed out.

To resolve this issue:
1. Try again during off-peak hours (early morning or late evening)
2. Ensure you have a stable internet connection
3. Complete the registration form quickly to avoid timeout
4. Contact customer service if timeouts continue
5. You may submit a new account creation request immediately`
      },
      'information_format_error': {
        title: 'Information Format Error',
        category: 'retry',
        message: `Your Ecotrack account creation request has been rejected because some information needs to be corrected.

To resolve this issue:
1. Double-check your name spelling matches your utility bill exactly
2. Remove any special characters or numbers from name fields
3. Ensure your middle name is entered correctly (leave blank if none)
4. Verify all required fields are properly filled
5. Once corrected, you may submit a new account creation request`
      },
      'address_format_issue': {
        title: 'Address Format Issue',
        category: 'retry',
        message: `Your Ecotrack account creation request has been rejected because your address information could not be verified.

To resolve this issue:
1. Verify you selected the correct barangay from the dropdown
2. Ensure you are selecting the barangay where your utility service is located
3. Check your utility bill for the exact barangay listed
4. Contact BATELEC customer service if you're unsure of your service barangay
5. Once verified, you may submit a new account creation request`
      },
      // CATEGORY 2: PERMANENT REJECTION (BLOCK) - Account/Security Issues
      'no_customer_record': {
        title: 'No Customer Record Found',
        category: 'block',
        message: `Your Ecotrack account creation request has been rejected after verification review.

This email address is no longer eligible for account creation. If you believe this is an error, please contact BATELEC customer service directly with your reference ID: [REF_ID]

For assistance, visit your nearest BATELEC office or call their customer service hotline.`
      },
      'account_creation_denied': {
        title: 'Account Creation Denied',
        category: 'block',
        message: `Your Ecotrack account creation request has been rejected as the provided information could not be verified.

This email address is no longer eligible for account creation. If you are a BATELEC customer and believe this is an error, please contact BATELEC customer service with your reference ID: [REF_ID]

Please bring a valid ID and your latest utility bill when visiting BATELEC offices.`
      },
      'invalid_registration_attempt': {
        title: 'Invalid Registration Attempt',
        category: 'block',
        message: `Your Ecotrack account creation request has been rejected due to security verification failure.

This email address has been blocked from future registrations. If you believe this is an error, please contact BATELEC customer service directly with your reference ID: [REF_ID]

For assistance, please visit your nearest BATELEC office with proper identification.`
      },
      'terms_of_service_violation': {
        title: 'Terms of Service Violation',
        category: 'block',
        message: `Your Ecotrack account creation request has been rejected due to a policy violation.

This email address is no longer eligible for account creation. If you believe this is an error or need clarification, please contact customer service with your reference ID: [REF_ID]

Please review the Terms of Service before contacting support.`
      },
      'duplicate_account_violation': {
        title: 'Duplicate Account Violation',
        category: 'block',
        message: `Your Ecotrack account creation request has been rejected because an account with this information already exists.

This email address is no longer eligible for new account creation. If you forgot your login credentials, use the "Forgot Password" feature or contact customer service with your reference ID: [REF_ID]

If you believe you don't have an existing account, please contact BATELEC customer service directly.`
      },
      'suspicious_activity_detected': {
        title: 'Suspicious Activity Detected',
        category: 'block',
        message: `Your Ecotrack account creation request has been rejected due to security concerns.

This email address has been permanently blocked from account creation. If you believe this is an error, please contact BATELEC customer service in person with your reference ID: [REF_ID]

Please bring valid identification when visiting BATELEC offices.`
      },
      'admin_rejection_reason': {
        title: 'Admin Rejection Reason',
        category: 'block',
        message: `Your BATELEC account creation request has been rejected. Please review the additional comments below for specific details about the rejection.

To resolve this issue:
1. Carefully read the specific rejection reason provided
2. Address all mentioned issues before resubmitting
3. Contact BATELEC customer service if you need clarification
4. Submit a new account creation request once all issues are resolved`
      }
    };

    return rejectionReasons[reasonKey] || {
      title: 'Unknown Reason',
      category: 'block',
      message: 'No specific reason provided.'
    };
  };

  // Event handlers
  const handleView = async (user) => {
    setState(prev => ({ ...prev, showViewModal: true }));
    await fetchUserDetails(user._id);
  };

  const handleApproveUser = async (user) => {
    const isNewConsumer = !user.accountNumber;
    
    if (isNewConsumer) {
      // Show account linking modal for new consumers
      setState(prev => ({ 
        ...prev, 
        showAccountLinkModal: true,
        verificationAction: { user, action: 'approve' }
      }));
      await fetchBatelecAccounts();
    } else {
      // Direct approval for existing consumers
      setState(prev => ({ 
        ...prev, 
        showVerificationModal: true, 
        verificationAction: { user, action: 'approve' } 
      }));
    }
  };

  const handleAccountLinkApproval = async (accountNumber, accountData, adminNotes) => {
    try {
      setState(prev => ({ ...prev, isUpdating: true }));
      const { user } = state.verificationAction;
      const token = localStorage.getItem("token");
      
      // Call new API endpoint that handles account linking + approval
      await axios.post(`${BASE_URL}/api/users/link-account-and-approve/${user._id}`, {
        accountNumber,
        adminNotes
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      fetchUsers();
      fetchUserStatistics();
      
      setState(prev => ({
        ...prev,
        showAccountLinkModal: false,
        verificationAction: null,
        adminNotes: "",
        isUpdating: false
      }));
    } catch (err) {
      console.error("Account linking failed:", err);
      alert("Account linking failed: " + (err.response?.data?.message || err.message));
      setState(prev => ({ ...prev, isUpdating: false }));
    }
  };

  const handleArchiveToggle = async (userId) => {
    try {
      setState(prev => ({ ...prev, isDeleting: true }));
      const token = localStorage.getItem("token");
      await axios.patch(`${BASE_URL}/api/users/${userId}/toggle-archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      fetchUserStatistics();
    } catch (err) {
      console.error("Error toggling archive:", err);
      alert("Operation failed");
    } finally {
      setState(prev => ({ ...prev, isDeleting: false, showDeleteModal: false, userToDelete: null }));
    }
  };

  const handleRejectUser = async () => {
  try {
    setState(prev => ({ ...prev, isUpdating: true }));
    const token = localStorage.getItem("token");
    const { selectedRejectionReason, rejectionNotes } = state;
    const reasonData = rejectionReasons.find(r => r.value === selectedRejectionReason);
    
    await axios.post(`${BASE_URL}/api/users/verify-user/${state.verificationAction.user._id}`, {
      action: 'reject',
      adminNotes: rejectionNotes,
      rejectionReason: selectedRejectionReason,
      rejectionMessage: reasonData?.defaultMessage || '',
      rejectionCategory: reasonData?.category || 'block' // Send category to backend
    }, { headers: { Authorization: `Bearer ${token}` } });
    
    fetchUsers();
    fetchUserStatistics();
    
    setState(prev => ({
      ...prev,
      isUpdating: false,
      showConfirmRejectionModal: false,
      verificationAction: null,
      selectedRejectionReason: '',
      rejectionNotes: ''
    }));
  } catch (err) {
    console.error("Rejection failed:", err);
    alert("Rejection failed: " + (err.response?.data?.message || err.message));
    setState(prev => ({ ...prev, isUpdating: false }));
  }
};

  // Reusable Components
const StatCard = ({ title, value, color = "text-gray-800" }) => (
  <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
    <h4 className="text-sm text-gray-500 font-inter mb-2">{title}</h4>
    <span className={`text-2xl font-semibold ${color} font-inter`}>{value}</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const configs = {
    auto_verified: { color: "text-green-600 bg-green-100", text: "Auto Verified" },
    manually_verified: { color: "text-green-600 bg-green-100", text: "Manually Verified" },
    pending_manual: { color: "text-yellow-600 bg-yellow-100", text: "Pending Review" },
    rejected_review: { color: "text-orange-600 bg-orange-100", text: "Rejected/Review" },
    rejected_final: { color: "text-red-600 bg-red-100", text: "Rejected/Final" },
    rejected: { color: "text-red-600 bg-red-100", text: "Rejected" }, // Legacy support
    unverified: { color: "text-gray-600 bg-gray-100", text: "Unverified" } // Legacy support
  };
  
  const config = configs[status] || { color: "text-gray-600 bg-gray-100", text: "Unknown" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

const FilterSelect = ({ value, onChange, options, placeholder, className = "" }) => (
<div className={`relative ${className}`}>
<select
className="p-2 border bg-white border-gray-300 rounded-md font-inter shadow-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
value={value}
onChange={(e) => onChange(e.target.value)}
>
<option value="">{placeholder}</option>
{options.map(opt => (
<option key={opt.value} value={opt.value}>{opt.label}</option>
))}
</select>
<div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
<FaChevronDown className="text-gray-500" />
</div>
</div>
);

const Modal = ({ show, onClose, title, children, actions, loading = false }) => {
  if (!show) return null;
  
return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
<div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden">
<div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
<FiX className="w-5 h-5" />
</button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="max-h-[calc(95vh-200px)] overflow-y-auto p-6">
              {children}
            </div>
            {actions && (
<div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
{actions}
</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Rejection reasons with default messages - Updated with RETRY and BLOCK categories
const rejectionReasons = [
  // CATEGORY 1: RETRY ALLOWED
  {
    value: 'api_connection_failed',
    label: 'Internet Connection Timeout (RETRY)',
    category: 'retry',
    defaultMessage: `Your Ecotrack account creation request has been rejected due to an internet connection timeout during verification.

To resolve this issue:
1. Wait 30 minutes before trying again
2. Ensure your internet connection is stable
3. Double-check all information is entered correctly
4. Contact customer service if the problem persists
5. Once resolved, you may submit a new account creation request`
  },
  {
    value: 'system_timeout',
    label: 'System Timeout (RETRY)',
    category: 'retry',
    defaultMessage: `Your Ecotrack account creation request has been rejected because the verification process timed out.

To resolve this issue:
1. Try again during off-peak hours (early morning or late evening)
2. Ensure you have a stable internet connection
3. Complete the registration form quickly to avoid timeout
4. Contact customer service if timeouts continue
5. You may submit a new account creation request immediately`
  },
  {
    value: 'information_format_error',
    label: 'Information Format Error (RETRY)',
    category: 'retry',
    defaultMessage: `Your Ecotrack account creation request has been rejected because some information needs to be corrected.

To resolve this issue:
1. Double-check your name spelling matches your utility bill exactly
2. Remove any special characters or numbers from name fields
3. Ensure your middle name is entered correctly (leave blank if none)
4. Verify all required fields are properly filled
5. Once corrected, you may submit a new account creation request`
  },
  {
    value: 'address_format_issue',
    label: 'Address Format Issue (RETRY)',
    category: 'retry',
    defaultMessage: `Your Ecotrack account creation request has been rejected because your address information could not be verified.

To resolve this issue:
1. Verify you selected the correct barangay from the dropdown
2. Ensure you are selecting the barangay where your utility service is located
3. Check your utility bill for the exact barangay listed
4. Contact BATELEC customer service if you're unsure of your service barangay
5. Once verified, you may submit a new account creation request`
  },

  // CATEGORY 2: PERMANENT REJECTION (BLOCK)
  {
    value: 'no_customer_record',
    label: 'No Customer Record Found (BLOCK)',
    category: 'block',
    defaultMessage: `Your Ecotrack account creation request has been rejected after verification review.

This email address is no longer eligible for account creation. If you believe this is an error, please contact BATELEC customer service directly with your reference ID: [REF_ID]

For assistance, visit your nearest BATELEC office or call their customer service hotline.`
  },
  {
    value: 'account_creation_denied',
    label: 'Account Creation Denied (BLOCK)',
    category: 'block',
    defaultMessage: `Your Ecotrack account creation request has been rejected as the provided information could not be verified.

This email address is no longer eligible for account creation. If you are a BATELEC customer and believe this is an error, please contact BATELEC customer service with your reference ID: [REF_ID]

Please bring a valid ID and your latest utility bill when visiting BATELEC offices.`
  },
  {
    value: 'invalid_registration_attempt',
    label: 'Invalid Registration Attempt (BLOCK)',
    category: 'block',
    defaultMessage: `Your Ecotrack account creation request has been rejected due to security verification failure.

This email address has been blocked from future registrations. If you believe this is an error, please contact BATELEC customer service directly with your reference ID: [REF_ID]

For assistance, please visit your nearest BATELEC office with proper identification.`
  },
  {
    value: 'terms_of_service_violation',
    label: 'Terms of Service Violation (BLOCK)',
    category: 'block',
    defaultMessage: `Your Ecotrack account creation request has been rejected due to a policy violation.

This email address is no longer eligible for account creation. If you believe this is an error or need clarification, please contact customer service with your reference ID: [REF_ID]

Please review the Terms of Service before contacting support.`
  },
  {
    value: 'duplicate_account_violation',
    label: 'Duplicate Account Violation (BLOCK)',
    category: 'block',
    defaultMessage: `Your Ecotrack account creation request has been rejected because an account with this information already exists.

This email address is no longer eligible for new account creation. If you forgot your login credentials, use the "Forgot Password" feature or contact customer service with your reference ID: [REF_ID]

If you believe you don't have an existing account, please contact BATELEC customer service directly.`
  },
  {
    value: 'suspicious_activity_detected',
    label: 'Suspicious Activity Detected (BLOCK)',
    category: 'block',
    defaultMessage: `Your Ecotrack account creation request has been rejected due to security concerns.

This email address has been permanently blocked from account creation. If you believe this is an error, please contact BATELEC customer service in person with your reference ID: [REF_ID]

Please bring valid identification when visiting BATELEC offices.`
  },
  {
    value: 'admin_rejection_reason',
    label: 'Admin Rejection Reason (BLOCK)',
    category: 'block',
    defaultMessage: `Your BATELEC account creation request has been rejected. Please review the additional comments below for specific details about the rejection.

To resolve this issue:
1. Carefully read the specific rejection reason provided
2. Address all mentioned issues before resubmitting
3. Contact BATELEC customer service if you need clarification
4. Submit a new account creation request once all issues are resolved`
  }
];

// Rejection Modal Reason Options
const RejectionModal = ({ show, onClose, user, onContinue }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const getCurrentReason = () => {
    return rejectionReasons.find(reason => reason.value === selectedReason);
  };

  const handleContinue = () => {
    if (!selectedReason) return;
    onContinue(selectedReason, adminNotes);
  };

  if (!show || !user) return null;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Reject Verification Request" 
      actions={[
        <button
          key="cancel"
          onClick={() => setState(prev => ({ 
            ...prev, 
            showRejectionModal: false,
            showViewModal: true
          }))}
          disabled={state.isUpdating}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>,
        <button
          key="continue"
          onClick={handleContinue}
          disabled={!selectedReason || (selectedReason === 'other' && !adminNotes.trim())}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center gap-2"
        >
          <FiX className="w-4 h-4" /> Reject
        </button>
      ]}
    >
      <div className="space-y-6">
        {/* User Information */}
        <div className="bg-gray-50 p-4 mb-4 rounded-md border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-1">User Information</h3>
          <div className="grid grid-cols-2 gap-x-1 gap-y-1 text-sm">
            <div><span className="font-medium">Name:</span> {(() => {
              const fullName = user.fullName && user.fullName !== 'null' ? user.fullName : null;
              const name = user.name && user.name !== 'null' ? user.name : null;
              return (fullName || name) || "-";
            })()}</div>
            <div><span className="font-medium">Email:</span> {user.email && !user.email.startsWith('nullified_') ? user.email : "-"}</div>
            <div><span className="font-medium">Reference ID:</span> {user.referenceId}</div>
            <div><span className="font-medium">Consumer Type:</span> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                !user.accountNumber ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {!user.accountNumber ? 'New Consumer' : 'Existing Consumer'}
              </span>
            </div>
          </div>
        </div>

        {/* Rejection Details */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-orange-100 rounded-full p-1">
              <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-red-600 font-semibold">Rejection Details</h3>
          </div>

          {/* Rejection Reason */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full shadow-sm border border-gray-500 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-inter py-2 px-4 cursor-pointer appearance-none pr-8"
              >
                <option value="">Select a reason...</option>
                <optgroup label="🔄 RETRY ALLOWED - User can register again">
                  {rejectionReasons.filter(reason => reason.category === 'retry').map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🚫 BLOCK PERMANENT - User cannot register again">
                  {rejectionReasons.filter(reason => reason.category === 'block').map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </optgroup>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FaChevronDown className="text-gray-500" />
              </div>
            </div>
          </div>

          {/* Default Email Message */}
          {selectedReason && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Default Email Message
              </label>
              <textarea
                value={getCurrentReason()?.defaultMessage || ''}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-sm"
                rows="8"
              />
            </div>
          )}

          {/* Additional Comments */}
          <div className="mt-2">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Additional Comments {selectedReason !== 'other' && '(Optional)'}
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder={
                selectedReason === 'other'
                  ? 'Please provide the reason for rejection...'
                  : 'Add any additional notes or specific instructions. This will be appended to the default message above.'
              }
              className={`w-full p-3 border rounded-md ${
                selectedReason === 'other'
                  ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500'
                  : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500'
              }`}
              rows="3"
            />
            {selectedReason === 'other' && !adminNotes && (
              <p className="text-sm text-red-500 mt-1">
                Additional comments are required when selecting "Other".
              </p>
            )}
          </div>
        </div>

        {/* Admin Info */}
        <div className="bg-blue-50 p-4 mt-2 rounded-lg">
          <div className="text-sm">
            <div className="mb-1">
              <span className="text-gray-600">Rejected by</span>
              <div className="text-blue-600 font-semibold">Super Admin</div>
            </div>
            <div>
              <span className="text-gray-600">Rejected at</span>
              <div className="text-blue-600 font-semibold">{currentDate}</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Confirmation Modal for Rejection
const ConfirmRejectionModal = ({ 
  show, 
  onClose, 
  user, 
  onConfirm, 
  loading,
  rejectionReason,
  adminNotes 
}) => {
  if (!show || !user) return null;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Find the rejection reason data
  const reasonData = rejectionReasons.find(r => r.value === rejectionReason);
  const reasonLabel = reasonData?.label || rejectionReason;
  const reasonCategory = reasonData?.category || 'block';

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={
        <div className="text-white px-3 py-1 flex items-center gap-2">
          Confirm Rejection
        </div>
      }
      actions={[
          <button
            key="cancel"
            onClick={() => setState(prev => ({ 
              ...prev, 
            showConfirmRejectionModal: false,
            showRejectionModal: true
            }))}
            className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>,
        <button
          key="confirm"
          onClick={onConfirm} 
          disabled={loading}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium"
        >
          {loading ? "Processing..." : "Confirm Rejection"}
        </button>
      ]}
    >
      <div className="text-center space-y-3 p-4">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="w-40 h-40 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-35 h-35 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Main Question */}
        <h3 className="text-lg font-semibold mb-10 text-gray-800">
          Are you sure you want to reject this verification request?
        </h3>

        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded p-4 flex items-center gap-2 justify-center ">
          <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold text-red-800">This action is IRREVERSIBLE!</span>
        </div>

        {/* Request Details */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4 text-left">
          <h4 className="font-semibold text-gray-800 mb-3">Request Details:</h4>
          <div className="space-y-1 text-sm">
            <div><span className="font-medium">User:</span> {(() => {
              const fullName = user.fullName && user.fullName !== 'null' ? user.fullName : null;
              const name = user.name && user.name !== 'null' ? user.name : null;
              return (fullName || name) || "-";
            })()} ({user.email && !user.email.startsWith('nullified_') ? user.email : '-'})</div>
            <div><span className="font-medium">Account:</span> {user.accountNumber && user.accountNumber !== 'null' ? user.accountNumber : "-"}</div>
            <div><span className="font-medium">Date:</span> {currentDate}</div>
          </div>
        </div>

        {/* Rejection Reason */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-left">
          <div className="text-sm">
            <div className="mb-2">
              <span className="font-medium">Rejection Reason:</span> {reasonLabel}
            </div>
            <div className="mb-2">
              <span className="font-medium">Category:</span> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                reasonCategory === 'retry' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {reasonCategory === 'retry' ? '🔄 RETRY ALLOWED' : '🚫 BLOCK PERMANENT'}
              </span>
            </div>
            {adminNotes && (
              <div>
                <span className="font-medium">Custom Message:</span> {adminNotes}
              </div>
            )}
          </div>
        </div>

        {/* Final Notice */}
        <p className="text-sm text-gray-600">
          {reasonCategory === 'retry' 
            ? "The user will be notified via email and can resubmit their request after addressing the issues."
            : "The user will be notified via email and will be permanently blocked from future registrations."
          }
        </p>
      </div>
    </Modal>
  );
};


// Account Linking Modal
const AccountLinkingModal = ({ 
  show, 
  onClose, 
  user, 
  onApprove, 
  loading,
  batelecAccounts}) => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Since we're now fetching only unlinked accounts from the backend,
    // we only need to filter by search query and barangay
    const filtered = batelecAccounts.filter(account => 
      (
        account.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.accountNumber?.includes(searchQuery) ||
        account.meterNumber?.includes(searchQuery)
      ) && (
        !selectedBarangay || 
        (account.barangay && account.barangay.toLowerCase() === selectedBarangay.toLowerCase())
      )
    );
    setFilteredAccounts(filtered);
  }, [searchQuery, selectedBarangay, batelecAccounts]);

  const handleApproveClick = () => {
    if (!selectedAccount && user && !user.accountNumber) return;
    setShowConfirmation(true);
  };

  const handleConfirmApproval = () => {
    const accountData = batelecAccounts.find(acc => acc.accountNumber === selectedAccount);
    onApprove(selectedAccount, accountData, adminNotes);
    setShowConfirmation(false);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleBarangayChange = (value) => {
    setSelectedBarangay(value);
  };

  if (!show || !user) return null;

  const isNewConsumer = !user.accountNumber;
  const accountData = batelecAccounts.find(acc => acc.accountNumber === selectedAccount);

  return (
    <>
      <Modal
        show={show && !showConfirmation}
        onClose={onClose}
        title={isNewConsumer ? "Link Account & Approve User" : "Approve User Verification"}
        actions={[
          ////
         <button
            key="cancel"
            onClick={() => setState(prev => ({ 
              ...prev, 
            showAccountLinkModal: false,
            showViewModal: true
            }))}
            className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>,
          <button
            key="approve"
            onClick={handleApproveClick}
            disabled={loading || (isNewConsumer && !selectedAccount)}
            className={`px-6 py-2 text-white rounded-md flex items-center gap-2 font-medium ${
              (isNewConsumer && !selectedAccount) 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <FiCheck className="w-4 h-4" />
            Approve User
          </button>
        ]}
      >
        <div className="space-y-6">
          {/* User Information */}
          <div className="bg-gray-50 p-4 mb-4 rounded-md border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-1">User Information</h3>
            <div className="grid grid-cols-2 gap-x-1 gap-y-1 text-sm">
              <div>
                <span className="text-gray-600">Name:</span> 
                <span className="ml-2 text-gray-900">{(() => {
                  const fullName = user.fullName && user.fullName !== 'null' ? user.fullName : null;
                  const name = user.name && user.name !== 'null' ? user.name : null;
                  return (fullName || name) || "-";
                })()}</span>
              </div>
              <div>
                <span className="text-gray-600">Reference ID:</span> 
                <span className="ml-2 text-gray-900">{user.referenceId}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span> 
                <span className="ml-2 text-gray-900">{user.email && !user.email.startsWith('nullified_') ? user.email : "-"}</span>
              </div>
              <div>
                <span className="text-gray-600">Consumer Type:</span>
                <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 font-medium">
                  {isNewConsumer ? 'New Consumer' : 'Existing Consumer'}
                </span>
              </div>
              {user.barangay && (
                <div>
                  <span className="text-gray-600">Barangay:</span> 
                  <span className="ml-2 text-gray-900">{user.barangay && user.barangay !== 'null' ? user.barangay : "-"}</span>
                </div>
              )}
              {user.requestedDate && (
                <div>
                  <span className="text-gray-600">Requested:</span> 
                  <span className="ml-2 text-gray-900">{user.requestedDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Account Linking Section (only for new consumers) */}
          {isNewConsumer && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔍 Find Matching Customer Account</h3>
              
              {/* Search Box and Filter */}
              <div className="mb-4 flex gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name, account number, or meter number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <FilterSelect
                  value={selectedBarangay}
                  onChange={handleBarangayChange}
                  options={[{value: "", label: "All Barangays"}, ...barangayOptions]}
                  placeholder="Filter by Barangay"
                  className="min-w-[180px]"
                />
              </div>

              {/* Account Table */}
              <div className="border border-gray-300 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900">
                    Matching Customer Accounts ({filteredAccounts.length} found)
                  </h4>
                </div>
                
                <div className="overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-700">
                      <div className="col-span-1"></div>
                      <div className="col-span-4">Name</div>
                      <div className="col-span-2">Barangay</div>
                      <div className="col-span-3">Account ID</div>
                      <div className="col-span-2">Meter</div>
                    </div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                    {filteredAccounts.length > 0 ? (
                      filteredAccounts.map((account) => (
                        <label key={account.accountNumber} className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 cursor-pointer text-sm">
                          <div className="col-span-1 flex items-center">
                            <input
                              type="radio"
                              name="selectedAccount"
                              value={account.accountNumber}
                              checked={selectedAccount === account.accountNumber}
                              onChange={(e) => setSelectedAccount(e.target.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                          </div>
                          <div className="col-span-4 text-gray-900">{account.customerName}</div>
                          <div className="col-span-2 text-gray-600">{account.barangay || '-'}</div>
                          <div className="col-span-3 text-gray-900">{account.accountNumber}</div>
                          <div className="col-span-2 text-gray-600">{account.meterNumber}</div>
                        </label>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        {searchQuery || selectedBarangay ? 'No matching accounts found' : 'No available accounts to link'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedAccount && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-green-800">
                    <FiLink className="w-4 h-4" />
                    <span className="font-medium">Account Selected</span>
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    This account will be linked to {(() => {
        const fullName = user.fullName && user.fullName !== 'null' ? user.fullName : null;
        const name = user.name && user.name !== 'null' ? user.name : null;
        return (fullName || name) || "-";
      })()}'s profile upon approval.
                  </div>
                </div>
              )}
            </div>
          )}

         {/* Approval Summary */}
            <div className="bg-yellow-50 p-4 mb-4 rounded-md border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-3">Approval Summary</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                 <li>• User verification status will change to "manually_verified"</li>
                 <li>• User will gain access to BATELEC energy data</li>
                 {isNewConsumer && selectedAccount && (
                   <li>• Account {selectedAccount} will be linked to this user</li>
                 )}
                 <li>• User will receive approval confirmation email</li>
               </ul>
             </div>

          {/* Existing Consumer Info */}
          {!isNewConsumer && (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Existing Account Information</h3>
              <div className="text-sm text-blue-700">
                <div><span className="font-medium">Account Number:</span> {user.accountNumber}</div>
                <div className="mt-1">This user has already provided their BATELEC account number.</div>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Enter any additional notes for this approval..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows="3"
            />
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <AccountLinkingConfirmation
        show={showConfirmation}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmApproval}
        user={user}
        selectedAccount={selectedAccount}
        accountData={accountData}
        adminNotes={adminNotes}
        loading={loading}
      />
    </>
  );
};

// Account Linking Confirmation Modal
const AccountLinkingConfirmation = ({ 
  show, 
  onClose, 
  onConfirm, 
  user, 
  selectedAccount, 
  accountData, 
  adminNotes,
  loading 
}) => {
  console.log('AccountLinkingConfirmation render:', { show, user: !!user });
  
  if (!show || !user) {
    console.log('AccountLinkingConfirmation not showing:', { show, hasUser: !!user });
    return null;
  }

  const isNewConsumer = !user.accountNumber;

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Link Account Confirmation"
      actions={[
        <button
          key="cancel"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>,
        <button
          key="confirm"
          onClick={onConfirm}
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            'Link Account'
          )}
        </button>
      ]}
    >
      <div className="space-y-6">
        {/* Warning Icon */}
         <div className="w-145 h-75 bg-yellow-50 p-4 rounded-lg mb-2 text-center mx-auto" style={{maxWidth: '95%'}}>
        <div className="mx-auto w-36 h-36 bg-yellow-400 rounded-full flex items-center justify-center">
          <svg className="w-20 h-20 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
          </svg>
        </div>

        {/* Confirmation Message */}
        <div className="text-center">
          <p className="text-gray-900 mb-3 mt-2 font-semibold">
            Are you sure you want to link this verification request to:
          </p>


            <div className="font-semibold text-lg text-gray-600 mb-1">
              {(() => {
                const fullName = user.fullName && user.fullName !== 'null' ? user.fullName : null;
                const name = user.name && user.name !== 'null' ? user.name : null;
                return (fullName || name) || "-";
              })()}
            </div>
            <div className="text-sm text-gray-600">
              {user.email && !user.email.startsWith('nullified_') ? user.email : "-"}
            </div>
            {isNewConsumer && accountData && (
              <div className="text-sm text-gray-900 font-medium">
                Account: {selectedAccount}
              </div>
            )}
            {!isNewConsumer && (
              <div className="text-sm text-gray-900 font-medium">
                Account: {user.accountNumber}
              </div>
            )}
          </div>
        </div>

        {/* Action Items */}
        <div className="w-145 h-25 bg-green-50 border border-green-200 p-4 rounded-lg mb-2 text-center mx-auto" style={{maxWidth: '95%'}}>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <FiCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-green-800">Customer account will be activated immediately</span>
            </div>
            <div className="flex items-start gap-2">
              <FiMail className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-green-800">Welcome email will be sent automatically</span>
            </div>
            <div className="flex items-start gap-2">
              <FiSmartphone className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-green-800">App access will be granted</span>
            </div>
          </div>
        </div>

        {/* Account Details (for new consumers) */}
        {isNewConsumer && accountData && (
        <div className="w-145 h-40 bg-blue-50 border border-blue-200 p-4 rounded-lg mb-2 mx-auto" style={{maxWidth: '95%'}}>
            <h4 className="font-semibold text-blue-800 mb-3">Account Details</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-blue-600">Customer Name:</span>
                <div className="text-blue-900 font-medium">{accountData.customerName}</div>
              </div>
              <div>
                <span className="text-blue-600">Account Number:</span>
                <div className="text-blue-900 font-medium">{accountData.accountNumber}</div>
              </div>
              <div>
                <span className="text-blue-600">Meter Number:</span>
                <div className="text-blue-900 font-medium">{accountData.meterNumber}</div>
              </div>
              <div>
                <span className="text-blue-600">Barangay:</span>
                <div className="text-blue-900 font-medium">{accountData.barangay || '-'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Notes (if provided) */}
        {adminNotes && (
          <div className="w-145 h-25 bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2 mx-auto" style={{maxWidth: '95%'}}>
            <h4 className="font-semibold text-gray-800 mb-2">Admin Notes</h4>
            <p className="text-sm text-gray-700">{adminNotes}</p>
          </div>
        )}

        {/* Warning Message */}
        <div className="w-145 h-23 bg-orange-50 border border-orange-200 p-4 rounded-lg mb-2 mx-auto" style={{maxWidth: '95%'}}>
          <div className="flex items-start gap-2">
            <FiAlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-yellow-800 font-medium mb-1">Important:</p>
              <p className="text-yellow-700">
                This action cannot be undone. The user will immediately gain access to their account 
                and receive confirmation via email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
  // Effects
  useEffect(() => {
    fetchUsers();
    fetchUserStatistics();
  }, [state.currentPage, state.search, state.verificationFilter, state.userTypeFilter, state.selectedBarangay, state.activeTab, state.rejectionFilter, state.activeFilter]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  // Filter options
  const verificationOptions = [
    { value: "auto_verified", label: "Auto Verified" },
    { value: "manually_verified", label: "Manually Verified" },
    { value: "pending_manual", label: "Pending Review" },
    { value: "rejected_review", label: "Rejected/Review" },
    { value: "rejected_final", label: "Rejected/Final" },
    { value: "rejected", label: "Rejected" } // Legacy support
  ];

  const typeOptions = [
    { value: "new", label: "New" },
    { value: "existing", label: "Existing" }
  ];

  const rejectionOptions = [
    { value: "rejected_final", label: "Rejected/Final" },
    { value: "rejected_review", label: "Rejected/Review" }
  ];

  const activeOptions = [
    { value: "manually_verified", label: "Manually Verified" },
    { value: "auto_verified", label: "Auto Verified" }
  ];

  const barangayOptions = barangaysInNasugbu.map(b => ({ value: b, label: b }));

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <h2 className="text-3xl font-semibold font-inter text-gray-800 mb-5">User Management</h2>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={state.statistics.totalUsers} />
        <StatCard title="Auto Verified" value={state.statistics.autoVerified} color="text-green-600" />
        <StatCard title="Manually Verified" value={state.statistics.manuallyVerified} color="text-blue-600" />
        <StatCard title="Pending Review" value={state.statistics.pendingManual} color="text-yellow-600" />
        <StatCard title="Rejected/Review" value={state.statistics.rejectedReview || 0} color="text-orange-600" />
        <StatCard title="Rejected/Final" value={state.statistics.rejectedFinal || 0} color="text-red-600" />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative w-full md:w-[400px]">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={state.search}
            onChange={(e) => setState(prev => ({ ...prev, search: e.target.value, currentPage: 1 }))}
            className="p-3 pl-10 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-inter w-full"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center md:justify-between">
          {/* Left side: Tabs and other filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* All/Active/Inactive/Pending/Rejected Button */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
              {['all', 'active', 'inactive', 'pending', 'rejected'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setState(prev => ({ 
                    ...prev, 
                    activeTab: tab, 
                    currentPage: 1,
                    // Clear verification filter when switching to active tab since it only shows verified users
                    verificationFilter: tab === 'active' ? '' : prev.verificationFilter,
                    // Clear rejection filter when switching away from rejected tab
                    rejectionFilter: tab === 'rejected' ? prev.rejectionFilter : '',
                    // Clear active filter when switching away from active tab
                    activeFilter: tab === 'active' ? prev.activeFilter : ''
                  }))}
                  className={`px-6 py-2 capitalize ${
                    state.activeTab === tab 
                      ? "bg-green-600 text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
             {tab} ({
               tab === 'all' ? state.statistics.totalUsers :
               tab === 'active' ? (state.statistics.autoVerified + state.statistics.manuallyVerified) :
               tab === 'inactive' ? state.statistics.archivedUsers || 0 :
               tab === 'pending' ? state.statistics.pendingManual :
               (state.statistics.rejectedReview || 0) + (state.statistics.rejectedFinal || 0)
             })
                </button>
              ))}
            </div>

            {/* Only show these filters when NOT on the pending/rejected/active/inactive tabs */}
            {state.activeTab !== 'pending' && state.activeTab !== 'rejected' && state.activeTab !== 'active' && state.activeTab !== 'inactive' && (
              <>
                <FilterSelect
                  value={state.verificationFilter}
                  onChange={(value) => setState(prev => ({ ...prev, verificationFilter: value, currentPage: 1 }))}
                  options={verificationOptions}
                  placeholder="All Verification Status"
                  className="min-w-[180px]"
                />
                <FilterSelect
                  value={state.userTypeFilter}
                  onChange={(value) => setState(prev => ({ ...prev, userTypeFilter: value, currentPage: 1 }))}
                  options={typeOptions}
                  placeholder="All Types"
                  className="min-w-[140px]"
                />
              </>
            )}

            {/* Show rejection filter only on rejected tab */}
            {state.activeTab === 'rejected' && (
              <FilterSelect
                value={state.rejectionFilter}
                onChange={(value) => {
                  console.log('🔍 Rejection filter changed to:', value);
                  setState(prev => ({ ...prev, rejectionFilter: value, currentPage: 1 }));
                }}
                options={rejectionOptions}
                placeholder="All Rejected Users"
                className="min-w-[180px]"
              />
            )}

            {/* Show active filter only on active tab */}
            {state.activeTab === 'active' && (
              <FilterSelect
                value={state.activeFilter}
                onChange={(value) => {
                  console.log('🔍 Active filter changed to:', value);
                  setState(prev => ({ ...prev, activeFilter: value, currentPage: 1 }));
                }}
                options={activeOptions}
                placeholder="All Active Users"
                className="min-w-[180px]"
              />
            )}

            {/* Show inactive filter only on inactive tab */}
            {state.activeTab === 'inactive' && (
              <FilterSelect
                value={state.activeFilter}
                onChange={(value) => {
                  console.log('🔍 Inactive filter changed to:', value);
                  setState(prev => ({ ...prev, activeFilter: value, currentPage: 1 }));
                }}
                options={activeOptions}
                placeholder="All Inactive Users"
                className="min-w-[180px]"
              />
            )}
          </div>

          {/* Right side: Barangay filter */}
          <FilterSelect
            value={state.selectedBarangay}
            onChange={(value) => setState(prev => ({ ...prev, selectedBarangay: value, currentPage: 1 }))}
            options={barangayOptions}
            placeholder="All Barangays"
            className="min-w-[180px]"
          />
        </div>
      </div>

      {/* Users Table */}
      {state.isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-[#F5F5F5] sticky top-0 z-10 border-b border-gray-200">
                <tr className="text-left align-middle">
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm">#</th>
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm">Name</th>
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm">Email</th>
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm">Account #</th>
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm">Type</th>
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm">Barangay</th>
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm">Verification</th>
                  <th className="px-4 py-3 font-bold text-gray-500 text-sm text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {state.users.length > 0 ? state.users.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50 align-middle">
                    <td className="px-3 py-4 text-sm">{((state.currentPage - 1) * usersPerPage) + index + 1}</td>
                    <td className="px-3 py-4 text-sm font-medium">
                      {(() => {
                        const fullName = user.fullName && user.fullName !== 'null' ? user.fullName : null;
                        const name = user.name && user.name !== 'null' ? user.name : null;
                        return (fullName || name) || "-";
                      })()}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600">
                      {user.email && !user.email.startsWith('nullified_') ? user.email : "-"}
                    </td>
                    <td className="px-3 py-4 text-sm">{user.accountNumber && user.accountNumber !== 'null' ? user.accountNumber : "-"}</td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.accountNumber ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.accountNumber ? 'Existing' : 'New'}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm">{user.barangay && user.barangay !== 'null' ? user.barangay : "-"}</td>
                    <td className="px-3 py-4">
                      <StatusBadge status={user.verificationStatus} />
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(user)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {/* Only show archive toggle for active and inactive tabs, not for all/pending/rejected */}
                        {state.activeTab !== 'all' && state.activeTab !== 'pending' && state.activeTab !== 'rejected' && (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!user.isArchived}
                              onChange={() => setState(prev => ({ 
                                ...prev, 
                                showDeleteModal: true, 
                                userToDelete: user 
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:bg-green-600 transition-all"></div>
                            <div className="absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-all peer-checked:translate-x-4"></div>
                          </label>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No users found for the selected filters.
                  </td>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {state.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Showing {((state.currentPage - 1) * usersPerPage) + 1} to {Math.min(state.currentPage * usersPerPage, state.statistics.totalUsers)} of {state.statistics.totalUsers} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={state.currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, state.totalPages) }, (_, i) => {
                  let pageNum;
                  if (state.totalPages <= 5) pageNum = i + 1;
                  else if (state.currentPage <= 3) pageNum = i + 1;
                  else if (state.currentPage >= state.totalPages - 2) pageNum = state.totalPages - 4 + i;
                  else pageNum = state.currentPage - 2 + i;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setState(prev => ({ ...prev, currentPage: pageNum }))}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        state.currentPage === pageNum
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={state.currentPage === state.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View User Modal */}
 {/* View User Modal */}
        <Modal
          show={state.showViewModal}
          onClose={() =>
            setState((prev) => ({
              ...prev,
              showViewModal: false,
              viewingUser: null,
              batelecAccount: null,
            }))
          }
          title="User Details"
          loading={state.isLoadingUserDetails}
          actions={
            state.viewingUser?.verificationStatus === "pending_manual" && [
              <button
                key="approve"
                onClick={() => {
                  setState((prev) => ({ ...prev, showViewModal: false }));
                  handleApproveUser(state.viewingUser);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium"
              >
                {!state.viewingUser?.accountNumber ? "Link & Approve" : "Approve"}
              </button>,
              <button
                key="reject"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    showViewModal: false,
                    showRejectionModal: true,
                    verificationAction: { user: state.viewingUser, action: "reject" },
                  }))
                }
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium"
              >
                Reject
              </button>,
            ]
          }
        >
          {state.viewingUser && (
            <div className="space-y-6">
              {/* Modern Profile Header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {(() => {
                          const fullName = state.viewingUser.fullName && state.viewingUser.fullName !== 'null' ? state.viewingUser.fullName : null;
                          const name = state.viewingUser.name && state.viewingUser.name !== 'null' ? state.viewingUser.name : null;
                          const displayName = fullName || name;
                          return displayName ? displayName.charAt(0).toUpperCase() : '-';
                        })()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {(() => {
                          const fullName = state.viewingUser.fullName && state.viewingUser.fullName !== 'null' ? state.viewingUser.fullName : null;
                          const name = state.viewingUser.name && state.viewingUser.name !== 'null' ? state.viewingUser.name : null;
                          return (fullName || name) || '-';
                        })()}
                      </h2>
                      <p className="text-blue-100 text-sm">
                        {state.viewingUser.email && !state.viewingUser.email.startsWith('nullified_') 
                          ? state.viewingUser.email 
                          : '-'
                        }
                      </p>
                      <p className="text-blue-200 text-xs mt-1">
                        Registered since {formatDate(state.viewingUser.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                      <div className="mt-1">
                        <StatusBadge status={state.viewingUser.verificationStatus} />
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiCheck className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Consumer Type</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {state.viewingUser.accountNumber ? "Existing" : "New"}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiSmartphone className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reference ID</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1 font-mono">
                        {state.viewingUser.referenceId || "-"}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FiMail className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiSmartphone className="w-5 h-5 text-gray-600 mr-2" />
                    Contact Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="text-gray-900 font-medium">
                        {state.viewingUser.phone || (
                          <span className="text-gray-400 italic">Not provided</span>
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Barangay</p>
                      <p className="text-gray-900 font-medium">
                        {state.viewingUser.barangay || (
                          <span className="text-gray-400 italic">Not provided</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rejection Details - Only for rejected users */}
              {(state.viewingUser.verificationStatus === 'rejected_review' || state.viewingUser.verificationStatus === 'rejected_final') && state.viewingUser.manualVerificationRequest?.rejectionReason && (
                <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
                  <div className="bg-red-50 px-6 py-3 border-b border-red-200">
                    <h3 className="text-lg font-semibold text-red-900 flex items-center">
                      <FiX className="w-5 h-5 text-red-600 mr-2" />
                      Rejection Details
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500 mb-1">Rejection Reason</p>
                          <p className="text-red-800 font-semibold">
                            {getRejectionReasonDetails(state.viewingUser.manualVerificationRequest.rejectionReason).title}
                          </p>
                        </div>
                      </div>

                      {state.viewingUser.manualVerificationRequest?.adminNotes && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500 mb-1">Admin Notes</p>
                            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                              <p className="text-gray-700 text-sm whitespace-pre-line">
                                {state.viewingUser.manualVerificationRequest.adminNotes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-500">Category:</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            state.viewingUser.manualVerificationRequest?.rejectionCategory === 'retry'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {state.viewingUser.manualVerificationRequest?.rejectionCategory === 'retry' 
                              ? 'RETRY ALLOWED' 
                              : 'BLOCK PERMANENT'
                            }
                          </span>
                        </div>
                        {state.viewingUser.manualVerificationRequest?.reviewedAt && (
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-500">Date:</p>
                            <p className="text-sm text-gray-700">
                              {new Date(state.viewingUser.manualVerificationRequest.reviewedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BATELEC Account */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiLink className="w-5 h-5 text-gray-600 mr-2" />
                    BATELEC Account
                  </h3>
                </div>
                <div className="p-6">
                  {state.batelecAccount ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Account Number</p>
                        <p className="text-gray-900 font-mono font-semibold">{state.batelecAccount.accountNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Customer Name</p>
                        <p className="text-gray-900 font-medium">{state.batelecAccount.customerName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Meter Number</p>
                        <p className="text-gray-900 font-mono">{state.batelecAccount.meterNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="text-gray-900">{state.batelecAccount.address || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Consumer Type</p>
                        <p className="text-gray-900">{state.batelecAccount.consumerType || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Latest Reading</p>
                        <p className="text-gray-900 font-semibold">
                          {state.batelecAccount.latestReading?.currentReading || "-"} kWh
                        </p>
                      </div>
                    </div>
                  ) : state.viewingUser.accountNumber ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
                      </div>
                      <p className="text-gray-500 text-sm">BATELEC account data not found</p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FiLink className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-blue-800 font-medium text-sm">New Consumer</p>
                          <p className="text-blue-600 text-xs mt-1">
                            This user needs to be linked to a BATELEC account during approval.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Request */}
              {state.viewingUser.manualVerificationRequest?.requested && (
                <div className="bg-white rounded-xl border border-yellow-200 shadow-sm overflow-hidden">
                  <div className="bg-yellow-50 px-6 py-3 border-b border-yellow-200">
                    <h3 className="text-lg font-semibold text-yellow-900 flex items-center">
                      <FiAlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                      Verification Request
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Reason</p>
                        <p className="text-gray-900 font-medium">{state.viewingUser.manualVerificationRequest.reason}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Requested Date</p>
                        <p className="text-gray-900 font-medium">{formatDate(state.viewingUser.manualVerificationRequest.requestedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

      </Modal>

      {/* Account Linking Modal */}
      <AccountLinkingModal
        show={state.showAccountLinkModal}
        onClose={() => setState(prev => ({ 
          ...prev, 
          showAccountLinkModal: false,
          verificationAction: null
        }))}
        user={state.verificationAction?.user}
        onApprove={handleAccountLinkApproval}
        loading={state.isUpdating}
        batelecAccounts={state.batelecAccounts}
        onSearchAccounts={fetchBatelecAccounts}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        show={state.showDeleteModal}
        onClose={() => setState(prev => ({ 
          ...prev, 
          showDeleteModal: false, 
          userToDelete: null 
        }))}
        title={state.activeTab === "active" ? "Archive User" : "Restore User"}
        actions={[
          <button
            key="cancel"
            onClick={() => setState(prev => ({ 
              ...prev, 
              showDeleteModal: false, 
              userToDelete: null 
            }))}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>,
          <button
            key="confirm"
            onClick={() => handleArchiveToggle(state.userToDelete._id)}
            disabled={state.isDeleting}
            className={`px-4 py-2 text-white rounded-md flex items-center gap-2 ${
              state.activeTab === "active" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {state.isDeleting ? "Processing..." : (state.activeTab === "active" ? "Archive" : "Restore")}
          </button>
        ]}
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl font-bold text-blue-600">
              {state.userToDelete && (() => {
                const fullName = state.userToDelete.fullName && state.userToDelete.fullName !== 'null' ? state.userToDelete.fullName : null;
                const name = state.userToDelete.name && state.userToDelete.name !== 'null' ? state.userToDelete.name : null;
                const displayName = fullName || name;
                return displayName ? displayName.charAt(0).toUpperCase() : '-';
              })()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Are you sure you want to {state.activeTab === "active" ? "archive" : "restore"} this user?
            </h3>
            <p className="text-gray-600">
              <span className="font-medium">{state.userToDelete && ((state.userToDelete.fullName && state.userToDelete.fullName !== 'null') || (state.userToDelete.name && state.userToDelete.name !== 'null')) ? (state.userToDelete.fullName || state.userToDelete.name) : "-"}</span>
              {state.userToDelete && state.userToDelete.email && !state.userToDelete.email.startsWith('nullified_') && (
                <span className="text-gray-500"> ({state.userToDelete.email})</span>
              )}
            </p>
          </div>
        </div>
      </Modal>

      <RejectionModal
        show={state.showRejectionModal}
        onClose={() => setState(prev => ({ 
          ...prev, 
          showRejectionModal: false,
          verificationAction: null,
          selectedRejectionReason: '',
          rejectionNotes: ''
        }))}
        user={state.verificationAction?.user}
        onContinue={(reason, notes) => setState(prev => ({
          ...prev,
          showRejectionModal: false,
          showConfirmRejectionModal: true,
          selectedRejectionReason: reason,
          rejectionNotes: notes
        }))}
        loading={state.isUpdating}
      />

      <ConfirmRejectionModal
        show={state.showConfirmRejectionModal}
        onClose={() => setState(prev => ({ 
          ...prev, 
          showConfirmRejectionModal: false 
        }))}
        user={state.verificationAction?.user}
        onConfirm={handleRejectUser}
        loading={state.isUpdating}
        rejectionReason={state.selectedRejectionReason}
        adminNotes={state.rejectionNotes}
      />

    </div>
  );
};

export default Users;