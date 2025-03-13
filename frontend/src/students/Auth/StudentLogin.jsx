import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/api";

const StudentLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Extract the subdomain from the current window hostname.
  // For example, if the URL is "http://nps.localhost:5173", this function returns "nps".
  const getSubdomain = () => {
    const hostname = window.location.hostname; // e.g., "nps.localhost"
    const parts = hostname.split(".");
    return parts.length > 1 ? parts[0] : "";
  };

  const loginStudent = async (username, password) => {
    setLoading(true);
    const subdomain = getSubdomain();
    try {
      const response = await axiosInstance.post(
        "/student/login",
        { username, password, subdomain },
        {
          withCredentials: true,
          // If you have an interceptor that attaches the token, ensure it's not added for login requests.
          headers: { Authorization: "" },
        }
      );
      console.log("Login successful", response.data);
      toast.success(`Login successful on subdomain: ${subdomain}`);
      // Redirect to the student dashboard or any route you want.
      navigate("/student/dashboard");
    } catch (error) {
      console.error("Login error on subdomain", subdomain, error.response?.data);
      toast.error(
        error.response?.data?.message ||
          `Login error on subdomain: ${subdomain}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginStudent(username, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold text-center mb-4">Student Login</h2>
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
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors duration-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
