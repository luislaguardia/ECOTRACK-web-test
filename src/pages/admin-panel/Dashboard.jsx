import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import autoTable from "jspdf-autotable";
import { BASE_URL } from "../../config";

const Dashboard = () => {
  // --- State Management ---
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [verifiedUsers, setVerifiedUsers] = useState(0);
  const [totalNews, setTotalNews] = useState(0);
  const [usageData, setUsageData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // State to hold all user data for exports

  // Previous counts for growth calculation (initialized to 1 to prevent division by zero)
  const [prevTotalUsers, setPrevTotalUsers] = useState(1);
  const [prevVerifiedUsers, setPrevVerifiedUsers] = useState(1);
  const [prevTotalNews, setPrevTotalNews] = useState(1);

  // Export related states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState(null); // 'csv' or 'pdf'
  const [fileName, setFileName] = useState("dashboard_export");
  // const [showPreview, setShowPreview] = useState(false);
  // const [previewData, setPreviewData] = useState(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  // const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportProgress, setExportProgress] = useState(0); // State for export progress

  // --- Refs ---
  // Reference to the entire dashboard container for PDF capture
  const dashboardRef = useRef(null);
  // Reference to the export modal for temporary hiding during PDF capture
  const exportModalRef = useRef(null);
  // Reference to the main dashboard header
  const dashboardHeaderRef = useRef(null);

  // --- Pie Colors ---
  const COLORS = [
    "#119718", // green
    "#2D710E", // greener
    "#17594A", // darker green
    "#5D8C55", // green leaf
    "#8EAC50", // yellow green
    "#D3D04F", // yellow
  ];

  // --- Effects ---
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchUserCount(),
        fetchNewsCount(),
        fetchUsageData(),
        fetchDeviceData(),
        fetchAllUsers(),
      ]);
      setIsLoading(false);
    };
    fetchAll();
  }, []);

  // --- Helper Functions ---
  const getGrowth = (current, prev) => {
    if (prev <= 0) return current > 0 ? "+100%" : "0%";
    const diff = current - prev;
    const growth = (diff / prev) * 100;
    return `${diff >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
  };

  // --- Data Fetching Functions ---
  const fetchUserCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = res.data;
      const verified = users.filter((u) => u.isVerified).length;

      setTotalUsers(users.length);
      setVerifiedUsers(verified);
      setPrevTotalUsers(Math.max(users.length - Math.floor(users.length * 0.1), 1));
      setPrevVerifiedUsers(Math.max(verified - Math.floor(verified * 0.05), 1));
    } catch (err) {
      console.error("Error fetching user counts:", err);
      setExportError("Failed to load user data.");
    }
  };

  const fetchNewsCount = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/news`);
      setTotalNews(res.data.length);
      setPrevTotalNews(Math.max(res.data.length - Math.floor(res.data.length * 0.15), 1));
    } catch (err) {
      console.error("Error fetching news counts:", err);
      setExportError("Failed to load news data.");
    }
  };

  const fetchUsageData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/plugs/energy/monthly`);
      const sorted = (res.data.usage || []).sort(
        (a, b) => new Date(`${a.month} 1`) - new Date(`${b.month} 1`)
      );
      setUsageData(sorted);
    } catch (err) {
      console.error("Error fetching usage data:", err);
      setExportError("Failed to load energy usage data.");
    }
  };

  const fetchDeviceData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/plugs/appliance-stats`);
      const rawData = Object.entries(res.data).map(([name, value]) => ({
        name,
        value,
      }));

      const sorted = rawData.sort((a, b) => b.value - a.value);

      const topFive = sorted.slice(0, 5);
      const othersTotal = sorted.slice(5).reduce((acc, item) => acc + item.value, 0);

      const finalTopFive = topFive.map((item) =>
        item.name.toLowerCase() === "unknown" ? { ...item, name: "Others" } : item
      );

      if (othersTotal > 0 || rawData.some((item) => item.name.toLowerCase() === "unknown")) {
        finalTopFive.push({ name: "Other Devices", value: othersTotal }); }
      
      setDeviceData(finalTopFive);
    } catch (err) {
      console.error("Error fetching device data:", err);
      setExportError("Failed to load device distribution data.");
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(res.data);
    } catch (err) {
      console.error("Error fetching all users:", err);
      setExportError("Failed to load full user list for export.");
    }
  };

  const handleExportClick = (type) => {
    setExportType(type);
    setFileName(`dashboard_export_${new Date().toISOString().split('T')[0]}`);
    setShowExportModal(true);
    setExportError(null);
    setExportProgress(0);
  };


  const performExport = async () => {
    try {
      setExportError(null);
      setShowExportModal(false);
  
      if (exportType === "csv") {
        exportCSV();
      } else if (exportType === "pdf") {
        setIsExportingPDF(true);
        await exportPDF();
      }
    } catch (error) {
      console.error("Export failed:", error);
      setExportError(`Export failed: ${error.message}`);
    } finally {
      setIsExportingPDF(false);
    }
  };
  
  const exportCSV = () => {
    const generalData = [
      ["Metric", "Value"],
      ["Total Users", totalUsers],
      ["Verified Users", verifiedUsers],
      ["Total News Posted", totalNews],
    ];

    const userData = [
      [],
      ["User List"],
      ["UserID", "Name", "Email", "Location", "Status"],
      ...allUsers.map((u) => [
        u._id,
        u.name,
        u.email,
        u.barangay || "N/A",
        u.isVerified ? "Active" : "Inactive",
      ]),
    ];

    const data = [...generalData, ...userData];
    const csv = data.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



// const exportPDF = async () => {
//   try {
//     setExportProgress(5);
//     const doc = new jsPDF("p", "mm", "a4");
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();

//     // Page 1 - Title and Dashboard
//     const title = "Batelec I Nasugbu Report";
//     doc.setFontSize(20);
//     const titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
//     doc.text(title, (pageWidth - titleWidth) / 2, 20);

//     const dateText = `Generated on: ${new Date().toLocaleDateString()}`;
//     doc.setFontSize(12);
//     const dateWidth = doc.getStringUnitWidth(dateText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
//     doc.text(dateText, (pageWidth - dateWidth) / 2, 30);

//     doc.setFontSize(16);
//     doc.text("Dashboard Overview", 14, 45);

//     setExportProgress(10);

//     if (!dashboardRef.current) throw new Error("Dashboard reference not found for PDF export.");

//     // Temporarily hide elements before rendering
//     const elementsToHide = [];
//     if (dashboardHeaderRef.current) elementsToHide.push(dashboardHeaderRef.current);
//     dashboardRef.current.querySelectorAll('.export-button').forEach(el => elementsToHide.push(el));
//     elementsToHide.forEach(el => el.style.visibility = 'hidden');

//     await new Promise((r) => setTimeout(r, 500));
//     setExportProgress(15);

//     const dashboardCanvas = await html2canvas(dashboardRef.current, {
//       scale: 2,
//       useCORS: true,
//       allowTaint: false,
//       backgroundColor: "#f5f5f5",
//       scrollX: 0,
//       scrollY: 0,
//       windowWidth: dashboardRef.current.scrollWidth,
//       windowHeight: dashboardRef.current.scrollHeight,
//       width: dashboardRef.current.scrollWidth,
//       height: dashboardRef.current.scrollHeight,
//       onclone: (clonedDoc) => {
//         const allElements = clonedDoc.querySelectorAll("*");
      
//         allElements.forEach((el) => {
//           const computed = window.getComputedStyle(el);
      
//           if (computed.backgroundColor.includes("oklch")) {
//             el.style.backgroundColor = "#ffffff"; // or a fallback color
//           }
      
//           if (computed.color.includes("oklch")) {
//             el.style.color = "#000000";
//           }
      
//           if (computed.borderColor.includes("oklch")) {
//             el.style.borderColor = "#d1d5db";
//           }
      
//           el.style.transform = "none";
//           el.style.animation = "none";
//           el.style.transition = "none";
//         });
//       },
//       ignoreElements: (el) => el.closest('.export-modal-container') !== null,
//     });

//     elementsToHide.forEach(el => el.style.visibility = '');
//     setExportProgress(50);

//     if (!dashboardCanvas.width || !dashboardCanvas.height) {
//       throw new Error("Dashboard capture failed - canvas is empty.");
//     }

//     const dashboardImg = dashboardCanvas.toDataURL("image/jpeg", 0.9);
//     const maxWidth = pageWidth - 20;
//     const maxHeight = pageHeight - 60;
//     let imgWidth = maxWidth;
//     let imgHeight = (dashboardCanvas.height * imgWidth) / dashboardCanvas.width;

//     if (imgHeight > maxHeight) {
//       imgHeight = maxHeight;
//       imgWidth = (dashboardCanvas.width * imgHeight) / dashboardCanvas.height;
//     }

//     doc.addImage(dashboardImg, "JPEG", (pageWidth - imgWidth) / 2, 50, imgWidth, imgHeight);
//     setExportProgress(70);

//     // Page 2 - User Data Table
//     if (allUsers && allUsers.length > 0) {
//       doc.addPage();
//       doc.setFontSize(16);
//       doc.text("User Data Overview", 14, 20);

//       const tableData = allUsers.map((u) => [
//         u._id?.substring(0, 8) || "N/A",
//         u.name || "N/A",
//         u.email?.length > 35 ? u.email.substring(0, 32) + "..." : u.email || "N/A",
//         u.barangay || "N/A",
//         u.isVerified ? "Verified" : "Unverified",
//       ]);

//       autoTable(doc, {
//         head: [["ID", "Name", "Email", "Barangay", "Status"]],
//         body: tableData,
//         startY: 30,
//         styles: {
//           fontSize: 8,
//           cellPadding: 2.5,
//         },
//         headStyles: {
//           fillColor: [34, 197, 94],
//           textColor: 255,
//           fontSize: 9,
//         },
//         alternateRowStyles: {
//           fillColor: [248, 250, 252],
//         },
//         columnStyles: {
//           0: { cellWidth: 20 },
//           1: { cellWidth: 40 },
//           2: { cellWidth: 60 },
//           3: { cellWidth: 35 },
//           4: { cellWidth: 25 },
//         },
//         margin: { left: 14, right: 14 },
//         didDrawPage: () => {
//           if (allUsers.length > 100) {
//             doc.setFontSize(10);
//             doc.text(`Note: Total users: ${allUsers.length}`, 14, doc.internal.pageSize.getHeight() - 10);
//           }
//         },
//       });
//     }

//     setExportProgress(100);
//     doc.save(`${fileName || 'dashboard_report'}.pdf`);
//   } catch (error) {
//     console.error("Detailed PDF export error:", error);
//     setExportError(`PDF Export Failed: ${error.message}`);
//     throw error;
//   }
// };

const exportPDF = async () => {
  try {
    setExportProgress(5);
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Page 1 - Title and Dashboard
    const title = "Batelec I Nasugbu Report";
    doc.setFontSize(20);
    const titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    doc.text(title, (pageWidth - titleWidth) / 2, 20);

    const dateText = `Generated on: ${new Date().toLocaleDateString()}`;
    doc.setFontSize(12);
    const dateWidth = doc.getStringUnitWidth(dateText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    doc.text(dateText, (pageWidth - dateWidth) / 2, 30);

    doc.setFontSize(16);
    doc.text("Dashboard Overview", 14, 45);

    setExportProgress(10);

    if (!dashboardRef.current) throw new Error("Dashboard reference not found for PDF export.");

    // Temporarily hide elements before rendering
    const elementsToHide = [];
    if (dashboardHeaderRef.current) elementsToHide.push(dashboardHeaderRef.current);
    dashboardRef.current.querySelectorAll('.export-button').forEach(el => elementsToHide.push(el));
    elementsToHide.forEach(el => el.style.visibility = 'hidden');

    await new Promise((r) => setTimeout(r, 500));
    setExportProgress(15);

    const dashboardCanvas = await html2canvas(dashboardRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      windowWidth: dashboardRef.current.scrollWidth,
      windowHeight: dashboardRef.current.scrollHeight,
      width: dashboardRef.current.scrollWidth,
      height: dashboardRef.current.scrollHeight,
      onclone: (clonedDoc) => {
        const allElements = clonedDoc.querySelectorAll("*");
        allElements.forEach((el) => {
          const computed = window.getComputedStyle(el);
          if (computed.backgroundColor.includes("oklch")) el.style.backgroundColor = "#ffffff";
          if (computed.color.includes("oklch")) el.style.color = "#000000";
          if (computed.borderColor.includes("oklch")) el.style.borderColor = "#d1d5db";
          el.style.transform = "none";
          el.style.animation = "none";
          el.style.transition = "none";
        });
        clonedDoc.querySelectorAll(".export-button").forEach(el => (el.style.display = "none"));
      },
      ignoreElements: (el) => el.closest('.export-modal-container') !== null,
    });

    elementsToHide.forEach(el => el.style.visibility = '');
    setExportProgress(50);

    if (!dashboardCanvas.width || !dashboardCanvas.height) {
      throw new Error("Dashboard capture failed - canvas is empty.");
    }

    // Fit image below header (starts at y = 50), keep proportions
    const dashboardImg = dashboardCanvas.toDataURL("image/jpeg", 0.95);
    const availableHeight = pageHeight - 60; // leave margin under title
    const availableWidth = pageWidth - 20;

    const ratio = Math.min(availableWidth / dashboardCanvas.width, availableHeight / dashboardCanvas.height);
    const imgWidth = dashboardCanvas.width * ratio;
    const imgHeight = dashboardCanvas.height * ratio;

    const xOffset = (pageWidth - imgWidth) / 2;
    const yOffset = 50;

    doc.addImage(dashboardImg, "JPEG", xOffset, yOffset, imgWidth, imgHeight);
    setExportProgress(70);

    // Page 2 - User Data Table
    if (allUsers && allUsers.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text("User Data Overview", 14, 20);

      const tableData = allUsers.map((u) => [
        u._id?.substring(0, 8) || "N/A",
        u.name || "N/A",
        u.email?.length > 35 ? u.email.substring(0, 32) + "..." : u.email || "N/A",
        u.barangay || "N/A",
        u.isVerified ? "Verified" : "Unverified",
      ]);

      autoTable(doc, {
        head: [["ID", "Name", "Email", "Barangay", "Status"]],
        body: tableData,
        startY: 30,
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
        },
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: 255,
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 40 },
          2: { cellWidth: 60 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25 },
        },
        margin: { left: 14, right: 14 },
        didDrawPage: () => {
          if (allUsers.length > 100) {
            doc.setFontSize(10);
            doc.text(`Note: Total users: ${allUsers.length}`, 14, doc.internal.pageSize.getHeight() - 10);
          }
        },
      });
    }

    setExportProgress(100);
    doc.save(`${fileName || 'dashboard_report'}.pdf`);
  } catch (error) {
    console.error("Detailed PDF export error:", error);
    setExportError(`PDF Export Failed: ${error.message}`);
    throw error;
  }
};

  // --- Render ---
  return (
    // The dashboardRef is on the outermost div containing all dashboard content.
    <div ref={dashboardRef} className="bg-[#F5F5F5] p-6">
      {isLoading ? (
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
        </div>
      ) : (
        <>
          <div ref={dashboardHeaderRef} className="flex justify-between items-center mb-5 dashboard-header-for-pdf">
            <h2 className="text-3xl font-semibold font-inter text-gray-800">
              Dashboard Overview
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleExportClick("csv")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all font-inter shadow-md export-button"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExportClick("pdf")}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all font-inter shadow-md export-button"
              >
                Export PDF
              </button>
            </div>
          </div>

          {exportError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
              <strong className="font-bold">Export Error!</strong>
              <span className="block sm:inline ml-2">{exportError}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setExportError(null)}>
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.414l-2.651 2.651a1.2 1.2 0 1 1-1.697-1.697L8.586 10 5.935 7.349a1.2 1.2 0 1 1 1.697-1.697L10 8.586l2.651-2.651a1.2 1.2 0 1 1 1.697 1.697L11.414 10l2.651 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
              </span>
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-lg text-gray-500 font-inter">Total Users</h4>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-semibold text-gray-800 font-inter">{totalUsers}</span>
                <span className="text-green-600 font-semibold text-sm bg-green-100 px-2 py-1 rounded-full">
                  {getGrowth(totalUsers, prevTotalUsers)}
                </span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-lg text-gray-500 font-inter">Total News Posted</h4>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-semibold text-gray-800 font-inter">{totalNews}</span>
                <span className="text-green-600 font-semibold text-sm bg-green-100 px-2 py-1 rounded-full">
                  {getGrowth(totalNews, prevTotalNews)}
                </span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-lg text-gray-500 font-inter">Verified Users</h4>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-semibold text-gray-800 font-inter">{verifiedUsers}</span>
                <span className="text-green-600 font-semibold text-sm bg-green-100 px-2 py-1 rounded-full">
                  {getGrowth(verifiedUsers, prevVerifiedUsers)}
                </span>
              </div>
            </div>
          </div>

          {/* Charts */}
          
          {/* Charts */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="bg-white p-6 rounded-lg border flex-1 border-gray-200">
              <h4 className="text-xl font-semibold text-gray-700 mb-4 font-inter">
                Energy Usage Trends
              </h4>
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="kWh" stroke="#22c55e" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border w-full md:w-[35%] border-gray-200">
              <h4 className="text-xl font-semibold text-gray-700 mb-4 font-inter">Device Distribution</h4>
              <div className="w-full h-[300px] flex items-center justify-center mt-12">
                <ResponsiveContainer width="85%" height="110%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      label
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Export Modal */}
          {showExportModal && (
  <div
    ref={exportModalRef}
    className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm flex items-center justify-center z-50 export-modal-container"
  >
    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
      <div className="bg-green-600 rounded-t-lg py-3 px-6">
        <h3 className="text-lg font-semibold text-white">Export Dashboard Data</h3>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File Name
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter file name"
          />
          <p className="text-xs text-gray-500 mt-1">
            File will be saved as: {fileName}.{exportType}
          </p>
        </div>

        <p className="text-gray-700 mb-4">
          Export format: <strong>{exportType?.toUpperCase()}</strong>
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowExportModal(false)}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={performExport}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm"
            disabled={isExportingPDF}
          >
            {isExportingPDF ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Exporting... ({exportProgress}%)
              </div>
            ) : (
              "Export"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

          
          {/* Preview Modal */}


        </>
      )}
    </div>
  );
};

export default Dashboard;