import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../../services/api";

const SchoolAdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Username and password are required");
      return;
    }
    setLoadingLogin(true);
    try {
      const response = await axiosInstance.post("/schooladmin/login", {
        username,
        password,
      });
      console.log("Login response:", response.data);
      toast.success(response.data.message || "Login successful");
      
      const schoolAdminData = response.data.data;
      
      // Save tokens if available
      if (schoolAdminData.accessToken) {
        localStorage.setItem("token", schoolAdminData.accessToken);
      }
      if (schoolAdminData.refreshToken) {
        localStorage.setItem("refreshToken", schoolAdminData.refreshToken);
      }
      
      // Save school admin data and role
      localStorage.setItem("schoolAdminData", JSON.stringify(schoolAdminData));
      localStorage.setItem("role", schoolAdminData.user.role);
      
      navigate("/school-admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-white">
      <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          School Admin Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Enter password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loadingLogin}
            className="w-full bg-purple-600 text-white font-semibold p-2 rounded hover:bg-purple-700 transition-colors duration-300"
          >
            {loadingLogin ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SchoolAdminLogin;
