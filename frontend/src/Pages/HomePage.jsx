import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-800 to-purple-600 p-4">
      <h1 className="text-4xl font-bold text-white mb-10 drop-shadow-lg">Aimify</h1>
      <div className="flex flex-col sm:flex-row gap-6">
        <Link to="/master-admin-login">
          <button className="px-8 py-3 bg-white text-purple-800 font-semibold rounded-lg shadow hover:bg-gray-100 transition">
            Master Admin Login
          </button>
        </Link>
        <Link to="/school-admin/login">
          <button className="px-8 py-3 bg-white text-purple-800 font-semibold rounded-lg shadow hover:bg-gray-100 transition">
            School Admin Login
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
