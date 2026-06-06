import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import HomePage from "./pages/HomePage/HomePage";
import Login from "./pages/Login/Login";
import PageTransition from "./components/PageTransition/PageTransition";
import StudentManagement from "./pages/Admin/StudentManagement";

function App() {
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith("/staff-dashboard") ||
    location.pathname.startsWith("/admin");

  return (
    <div className="app">
      {!isAdminRoute && <Header />}
      <main>
        <PageTransition>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/student-dashboard"
              element={
                <div style={{ padding: "100px", textAlign: "center" }}>
                  <h2>Student Dashboard</h2>
                </div>
              }
            />
            <Route
              path="/parent-dashboard"
              element={
                <div style={{ padding: "100px", textAlign: "center" }}>
                  <h2>Parent Dashboard</h2>
                </div>
              }
            />
            <Route path="/staff-dashboard" element={<StudentManagement />} />
            <Route path="/admin/students" element={<StudentManagement />} />
          </Routes>
        </PageTransition>
      </main>
      {!isAdminRoute && <Footer />}
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
