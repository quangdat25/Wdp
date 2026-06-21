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
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentManagement />} />
            <Route path="/admin/personnel" element={<PersonnelManagement />} />
            <Route
              path="/admin/notifications"
              element={<NotificationManagement />}
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
