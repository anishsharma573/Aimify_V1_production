import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/api";

const AddStudent = () => {
  const [option, setOption] = useState("file"); // Options: "file", "json", "manual"
  const [file, setFile] = useState(null);
  const [jsonInput, setJsonInput] = useState("");
  const [manualForm, setManualForm] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    class: "",
    username: ""
  });
  const [schoolId, setSchoolId] = useState("");
  const navigate = useNavigate();

  // Retrieve schoolId from localStorage on mount.
  useEffect(() => {
    const storedData = localStorage.getItem("schoolAdminData");
    console.log("Stored data from localStorage:", storedData);
    if (storedData) {
      try {
        const adminData = JSON.parse(storedData);
        console.log("Parsed admin data:", adminData);
        if (adminData?.user?.schoolId) {
          console.log("Extracted schoolId:", adminData.user.schoolId);
          setSchoolId(adminData.user.schoolId);
        } else {
          console.error("schoolId not found in adminData.user");
        }
      } catch (err) {
        console.error("Error parsing adminData:", err);
      }
    }
  }, []);
  

  const handleOptionChange = (mode) => {
    setOption(mode);
  };

  const submitRequest = async (formData) => {
    try {
      const response = await axiosInstance.post(
        `/schooladmin/schools/${schoolId}/add-student`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(response.data.message || "Student(s) added successfully");
      navigate("/school-admin/dashboard");
    } catch (error) {
      // Check for duplicate error in response message.
      const errMsg = error.response?.data?.message || "";
      if (errMsg.includes("Duplicate entries found")) {
        if (
          window.confirm(
            "Duplicate entries found. Would you like to skip duplicates and add the remaining students?"
          )
        ) {
          // Update formData to set skipDuplicates true and retry.
          formData.set("skipDuplicates", true);
          try {
            const response = await axiosInstance.post(
              `/schooladmin/schools/${schoolId}/add-student`,
              formData,
              { headers: { "Content-Type": "multipart/form-data" } }
            );
            toast.success(response.data.message || "Student(s) added successfully");
            navigate("/school-admin/dashboard");
          } catch (err) {
            console.error("Error after skipping duplicates:", err);
            toast.error(err.response?.data?.message || "Error adding student(s)");
          }
        } else {
          toast.error("Operation cancelled due to duplicate entries");
        }
      } else {
        console.error("Error adding student(s):", error);
        toast.error(errMsg || "Error adding student(s)");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!schoolId) {
      toast.error("School ID not available");
      return;
    }
    const formData = new FormData();
    // Initially set skipDuplicates to false.
    formData.append("skipDuplicates", false);

    if (option === "file") {
      if (!file) {
        toast.error("Please select an Excel file to upload");
        return;
      }
      formData.append("file", file);
    } else if (option === "json") {
      if (!jsonInput) {
        toast.error("Please enter valid JSON data");
        return;
      }
      try {
        const parsed = JSON.parse(jsonInput);
        // Append the JSON string directly so that it’s sent as a text field.
        formData.append("students", JSON.stringify(parsed));
      } catch (error) {
        toast.error("Invalid JSON data");
        return;
      }
    } else if (option === "manual") {
      if (!manualForm.name || !manualForm.phone || !manualForm.dateOfBirth) {
        toast.error("Name, phone, and date of birth are required");
        return;
      }
      const student = {
        name: manualForm.name,
        phone: manualForm.phone,
        dateOfBirth: manualForm.dateOfBirth,
        class: manualForm.class,
        ...(manualForm.username && { username: manualForm.username })
      };
      // Wrap in an array and append as a JSON string.
      formData.append("students", JSON.stringify([student]));
    }

    await submitRequest(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Add Student(s)</h2>
      <div className="mb-4 flex">
        <button
          type="button"
          onClick={() => handleOptionChange("file")}
          className={`px-4 py-2 rounded-l ${
            option === "file" ? "bg-purple-600 text-white" : "bg-gray-300 text-gray-700"
          }`}
        >
          File Upload
        </button>
        <button
          type="button"
          onClick={() => handleOptionChange("json")}
          className={`px-4 py-2 ${
            option === "json" ? "bg-purple-600 text-white" : "bg-gray-300 text-gray-700"
          }`}
        >
          JSON Input
        </button>
        <button
          type="button"
          onClick={() => handleOptionChange("manual")}
          className={`px-4 py-2 rounded-r ${
            option === "manual" ? "bg-purple-600 text-white" : "bg-gray-300 text-gray-700"
          }`}
        >
          Manual Entry
        </button>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-white p-6 rounded shadow">
        {option === "file" && (
          <div className="mb-4">
            <label htmlFor="file" className="block text-gray-700 font-semibold mb-2">
              Select Excel File:
            </label>
            <input
              type="file"
              id="file"
              accept=".xlsx, .xls"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        )}
        {option === "json" && (
          <div className="mb-4">
            <label htmlFor="jsonInput" className="block text-gray-700 font-semibold mb-2">
              Enter JSON Data:
            </label>
            <textarea
              id="jsonInput"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
              rows="6"
              placeholder='[{"name": "John Doe", "phone": "1234567890", "dateOfBirth": "01-01-2000", "class": "5"}]'
            />
          </div>
        )}
        {option === "manual" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">
                Name:
              </label>
              <input
                type="text"
                id="name"
                value={manualForm.name}
                onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-gray-700 font-semibold mb-1">
                Phone:
              </label>
              <input
                type="text"
                id="phone"
                value={manualForm.phone}
                onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-gray-700 font-semibold mb-1">
                Date of Birth (DD-MM-YYYY):
              </label>
              <input
                type="text"
                id="dateOfBirth"
                value={manualForm.dateOfBirth}
                onChange={(e) =>
                  setManualForm({ ...manualForm, dateOfBirth: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="e.g., 16-05-2003"
                required
              />
            </div>
            <div>
              <label htmlFor="class" className="block text-gray-700 font-semibold mb-1">
                Class:
              </label>
              <input
                type="text"
                id="class"
                value={manualForm.class}
                onChange={(e) =>
                  setManualForm({ ...manualForm, class: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="e.g., 5"
              />
            </div>
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded font-semibold transition-colors duration-300 mt-4"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddStudent;
