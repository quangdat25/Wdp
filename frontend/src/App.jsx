import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import HomePage from "./pages/HomePage/HomePage";
import Login from "./pages/Login/Login";
import PageTransition from "./components/PageTransition/PageTransition";
import ProtectedRoute from "./components/ProtectedRoute";

import StudentManagement from "./pages/Admin/StudentManagement";
import PersonnelManagement from "./pages/Admin/PersonnelManagement";
import NotificationManagement from "./pages/Admin/NotificationManagement";
import AdminDashboard from "./pages/Admin/AdminDashboard";

import ManagerDashboard from "./pages/Manager/ManagerDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";
import ParentDashboard from "./pages/Parent/ParentDashboard";

import CleanerDashboard from "./pages/Staff/CleanerDashboard";
import MaintenanceDashboard from "./pages/Staff/MaintenanceDashboard";
import SecurityDashboard from "./pages/Staff/SecurityDashboard";

function App() {
  const location = useLocation();
  const isDashboardRoute =
    location.pathname.startsWith("/student/dashboard") ||
    location.pathname.startsWith("/parent/dashboard") ||
    location.pathname.startsWith("/staff/dashboard") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/manager/dashboard");

  return (
    <div className="app">
      {!isDashboardRoute && <Header />}
      <main>
        <PageTransition>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<StudentManagement />} />
              <Route
                path="/admin/personnel"
                element={<PersonnelManagement />}
              />
              <Route
                path="/admin/notifications"
                element={<NotificationManagement />}
              />

              {/* Student Routes */}
              <Route path="/student/dashboard" element={<StudentDashboard />} />

              {/* Parent Routes */}
              <Route path="/parent/dashboard" element={<ParentDashboard />} />

              {/* Manager Routes */}
              <Route path="/manager/dashboard" element={<ManagerDashboard />} />

              {/* Staff Routes */}
              <Route
                path="/staff/dashboard/cleaner"
                element={<CleanerDashboard />}
              />
              <Route
                path="/staff/dashboard/maintenance"
                element={<MaintenanceDashboard />}
              />
              <Route
                path="/staff/dashboard/security"
                element={<SecurityDashboard />}
              />
            </Routes>
        </PageTransition>
      </main>
      {!isDashboardRoute && <Footer />}
    </div>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
