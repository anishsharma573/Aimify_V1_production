import React from "react";
import { useNavigate } from "react-router-dom";
const AdminDashBoard = () => {
  const navigate = useNavigate();

  const handleAllSchools = () => {
    navigate("/allschools");
  }
  const handleCreateSchool = () => {
    navigate("/create-school");
  }

  const handleAddQuestion = () => {
    navigate("/upload-questions");
  }

  const handleSchoolAdmins = () => {  
    navigate("/school-admins");
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-500 via-purple-300 to-white px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Admin Dashboard
      </h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
        onClick={handleAllSchools} 
        className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-purple-100 transition-colors duration-300">
          Schools
        </button>
        <button 
        onClick={handleCreateSchool} 
        className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300">
          Create Schools
        </button>
        <button 
        onClick={handleAddQuestion} 
        className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300">
          Add Question
        </button>
        <button 
        onClick={handleSchoolAdmins} 
        className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300">
           School Admin
        </button>
      </div>
    </div>
  );
};

export default AdminDashBoard;
