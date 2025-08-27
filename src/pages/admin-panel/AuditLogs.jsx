import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, Calendar, User, Activity, Shield, AlertTriangle } from "lucide-react";

const AuditLogs = () => {
  const storedInfo = JSON.parse(localStorage.getItem("adminInfo"));
  
  // States for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState(null);
  
  // Auto redirect non-superadmin - implement with your router
  // if (storedInfo?.role !== "superadmin") {
  //   return <Navigate to="/dashboard" />;
  // }

  // Placeholder data - replace with actual API call
  const mockAuditLogs = [
    {
      id: 1,
      timestamp: "2025-01-15T10:30:00Z",
      user: "admin@example.com",
      action: "USER_CREATED",
      resource: "User Management",
      details: "Created new user: john.doe@example.com",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
      status: "SUCCESS",
      severity: "INFO"
    },
    {
      id: 2,
      timestamp: "2025-01-15T09:15:00Z",
      user: "admin@example.com",
      action: "LOGIN_ATTEMPT",
      resource: "Authentication",
      details: "Failed login attempt",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0...",
      status: "FAILED",
      severity: "WARNING"
    },
    {
      id: 3,
      timestamp: "2025-01-15T08:45:00Z",
      user: "superadmin@example.com",
      action: "SYSTEM_CONFIG_CHANGED",
      resource: "System Settings",
      details: "Updated security settings",
      ipAddress: "192.168.1.102",
      userAgent: "Mozilla/5.0...",
      status: "SUCCESS",
      severity: "HIGH"
    },
    {
      id: 4,
      timestamp: "2025-01-14T16:20:00Z",
      user: "admin@example.com",
      action: "USER_DELETED",
      resource: "User Management",
      details: "Deleted user: inactive.user@example.com",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
      status: "SUCCESS",
      severity: "CRITICAL"
    },
    {
      id: 5,
      timestamp: "2025-01-14T14:10:00Z",
      user: "moderator@example.com",
      action: "DATA_EXPORT",
      resource: "Data Management",
      details: "Exported user data for compliance audit",
      ipAddress: "192.168.1.103",
      userAgent: "Mozilla/5.0...",
      status: "SUCCESS",
      severity: "INFO"
    }
  ];

  // Action types for filter dropdown
  const actionTypes = [
    "USER_CREATED", "USER_UPDATED", "USER_DELETED", "LOGIN_ATTEMPT",
    "LOGOUT", "PASSWORD_CHANGED", "SYSTEM_CONFIG_CHANGED", "DATA_EXPORT",
    "DATA_IMPORT", "PERMISSION_CHANGED", "SECURITY_ALERT"
  ];

  // Get unique users for filter
  const uniqueUsers = [...new Set(mockAuditLogs.map(log => log.user))];

  // Filter logs based on search and filters
  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = selectedAction === "" || log.action === selectedAction;
    const matchesUser = selectedUser === "" || log.user === selectedUser;
    
    // Date range filter would be implemented here
    // const matchesDateRange = ...
    
    return matchesSearch && matchesAction && matchesUser;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "CRITICAL": return "text-red-600 bg-red-100";
      case "HIGH": return "text-orange-600 bg-orange-100";
      case "WARNING": return "text-yellow-600 bg-yellow-100";
      case "INFO": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SUCCESS": return "text-green-600 bg-green-100";
      case "FAILED": return "text-red-600 bg-red-100";
      case "PENDING": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const handleExport = () => {
    // Placeholder for export functionality
    console.log("Exporting audit logs...");
    alert("Export functionality will be implemented with backend integration");
  };

  const DetailModal = ({ log, onClose }) => {
    if (!log) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Audit Log Details</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Timestamp</label>
              <p className="text-sm text-gray-900">{formatTimestamp(log.timestamp)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">User</label>
              <p className="text-sm text-gray-900">{log.user}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Action</label>
              <p className="text-sm text-gray-900">{log.action}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Resource</label>
              <p className="text-sm text-gray-900">{log.resource}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(log.status)}`}>
                {log.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Severity</label>
              <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(log.severity)}`}>
                {log.severity}
              </span>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Details</label>
              <p className="text-sm text-gray-900">{log.details}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">IP Address</label>
              <p className="text-sm text-gray-900">{log.ipAddress}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">User Agent</label>
              <p className="text-sm text-gray-900 truncate" title={log.userAgent}>
                {log.userAgent}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Audit Logs
          </h1>
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Logs
          </button>
        </div>
        <p className="text-gray-600">Monitor and track all system activities and user actions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Actions</option>
            {actionTypes.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          {/* User Filter */}
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>

          {/* Date Range - Placeholder */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="From"
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="To"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
        </p>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {log.user}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-gray-400" />
                        {log.action}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No audit logs found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-700">per page</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal 
        log={selectedLog} 
        onClose={() => setSelectedLog(null)} 
      />
    </div>
  );
};

export default AuditLogs;