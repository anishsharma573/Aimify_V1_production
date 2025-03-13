import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/api';

const SchoolAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [expandedAdminIds, setExpandedAdminIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axiosInstance.get('/users/allschoolsadmins');
        console.log('API Response:', response.data);
        // Use optional chaining to safely access schoolAdmins array
        setAdmins(response.data.data?.schoolAdmins || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const toggleAdminDetails = (adminId) => {
    setExpandedAdminIds((prev) =>
      prev.includes(adminId)
        ? prev.filter((id) => id !== adminId)
        : [...prev, adminId]
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        School Admins
      </h1>
      <ul className="max-w-2xl mx-auto space-y-4">
        {admins.map((admin) => (
          <li
            key={admin._id}
            className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold text-gray-700">{admin.name}</div>
              <span
                className="text-gray-600 text-2xl cursor-pointer"
                onClick={() => toggleAdminDetails(admin._id)}
              >
                {expandedAdminIds.includes(admin._id) ? '−' : '+'}
              </span>
            </div>
            {expandedAdminIds.includes(admin._id) && (
              <div className="mt-4 text-gray-700">
                <p>
                  <strong>Username:</strong> {admin.username}
                </p>
                <p>
                  <strong>Email:</strong> {admin.email}
                </p>
                <p>
                  <strong>Phone:</strong> {admin.phone}
                </p>
                <p>
                  <strong>Role:</strong> {admin.role}
                </p>
                <p>
                  <strong>School ID:</strong> {admin.schoolId}
                </p>
                {/* Add more admin details here if needed */}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SchoolAdmins;
