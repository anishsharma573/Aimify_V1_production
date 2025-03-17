import React from "react";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const handleAssignPaper = () => {
    navigate("/teacher/assign-paper");
  };

  const handleUpdateMarks = () => {
    navigate("/teacher/update-marks");
  };
  const handleSetPaper = () => {
    navigate("/teacher/set-paper");
  };
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-center text-blue-800">
          Teacher Dashboard
        </h1>
      </header>
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={handleAssignPaper}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-300"
        >
          Assign Paper
        </button>
        <button
          onClick={handleUpdateMarks}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-300"
        >
          Update Marks
        </button>
        <button
          onClick={handleSetPaper}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-300"
        >
          Set paper
        </button>
      </div>
      <main>
        {/* Here you can conditionally render different components or provide instructions */}
        <p className="text-center text-gray-700">
          Please select an option above to proceed.
        </p>
      </main>
    </div>
  );
};

export default TeacherDashboard;
