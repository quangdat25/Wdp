import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import HomePage from "./pages/HomePage/HomePage";
import Login from "./pages/Login/Login";
import PageTransition from "./components/PageTransition/PageTransition";
import StudentManagement from "./pages/Admin/StudentManagement";
import StudentDashboard from "./pages/Student/StudentDashboard";
import ParentDashboard from "./pages/Parent/ParentDashboard";

function App() {
  const location = useLocation();
  const isDashboardRoute =
    location.pathname.startsWith("/student-dashboard") ||
    location.pathname.startsWith("/parent-dashboard") ||
    location.pathname.startsWith("/staff-dashboard") ||
    location.pathname.startsWith("/admin");

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
            <Route path="/staff-dashboard" element={<StudentManagement />} />
            <Route path="/admin/students" element={<StudentManagement />} />
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
