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
import HomePage from "./Pages/HomePage";

import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";
import Unauthorized from "./ProtectedRoute/Unauthorized";
import StudentDashboard from "./students/StudentDashboard";
import TeacherDashboard from "./teacher/TeacherDashboard";
import LoginSelection from "./CombinLogin/Login";
import TeacherLogin from "./teacher/Auth/TeacherLogin";
import AssignPaperForm from "./Exam/AssignPaperForm";
import UpdateMarksForm from "./Exam/UpdateMarksForm";
import SetPaper from "./Exam/SetPaper";

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
        <Route path="/" element={<HomePage />} />
        <Route path="/master-admin-login" element={<MasterAdminLogin />} />
        <Route path="/school-admin/login" element={<SchoolAdminLogin />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/login" element={<LoginSelection />} />

        {/* Protected Routes for Student */}
      
          <Route path="/student/dashboard" element={<StudentDashboard />} />
  
         {/* Protected Routes for teacher */}
       
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          
     
  {/* Assign Exam*/}

  <Route path="/teacher/assign-paper" element={<AssignPaperForm />} />
  <Route path="/teacher/update-marks" element={<UpdateMarksForm />} />
  <Route path="/teacher/set-paper" element={<SetPaper />} />
        {/* Unauthorized route */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes for Master Admin only */}
       
          <Route path="/create-school" element={<CreateSchool />} />
          <Route path="/admin-dashboard" element={<AdminDashBoard />} />
          <Route path="/allschools" element={<SchoolsList />} />
          <Route path="/create-school-admin/:schoolId" element={<CreateSchoolAdmin />} />
          <Route path="/upload-questions" element={<UploadQuestions />} />
          <Route path="/school-admins" element={<SchoolAdmins />} />
       

        {/* Protected Routes for Master Admin and School Admin */}
      
          <Route path="/school-admin/dashboard" element={<SchoolAdminDashboard />} />
          <Route path="/schools/:schoolId/students" element={<StudentsList />} />
          <Route path="/schools/:schoolId/teacher" element={<TeachersList />} />
          <Route path="/schools/:schoolId/add-student" element={<AddStudent />} />
          <Route path="/schools/:schoolId/add-teacher" element={<AddTeacher />} />
      
      </Routes>
    </>
  );
};

export default App;
