import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import HomePage from "./pages/HomePage/HomePage";
import Login from "./pages/Login/Login";
import PageTransition from "./components/PageTransition/PageTransition";

import StudentManagement from "./pages/Admin/StudentManagement";

import ManagerDashboard from "./pages/Manager/ManagerDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";
import ParentDashboard from "./pages/Parent/ParentDashboard";

import CleanerDashboard from "./pages/Staff/CleanerDashboard";
import MaintenanceDashboard from "./pages/Staff/MaintenanceDashboard";
import SecurityDashboard from "./pages/Staff/SecurityDashboard";

function App() {
  const location = useLocation();
  const isDashboardRoute =
    location.pathname.startsWith("/student-dashboard") ||
    location.pathname.startsWith("/parent-dashboard") ||
    location.pathname.startsWith("/staff-dashboard") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/manager_dashbroad");

  return (
    <div className="app">
      {!isDashboardRoute && <Header />}
      <main>
        <PageTransition>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
            <Route path="/admin/students" element={<StudentManagement />} />
            <Route path="/manager_dashbroad" element={<ManagerDashboard />} />
            <Route path="/staff-dashboard/cleaner" element={<CleanerDashboard />} />
            <Route path="/staff-dashboard/maintenance" element={<MaintenanceDashboard />} />
            <Route path="/staff-dashboard/security" element={<SecurityDashboard />} />
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
