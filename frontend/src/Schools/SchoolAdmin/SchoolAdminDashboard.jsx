import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SchoolAdminDashboard = () => {
  const navigate = useNavigate();
  const [schoolId, setSchoolId] = useState("");

  useEffect(() => {
    const storedData = localStorage.getItem("schoolAdminData");
    console.log("Stored data from localStorage:", storedData);
    if (storedData) {
      try {
        const adminData = JSON.parse(storedData);
        console.log("Parsed admin data:", adminData);
        const extractedSchoolId =
          adminData?.school?._id || adminData?.school?.schoolId;
        if (extractedSchoolId) {
          console.log("Extracted schoolId:", extractedSchoolId);
          setSchoolId(extractedSchoolId);
        } else {
          console.error("schoolId not found in adminData.school");
        }
      } catch (err) {
        console.error("Error parsing adminData:", err);
      }
    }
  }, []);
  
  
  const handleFetchStudents = () => {
    console.log("Navigating with schoolId:", schoolId);
    if (!schoolId) {
      console.error("School ID is not available");
      return;
    }
    // Navigate to the students page using the extracted schoolId
    navigate(`/schools/${schoolId}/students`);
  };


  const handleFetchTeacher = () => {
    console.log("Navigating with schoolId:", schoolId);
    if (!schoolId) {
      console.error("School ID is not available");
      return;
    }
    // Navigate to the students page using the extracted schoolId
    navigate(`/schools/${schoolId}/teacher`);
  };
  const handleAddStudent = () => {
    console.log("Navigating with schoolId:", schoolId);
    if (!schoolId) {
      console.error("School ID is not available");
      return;
    }
    // Navigate to the students page using the extracted schoolId
    navigate(`/schools/${schoolId}/add-student`);
  };

  
  const handleAddTeacher = () => {
    console.log("Navigating with schoolId:", schoolId);
    if (!schoolId) {
      console.error("School ID is not available");
      return;
    }
    // Navigate to the students page using the extracted schoolId
    navigate(`/schools/${schoolId}/add-teacher`);
  };

 

 
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-4">
      <h1 className="text-3xl font-semibold text-white mb-6">
        School Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleFetchStudents}
          className="bg-blue-600 text-white font-medium px-6 py-3 rounded shadow hover:bg-blue-700 transition"
        >
          View Students
        </button>
        <button
          onClick={handleFetchTeacher}
          className="bg-purple-600 text-white font-medium px-6 py-3 rounded shadow hover:bg-purple-700 transition"
        >
          Show Teachers
        </button>
        <button
          onClick={handleAddStudent}
          className="bg-green-600 text-white font-medium px-6 py-3 rounded shadow hover:bg-green-700 transition"
        >
          Add Student
        </button>
        <button
          onClick={handleAddTeacher}
          className="bg-red-600 text-white font-medium px-6 py-3 rounded shadow hover:bg-red-700 transition"
        >
          Add Teacher
        </button>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
