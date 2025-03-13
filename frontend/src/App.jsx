import React from "react";
import  {BrowserRouter as Router , Route , Routes } from "react-router-dom"
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
import StudentDashboard from "./students/StudentDashboard";


const App = () => {
  return (
<Router>
  <MainLayout/>
</Router>

  )
};


const MainLayout = () => {
  return (
   <>
    <ToastContainer/>
    <Routes>
<Route path="/master-admin-login" element={<MasterAdminLogin/>}/>
<Route path="/create-school" element={<CreateSchool/>}/>
<Route path="/admin-dashboard" element={<AdminDashBoard/>}/>
<Route path="/allschools" element={<SchoolsList/>}/>
<Route path="/create-school-admin/:schoolId" element={<CreateSchoolAdmin/>}/>
<Route path="/upload-questions" element={<UploadQuestions/>}/>   
<Route path="/school-admins" element={<SchoolAdmins/>}/>   
<Route path="/school-admin/login" element={<SchoolAdminLogin/>}/>   
<Route path="/school-admin/dashboard" element={<SchoolAdminDashboard/>}/> 
<Route path="/schools/:schoolId/students" element={<StudentsList />} />
<Route path="/schools/:schoolId/teacher" element={<TeachersList />} />
<Route path="/schools/:schoolId/add-student" element={<AddStudent />} />
<Route path="/schools/:schoolId/add-teacher" element={<AddTeacher />} />    
<Route path="/" element={<StudentLogin />} />    
<Route path="/student/dashboard" element={<StudentDashboard />} />    

    </Routes>
 
   </>
  )
}

export default App;
