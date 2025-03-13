import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      username: formData.username,
      password: formData.password,
    };

    try {
      const response = await axiosInstance.post("users/master-admin-login", data, {
        headers: { "Content-Type": "application/json" },
      });
      
      const { accessToken, refreshToken, user } = response.data.data; // Destructure user here
      
      console.log("Access Token:", accessToken);
      console.log("Refresh Token:", refreshToken);
      
      if (accessToken && refreshToken && user) {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("role", user.role); // Now using user from data
      
        toast.success("Login successful!");
      
      
        navigate("/admin-dashboard");
      } else {
        console.error("Tokens not found in the response data:", response.data);
        toast.error("Login failed: Tokens not received.");
      }
    } catch (error) {
      console.error(
        "Error during login:",
        JSON.stringify(error.response?.data || error.message, null, 2)
      );
      toast.error(`Login failed! ${error.response?.data?.message || "Unknown error"}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const fields = [
    { name: "username", type: "text", placeholder: "Username", required: true },
    { name: "password", type: "password", placeholder: "Password", required: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Master Admin Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((field, index) => (
              <div key={index}>
                <label htmlFor={field.name} className="block text-sm font-semibold text-gray-700 mb-2">
                  {field.placeholder}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  id={field.name}
                  onChange={handleInputChange}
                  required={field.required}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md font-semibold transition-colors duration-300"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
