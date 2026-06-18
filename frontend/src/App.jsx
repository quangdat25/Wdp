import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import HomePage from "./pages/HomePage/HomePage";
import Login from "./pages/Login/Login";
import PageTransition from "./components/PageTransition/PageTransition";
import ProtectedRoute from "./components/ProtectedRoute";

import StudentManagement from "./pages/Admin/StudentManagement";
import PersonnelManagement from "./pages/Admin/PersonnelManagement";
import NotificationManagement from "./pages/Admin/NotificationManagement";

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
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/parent/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/students" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StudentManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/personnel" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PersonnelManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/notifications" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <NotificationManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff/dashboard/cleaner" 
              element={
                <ProtectedRoute allowedRoles={['staff']} allowedStaffTypes={['cleaner']}>
                  <CleanerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff/dashboard/maintenance" 
              element={
                <ProtectedRoute allowedRoles={['staff']} allowedStaffTypes={['maintenance']}>
                  <MaintenanceDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff/dashboard/security" 
              element={
                <ProtectedRoute allowedRoles={['staff']} allowedStaffTypes={['security']}>
                  <SecurityDashboard />
                </ProtectedRoute>
              } 
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
