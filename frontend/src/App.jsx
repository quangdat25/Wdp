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
import AdminDashboard from "./pages/Admin/AdminDashboard";

import ManagerDashboard from "./pages/Manager/ManagerDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";
import BookingRoom from "./pages/Student/BookingRoom";
import BookingResult from "./pages/Student/BookingResult";
import ParentDashboard from "./pages/Parent/ParentDashboard";
import ParentStudentInfo from "./pages/Parent/ParentStudentInfo";

import CleanerDashboard from "./pages/Staff/CleanerDashboard";
import MaintenanceDashboard from "./pages/Staff/MaintenanceDashboard";
import SecurityDashboard from "./pages/Staff/SecurityDashboard";
import MyTickets from "./pages/Student/MyTickets";
import TicketManagement from "./pages/Manager/TicketManagement";
import ViolationManagement from "./pages/Manager/ViolationManagement";
import UtilityUsageManagement from "./pages/Staff/UtilityUsageManagement";
import UtilityInvoiceManagement from "./pages/Manager/UtilityInvoiceManagement";
import MyInvoices from "./pages/Student/MyInvoices";
import PaymentResult from "./pages/Student/PaymentResult";
import SemesterManagement from "./pages/Admin/SemesterManagement";
import BookingManagement from "./pages/Manager/BookingManagement";
import MyUtilities from "./pages/Student/MyUtilities";

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
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
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
              <Route path="/admin/buildings" element={<RoomManagement />} />
              <Route path="/admin/rooms" element={<RoomManagement />} />
              <Route path="/admin/semesters" element={<SemesterManagement />} />
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/booking" element={<BookingRoom />} />
              <Route
                path="/student/booking-result"
                element={<BookingResult />}
              />
              <Route path="/student/tickets" element={<MyTickets />} />
              <Route path="/student/invoices" element={<MyInvoices />} />
              <Route
                path="/student/payment-result"
                element={<PaymentResult />}
              />
              <Route path="/student/my-utilities" element={<MyUtilities />} />
            </Route>

            {/* Parent Routes */}
            <Route element={<ProtectedRoute allowedRoles={["parent"]} />}>
              <Route path="/parent/dashboard" element={<ParentDashboard />} />
              <Route path="/parent/student" element={<ParentStudentInfo />} />
            </Route>

            {/* Manager Routes */}
            <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
              <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              <Route path="/manager/notifications" element={<ManagerDashboard />} />
              <Route path="/manager/tickets" element={<TicketManagement />} />
              <Route
                path="/manager/violations"
                element={<ViolationManagement />}
              />
              <Route
                path="/manager/utility-invoices"
                element={<UtilityInvoiceManagement />}
              />
              <Route path="/manager/bookings" element={<BookingManagement />} />
            </Route>

            {/* Staff Routes */}
            <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
              <Route
                path="/staff/dashboard/cleaner/*"
                element={
                  <ProtectedRoute
                    allowedRoles={["staff"]}
                    allowedStaffTypes={["cleaner"]}
                  >
                    <CleanerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/dashboard/maintenance/*"
                element={
                  <ProtectedRoute
                    allowedRoles={["staff"]}
                    allowedStaffTypes={["maintenance"]}
                  >
                    <MaintenanceDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/dashboard/security/*"
                element={
                  <ProtectedRoute
                    allowedRoles={["staff"]}
                    allowedStaffTypes={["security"]}
                  >
                    <SecurityDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/utility-usages"
                element={<UtilityUsageManagement />}
              />
            </Route>
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
