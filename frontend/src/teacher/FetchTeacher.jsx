import React, { useEffect, useState } from "react";
import axiosInstance from "../services/api";

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState(""); // default: no selection

  // Extract schoolId from localStorage on component mount.
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
  

  // Fetch teachers when schoolId and selectedClass are available.
  useEffect(() => {
    if (schoolId && selectedClass) {
      setLoading(true);
      const fetchTeachers = async () => {
        try {
          let url = `/schooladmin/schools/${schoolId}/teacher`;
          // If a specific class is selected (other than "All Classes"), append query parameter.
          if (selectedClass !== "All Classes") {
            url += `?class=${selectedClass}`;
          }
          const response = await axiosInstance.get(url);
          console.log("Fetched teachers:", response.data);
          // NOTE: The backend returns teacher records under "students" property.
          setTeachers(response.data.data.students);
        } catch (err) {
          console.error("Error fetching teachers:", err);
          setError(err.response?.data?.message || err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchTeachers();
    } else {
      // Clear teachers if no class is selected.
      setTeachers([]);
    }
  }, [schoolId, selectedClass]);

  // Client-side filtering based on selected class and search query for username.
  const filteredTeachers = teachers.filter((teacher) => {
    let matchesClass = true;
    if (selectedClass && selectedClass !== "All Classes") {
      if (selectedClass === "Other") {
        const teacherClassNum = Number(teacher.class);
        matchesClass =
          isNaN(teacherClassNum) ||
          teacher.class === undefined ||
          teacherClassNum < 1 ||
          teacherClassNum > 12;
      } else {
        // For a numeric class, match exactly.
        matchesClass =
          teacher.class !== undefined &&
          Number(teacher.class) === Number(selectedClass);
      }
    }
    const matchesSearch = teacher.username
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  // Helper to format DOB as DD/MM/YYYY.
  const formatDOB = (dob) => {
    if (!dob) return "N/A";
    const date = new Date(dob);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className="p-4 text-center">Loading teachers...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      {/* Header: Title, class dropdown, and search bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
        <div className="mb-2 sm:mb-0">
          <h1 className="text-2xl font-bold">Teachers List</h1>
          <p className="text-gray-600">
            {selectedClass
              ? `Total: ${filteredTeachers.length}`
              : "Please select a class"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="" disabled>
              Select a class
            </option>
            <option value="All Classes">All Classes</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={(i + 1).toString()}>
                Class {i + 1}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Search by username..."
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Scrollable table container */}
      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">S.No</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Username</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Phone</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Class</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">DOB</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTeachers.map((teacher, index) => (
              <tr
                key={teacher._id}
                className="hover:bg-blue-50 cursor-pointer"
                onClick={() => setSelectedTeacher(teacher)}
              >
                <td className="px-4 py-2 text-sm text-gray-900">{index + 1}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{teacher.name}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{teacher.username || "N/A"}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{teacher.phone || "N/A"}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{teacher.class || "N/A"}</td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {teacher.dateOfBirth ? formatDOB(teacher.dateOfBirth) : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details box displayed below the table */}
      {selectedTeacher && (
        <div className="mt-8 p-4 border rounded shadow bg-white">
          <h2 className="text-xl font-bold mb-2">Teacher Details</h2>
          <p><strong>Name:</strong> {selectedTeacher.name}</p>
          <p><strong>Username:</strong> {selectedTeacher.username || "N/A"}</p>
          <p><strong>Phone:</strong> {selectedTeacher.phone || "N/A"}</p>
          <p><strong>Class:</strong> {selectedTeacher.class || "N/A"}</p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {selectedTeacher.dateOfBirth ? formatDOB(selectedTeacher.dateOfBirth) : "N/A"}
          </p>
          <button
            className="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
            onClick={() => setSelectedTeacher(null)}
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
};

export default TeachersList;
