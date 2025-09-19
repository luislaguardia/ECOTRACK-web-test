import React, { useState, useEffect } from "react";
import { FiSearch, FiUpload, FiX, FiFile, FiRefreshCw } from "react-icons/fi";
import axios from "axios";
import { BASE_URL } from "../../config";

const CustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [batelecAccounts, setBatelecAccounts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [uploadErrors, setUploadErrors] = useState([]); // Store detailed upload errors
  const [showErrorModal, setShowErrorModal] = useState(false); // Show error details modal

  // Fetch BATELEC accounts from backend
  const fetchBatelecAccounts = async () => {
    try {
      setIsDataLoading(true);
      const token = localStorage.getItem("token");
      
      const res = await axios.get(`${BASE_URL}/api/batelec/accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBatelecAccounts(res.data || []);
    } catch (err) {
      console.error("Error fetching BATELEC accounts:", err);
      showMessage(err.response?.data?.message || "Failed to fetch accounts", "error");
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchBatelecAccounts();
  }, []);

  // Filter data based on search term
  useEffect(() => {
    const searched = batelecAccounts.filter((account) =>
      Object.values(account).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFiltered(searched);
  }, [searchTerm, batelecAccounts]);

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Auto-hide upload status after 5 seconds
  useEffect(() => {
    if (uploadStatus && !uploadStatus.includes('Processing')) {
      const timer = setTimeout(() => {
        setUploadStatus("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadStatus]);

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
  };

  // Handle file upload to backend
  const handleFileUpload = async (file) => {
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setUploadStatus('Please upload a CSV file only.');
      showMessage('Please upload a CSV file only.', 'error');
      return;
    }

    setIsLoading(true);
    setUploadStatus('Processing file...');
    setUploadErrors([]); // Clear previous errors

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const token = localStorage.getItem("token");
      
      const response = await axios.post(`${BASE_URL}/api/batelec/upload-energy`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const { processed, errors } = response.data;
      
      if (errors && errors.length > 0) {
        setUploadErrors(errors); // Store detailed errors
        setUploadStatus(`Processed ${processed} records with ${errors.length} errors.`);
        showMessage(`Processed ${processed} records with ${errors.length} errors. Click to view details.`, 'error');
        console.warn('Upload errors:', errors);
      } else {
        setUploadErrors([]); // Clear any previous errors
        setUploadStatus(`Successfully uploaded ${processed} records.`);
        showMessage(`Successfully uploaded ${processed} records.`, 'success');
      }

      // Refresh the data
      setTimeout(() => {
        fetchBatelecAccounts();
        setIsModalOpen(false);
        setUploadStatus('');
      }, 1500);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error.response?.data?.message || 'Error uploading file. Please try again.';
      setUploadStatus(errorMsg);
      showMessage(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Handle file input
  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDropboxUpload = () => {
    setIsModalOpen(true);
    setUploadStatus('');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setUploadStatus('');
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Get registration status badge (commented out for future use)
  /*
  const getRegistrationBadge = (account) => {
    if (account.isRegistered && account.registeredUserId) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Registered
        </span>
      );
    }
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
        Available
      </span>
    );
  };
  */

  const handleDownloadTemplate = () => {
  const headers = [
    "accountNumber",
    "meterNumber",
    "customerName",
    "barangay",
    "contactNumber",
    "consumerType",
    "previousReading",
    "currentReading",
    "readingDate",
    "trackingPeriod",
  ];

  const csvContent = headers.join(",") + "\n"; // Just headers for the template
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "EnergyReadingsCSV_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-3xl font-semibold text-gray-800">
          Customer Management ({filtered.length})
        </h2>
        
        {/* Refresh Button */}
        <button
          onClick={fetchBatelecAccounts}
          disabled={isDataLoading}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${isDataLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Global Message Display */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg border ${
          messageType === "error" 
            ? "bg-red-50 border-red-200 text-red-800" 
            : "bg-green-50 border-green-200 text-green-800"
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>{message}</span>
              {messageType === "error" && uploadErrors.length > 0 && (
                <button
                  onClick={() => setShowErrorModal(true)}
                  className="text-xs bg-red-200 hover:bg-red-300 text-red-800 px-2 py-1 rounded transition-colors"
                >
                  View Details
                </button>
              )}
            </div>
            <button 
              onClick={() => {setMessage(""); setMessageType("");}}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Search and Upload Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap mb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-wrap">
          {/* Search Input */}
          <div className="relative w-full md:w-[400px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 pl-8 border border-gray-500 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-inter w-full"
            />
          </div>
        </div>

        {/* Right: Dropbox Button */}
        <button
          onClick={handleDropboxUpload}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 self-start md:self-auto flex items-center gap-2"
        >
          <FiUpload className="w-4 h-4" />
          Upload CSV
        </button>
      </div>

      {/* Loading State */}
      {isDataLoading ? (
        <div className="flex justify-center items-center h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading BATELEC accounts...</p>
          </div>
        </div>
      ) : (
        /* Table */
        <div
          className={`overflow-x-auto bg-white rounded-lg shadow border border-gray-200 ${
            filtered.length > 10 ? "max-h-[600px] overflow-y-auto" : ""
          }`}
        >
          <table className="min-w-full text-sm table-fixed">
            <thead className="bg-[#F5F5F5] border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Account No.</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Customer Name</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Barangay</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Meter No.</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Previous kWh</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Current kWh</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Total kWh</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Reading Date</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Consumer Type</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500">Tracking Period</th>
                {/* <th className="px-6 py-3 text-left font-bold text-gray-500">Status</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length > 0 ? (
                filtered.map((account) => (
                  <tr key={account._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{account.accountNumber || '-'}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{account.customerName || '-'}</div>
                        {account.registeredUserId && (
                          <div className="text-xs text-gray-500">
                            Registered to: {account.registeredUserId.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{account.barangay || account.address || '-'}</td>
                    <td className="px-6 py-4">{account.meterNumber || '-'}</td>
                    <td className="px-6 py-4">
                      {account.latestReading?.previousReading || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {account.latestReading?.currentReading || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {account.latestReading?.totalMonthlyKwh || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(account.latestReading?.readingDate)}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {account.consumerType || 'residential'}
                    </td>
                    <td className="px-6 py-4">
                      {account.latestReading?.trackingPeriod || '-'}
                    </td>
                 
                    {/* <td className="px-6 py-4">
                      {getRegistrationBadge(account)}
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    {batelecAccounts.length === 0 ? (
                      <div className="flex flex-col items-center">
                        <FiFile className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-400 mb-2">No BATELEC accounts available</p>
                        <p className="text-sm text-gray-400">Upload a CSV file to get started</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No results found for your search</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="bg-green-600 py-3 px-6 text-white font-semibold rounded-t-lg flex justify-between items-center">
              <span>Upload Energy Readings CSV</span>
              <button
                onClick={handleModalClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <FiUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">
                  Drop your CSV file here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                  id="csv-upload"
                  disabled={isLoading}
                />
                <label
                  htmlFor="csv-upload"
                  className={`inline-block px-4 py-2 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isLoading 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Choose File'}
                </label>
              </div>

              {uploadStatus && (
                <div className={`mt-4 p-3 rounded-lg text-sm border ${
                  uploadStatus.includes('Successfully') 
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : uploadStatus.includes('Error') || uploadStatus.includes('Please')
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                  <div className="flex justify-between items-center">
                    <span>{uploadStatus}</span>
                    <div className="flex items-center gap-2">
                      {uploadErrors.length > 0 && (
                        <button
                          onClick={() => setShowErrorModal(true)}
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                        >
                          View Details
                        </button>
                      )}
                      <button 
                        onClick={() => setUploadStatus("")}
                        className="text-current opacity-60 hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Processing file...</span>
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600">
                  <p className="mb-2 font-semibold text-gray-700">Expected CSV format:</p>
                  <div className="space-y-1">
                    <p className="font-mono text-xs bg-white px-2 py-1 rounded border">
                      accountNumber, customerName, meterNumber, previousReading, currentReading, totalkWh, readingDate, consumerType, trackingPeriod
                    </p>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="font-medium">Required fields:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li><strong>accountNumber:</strong> BATELEC account number</li>
                      <li><strong>customerName:</strong> Name of the customer</li>
                      <li><strong>meterNumber:</strong> Electricity meter number</li>
                      <li><strong>previousReading:</strong> Previous meter reading</li>
                      <li><strong>currentReading:</strong> Current meter reading</li>
                      <li><strong>totalkWh:</strong> Total kWh consumed</li>
                      <li><strong>readingDate:</strong> Date of reading (YYYY-MM-DD)</li>
                      <li><strong>consumerType:</strong> Type of consumer (e.g., Residential, Commercial)</li>
                      <li><strong>trackingPeriod:</strong> Tracking period (e.g., "January 2025")</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center gap-3">
              <button
                onClick={handleDownloadTemplate}
                className="w-full px-4 py-2 bg-yellow-500 text-white font-medium rounded-md hover:bg-yellow-600 transition-colors"
              >
                Download CSV File Template
              </button>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={handleModalClose}
                  className="w-full px-4 py-2 bg-gray-400 text-white font-medium rounded-md hover:bg-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Details Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col">
            <div className="bg-red-600 py-3 px-6 text-white font-semibold rounded-t-lg flex justify-between items-center">
              <span>Upload Errors ({uploadErrors.length} errors)</span>
              <button
                onClick={() => setShowErrorModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-hidden flex flex-col">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  The following rows had validation errors and were skipped during upload:
                </p>
              </div>

              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                <div className="max-h-96 overflow-y-auto">
                  {uploadErrors.map((error, index) => (
                    <div key={index} className="p-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 font-medium">{error}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> Make sure your CSV file includes all required fields: 
                  accountNumber, barangay (or address), previousReading, currentReading, readingDate, trackingPeriod.
                  Barangay must be one of the valid Nasugbu barangays.
                </p>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;