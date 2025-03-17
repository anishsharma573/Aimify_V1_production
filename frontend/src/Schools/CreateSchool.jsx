import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../services/api";

const CreateSchool = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    address: "",
    principalName: "",
    phoneNumber: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Create a FormData instance and append all form fields
      const data = new FormData();
      data.append("name", formData.name);
      data.append("subdomain", formData.subdomain);
      data.append("address", formData.address);
      data.append("principalName", formData.principalName);
      data.append("phoneNumber", formData.phoneNumber);
      
      // Append the file if available
      if (logoFile) {
        data.append("logo", logoFile);
      }

      // Send a POST request with multipart/form-data.
      const response = await axiosInstance.post("/users/create-school", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { message: resMessage } = response.data.data || {};
      setMessage(resMessage || "School created successfully");
      toast.success("School created successfully!");
      navigate("/admin-dashboard");
    } catch (error) {
      console.error("Error creating school:", error);
      setMessage("Error creating school");
      toast.error(
        `Error creating school: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Create School
          </h2>

          {message && (
            <div className="mb-4 p-3 text-center bg-green-200 text-green-800 rounded">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                School Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-1">
                Subdomain
              </label>
              <input
                type="text"
                name="subdomain"
                id="subdomain"
                value={formData.subdomain}
                onChange={handleChange}
                required
                placeholder="e.g., nps"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                Upload Logo
              </label>
              <input
                type="file"
                name="logo"
                id="logo"
                onChange={handleFileChange}
                accept="image/*"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label htmlFor="principalName" className="block text-sm font-medium text-gray-700 mb-1">
                Principal Name
              </label>
              <input
                type="text"
                name="principalName"
                id="principalName"
                value={formData.principalName}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-md transition-colors duration-300"
            >
              {loading ? "Creating..." : "Create School"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSchool;
