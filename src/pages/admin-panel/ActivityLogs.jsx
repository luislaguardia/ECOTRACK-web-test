import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../config"; //

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyLogs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const apiUrl = `${BASE_URL}/api/audit-logs/my-logs`;
        const { data } = await axios.get(apiUrl, config);

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from the server.");
        }

        setLogs(data);
        setError("");
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to fetch activity logs."
        );
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyLogs();
  }, []);

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        My Activity Log
      </h1>
      {/* <p className="text-gray-600 mb-8">
        Here is a record of all the actions you have performed in the admin panel.
      </p> */}

      {loading && (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading your activities...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-10 bg-red-50 text-red-600 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.action.replace(/_/g, " ")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.target?.model || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.target?.displayText || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.details || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">
                    You have no activity records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;