import React, { useState, useEffect } from "react";
import axios from "axios"; // Make sure to install axios: npm install axios
import { Search, Shield, Download, Eye, Calendar, User, Activity } from "lucide-react";
import { BASE_URL } from "../../config"; // Assuming you have a config file for your base URL

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${BASE_URL}/api/audit-logs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
        setError("Failed to load audit logs. You may not have permission to view this page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [token]);

  // Dynamically get action types and users from the logs for filtering
  const actionTypes = [...new Set(logs.map(log => log.action))].sort();
  const uniqueUsers = [...new Set(logs.map(log => log.actor?.email || 'Unknown Actor'))].sort();

  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    const actorEmail = log.actor?.email?.toLowerCase() || "";
    const details = log.details?.toLowerCase() || "";
    const action = log.action?.toLowerCase() || "";

    const matchesSearch = searchTerm === "" ||
      details.includes(searchTerm.toLowerCase()) ||
      actorEmail.includes(searchTerm.toLowerCase()) ||
      action.includes(searchTerm.toLowerCase());
    
    const matchesAction = selectedAction === "" || log.action === selectedAction;
    const matchesUser = selectedUser === "" || log.actor?.email === selectedUser;
    
    // Date range filter logic
    const logDate = new Date(log.createdAt);
    const fromDate = dateRange.from ? new Date(dateRange.from) : null;
    const toDate = dateRange.to ? new Date(dateRange.to) : null;
    if (fromDate) fromDate.setHours(0, 0, 0, 0); // Start of the day
    if (toDate) toDate.setHours(23, 59, 59, 999);   // End of the day

    const matchesDateRange = (!fromDate || logDate >= fromDate) && (!toDate || logDate <= toDate);
    
    return matchesSearch && matchesAction && matchesUser && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };
  
  const handleExport = () => {
    // This can be enhanced to generate a proper CSV from `filteredLogs`
    alert("Export functionality can be built here using the filtered data.");
  };

  const DetailModal = ({ log, onClose }) => {
    if (!log) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-xl font-semibold text-gray-800">Audit Log Details</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="md:col-span-2">
              <label className="block font-medium text-gray-600">Timestamp</label>
              <p className="text-gray-900">{formatTimestamp(log.createdAt)}</p>
            </div>
             <div className="bg-gray-50 p-3 rounded-lg md:col-span-2">
                <h4 className="font-semibold text-gray-700 mb-2">Actor</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block font-medium text-gray-600">Email</label>
                        <p className="text-gray-900">{log.actor?.email || 'N/A'}</p>
                    </div>
                     <div>
                        <label className="block font-medium text-gray-600">Role</label>
                        <p className="text-gray-900 capitalize">{log.actor?.role || 'N/A'}</p>
                    </div>
                </div>
            </div>
             <div className="bg-gray-50 p-3 rounded-lg md:col-span-2">
                <h4 className="font-semibold text-gray-700 mb-2">Action</h4>
                <div className="grid grid-cols-2 gap-2">
                     <div>
                        <label className="block font-medium text-gray-600">Action Type</label>
                        <p className="text-gray-900 font-mono bg-gray-200 px-2 py-1 rounded inline-block">{log.action}</p>
                    </div>
                </div>
            </div>
             <div className="bg-gray-50 p-3 rounded-lg md:col-span-2">
                <h4 className="font-semibold text-gray-700 mb-2">Target</h4>
                <div className="grid grid-cols-2 gap-2">
                     <div>
                        <label className="block font-medium text-gray-600">Resource Type</label>
                        <p className="text-gray-900">{log.target?.model || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block font-medium text-gray-600">Resource Name/ID</label>
                        <p className="text-gray-900 break-all">{log.target?.displayText || log.target?.id || 'N/A'}</p>
                    </div>
                </div>
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium text-gray-600">Details</label>
              <p className="text-gray-900 bg-gray-100 p-2 rounded-md">{log.details}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
      return <div className="p-6 text-center">Loading audit logs...</div>;
  }

  if (error) {
      return <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg">{error}</div>;
  }


  return (
<div className="p-6 bg-gray-50 min-h-screen max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Audit Logs
          </h1>
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Logs
          </button>
        </div>
        <p className="text-gray-600">Monitor and track all system activities and user actions.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search details, user, action..."
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

          {/* Date Range */}
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
             <span className="text-gray-500">-</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredLogs.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
        </p>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatTimestamp(log.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            {log.actor?.email || 'N/A'}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                       <span className="font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.target?.model}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-sm truncate" title={log.details}>
                        {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-sm text-gray-500 text-center">
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

          <div className="flex items-center rounded-md shadow-sm">
             <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
             <span className="px-4 py-2 border-t border-b border-gray-300 bg-white text-sm">
                Page {currentPage} of {totalPages}
             </span>
             <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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