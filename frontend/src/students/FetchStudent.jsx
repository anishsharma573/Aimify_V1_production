import React, { useEffect, useState } from "react";
import axiosInstance from "../services/api";

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState(""); // default: no selection

  // Extract schoolId from localStorage on component mount
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
  
  // Fetch students once the schoolId and selectedClass are available
  useEffect(() => {
    if (schoolId && selectedClass) {
      setLoading(true);
      const fetchStudents = async () => {
        try {
          let url = `/schooladmin/schools/${schoolId}/students`;
          // If a specific class is selected (numeric or "Other"), append query parameter.
          // If "All Classes" is selected, fetch all students.
          if (selectedClass !== "All Classes") {
            url += `?class=${selectedClass}`;
          }
          const response = await axiosInstance.get(url);
          console.log("Fetched students:", response.data);
          setStudents(response.data.data.students);
        } catch (err) {
          console.error("Error fetching students:", err);
          setError(err.response?.data?.message || err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    } else {
      // Clear students if no class is selected
      setStudents([]);
    }
  }, [schoolId, selectedClass]);

  // Client-side filtering based on selectedClass and search query for username
  const filteredStudents = students.filter((student) => {
    let matchesClass = true;
    if (selectedClass && selectedClass !== "All Classes") {
      if (selectedClass === "Other") {
        const studentClassNum = Number(student.class);
        matchesClass =
          isNaN(studentClassNum) ||
          student.class === undefined ||
          studentClassNum < 1 ||
          studentClassNum > 12;
      } else {
        // For a numeric class, match exactly.
        matchesClass =
          student.class !== undefined &&
          Number(student.class) === Number(selectedClass);
      }
    }
    const matchesSearch = student.username
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  // Helper function to format DOB as DD/MM/YYYY
  const formatDOB = (dob) => {
    if (!dob) return "N/A";
    const date = new Date(dob);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="p-4">
      {/* Header with title, dropdown, and search bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
        <div className="mb-2 sm:mb-0">
          <h1 className="text-2xl font-bold">Students List</h1>
          <p className="text-gray-600">
            {selectedClass
              ? `Total: ${filteredStudents.length}`
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
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                S.No
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Username
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Phone
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                DOB
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Class
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student, index) => (
              <tr
                key={student._id}
                className="hover:bg-blue-50 cursor-pointer"
                onClick={() => setSelectedStudent(student)}
              >
                <td className="px-4 py-2 text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {student.name}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {student.username || "N/A"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {student.phone || "N/A"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {formatDOB(student.dateOfBirth)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {student.class || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details box displayed below the table */}
      {selectedStudent && (
        <div className="mt-8 p-4 border rounded shadow bg-white">
          <h2 className="text-xl font-bold mb-2">Student Details</h2>
          <p>
            <strong>Name:</strong> {selectedStudent.name}
          </p>
          <p>
            <strong>Username:</strong> {selectedStudent.username || "N/A"}
          </p>
          <p>
            <strong>Phone:</strong> {selectedStudent.phone || "N/A"}
          </p>
         
          <p>
            <strong>Date of Birth:</strong> {formatDOB(selectedStudent.dateOfBirth)}
          </p>
          <p>
            <strong>Class:</strong> {selectedStudent.class || "N/A"}
          </p>
          <button
            className="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
            onClick={() => setSelectedStudent(null)}
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentsList;
