import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Forbidden</h1>
      <p className="text-lg text-gray-700 mb-6">
        You do not have permission to access this page.
      </p>
      <Link
        to="/"
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Go to Homepage
      </Link>
    </div>
  );
}
