// components/TeacherLogin.jsx
import React, { useState } from "react";
import axiosInstance from "../../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useSchool from "../../Schools/GetSchoolBySubdomain";
useSchool

const TeacherLogin = () => {
  const { school, loadingSchool } = useSchool();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const navigate = useNavigate();

  // Extract the subdomain from the current window hostname.
  const getSubdomain = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    return parts.length > 1 ? parts[0] : "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    const subdomain = getSubdomain();
    try {
      const response = await axiosInstance.post(
        '/teacher/login',
        { username, password, subdomain },
        { withCredentials: true } // ensures cookies (accessToken and refreshToken) are included
      );
      
      console.log('Login successful:', response.data);
      const teacher = response.data.data.user;
      localStorage.setItem("teacherdata", JSON.stringify(response.data.data));
      localStorage.setItem("role", teacher.role);
      toast.success("Teacher login successful!");
      navigate("/teacher/dashboard");
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.response?.data?.message || 'An error occurred during login';
      toast.error(errMsg);
    } finally {
      setLoadingLogin(false);
    }
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
      
      {/* Teacher Login Form */}
      <div className="w-full">
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-800">Teacher Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700">Username</label>
            <input 
              type="text" 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
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

export default TeacherLogin;
