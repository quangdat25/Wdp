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
import RoomManagement from "./pages/Admin/RoomManagement";

import ManagerDashboard from "./pages/Manager/ManagerDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";
import ParentDashboard from "./pages/Parent/ParentDashboard";

import CleanerDashboard from "./pages/Staff/CleanerDashboard";
import MaintenanceDashboard from "./pages/Staff/MaintenanceDashboard";
import SecurityDashboard from "./pages/Staff/SecurityDashboard";
import CreateTicket from "./pages/Student/CreateTicket";
import MyTickets from "./pages/Student/MyTickets";
import TicketManagement from "./pages/Manager/TicketManagement";

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="app">
      {isHomePage && <Header />}
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
              path="/admin/rooms" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RoomManagement />
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

            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/support/request" element={<CreateTicket />} />
            <Route path="/student/my/tickets" element={<MyTickets/>} />
            {/* Parent Routes */}
            <Route path="/parent/dashboard" element={<ParentDashboard />} />

            {/* Manager Routes */}
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/tickets" element={<TicketManagement />} />

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
      {isHomePage && <Footer />}
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
