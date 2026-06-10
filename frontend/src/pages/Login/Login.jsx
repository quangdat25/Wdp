import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../../api/authService';
import logoImg from '../../assets/logo.png';
import dormImg from '../../assets/dorm.jpg';

import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 🆕 Thêm state quản lý vai trò được chọn (Mặc định ban đầu là 'student')
  const [activeRole, setActiveRole] = useState('student');

  const navigate = useNavigate();

  const getRedirectPath = (role) => {
    switch (role) {
      case 'student':
        return '/student/dashboard';
      case 'admin':
        return '/admin/students';
      case 'manager':
        return '/manager/dashboard';
      case 'staff':
        return '/staff/dashboard/security';
      case 'parent':
        return '/parent/dashboard';
      default:
        return '/';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 🆕 Truyền thêm activeRole vào API nếu Backend của bạn yêu cầu phân biệt role khi đăng nhập bằng mật khẩu
      const result = await authService.login(username, password, activeRole);

      if (result.success) {
        const user = result.data;
        localStorage.setItem('user', JSON.stringify(user));
        const redirectPath = getRedirectPath(user.role || activeRole);
        navigate(redirectPath);
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      // 🆕 Truyền thêm activeRole vào Google Login nếu backend cần biết user đăng nhập với vai trò gì
      const result = await authService.googleLogin(credentialResponse.credential, activeRole);
      
      if (result.success) {
        console.log(">>> Toàn bộ dữ liệu trả về từ Backend:", result);
        const user = result.data;
        
        localStorage.setItem('user', JSON.stringify(user));
        if (result.tokens) {
          localStorage.setItem('accessToken', result.tokens.accessToken);
          localStorage.setItem('refreshToken', result.tokens.refreshToken);
        }

        const redirectPath = getRedirectPath(user.role || activeRole);
        navigate(redirectPath);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Đã xảy ra lỗi khi đăng nhập bằng Google';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page bg-surface font-body-md text-on-surface min-h-screen relative overflow-hidden">
      {/* Hero Background Layer */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-700 blur-[10px]" 
        style={{ backgroundImage: `url(${dormImg})`, transform: 'scale(1.05)' }}
      >
        <div className="absolute inset-0 bg-overlay"></div>
      </div>

      {/* Main Content Canvas */}
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
            <h2 className="font-title-md text-title-md text-on-surface">Đăng nhập</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Truy cập hệ thống quản lý ký túc xá</p>
          </div>

          {/* 🆕 NEW: Role Selector Tabs (3 ô chọn vai trò) */}
          <div className="flex bg-[#F0F4F9] p-1 rounded-2xl border border-gray-100 w-full justify-between items-center my-xs">
            <button
              type="button"
              onClick={() => setActiveRole('student')}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeRole === 'student'
                  ? 'bg-white text-[#0A3663] shadow-md'
                  : 'text-[#5C5F62] hover:bg-white/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('parent')}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeRole === 'parent'
                  ? 'bg-white text-[#0A3663] shadow-md'
                  : 'text-[#5C5F62] hover:bg-white/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">group</span>
              <span>Parent</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('staff')} // Bạn có thể sửa thành 'admin' tùy cấu trúc backend
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeRole === 'staff' || activeRole === 'admin'
                  ? 'bg-white text-[#0A3663] shadow-md'
                  : 'text-[#5C5F62] hover:bg-white/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">shield</span>
              <span>Staff / Admin</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="login-error-banner flex items-center gap-sm p-md rounded-lg bg-red-50 border border-red-200">
              <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
              <span className="text-red-600 font-body-md text-sm">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="flex flex-col gap-md" onSubmit={handleLogin}>
            {/* Username Field */}
            <div className="flex flex-col gap-xs">
              <div className="relative group login-input-group">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">alternate_email</span>
                </div>
                <input 
                  id="login-username"
                  className="w-full h-[48px] pl-[52px] pr-md bg-white border border-outline-variant rounded-xl font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline-variant login-input" 
                  placeholder="Tên đăng nhập" 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
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
                  id="login-password"
                  className="w-full h-[48px] pl-[52px] pr-[52px] bg-white border border-outline-variant rounded-xl font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline-variant login-input" 
                  placeholder="Mật khẩu" 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-md flex items-center text-outline hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <a className="font-label-sm text-label-sm text-primary hover:underline transition-all" href="#">Quên mật khẩu?</a>
            </div>

            {/* Primary Login Button */}
            <button 
              id="login-submit"
              type="submit" 
              disabled={loading}
              className={`w-full h-[48px] bg-secondary-container text-on-primary font-title-md text-title-md rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
            
            {/* Divider */}
            <div className="flex items-center gap-sm my-xs">
              <div className="h-[1px] bg-outline-variant/30 flex-1"></div>
              <span className="font-label-sm text-on-surface-variant text-xs uppercase tracking-wider">Hoặc</span>
              <div className="h-[1px] bg-outline-variant/30 flex-1"></div>
            </div>

            {/* Google Login Button */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => {
                  setError('Đăng nhập Google thất bại');
                }}
                useOneTap
                theme="outline"
                size="large"
                shape="rectangular"
                width="100%"
                text="signin_with"
              />
            </div>
          </form>

          {/* Secondary Action / Help */}
          <div className="pt-sm flex justify-center border-t border-outline-variant/20">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Cần hỗ trợ kỹ thuật? <a className="text-primary font-bold hover:underline" href="#">Liên hệ hỗ trợ</a>
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
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