import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles, allowedStaffTypes }) => {
  const location = useLocation();
  const userStr = localStorage.getItem("user");

  if (!userStr) {
    // User not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const userRole = user.role;

    // Check role
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // User role not authorized
      return <Navigate to="/" replace />;
    }

    // Check staff type if it's a staff route and user is a staff
    if (allowedStaffTypes && userRole === "staff") {
      const userStaffType = user.staffType;
      if (!allowedStaffTypes.includes(userStaffType)) {
        // Staff type not authorized
        return <Navigate to="/" replace />;
      }
    }

    // All checks passed
    return children;
  } catch (err) {
    // Handle invalid JSON in localStorage
    localStorage.removeItem("user");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;
