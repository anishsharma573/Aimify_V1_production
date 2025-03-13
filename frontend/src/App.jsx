// App.jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import MasterAdminLogin from "./MasterAdmin/Auth/MasterAdminLogin";
import CreateSchool from "./Schools/CreateSchool";
import AdminDashBoard from "./MasterAdmin/Pages/AdminDashBoard";
import SchoolsList from "./Schools/FetchSchool";
import CreateSchoolAdmin from "./Schools/SchoolAdmin/CreateSchoolAdmin";
import UploadQuestions from "./Questions/AddQuestion";
import SchoolAdmins from "./Schools/SchoolAdmin/AllSchoolAdmin";
import SchoolAdminLogin from "./Schools/SchoolAdmin/Auth/SchoolAdminLogin";
import SchoolAdminDashboard from "./Schools/SchoolAdmin/SchoolAdminDashboard";
import StudentsList from "./students/FetchStudent";
import TeachersList from "./teacher/FetchTeacher";
import AddStudent from "./students/AddStudents";
import AddTeacher from "./teacher/AddTeacher";
import StudentLogin from "./students/Auth/StudentLogin";


import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";
import Unauthorized from "./ProtectedRoute/Unauthorized";
import StudentDashboard from "./students/StudentDashboard";
import TeacherDashboard from "./teacher/TeacherDashboard";
import LoginSelection from "./CombinLogin/Login";
import TeacherLogin from "./teacher/Auth/TeacherLogin";

// For demonstration, we assume the user role is stored in localStorage.
// In a real application, you might use Context, Redux, or another state management method.
const userRole = localStorage.getItem("role") || null;

const App = () => {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
};

const MainLayout = () => {
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/master-admin-login" element={<MasterAdminLogin />} />
        <Route path="/school-admin/login" element={<SchoolAdminLogin />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/login" element={<LoginSelection />} />

        {/* Protected Routes for Student */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} userRole={userRole} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>
         {/* Protected Routes for teacher */}
        <Route element={<ProtectedRoute allowedRoles={["teacher"]} userRole={userRole} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        </Route>

        {/* Unauthorized route */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes for Master Admin only */}
        <Route element={<ProtectedRoute allowedRoles={["master_admin"]} userRole={userRole} />}>
          <Route path="/create-school" element={<CreateSchool />} />
          <Route path="/admin-dashboard" element={<AdminDashBoard />} />
          <Route path="/allschools" element={<SchoolsList />} />
          <Route path="/create-school-admin/:schoolId" element={<CreateSchoolAdmin />} />
          <Route path="/upload-questions" element={<UploadQuestions />} />
          <Route path="/school-admins" element={<SchoolAdmins />} />
        </Route>

        {/* Protected Routes for Master Admin and School Admin */}
        <Route element={<ProtectedRoute allowedRoles={[ "school_admin"]} userRole={userRole} />}>
          <Route path="/school-admin/dashboard" element={<SchoolAdminDashboard />} />
          <Route path="/schools/:schoolId/students" element={<StudentsList />} />
          <Route path="/schools/:schoolId/teacher" element={<TeachersList />} />
          <Route path="/schools/:schoolId/add-student" element={<AddStudent />} />
          <Route path="/schools/:schoolId/add-teacher" element={<AddTeacher />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
