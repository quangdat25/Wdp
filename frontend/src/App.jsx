import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import Login from './pages/Login/Login';
import PageTransition from './components/PageTransition/PageTransition';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main>
          <PageTransition>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/student-dashboard" element={<div style={{padding: '100px', textAlign: 'center'}}><h2>Student Dashboard</h2></div>} />
              <Route path="/parent-dashboard" element={<div style={{padding: '100px', textAlign: 'center'}}><h2>Parent Dashboard</h2></div>} />
              <Route path="/staff-dashboard" element={<div style={{padding: '100px', textAlign: 'center'}}><h2>Staff/Admin Dashboard</h2></div>} />
            </Routes>
          </PageTransition>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
