import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, userRole }) => {
  if (allowedRoles.includes(userRole)) {
    return <Outlet />;
  } else {
    return <Navigate to="/unauthorized" replace />;
  }
};

export default ProtectedRoute;
