import React from 'react';
import './StaffLayout.css';

const StaffLayout = ({ children, currentRole, onRoleChange, stats, hideRoleSelector }) => {
  const roles = [
    {
      id: 'security',
      name: 'Security Staff',
      title: 'Đội Ngũ Bảo Vệ',
      icon: 'shield',
      color: '#e8601c',
      desc: 'Giám sát cổng, quản lý vi phạm.',
      badge: 'PHÒNG AN NINH',
      agentName: 'Nguyễn Bảo An',
      agentTitle: 'Đại úy Trực Ban'
    },
    {
      id: 'maintenance',
      name: 'Maintenance Staff',
      title: 'Đội Ngũ Bảo Trì',
      icon: 'build',
      color: '#4CAF50',
      desc: 'Xử lý kỹ thuật & khắc phục lỗi.',
      badge: 'BAN KỸ THUẬT',
      agentName: 'Lưu Huy Hoàng',
      agentTitle: 'Kỹ sư Trực Điện Nước'
    },
    {
      id: 'cleaner',
      name: 'Cleaner Staff',
      title: 'Đội Ngũ Vệ Sinh',
      icon: 'clean_hands',
      color: '#00346f',
      desc: 'Dọn dẹp phòng, kiểm tra buồng.',
      badge: 'TỔ DỌN DẸP & VỆ SINH',
      agentName: 'Phạm Thị Liên',
      agentTitle: 'Tổ trưởng Lao công'
    }
  ];

  const activeRoleData = roles.find(r => r.id === currentRole) || roles[0];

  return (
    <div className="staff-layout" id="staff-layout-root">
      {/* Sidebar Panel */}
      <aside className="staff-sidebar" id="staff-sidebar-menu">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <span className="material-symbols-outlined text-[32px] text-primary">diversity_3</span>
          </div>
          <div className="brand-text">
            <h4>Dorm Operator</h4>
            <span>Staff Portal v1.2</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {hideRoleSelector ? (
            // Dedicated Single Role Display (Logged In)
            <div className="logged-role-container p-md bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-sm mb-lg animate-in fade-in duration-200">
              <span className="text-[10px] bg-slate-200 text-slate-700 font-extrabold px-sm py-[2px] rounded-full self-start">
                {activeRoleData.badge}
              </span>
              <div className="flex items-center gap-sm mt-xs">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: activeRoleData.color }}
                >
                  <span className="material-symbols-outlined">{activeRoleData.icon}</span>
                </div>
                <div>
                  <h5 className="font-title-md text-slate-800 text-sm m-0 leading-tight">{activeRoleData.title}</h5>
                  <span className="text-slate-400 text-[11px] font-medium block mt-[2px]">{activeRoleData.name}</span>
                </div>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed mt-2 pt-2 border-t border-slate-200">
                {activeRoleData.desc}
              </p>
            </div>
          ) : (
            // Full switcher (Admin/Simulation Mode)
            <>
              <div className="nav-section-title">CHỌN VAI TRÒ NHÂN VIÊN</div>
              <div className="role-cards-container">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => onRoleChange(role.id)}
                    className={`role-selector-card ${currentRole === role.id ? 'active' : ''}`}
                    style={{ '--role-color': role.color }}
                    id={`role-btn-${role.id}`}
                  >
                    <div className="role-icon-wrapper">
                      <span className="material-symbols-outlined">{role.icon}</span>
                    </div>
                    <div className="role-card-info">
                      <span className="role-name">{role.name}</span>
                      <span className="role-desc">{role.title}</span>
                    </div>
                    {currentRole === role.id && <div className="active-indicator" />}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="sidebar-footer">
            <div className="staff-profile-card">
              <div className="profile-avatar">
                <span className="material-symbols-outlined text-[32px] text-slate-400">account_circle</span>
              </div>
              <div className="profile-info">
                <strong>{hideRoleSelector ? activeRoleData.agentName : 'Nguyễn Văn Quyết'}</strong>
                <span>{hideRoleSelector ? activeRoleData.agentTitle : 'Quản trị viên Ca Trực'}</span>
              </div>
            </div>
            <a href="/login" className="btn-back-home" id="btn-back-home">
              <span className="material-symbols-outlined">logout</span>
              Đăng xuất
            </a>
          </div>
        </nav>
      </aside>

      {/* Main Board Area */}
      <main className="staff-viewport" id="staff-main-viewport">
        {/* Header Bar */}
        <header className="viewport-header">
          <div className="header-title-box">
            <h1>Hệ Thống Phân Hệ Nhân Viên</h1>
            <p>On-Campus Dormitory Booking & Operational Control Room</p>
          </div>

          {/* Quick Realtime Stats cards */}
          <div className="quick-stats-row">
            <div className="stat-pill border-l-4 border-amber-500">
              <div className="pill-val">{stats.lateInputs || 0}</div>
              <div className="pill-lbl">Lượt vào muộn</div>
            </div>
            <div className="stat-pill border-l-4 border-red-500">
              <div className="pill-val">{stats.pendingRepairs || 0}</div>
              <div className="pill-lbl">Y/C Bảo trì tồn</div>
            </div>
            <div className="stat-pill border-l-4 border-blue-500">
              <div className="pill-val">{stats.pendingCleanups || 0}</div>
              <div className="pill-lbl">Phòng chờ dọn</div>
            </div>
          </div>
        </header>

        {/* View Contents */}
        <section className="viewport-content" id="viewport-main-content">
          {children}
        </section>
      </main>
    </div>
  );
};

export default StaffLayout;
