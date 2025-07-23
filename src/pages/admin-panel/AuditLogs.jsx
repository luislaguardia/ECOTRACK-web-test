import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";

const AuditLogs = () => {
  const storedInfo = JSON.parse(localStorage.getItem("adminInfo"));
// note in sidebar.jsx - should change the icon logo of audit logs to a different one
  // auto rredirect nonsuperadmin
  if (storedInfo?.role !== "superadmin") {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Audit Logs</h1>
      <p className="text-gray-600">aUdit LOGs.</p>
      {/* table or list blah blah */}
    </div>
  );
};
// init repo
// final testing for commits
export default AuditLogs;