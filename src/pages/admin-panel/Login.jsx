import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock } from "react-icons/fi";

import { BASE_URL } from "../../config";

const Login = ({ setIsAuthenticated }) => {

  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/auth/admin/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      localStorage.setItem("token", data.token);
      localStorage.setItem("adminInfo", JSON.stringify({ role: data.role }));
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
<div
  className="flex min-h-screen flex-col justify-center items-center bg-cover bg-center bg-no-repeat px-4 sm:px-0"
  style={{
    backgroundImage:
      'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("../images/LoginBG.png")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
      <div className="flex justify-center mb-6">
        <img
          src="../images/ecotracklogo5.png"
          alt="Ecotrack Logo"
          className="h-16 sm:h-20 object-contain"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-6 sm:p-10 bg-white rounded-2xl shadow-xl mb-4"
      >
        <div className="flex flex-col items-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-[30px] font-bold text-gray-800 mb-1 font-proxima text-center">
            Admin Portal
          </h2>
          <p className="text-sm sm:text-[15px] text-gray-600 text-center">
            Secure Access for Ecotrack Administrators
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div className="flex justify-center">
            <div className="w-full sm:w-4/5 border-b-2 border-gray-300 focus-within:border-green-600 flex items-center mb-4 sm:mb-6">
              <FiMail className="text-gray-500 mr-3" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-2 font-proxima bg-transparent outline-none placeholder-gray-400 text-sm sm:text-md font-bold text-gray-800"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full sm:w-4/5 border-b-2 border-gray-300 focus-within:border-green-600 flex items-center mb-4 sm:mb-6">
              <FiLock className="text-gray-500 mr-3" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full py-2 bg-transparent outline-none placeholder-gray-400 text-sm sm:text-md font-bold text-gray-800"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm sm:text-md mt-1 text-center">{error}</p>}

          <button
  type="submit"
  disabled={isLoading}
  className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition flex items-center justify-center gap-2 ${
    isLoading ? "cursor-not-allowed opacity-70" : ""
  }`}
>
  {isLoading && (
    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
  )}
  {isLoading ? "Logging in..." : "Login"}
</button>

          {/* <div className="flex justify-center mt-3">
            <a
              href="#"
              className="text-sm sm:text-lg font-proxima font-bold text-green-600 hover:underline transition"
            >
              Forgot your Password?
            </a>
          </div> */}
        </form>
      </motion.div>

      <div className="w-full max-w-md text-center px-2 sm:px-0 mt-6">
  <span className="text-white font-medium text-sm sm:text-base">
    Not an Ecotrack Admin?
  </span>{" "}
  <a
    href="/"
    className="text-green-300 hover:text-green-400 font-medium text-sm sm:text-base underline"
  >
    Return to Customer Site
  </a>
</div>

{/* reserve design for NOT AN ECOTRACK ADMIN? RETURN TO CUSTOMER SITE */}

{/* <div className="w-full max-w-md text-center px-4 sm:px-0 mt-4">
  <p className="text-gray-800 font-proxima font-bold text-base sm:text-lg">
    Not an Ecotrack Admin?{" "}
    <a
      href="/"
      className="text-green-700 hover:underline transition font-semibold"
    >
      Return to Customer Site
    </a>
  </p>
</div> */}

    </div>
  );
};

export default Login;