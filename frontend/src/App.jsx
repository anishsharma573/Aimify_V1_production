import React from "react";
import  {BrowserRouter as Router , Route , Routes } from "react-router-dom"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MasterAdminLogin from "./MasterAdmin/Auth/MasterAdminLogin";
import CreateSchool from "./Pages/CreateSchool";
import AdminDashBoard from "./MasterAdmin/Pages/AdminDashBoard";
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
    </Routes>
   </>
  )
}

export default App;
