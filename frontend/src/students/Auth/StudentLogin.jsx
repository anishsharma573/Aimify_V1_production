// components/StudentLogin.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/api";
import useSchool from "../../Schools/GetSchoolBySubdomain";

const StudentLogin = () => {
  const { school, loadingSchool } = useSchool();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const navigate = useNavigate();

  // Extract the subdomain from the current window hostname.
  const getSubdomain = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    return parts.length > 1 ? parts[0] : "";
  };

  const loginStudent = async (username, password) => {
    setLoadingLogin(true);
    const subdomain = getSubdomain();
    try {
      const response = await axiosInstance.post(
        "/student/login",
        { username, password, subdomain },
        { withCredentials: true }
      );
      console.log("Login successful", response.data);
      const student = response.data.data.user;
  
      // Store the returned tokens in localStorage if they exist
      if (response.data.data.accessToken) {
        localStorage.setItem("token", response.data.data.accessToken);
      }
      if (response.data.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
      }
  
      // Also store student data and role for future use
      localStorage.setItem("studentData", JSON.stringify(response.data.data));
      localStorage.setItem("role", student.role);
  
      toast.success(`Login successful on subdomain: ${subdomain}`);
      navigate("/student/dashboard");
    } catch (error) {
      console.error("Login error on subdomain", subdomain, error.response?.data);
      toast.error(
        error.response?.data?.message ||
          `Login error on subdomain: ${subdomain}`
      );
    } finally {
      setLoadingLogin(false);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    loginStudent(username, password);
  };

  // Show a loader or message while fetching school details.
  if (loadingSchool) {
    return <div className="text-blue-800">Loading school details...</div>;
  }

  if (!school) {
    return <div className="text-blue-800">No school details found.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Display School Details */}
      <div className="mb-6 text-center">
        {school.logo && (
          <img
            src={school.logo}
            alt={`${school.name} Logo`}
            className="w-32 mx-auto mb-4"
          />
        )}
        <h1 className="text-3xl font-bold mb-2 text-blue-800">{school.name}</h1>
        {school.description && <p className="text-blue-700">{school.description}</p>}
      </div>
      
      {/* Student Login Form */}
      <div className="w-full">
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-800">Student Login</h2>
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
              className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loadingLogin}
            className="w-full bg-blue-600 text-white font-semibold p-2 rounded hover:bg-blue-700 transition-colors duration-300"
          >
            {loadingLogin ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
