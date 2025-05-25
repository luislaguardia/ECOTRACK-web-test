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
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [verifiedUsers, setVerifiedUsers] = useState(0);
  const [totalNews, setTotalNews] = useState(0);
  const [newUsersToday, setNewUsersToday] = useState(12);
  const [newUsersThisWeek, setNewUsersThisWeek] = useState(58);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [usageData, setUsageData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);

  const [prevTotalUsers, setPrevTotalUsers] = useState(1);
  const [prevVerifiedUsers, setPrevVerifiedUsers] = useState(1);
  const [prevTotalNews, setPrevTotalNews] = useState(1);
  const [allUsers, setAllUsers] = useState([]);


  const dashboardRef = useRef(null);

  const COLORS = ["#16a34a", "#4ade80", "#86efac", "#bbf7d0"];

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchUserCount(),
        fetchNewsCount(),
        fetchUsageData(),
        fetchDeviceData(),
        fetchAllUsers(), // new
      ]);
      setIsLoading(false);
    };
    fetchAll();
  }, []);

  const getGrowth = (current, prev) => {
    if (prev <= 0) return current > 0 ? "+100%" : "0%";
    const diff = current - prev;
    const growth = (diff / prev) * 100;
    return `${diff >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
  };

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
      setPrevTotalUsers(Math.max(users.length - 3, 1));
      setPrevVerifiedUsers(Math.max(verified - 1, 1));
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchNewsCount = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/news`);
      setTotalNews(res.data.length);
      setPrevTotalNews(Math.max(res.data.length - 2, 1));
    } catch (err) {
      console.error("Error fetching news:", err);
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
    }
  };

  const fetchDeviceData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/plugs/appliance-stats`);
      const formatted = Object.entries(res.data).map(([name, value]) => ({
        name,
        value,
      }));
      setDeviceData(formatted);
    } catch (err) {
      console.error("Error fetching device data:", err);
    }
  };

  const handleExportClick = (type) => {
    setExportType(type);
    setShowExportModal(true);
  };

  const performExport = async () => {
    if (exportType === "csv") exportCSV();
    else if (exportType === "pdf") await exportPDF();
    setShowExportModal(false);
  };

  const exportCSV = () => {
    const generalData = [
      ["Metric", "Value"],
      ["Total Users", totalUsers],
      ["Verified Users", verifiedUsers],
      ["Total News Posted", totalNews],
      ["New Users Today", newUsersToday],
      ["New Users This Week", newUsersThisWeek],
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
    link.download = "dashboard_with_users.csv";
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(18);
    doc.text("EcoTrack Dashboard Report", 14, 20);
  
    doc.setFontSize(12);
    doc.text(`Total Users: ${totalUsers}`, 14, 40);
    doc.text(`Verified Users: ${verifiedUsers}`, 14, 50);
    doc.text(`Total News Posted: ${totalNews}`, 14, 60);
    doc.text(`New Users Today: ${newUsersToday}`, 14, 70);
    doc.text(`New Users This Week: ${newUsersThisWeek}`, 14, 80);
  
    doc.text("Energy Usage (kWh):", 14, 100);
    usageData.forEach((item, index) => {
      doc.text(`${item.month}: ${item.kWh} kWh`, 20, 110 + index * 10);
    });
  
    // New page for Users
    doc.addPage();
    doc.setFontSize(16);
    doc.text("User List", 14, 20);
  
    autoTable(doc, {
      head: [["UserID", "Name", "Email", "Location", "Status"]],
      body: allUsers.map((u) => [
        u._id,
        u.name,
        u.email,
        u.barangay || "N/A",
        u.isVerified ? "Active" : "Inactive",
      ]),
      startY: 30,
    });
  
    doc.save("dashboard_with_users.pdf");
  };

  // asd
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  return (
    <div ref={dashboardRef} className="min-h-screen bg-[#F5F5F5]">
      {isLoading ? (
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-3xl font-semibold font-inter text-gray-800">
              Dashboard Overview
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleExportClick("csv")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all font-inter"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExportClick("pdf")}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all font-inter"
              >
                Export PDF
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg text-gray-500 font-inter">Total Users</h4>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-semibold text-gray-800 font-inter">{totalUsers}</span>
                <span className="text-green-600 font-semibold text-sm bg-green-100 px-2 py-1 rounded-full">
                  {getGrowth(totalUsers, prevTotalUsers)}
                </span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg text-gray-500 font-inter">Total News Posted</h4>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-semibold text-gray-800 font-inter">{totalNews}</span>
                <span className="text-green-600 font-semibold text-sm bg-green-100 px-2 py-1 rounded-full">
                  {getGrowth(totalNews, prevTotalNews)}
                </span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
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
                      outerRadius={110}
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
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="bg-green-600 rounded-t-lg py-3 px-6">
                  <h3 className="text-lg font-semibold text-white">Confirm Export</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-4">
                    Are you sure you want to export the dashboard data as {" "}
                    <strong>{exportType?.toUpperCase()}</strong>?
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={performExport}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;