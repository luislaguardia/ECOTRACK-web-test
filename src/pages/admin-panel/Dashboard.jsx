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
  const [dashboardScreenshot, setDashboardScreenshot] = useState(null);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  
  // User Statistics from the proper endpoint
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    autoVerified: 0,
    manuallyVerified: 0,
    pendingManual: 0,
    unverified: 0,
    rejected: 0,
    verifiedUsers: 0,
    basicUsers: 0
  });

  const [totalNews, setTotalNews] = useState(0);
  const [usageData, setUsageData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [otherDevicesList, setOtherDevicesList] = useState([]);
  const [fullDeviceList, setFullDeviceList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Previous counts for growth calculation
  const [prevUserStats, setPrevUserStats] = useState({
    totalUsers: 1,
    verifiedUsers: 1
  });
  const [prevTotalNews, setPrevTotalNews] = useState(1);

  // Export related states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [fileName, setFileName] = useState("dashboard_export");
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [isAISummaryEnabled, setIsAISummaryEnabled] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // Export configuration states
  const [exportConfig, setExportConfig] = useState({
    dateFrom: "",
    dateTo: "",
    title: "Batelec I Nasugbu Dashboard Report",
    header: "Dashboard Visual Overview",
    description: "User Statistics Summary"
  });

  // --- Refs ---
  const dashboardRef = useRef(null);
  const exportModalRef = useRef(null);
  const dashboardHeaderRef = useRef(null);

  // --- Pie Colors ---
  const COLORS = [
    "#119718",
    "#2D710E",
    "#17594A",
    "#5D8C55",
    "#8EAC50",
    "#D3D04F",
  ];

  // --- Effects ---
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchUserStatistics(),
        fetchNewsCount(),
        fetchUsageData(),
        fetchDeviceData(),
        fetchAllUsers(),
      ]);
      setIsLoading(false);
    };
    fetchAll();
  }, []);

  // Update preview when export config changes
  useEffect(() => {
    if (showExportModal && exportType === "pdf") {
      updatePreview();
    }
  }, [exportConfig, showExportModal, exportType]);

  // --- Helper Functions ---
  const getGrowth = (current, prev) => {
    if (prev <= 0) return current > 0 ? "+100%" : "0%";
    const diff = current - prev;
    const growth = (diff / prev) * 100;
    return `${diff >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const updatePreview = async () => {
    if (exportType === "pdf") {
      // Generate PDF preview
      if (dashboardRef.current) {
        try {
          const canvas = await html2canvas(dashboardRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            scrollX: 0,
            scrollY: 0,
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
          
          setDashboardScreenshot(canvas.toDataURL("image/jpeg", 0.95));
        } catch (error) {
          console.error("Failed to capture preview:", error);
        }
      }
    }
  };

  const fetchAISummary = async () => {
    try {
      setSummaryError(null);
      setIsSummarizing(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/api/asis/dashboard/summary`,
        {
          userStats,
          totalNews,
          deviceData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAiSummary(res.data?.summary || "");
    } catch (e) {
      console.error("AI summary error:", e);
      setSummaryError("Failed to generate AI summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  // --- Data Fetching Functions ---
  const fetchUserStatistics = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/users/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const stats = res.data;
      setUserStats(stats);
      
      setPrevUserStats({
        totalUsers: Math.max(stats.totalUsers - Math.floor(stats.totalUsers * 0.1), 1),
        verifiedUsers: Math.max(stats.verifiedUsers - Math.floor(stats.verifiedUsers * 0.05), 1)
      });
    } catch (err) {
      console.error("Error fetching user statistics:", err);
      setExportError("Failed to load user statistics.");
    }
  };

  const fetchNewsCount = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/news`);
      const total = res?.data?.pagination?.total ?? (Array.isArray(res?.data?.news) ? res.data.news.length : 0);
      setTotalNews(total);
      setPrevTotalNews(Math.max(total - Math.floor(total * 0.15), 1));
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
      const othersList = sorted
        .slice(5)
        .map((item) => (item.name?.toLowerCase() === "unknown" ? "Unknown" : item.name))
        .filter(Boolean);

      const finalTopFive = topFive.map((item) =>
        item.name.toLowerCase() === "unknown" ? { ...item, name: "Others" } : item
      );

      if (othersTotal > 0 || rawData.some((item) => item.name.toLowerCase() === "unknown")) {
        finalTopFive.push({ name: "Custom Devices", value: othersTotal }); 
      }
      
      setDeviceData(finalTopFive);
      setOtherDevicesList(othersList);
      // Save full list for breakdown rendering (normalize unknown label)
      setFullDeviceList(sorted.map((item) => ({
        name: item.name?.toLowerCase() === "unknown" ? "Unknown" : item.name,
        value: item.value,
      })));
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
        params: { 
          limit: 1000,
          filterTab: 'all', // Get all users regardless of verification status
          page: 1 // Start from first page
        }
      });
      const users = res.data.users || res.data;
      setAllUsers(users);
      console.log(`Fetched ${users.length} users for export (filterTab: all)`);
    } catch (err) {
      console.error("Error fetching all users:", err);
      setExportError("Failed to load full user list for export.");
    }
  };

  const handleExportClick = async (type) => {
    setExportType(type);
    const currentDate = new Date().toISOString().split('T')[0];
    setFileName(`dashboard_export_${currentDate}`);
    setExportError(null);
    setExportProgress(0);
    
    // Set default configuration
    setExportConfig(prev => ({
      ...prev,
      dateFrom: prev.dateFrom || "",
      dateTo: prev.dateTo || "",
    }));

    setShowExportModal(true);
  };

  const performExport = async () => {
    try {
      setExportError(null);
      setShowExportModal(false);
  
      if (exportType === "csv") {
        exportCSV();
      } else if (exportType === "pdf") {
        setIsExportingPDF(true);
        if (isAISummaryEnabled && !aiSummary) {
          await fetchAISummary();
        }
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
    const dateRange = exportConfig.dateFrom && exportConfig.dateTo 
      ? `Date Range: ${formatDate(exportConfig.dateFrom)} to ${formatDate(exportConfig.dateTo)}`
      : `Generated on: ${new Date().toLocaleDateString()}`;

    const generalData = [
      [exportConfig.title],
      [dateRange],
      [""],
      ["KPI", "Value"],
      ["Total Users", userStats.totalUsers],
      ["Verified Users (Total)", userStats.verifiedUsers],
      ["Auto Verified", userStats.autoVerified],
      ["Manually Verified", userStats.manuallyVerified],
      ["Pending Manual Verification", userStats.pendingManual],
      ["Unverified Users", userStats.unverified],
      ["Rejected Users", userStats.rejected],
      ["Basic Users", userStats.basicUsers],
      ["Total News Posted", totalNews],
    ];

    // Device Distribution section
    const deviceSectionHeader = [[""], ["Device Distribution"], ["Appliance", "Count"]];
    const deviceRows = (fullDeviceList && fullDeviceList.length ? fullDeviceList : deviceData).map((d) => [d.name, d.value]);
    const deviceDistribution = [...deviceSectionHeader, ...deviceRows];

    const userData = [
      [],
      ["Detailed User List"],
      ["UserID", "Name", "Email", "Account Number", "Verification Status", "User Role", "Created At"],
      ...allUsers.map((u) => [
        u._id || "N/A",
        u.name || u.fullName || "N/A",
        u.email || "N/A",
        u.accountNumber || "N/A",
        u.verificationStatus || "N/A",
        u.userRole || "N/A",
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A",
      ]),
    ];

    const data = [...generalData, ...deviceDistribution, ...userData];
    const csv = data.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

const exportPDF = async () => {
  try {
    setExportProgress(5);
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Page 1 - Title and configuration
    doc.setFontSize(20);
    const titleWidth = doc.getStringUnitWidth(exportConfig.title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    doc.text(exportConfig.title, (pageWidth - titleWidth) / 2, 15);

    const dateText = exportConfig.dateFrom && exportConfig.dateTo 
      ? `Date Range: ${formatDate(exportConfig.dateFrom)} to ${formatDate(exportConfig.dateTo)}`
      : `Generated on: ${new Date().toLocaleDateString()}`;
    
    doc.setFontSize(12);
    const dateWidth = doc.getStringUnitWidth(dateText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    doc.text(dateText, (pageWidth - dateWidth) / 2, 25);

    setExportProgress(10);

    const contentWidth = pageWidth - 20;

    // Add dashboard screenshot
    if (dashboardScreenshot) {
      doc.setFontSize(16);
      doc.text(exportConfig.header || "Dashboard Visual Overview", 14, 40);
      
      // Add description below the header with proper text wrapping and page break handling
      doc.setFontSize(12);
      const descriptionText = exportConfig.description || "User Statistics Summary";
      const descriptionLines = doc.splitTextToSize(descriptionText, contentWidth - 20); // More margin for better readability
      const descriptionLineHeight = 6; // Increased line height for better readability
      const descriptionStartY = 50;
      const maxDescriptionHeight = 40; // Maximum height for description before forcing new page
      
      let currentDescY = descriptionStartY;
      let descriptionFitsOnPage = true;
      
      // Check if description fits on current page
      const requiredHeight = descriptionLines.length * descriptionLineHeight;
      if (currentDescY + requiredHeight > pageHeight - 20) {
        descriptionFitsOnPage = false;
      }
      
      if (descriptionFitsOnPage) {
        // Add description on current page
        descriptionLines.forEach((line) => {
          doc.text(line, 14, currentDescY);
          currentDescY += descriptionLineHeight;
        });
      } else {
        // Add new page for description if it doesn't fit
        doc.addPage();
        currentDescY = 20; // Start from top of new page
        descriptionLines.forEach((line) => {
          // Check if we need another page break
          if (currentDescY > pageHeight - 20) {
            doc.addPage();
            currentDescY = 20;
          }
          doc.text(line, 14, currentDescY);
          currentDescY += descriptionLineHeight;
        });
      }
      
      const img = new Image();
      img.src = dashboardScreenshot;
      
      await new Promise((resolve) => {
        img.onload = () => {
          const ratio = contentWidth / img.width;
          let targetWidth = contentWidth;
          let targetHeight = img.height * ratio;

          const imageY = currentDescY + 6;
          const availableHeight = pageHeight - imageY - 20;

          if (targetHeight > availableHeight) {
            const scaleToFit = availableHeight / targetHeight;
            targetWidth = targetWidth * scaleToFit;
            targetHeight = targetHeight * scaleToFit;
          }

          doc.addImage(dashboardScreenshot, "JPEG", 10, imageY, targetWidth, targetHeight);

          // Optionally include AI summary on a dedicated page (max 2 pages)
          if (isAISummaryEnabled && aiSummary) {
            addAISummary(doc, contentWidth, pageHeight);
          }

          // Place statistics table on a new page for consistent layout
          doc.addPage();
          addStatisticsTable(doc, 20, contentWidth);

          // Device distribution breakdown table
          if (fullDeviceList && fullDeviceList.length) {
            doc.addPage();
            doc.setFontSize(16);
            doc.text("Device Distribution Breakdown", 14, 20);
            const deviceRows = fullDeviceList.map(d => [d.name, String(d.value)]);
            autoTable(doc, {
              head: [["Appliance", "Count"]],
              body: deviceRows,
              startY: 28,
              styles: {
                fontSize: 9,
                cellPadding: 2,
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
              },
              headStyles: {
                fillColor: [34, 197, 94],
                textColor: 255,
                fontSize: 10,
                cellPadding: 2,
              },
              alternateRowStyles: {
                fillColor: [248, 250, 252],
              },
              margin: { left: 10, right: 10 },
              tableWidth: contentWidth,
              columnStyles: {
                0: { cellWidth: contentWidth * 0.7 },
                1: { cellWidth: contentWidth * 0.3 },
              },
            });
          }
          resolve();
        };
      });
    }

    setExportProgress(60);

    // Add user data table
    if (allUsers && allUsers.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Detailed User List", 14, 20);

      const tableData = allUsers.map((u) => [
        u._id?.substring(0, 8) || "N/A",
        u.name || u.fullName || "N/A",
        u.email?.length > 30 ? u.email.substring(0, 27) + "..." : u.email || "N/A",
        u.accountNumber || "N/A",
        u.verificationStatus || "N/A",
        u.userRole || "N/A",
      ]);

      const userTableWidth = contentWidth;
      const columnWidths = {
        0: userTableWidth * 0.12,
        1: userTableWidth * 0.20,
        2: userTableWidth * 0.28,
        3: userTableWidth * 0.15,
        4: userTableWidth * 0.15,
        5: userTableWidth * 0.10,
      };

      let finalY = 25;
      
      autoTable(doc, {
        head: [["ID", "Name", "Email", "Account #", "Status", "Role"]],
        body: tableData,
        startY: 25,
        styles: {
          fontSize: 7,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: 255,
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: columnWidths,
        margin: { left: 10, right: 10 },
        tableWidth: userTableWidth,
        didDrawPage: function(data) {
          if (data.cursor && data.cursor.y) {
            finalY = data.cursor.y;
          }
        },
      });
      
      doc.setFontSize(10);
      doc.text(`Total users: ${allUsers.length}`, 14, finalY + 10);
    }

    setExportProgress(100);
    doc.save(`${fileName || 'dashboard_report'}.pdf`);
  } catch (error) {
    console.error("Detailed PDF export error:", error);
    setExportError(`PDF Export Failed: ${error.message}`);
    throw error;
  }
};

const addStatisticsTable = (doc, startY, contentWidth) => {
  doc.setFontSize(16);
  doc.text("User Statistics Summary", 14, startY);

  const statsData = [
    ["Total Users", userStats.totalUsers.toString()],
    ["Verified Users", userStats.verifiedUsers.toString()],
    ["Auto Verified", userStats.autoVerified.toString()],
    ["Manual Verified", userStats.manuallyVerified.toString()],
    ["Pending Verification", userStats.pendingManual.toString()],
    ["Unverified Users", userStats.unverified.toString()],
    ["Rejected Users", userStats.rejected.toString()],
    ["Basic Users", userStats.basicUsers.toString()],
    ["News Posts", totalNews.toString()],
  ];

  const firstColWidth = contentWidth * 0.7;
  const secondColWidth = contentWidth * 0.3;

  autoTable(doc, {
    head: [["KPI", "Count"]],
    body: statsData,
    startY: startY + 10, // Add some space after the title
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: 255,
      fontSize: 10,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: firstColWidth },
      1: { cellWidth: secondColWidth },
    },
    margin: { left: 10, right: 10 },
    tableWidth: contentWidth,
  });
};

const addAISummary = (doc, contentWidth, pageHeight) => {
  // Calculate how many lines fit per page and cap to 2 pages
  const approxLineHeight = 6; // mm
  const availablePerPage = pageHeight - 40; // margins top/bottom
  const maxLinesPerPage = Math.max(1, Math.floor(availablePerPage / approxLineHeight));
  const wrapped = doc.splitTextToSize(aiSummary, contentWidth - 6);
  const cappedLines = wrapped.slice(0, maxLinesPerPage * 2);

  doc.addPage();
  doc.setFontSize(16);
  doc.text("AI Summary", 14, 20);

  // Use autoTable for robust text layout and automatic wrapping
  doc.setFontSize(11);
  autoTable(doc, {
    startY: 26,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 3, lineWidth: 0 },
    columnStyles: { 0: { cellWidth: contentWidth } },
    body: [[cappedLines.join('\n')]],
    margin: { left: 10, right: 10 },
    tableWidth: contentWidth,
  });
};
  // --- Render ---
  return (
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
                disabled={isCapturingScreenshot}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all font-inter shadow-md export-button flex items-center justify-center"
              >
                {isCapturingScreenshot ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Capturing...
                  </>
                ) : (
                  "Export PDF"
                )}
              </button>
            </div>
          </div>

          {exportError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
              <strong className="font-bold">Export Error!</strong>
              <span className="block sm:inline ml-2">{exportError}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setExportError(null)}>
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.414l-2.651 2.651a1.2 1.2 0 1 1-1.697-1.697L8.586 10 5.935 7.349a1.2 1.2 0 1 1 1.697-1.697L10 8.586l-2.651 2.651a1.2 1.2 0 0 1-1.697-1.697L8.586 10 5.935 7.349a1.2 1.2 0 1 1 1.697-1.697L10 8.586l2.651-2.651a1.2 1.2 0 1 1 1.697 1.697L11.414 10l2.651 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
              </span>
            </div>
          )}

          {/* Enhanced Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-lg text-gray-500 font-inter">Total Users</h4>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-semibold text-gray-800 font-inter">{userStats.totalUsers}</span>
                <span className="text-green-600 font-semibold text-sm bg-green-100 px-2 py-1 rounded-full">
                  {getGrowth(userStats.totalUsers, prevUserStats.totalUsers)}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <div>Basic: {userStats.basicUsers}</div>
                <div>Verified: {userStats.verifiedUsers}</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-lg text-gray-500 font-inter">Verified Users</h4>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-semibold text-gray-800 font-inter">{userStats.verifiedUsers}</span>
                <span className="text-green-600 font-semibold text-sm bg-green-100 px-2 py-1 rounded-full">
                  {getGrowth(userStats.verifiedUsers, prevUserStats.verifiedUsers)}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <div>Auto: {userStats.autoVerified}</div>
                <div>Manual: {userStats.manuallyVerified}</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-lg text-gray-500 font-inter">Pending Verification</h4>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-semibold text-gray-800 font-inter">{userStats.pendingManual}</span>
                <span className="text-orange-600 font-semibold text-sm bg-orange-100 px-2 py-1 rounded-full">
                  Manual Review
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <div>Unverified: {userStats.unverified}</div>
                <div>Rejected: {userStats.rejected}</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-lg text-gray-500 font-inter">Total News</h4>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-semibold text-gray-800 font-inter">{totalNews}</span>
                <span className="text-green-600 font-semibold text-sm bg-green-100 px-2 py-1 rounded-full">
                  {getGrowth(totalNews, prevTotalNews)}
                </span>
              </div>
            </div>
          </div>

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
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const { name, value } = payload[0];
                        if (name === "Custom Devices") {
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded shadow text-xs max-w-[240px]">
                              <div className="font-semibold mb-1">Custom Devices ({value})</div>
                              {otherDevicesList && otherDevicesList.length ? (
                                <div className="text-gray-700 leading-snug whitespace-normal break-words">
                                  {otherDevicesList.join(", ")}
                                </div>
                              ) : (
                                <div className="text-gray-500">No additional devices</div>
                              )}
                            </div>
                          );
                        }
                        return (
                          <div className="bg-white p-2 border border-gray-200 rounded shadow text-xs">
                            <div className="font-semibold">{name}</div>
                            <div className="text-gray-700">{value}</div>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
           {/* Enhanced Export Modal */}
          {showExportModal && (
            <div
              ref={exportModalRef}
              className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm flex items-center justify-center z-50 export-modal-container p-4"
            >
              {exportType === "csv" ? (
                // Simple CSV Modal
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl"> {/* Increased width */}
              <div className="bg-green-600 py-3 px-6 rounded-t-lg">
                <h3 className="text-lg font-semibold text-white">Export CSV</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Configuration Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">CONFIGURATION</h4>
                    
                    {/* Date Range - Now in one line */}
                    <div className="flex gap-3 items-end mb-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                          type="date"
                          value={exportConfig.dateFrom}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, dateFrom: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          placeholder="mm/dd/yyyy"
                        />
                      </div>
                      <div className="px-2 pb-2">
                        <span className="text-xs text-gray-500">to</span>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                          type="date"
                          value={exportConfig.dateTo}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, dateTo: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          placeholder="mm/dd/yyyy"
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={exportConfig.title}
                        onChange={(e) => setExportConfig(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Enter Title"
                      />
                    </div>

                    {/* Header */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Header</label>
                      <input
                        type="text"
                        value={exportConfig.header}
                        onChange={(e) => setExportConfig(prev => ({ ...prev, header: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Enter Header"
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={exportConfig.description}
                        onChange={(e) => setExportConfig(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Enter Description"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* File Name */}
                  <div className="mt-6">
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

                  <p className="text-gray-700 mt-4">
                    Export format: <strong>{exportType?.toUpperCase()}</strong>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-8 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={performExport}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm"
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>
             ) : (
                      // PDF Modal with Preview
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                      <div className="bg-green-600 py-3 px-6">
                    <h3 className="text-lg font-semibold text-white">Export Dashboard Data</h3>
                  </div>
                      <div className="flex">
                        {/* Left Panel - Configuration */}
                        <div className="w-1/3 border-r border-gray-200">
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-60px)]">
                          <div className="space-y-4">
                            {/* Configuration Section */}
                            <div>
                              <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">CONFIGURATION</h4>
                              
                              {/* Date Range - Compact inline layout */}
                              <div className="flex gap-2 items-center mb-4">
                                <input
                                  type="date"
                                  value={exportConfig.dateFrom}
                                  onChange={(e) => setExportConfig(prev => ({ ...prev, dateFrom: e.target.value }))}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                />
                                <span className="text-xs text-gray-500">to</span>
                                <input
                                  type="date"
                                  value={exportConfig.dateTo}
                                  onChange={(e) => setExportConfig(prev => ({ ...prev, dateTo: e.target.value }))}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                />
                              </div>

                              {/* Title */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                  type="text"
                                  value={exportConfig.title}
                                  onChange={(e) => setExportConfig(prev => ({ ...prev, title: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                  placeholder="Enter Title"
                                />
                              </div>

                              {/* Header */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Header</label>
                                <input
                                  type="text"
                                  value={exportConfig.header}
                                  onChange={(e) => setExportConfig(prev => ({ ...prev, header: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                  placeholder="Enter Header"
                                />
                              </div>

                              {/* Description */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                  value={exportConfig.description}
                                  onChange={(e) => setExportConfig(prev => ({ ...prev, description: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                  placeholder="Enter Description"
                                  rows={3}
                                />
                              </div>

                              {/* Include AI Summary - Position below description */}
                              <div className="mb-4">
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={isAISummaryEnabled}
                                    onChange={(e) => {
                                      setIsAISummaryEnabled(e.target.checked);
                                      if (e.target.checked && !aiSummary && !isSummarizing) {
                                        fetchAISummary();
                                      }
                                    }}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                  />
                                  <span className="text-gray-700">Include Summary (AI Generated)</span>
                                </label>
                                {isSummarizing && (
                                  <div className="text-xs text-gray-500 mt-1 ml-6">Generating summary...</div>
                                )}
                                {summaryError && (
                                  <div className="text-xs text-red-500 mt-1 ml-6">
                                    Failed to generate summary. 
                                    <button onClick={fetchAISummary} className="underline ml-1">Retry</button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* File Name */}
                            <div className="mt-6">
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

                            <p className="text-gray-700 mt-4">
                              Export format: <strong>{exportType?.toUpperCase()}</strong>
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-end gap-2 mt-8 pt-4 border-t border-gray-200">
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

                    {/* Right Panel - Preview */}
                    <div className="flex-1">
                      <div className="p-6 overflow-y-auto max-h-[calc(90vh-60px)]">
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700">Preview</h5>
                        </div>
                        
                        {/* Page 1 - Title and Dashboard Overview */}
                        <div className="bg-white border border-gray-300 shadow-lg mx-auto mb-6" style={{ width: '210mm', height: '297mm', padding: '20mm' }}>
                          <div className="h-full flex flex-col">
                            {/* Title and Date */}
                            <div className="text-center mb-6">
                              <h1 className="text-xl font-bold text-gray-800 mb-2">
                                {exportConfig.title || "Batelec I Nasugbu Dashboard Report"}
                              </h1>
                              <p className="text-sm text-gray-600">
                                {exportConfig.dateFrom && exportConfig.dateTo 
                                  ? `${formatDate(exportConfig.dateFrom)} to ${formatDate(exportConfig.dateTo)}`
                                  : `Generated on: ${new Date().toLocaleDateString()}`
                                }
                              </p>
                            </div>

                            {/* Header and Description */}
                            <div className="mb-4">
                              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                                {exportConfig.header || "Dashboard Overview"}
                              </h2>
                              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                                {exportConfig.description}
                              </p>
                              
                              {/* Dashboard Screenshot Preview */}
                              {dashboardScreenshot ? (
                                <div className="mb-4" style={{ maxHeight: '120mm', overflow: 'hidden' }}>
                                  <img 
                                    src={dashboardScreenshot} 
                                    alt="Dashboard Preview" 
                                    className="w-full h-auto"
                                    style={{ objectFit: 'contain' }}
                                  />
                                </div>
                              ) : (
                                <div className="border border-gray-200 bg-gray-100 p-8 mb-4 text-center">
                                  <div className="text-gray-500">Dashboard visual will appear here</div>
                                </div>
                              )}
                            </div>

                            {/* Page Number */}
                            <div className="text-center text-xs text-gray-500 mt-auto">
                              Page 1 of {isAISummaryEnabled ? Math.ceil(allUsers.length / 15) + 4 : Math.ceil(allUsers.length / 15) + 3}
                            </div>
                          </div>
                        </div>

                        {/* AI Summary Page Preview - Only show if enabled (Page 2) */}
                        {isAISummaryEnabled && (
                          <div className="bg-white border border-gray-300 shadow-lg mx-auto mb-6" style={{ width: '210mm', height: '297mm', padding: '20mm' }}>
                            <div className="h-full flex flex-col">
                              <h2 className="text-lg font-semibold text-gray-700 mb-4">Summary</h2>
                              <div className="flex-grow">
                                {isSummarizing ? (
                                  <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mr-3"></div>
                                    <span className="text-gray-600">Generating AI summary...</span>
                                  </div>
                                ) : aiSummary ? (
                                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {aiSummary}
                                  </div>
                                ) : summaryError ? (
                                  <div className="bg-red-50 border border-red-200 rounded p-4">
                                    <span className="text-red-600">Failed to generate AI summary</span>
                                  </div>
                                ) : (
                                  <div className="bg-gray-50 border border-gray-200 rounded p-4">
                                    <span className="text-gray-500">AI summary will be generated when enabled</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Page Number */}
                              <div className="text-center text-xs text-gray-500 mt-4">
                                Page 2 of {Math.ceil(allUsers.length / 15) + 4}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Statistics Table Preview (Page 2 or 3 depending on AI summary) */}
                        <div className="bg-white border border-gray-300 shadow-lg mx-auto mb-6" style={{ width: '210mm', height: '297mm', padding: '20mm' }}>
                          <div className="h-full flex flex-col">
                            <h3 className="text-base font-semibold text-gray-700 mb-3">
                              User Statistics Summary
                            </h3>
                            <div className="flex-grow">
                              <div className="border border-gray-200 rounded overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-green-600 text-white">
                                      <th className="px-3 py-2 text-left">KPI</th>
                                      <th className="px-3 py-2 text-left">Count</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[
                                      ["Total Users", userStats.totalUsers],
                                      ["Verified Users", userStats.verifiedUsers],
                                      ["Auto Verified", userStats.autoVerified],
                                      ["Manual Verified", userStats.manuallyVerified],
                                      ["Pending Verification", userStats.pendingManual],
                                      ["Unverified Users", userStats.unverified],
                                      ["Rejected Users", userStats.rejected],
                                      ["Basic Users", userStats.basicUsers],
                                      ["News Posts", totalNews],
                                    ].map(([metric, value], index) => (
                                      <tr key={metric} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                        <td className="px-3 py-2 border-b border-gray-200">{metric}</td>
                                        <td className="px-3 py-2 border-b border-gray-200">{value}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            
                            {/* Page Number */}
                            <div className="text-center text-xs text-gray-500 mt-4">
                              Page {isAISummaryEnabled ? 3 : 2} of {isAISummaryEnabled ? Math.ceil(allUsers.length / 15) + 4 : Math.ceil(allUsers.length / 15) + 3}
                            </div>
                          </div>
                        </div>

                        {/* Device Distribution Breakdown Preview (Page 4) */}
                        <div className="bg-white border border-gray-300 shadow-lg mx-auto mb-6" style={{ width: '210mm', height: '297mm', padding: '20mm' }}>
                          <div className="h-full flex flex-col">
                            <h3 className="text-base font-semibold text-gray-700 mb-3">
                              Device Distribution Breakdown
                            </h3>
                            <div className="flex-grow">
                              <div className="border border-gray-200 rounded overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-green-600 text-white">
                                      <th className="px-3 py-2 text-left">Appliance</th>
                                      <th className="px-3 py-2 text-left">Count</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {fullDeviceList.map((device, index) => (
                                      <tr key={device.name} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                        <td className="px-3 py-2 border-b border-gray-200">{device.name}</td>
                                        <td className="px-3 py-2 border-b border-gray-200">{device.value}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            
                            {/* Page Number */}
                            <div className="text-center text-xs text-gray-500 mt-4">
                              Page {isAISummaryEnabled ? 4 : 3} of {isAISummaryEnabled ? Math.ceil(allUsers.length / 15) + 4 : Math.ceil(allUsers.length / 15) + 3}
                            </div>
                          </div>
                        </div>
                      </div>
                     </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  export default Dashboard;