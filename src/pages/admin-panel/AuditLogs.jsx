// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function AuditLogs() {
//   const [logs, setLogs] = useState([]);

//   useEffect(() => {
//     const fetchLogs = async () => {
//       const token = localStorage.getItem("token");
//       const res = await axios.get("http://localhost:5003/api/audit-logs", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setLogs(res.data);
//     };
//     fetchLogs();
//   }, []);

//   return (
//     <div className="p-6 bg-[#F5F5F5] min-h-screen">
//       <h2 className="text-2xl font-bold mb-4 text-gray-800">Audit Logs</h2>
//       <div className="bg-white rounded shadow p-4 overflow-auto">
//         <table className="w-full text-sm text-left">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="py-2 px-4">Admin</th>
//               <th className="py-2 px-4">Action</th>
//               <th className="py-2 px-4">Details</th>
//               <th className="py-2 px-4">Time</th>
//             </tr>
//           </thead>
//           <tbody>
//             {logs.map(log => (
//               <tr key={log._id}>
//                 <td className="py-2 px-4">{log.adminId?.name || "Unknown"}</td>
//                 <td className="py-2 px-4">{log.action}</td>
//                 <td className="py-2 px-4">{log.details}</td>
//                 <td className="py-2 px-4">{new Date(log.timestamp).toLocaleString()}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

