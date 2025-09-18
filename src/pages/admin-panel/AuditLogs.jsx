import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {FiX} from "react-icons/fi";
import { Search, Shield, Eye, Calendar, User, Activity, Hash, Briefcase, Clock, AlertTriangle, Info, Tag, ChevronDown, FileText } from "lucide-react";
import { BASE_URL } from "../../config";

// Helper function to format keys into user-friendly labels
const formatLabel = (key) => {
  if (!key) return '';
  return key
    .replace(/_/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Reusable Stat Card component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

// Reusable Action Badge component with color coding
const ActionBadge = ({ action }) => {
  const getActionColor = () => {
    if (action.includes('CREATE') || action.includes('APPROVE') || action.includes('LINK')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE') || action.includes('UPLOAD') || action.includes('RESTORE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETE') || action.includes('REJECT') || action.includes('ARCHIVE') || action.includes('UNLINK')) return 'bg-red-100 text-red-800';
    if (action.includes('RESET')) return 'bg-yellow-100 text-yellow-800';
    if (action.includes('RETRY_REJECTION_EMAIL_NULLIFIED')) return 'bg-orange-100 text-orange-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getActionColor()}`}>
      {formatLabel(action)}
    </span>
  );
};

// Reusable FilterSelect component matching Users component style
const FilterSelect = ({ value, onChange, options, placeholder, className = "" }) => (
  <div className={`relative ${className}`}>
    <select
      className="p-2 border bg-white border-gray-300 rounded-md shadow-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
      <ChevronDown className="text-gray-500 w-4 h-4" />
    </div>
  </div>
);

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
  const [itemsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${BASE_URL}/api/audit-logs`, {
          headers: { Authorization: `Bearer ${token}` },
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

  // Memoize filtered logs and derived data for performance
  const { filteredLogs, actionTypes, uniqueUsers, stats } = useMemo(() => {
    const filtered = logs.filter(log => {
        const actorEmail = log.actor?.email?.toLowerCase() || "";
        const details = log.details?.toLowerCase() || "";
        const action = log.action?.toLowerCase() || "";
        const matchesSearch = searchTerm === "" || details.includes(searchTerm.toLowerCase()) || actorEmail.includes(searchTerm.toLowerCase()) || action.includes(searchTerm.toLowerCase());
        const matchesAction = selectedAction === "" || log.action === selectedAction;
        const matchesUser = selectedUser === "" || log.actor?.email === selectedUser;
        const logDate = new Date(log.createdAt);
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        const toDate = dateRange.to ? new Date(dateRange.to) : null;
        if (toDate) toDate.setHours(23, 59, 59, 999);
        const matchesDateRange = (!fromDate || logDate >= fromDate) && (!toDate || logDate <= toDate);
        return matchesSearch && matchesAction && matchesUser && matchesDateRange;
    });

    const types = [...new Set(logs.map(log => log.action))].sort();
    const users = [...new Set(logs.map(log => log.actor?.email || 'Unknown Actor'))].sort();
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const logsLast24h = logs.filter(log => new Date(log.createdAt) > twentyFourHoursAgo).length;

    return { filteredLogs: filtered, actionTypes: types, uniqueUsers: users, stats: { logsLast24h } };
  }, [logs, searchTerm, selectedAction, selectedUser, dateRange]);

  // Prepare options for filter selects
  const actionOptions = actionTypes.map(action => ({
    value: action,
    label: formatLabel(action)
  }));

  const userOptions = uniqueUsers.map(user => ({
    value: user,
    label: user
  }));

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };
  
  const DetailModal = ({ log, onClose }) => {
    if (!log) return null;
    
    const renderLogField = (label, value) => (
        <div className="grid grid-cols-3 gap-2 text-sm">
            <span className="text-slate-500 col-span-1">{label}:</span>
            <strong className="text-slate-800 break-words col-span-2">{value || 'N/A'}</strong>
        </div>
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
           <div className="px-6 py-4 bg-green-500 rounded-t-xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white">Event Details</h3>
                  <ActionBadge action={log.action} />
              </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
         <FiX className="w-5 h-5" />
         </button>
          </div>
          <div className="p-6 space-y-6 overflow-y-auto">
             <div className="p-4 bg-white border rounded-lg shadow-sm">
                <h4 className="font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2"><User className="w-5 h-5 text-blue-500"/>Actor Information</h4>
                <div className="space-y-2">
                    {renderLogField('Email', log.actor?.email)}
                    {renderLogField('Role', log.actor?.role ? formatLabel(log.actor.role) : 'N/A')}
                </div>
             </div>
             <div className="p-4 bg-white border rounded-lg shadow-sm">
                <h4 className="font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2"><Briefcase className="w-5 h-5 text-green-500"/>Target Resource</h4>
                <div className="space-y-2">
                    {renderLogField('Type', log.target?.model)}
                    {renderLogField('Name / ID', log.target?.displayText || log.target?.id)}
                </div>
             </div>
             <div className="p-4 bg-white border rounded-lg shadow-sm">
                <h4 className="font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2"><Info className="w-5 h-5 text-purple-500"/>Event Summary</h4>
                <div className="space-y-2">
                    {renderLogField('Timestamp', formatTimestamp(log.createdAt))}
                    {renderLogField('Action', formatLabel(log.action))}
                </div>
                <div className="mt-4">
                    <p className="text-slate-500 text-sm mb-1">Description:</p>
                    <p className="text-slate-800 bg-slate-100 p-3 rounded-md text-sm">{log.details || 'No additional details provided.'}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
      return <div className="p-6 text-center text-slate-600">Loading audit logs...</div>;
  }

  if (error) {
      return <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg flex items-center justify-center gap-2 border border-red-200"><AlertTriangle className="w-5 h-5"/>{error}</div>;
  }

  return (
    <div className="p-6 bg-[#F5F5F5] min-h-screen">
      <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Audit Logs</h1>
          <p className="text-slate-600 mt-1">Monitor and track all system activities and user actions.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <StatCard title="Total Events Logged" value={logs.length} icon={<FileText className="w-6 h-6 text-blue-500" />} color="bg-blue-100" />
          <StatCard title="Unique Actors" value={uniqueUsers.length} icon={<User className="w-6 h-6 text-green-500"/>} color="bg-green-100"/>
          <StatCard title="Events in Last 24 Hours" value={stats.logsLast24h} icon={<Clock className="w-6 h-6 text-yellow-500"/>} color="bg-yellow-100"/>
      </div>

      {/* Updated Filter Section with Users component style */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text" 
              placeholder="Search details, user, action..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          {/* Action Filter with Users component style */}
          <FilterSelect
            value={selectedAction}
            onChange={setSelectedAction}
            options={actionOptions}
            placeholder="All Actions"
            className="min-w-[180px]"
          />
          
          {/* User Filter with Users component style */}
          <FilterSelect
            value={selectedUser}
            onChange={setSelectedUser}
            options={userOptions}
            placeholder="All Users"
            className="min-w-[180px]"
          />
          
          {/* Date Range Filter */}
          <div className="flex flex-col sm:flex-row gap-2 items-center min-w-0">
            <input 
              type="date" 
              value={dateRange.from} 
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))} 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 min-w-0"
            />
                        <span className="text-slate-500">-</span>
                        <input 
              type="date" 
              value={dateRange.to} 
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))} 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 min-w-0"
/>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actor</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Target</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatTimestamp(log.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">
                    <div className="flex items-center">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs mr-3">
                        {log.actor?.email?.substring(0, 2).toUpperCase() || '??'}
                      </div>
                      {log.actor?.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {log.target?.displayText || log.target?.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-blue-600 hover:text-blue-800 flex items-center justify-end gap-1 group"
                    >
                      <Eye className="h-4 w-4 group-hover:scale-105 transition-transform" /> View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                  <h3 className="text-lg font-semibold mb-2">No Logs Found</h3>
                  <p>No audit logs were found matching the current filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        </div>
        
        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <div className="text-sm text-slate-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Sliding window of 3 pages */}
              {Array.from({ length: 3 }, (_, i) => {
                let pageNum = currentPage - 1 + i;

                // Adjust for edges
                if (currentPage === 1) pageNum = i + 1;
                if (currentPage === 2) pageNum = i + 1;
                if (currentPage === totalPages) pageNum = totalPages - 2 + i;
                if (currentPage === totalPages - 1) pageNum = totalPages - 2 + i;

                // Make sure pageNum stays in range
                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      currentPage === pageNum
                        ? "bg-green-600 text-white border-green-600"
                        : "border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
         )}
      </div>

      <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};

export default AuditLogs;