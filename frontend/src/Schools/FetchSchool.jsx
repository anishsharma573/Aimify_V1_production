import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../services/api";

const SchoolsList = () => {
  const [schools, setSchools] = useState([]);
  const [expandedSchoolIds, setExpandedSchoolIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axiosInstance.get("/users/allschools");
        // Assuming response.data.data.schools contains the schools
        setSchools(response.data.data.schools);
      } catch (error) {
        toast.error("Error fetching schools");
      }
    };

    fetchSchools();
  }, []);

  const toggleSchoolDetails = (schoolId) => {
    setExpandedSchoolIds((prev) =>
      prev.includes(schoolId)
        ? prev.filter((id) => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  const handleCreateAdmin = (schoolId) => {
    navigate(`/create-school-admin/${schoolId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Schools</h1>
      <div className="max-w-4xl mx-auto">
        {schools.map((school) => (
          <div
            key={school._id}
            className="bg-white shadow rounded p-4 mb-4 transition-all duration-300"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{school.name}</h2>
              <div className="flex items-center gap-4">
              <button
  onClick={() => handleCreateAdmin(school._id)}
  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors duration-300"
>
  Create School Admin
</button>
<span
  className="text-gray-600 text-2xl cursor-pointer"
  onClick={() => toggleSchoolDetails(school._id)}
>
  {expandedSchoolIds.includes(school._id) ? "−" : "+"}
</span>
              </div>
            </div>
            {expandedSchoolIds.includes(school._id) && (
              <div className="mt-4 text-gray-700">
                <p>
                  <strong>Address:</strong> {school.address}
                </p>
                <p>
                  <strong>Logo:</strong> {school.logo}
                </p>
                <p>
                  <strong>Principal Name:</strong> {school.principalName}
                </p>
                <p>
                  <strong>Phone:</strong> {school.phoneNumber}
                </p>
                <p>
                  <strong>Subdomain:</strong> {school.subdomain}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolsList;
