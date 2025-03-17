import React, { useState } from "react";
import axiosInstance from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const examOptions = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);
const classOptions = [
  ...Array.from({ length: 12 }, (_, i) => `${i + 1}`),
  "Other",
];

const AssignPaperForm = () => {
  const [formData, setFormData] = useState({
    subject: "",
    examName: "",
    topic: "",
    subTopic: "",
    totalMarks: "",
    className: "",
  });
  const [customClass, setCustomClass] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle generic form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes for the custom class input
  const handleCustomClassChange = (e) => {
    setCustomClass(e.target.value);
  };

  // Handle the selection of a class
  const handleClassSelect = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, className: value }));
    if (value !== "Other") {
      setCustomClass("");
    }
  };

  // Submit the form data to the backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Override className if "Other" is selected
    const finalFormData = {
      ...formData,
      className: formData.className === "Other" ? customClass : formData.className,
    };

    try {
      const response = await axiosInstance.post("/exam/create/exam", finalFormData);
      toast.success(`Paper assigned successfully with ${response.data.data.studentCount} students connected.`);
      
      // Reset the form fields after successful submission
      setFormData({
        subject: "",
        examName: "",
        topic: "",
        subTopic: "",
        totalMarks: "",
        className: "",
      });
      setCustomClass("");
    } catch (error) {
      console.error("Error submitting the form:", error);
      const errMsg =
        error.response?.data?.message ||
        "An error occurred while assigning the paper.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
        Assign Exam Paper
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Subject:</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {/* Exam Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Exam Name:</label>
          <select
            name="examName"
            value={formData.examName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Select Exam --</option>
            {examOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {/* Topic */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Topic:</label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {/* Sub-Topic */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Sub-Topic:</label>
          <input
            type="text"
            name="subTopic"
            value={formData.subTopic}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {/* Total Marks */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Total Marks:</label>
          <input
            type="number"
            name="totalMarks"
            value={formData.totalMarks}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {/* Class Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Class Name:</label>
          <select
            name="className"
            value={formData.className}
            onChange={handleClassSelect}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Select Class --</option>
            {classOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {formData.className === "Other" && (
            <div className="mt-2">
              <label className="block text-gray-700 font-medium mb-1">
                Enter Custom Class:
              </label>
              <input
                type="text"
                value={customClass}
                onChange={handleCustomClassChange}
                required
                placeholder="Type class name..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          {loading ? "Assigning..." : "Assign Paper"}
        </button>
      </form>
    </div>
  );
};

export default AssignPaperForm;
