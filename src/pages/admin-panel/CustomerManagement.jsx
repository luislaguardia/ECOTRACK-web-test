import React, { useState, useEffect } from "react";
import { FiSearch, FiUpload, FiX, FiFile, FiRefreshCw, FiArrowRight, FiArrowLeft  } from "react-icons/fi";
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
    <div className="min-h-screen bg-[#F5F5F5] p-3 sm:p-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Customer Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {filtered.length} {filtered.length === 1 ? 'account' : 'accounts'}
          </p>
        </div>
        
        {/* Refresh Button - Better positioning on mobile */}
        <button
          onClick={fetchBatelecAccounts}
          disabled={isDataLoading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
        >
          <FiRefreshCw className={`w-4 h-4 ${isDataLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Global Message Display - Improved mobile layout */}
      {message && (
        <div className={`mb-4 p-3 sm:p-4 rounded-lg border ${
          messageType === "error" 
            ? "bg-red-50 border-red-200 text-red-800" 
            : "bg-green-50 border-green-200 text-green-800"
        }`}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm sm:text-base">{message}</span>
              {messageType === "error" && uploadErrors.length > 0 && (
                <button
                  onClick={() => setShowErrorModal(true)}
                  className="text-xs bg-red-200 hover:bg-red-300 text-red-800 px-2 py-1 rounded transition-colors self-start"
                >
                  View Details
                </button>
              )}
            </div>
            <button 
              onClick={() => {setMessage(""); setMessageType("");}}
              className="text-gray-400 hover:text-gray-600 self-end sm:self-auto"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Search and Upload Section - Enhanced responsive layout */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-4">
        {/* Search Input - Full width on mobile, constrained on desktop */}
        <div className="relative w-full lg:w-[400px]">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 pl-10 border border-gray-400 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter w-full text-sm"
          />
        </div>

        {/* Upload Button */}
        <button
          onClick={handleDropboxUpload}
          className="bg-green-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full lg:w-auto"
        >
          <FiUpload className="w-4 h-4" />
          <span className="font-medium">Upload CSV</span>
        </button>
      </div>

      {/* Loading State */}
      {isDataLoading ? (
        <div className="flex justify-center items-center h-[300px] sm:h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading BATELEC accounts...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Table Container - Enhanced scrolling */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Scroll hint for mobile */}
            <div className="lg:hidden bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center">
              <div className="flex items-center justify-center text-xs text-yellow-700">
                <FiArrowRight className="mr-1 w-3 h-3" />
                <span>Scroll right to view all columns</span>
                <FiArrowLeft className="ml-1 w-3 h-3" />
              </div>
            </div>

            <div 
              className="table-scroll-container overflow-x-auto"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                maxHeight: filtered.length > 10 ? '70vh' : 'none'
              }}
            >
              <table className="min-w-full" style={{ minWidth: '1200px' }}>
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap min-w-[120px]">
                      Account No.
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap min-w-[150px]">
                      Customer Name
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap min-w-[120px]">
                      Barangay
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap min-w-[100px]">
                      Meter No.
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap min-w-[100px]">
                      Previous kWh
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap min-w-[100px]">
                      Current kWh
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap min-w-[90px]">
                      Total kWh
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap min-w-[110px]">
                      Reading Date
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap min-w-[120px]">
                      Consumer Type
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap min-w-[130px]">
                      Tracking Period
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length > 0 ? (
                    filtered.map((account) => (
                      <tr key={account._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap text-sm">
                          {account.accountNumber || '-'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm">
                          {account.customerName || '-'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm">
                          {account.barangay || account.address || '-'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm">
                          {account.meterNumber || '-'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm">
                          {account.latestReading?.previousReading || '-'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm">
                          {account.latestReading?.currentReading || '-'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm">
                          {account.latestReading?.totalMonthlyKwh || '-'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm">
                          {formatDate(account.latestReading?.readingDate)}
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap capitalize text-sm">
                          {account.consumerType || 'residential'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm">
                          {account.latestReading?.trackingPeriod || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center">
                        {batelecAccounts.length === 0 ? (
                          <div className="flex flex-col items-center">
                            <FiFile className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-500 mb-2">No BATELEC accounts available</p>
                            <p className="text-sm text-gray-400">Upload a CSV file to get started</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <FiSearch className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-500 mb-2">No results found</p>
                            <p className="text-sm text-gray-400">Try adjusting your search terms</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Desktop scroll indicator - only show when there are results */}
          {filtered.length > 0 && (
            <div className="hidden lg:flex justify-center mt-3">
              <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <FiArrowRight className="mr-1 w-3 h-3" />
                <span>Use horizontal scroll or arrow keys to navigate table</span>
                <FiArrowLeft className="ml-1 w-3 h-3" />
              </div>
            </div>
          )}
        </>
      )}

      {/* Upload Modal - Enhanced responsive design */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-green-600 py-4 px-6 text-white font-semibold rounded-t-lg flex justify-between items-center">
              <span className="text-lg">Upload Energy Readings CSV</span>
              <button
                onClick={handleModalClose}
                className="text-white hover:text-gray-200 transition-colors p-1"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
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
                  className={`inline-block px-6 py-3 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 font-medium ${
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
                    <p className="font-mono text-xs bg-white px-2 py-1 rounded border overflow-x-auto">
                      accountNumber, customerName, barangay, contactNumber, meterNumber, previousReading, currentReading, totalkWh, readingDate, consumerType, trackingPeriod
                    </p>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="font-medium">Required fields:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li><strong>accountNumber:</strong> BATELEC account number</li>
                      <li><strong>customerName:</strong> Name of the customer</li>
                      <li><strong>barangay:</strong> Barangay location of the customer</li>
                      <li><strong>contactNumber:</strong> Customer's contact number</li>
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

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full px-4 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Download CSV Template
                </button>
                
                <button
                  onClick={handleModalClose}
                  className="w-full px-4 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Details Modal - Enhanced responsive design */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col">
            <div className="bg-red-600 py-4 px-6 text-white font-semibold rounded-t-lg flex justify-between items-center">
              <span className="text-lg">Upload Errors ({uploadErrors.length} errors)</span>
              <button
                onClick={() => setShowErrorModal(false)}
                className="text-white hover:text-gray-200 transition-colors p-1"
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
                          <p className="text-sm text-gray-800 font-medium break-words">{error}</p>
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
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
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