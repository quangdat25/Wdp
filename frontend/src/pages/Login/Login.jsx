import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import dormImg from '../../assets/dorm.jpg';
import './Login.css';

function Login() {
  const [role, setRole] = useState('Staff / Admin');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'Student') {
      navigate('/student/dashboard');
    } else if (role === 'Parent') {
      navigate('/parent/dashboard');
    } else {
      navigate('/staff/dashboard');
    }
  };

  return (
    <div className="login-page bg-surface font-body-md text-on-surface min-h-screen relative overflow-hidden">
      {/* Hero Background Layer */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-700 blur-[10px]" 
        style={{ backgroundImage: `url(${dormImg})`, transform: 'scale(1.05)' }}
      >
        {/* Dimming Overlay */}
        <div className="absolute inset-0 bg-overlay"></div>
      </div>

      {/* Main Content Canvas (Fixed Centered Model) */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-margin-mobile md:px-0">
        {/* Glassmorphic Login Modal */}
        <section className="glass-modal w-full max-w-[480px] rounded-xl p-xl shadow-[0px_4px_20px_rgba(0,0,0,0.1)] flex flex-col gap-lg">
          
          {/* Logo & Identity Section */}
          <div className="flex flex-col items-center md:items-start gap-sm">
            <div className="flex items-center gap-md">
              <img alt="Logo" className="w-12 h-12 rounded-lg object-contain bg-white" src={logoImg} />
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Dorm Booking System</h1>
            </div>
          </div>

          {/* Header */}
          <div className="mt-md">
            <h2 className="font-title-md text-title-md text-on-surface">Login</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Access your dormitory portal</p>
          </div>

          {/* Role Tabs (Segmented Control) */}
          <nav className="flex p-xs bg-surface-container-low rounded-xl w-full">
            <button 
              type="button"
              onClick={() => setRole('Student')}
              className={`flex-1 flex flex-col items-center justify-center gap-xs py-sm px-xs rounded-lg transition-all duration-200 active:scale-95 ${role === 'Student' ? 'bg-white shadow-sm text-primary font-bold' : 'hover:bg-white/50 text-on-surface-variant'}`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: role === 'Student' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
              <span className={`font-label-sm text-label-sm ${role === 'Student' ? 'font-bold' : ''}`}>Student</span>
            </button>
            <button 
              type="button"
              onClick={() => setRole('Parent')}
              className={`flex-1 flex flex-col items-center justify-center gap-xs py-sm px-xs rounded-lg transition-all duration-200 active:scale-95 ${role === 'Parent' ? 'bg-white shadow-sm text-primary font-bold' : 'hover:bg-white/50 text-on-surface-variant'}`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: role === 'Parent' ? "'FILL' 1" : "'FILL' 0" }}>group</span>
              <span className={`font-label-sm text-label-sm ${role === 'Parent' ? 'font-bold' : ''}`}>Parent</span>
            </button>
            <button 
              type="button"
              onClick={() => setRole('Staff / Admin')}
              className={`flex-1 flex flex-col items-center justify-center gap-xs py-sm px-xs rounded-lg transition-all duration-200 active:scale-95 ${role === 'Staff / Admin' ? 'bg-white shadow-sm text-primary font-bold' : 'hover:bg-white/50 text-on-surface-variant'}`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: role === 'Staff / Admin' ? "'FILL' 1" : "'FILL' 0" }}>shield</span>
              <span className={`font-label-sm text-label-sm ${role === 'Staff / Admin' ? 'font-bold' : ''}`}>Staff / Admin</span>
            </button>
          </nav>

          {/* Login Form */}
          <form className="flex flex-col gap-md" onSubmit={handleLogin}>
            {/* Username Field */}
            <div className="flex flex-col gap-xs">
              <div className="relative group login-input-group">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">alternate_email</span>
                </div>
                <input 
                  className="w-full h-[48px] pl-[52px] pr-md bg-white border border-outline-variant rounded-xl font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline-variant login-input" 
                  placeholder="Username" 
                  type="text" 
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-xs">
              <div className="relative group login-input-group">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">lock</span>
                </div>
                <input 
                  className="w-full h-[48px] pl-[52px] pr-md bg-white border border-outline-variant rounded-xl font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline-variant login-input" 
                  placeholder="Password" 
                  type="password" 
                  required
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <a className="font-label-sm text-label-sm text-primary hover:underline transition-all" href="#">Forgot Password?</a>
            </div>

            {/* Primary Login Button */}
            <button type="submit" className="w-full h-[48px] bg-secondary-container text-on-primary font-title-md text-title-md rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-sm">
              Login
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          {/* Secondary Action / Help */}
          <div className="pt-sm flex justify-center border-t border-outline-variant/20">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Need technical assistance? <a className="text-primary font-bold hover:underline" href="#">Contact Support</a>
            </p>
          </div>
        </section>
      </main>

      {/* Shared Component: Footer (Hidden on focused login screens usually, but following mandate) */}
      <footer className="w-full absolute bottom-0 flex flex-col md:flex-row justify-center items-center gap-md pb-sm font-label-sm text-label-sm text-white/70">
        <div className="px-margin-desktop flex flex-col md:flex-row justify-between items-center w-full max-w-7xl">
          <p>© 2024 Dormitory Management Systems. All rights reserved.</p>
          <div className="flex gap-lg mt-sm md:mt-0">
            <a className="hover:text-white transition-opacity" href="#">Privacy Policy</a>
            <a className="hover:text-white transition-opacity" href="#">Terms of Service</a>
            <a className="hover:text-white transition-opacity" href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Login;
