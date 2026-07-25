import { useState, useEffect } from "react";
import { getStudentInfo } from "../../api/parentService";
import {
  FaUserGraduate,
  FaIdCard,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaVenusMars,
  FaBookOpen,
} from "react-icons/fa";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import "./ParentDashboard.css";
import "./ParentStudentInfo.css";

function ParentStudentInfo() {
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getStudentInfo();
        if (data && data.success) {
          setStudentInfo(data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin sinh viên:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getGenderText = (gender) => {
    if (gender === "male") return "Nam";
    if (gender === "female") return "Nữ";
    return "Khác";
  };

  return (
    <div className="parent-shell">
      <Sidebar />
      <main className="parent-main">
        <Header avatarText="P" />

        <div className="parent-content" style={{ padding: "32px" }}>
          {loading ? (
            <div className="parent-placeholder" style={{ backgroundColor: "var(--bg-card)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              <h3>Đang tải dữ liệu của con...</h3>
            </div>
          ) : !studentInfo ? (
            <div className="parent-placeholder" style={{ backgroundColor: "var(--bg-card)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              <h3>Không tìm thấy thông tin sinh viên</h3>
            </div>
          ) : (
            <div className="parent-student-info">
              {/* Header Card */}
              <div className="parent-student-header">
                <div className="parent-student-avatar">
                  {studentInfo.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="parent-student-title">
                  <h2>{studentInfo.fullName}</h2>
                  <p>Mã SV: {studentInfo.studentCode}</p>
                  <span className={`parent-student-status ${studentInfo.status === "active" ? "active" : ""}`}>
                    {studentInfo.status === "active" ? "Đang theo học" : "Đã nghỉ"}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="parent-student-grid">
                {/* Personal Info */}
                <div className="parent-student-card">
                  <h3>
                    <FaIdCard /> Thông tin cá nhân
                  </h3>
                  <div className="parent-info-list">
                    <InfoItem
                      icon={<FaBirthdayCake />}
                      label="Ngày sinh"
                      value={formatDate(studentInfo.dateOfBirth)}
                    />
                    <InfoItem
                      icon={<FaVenusMars />}
                      label="Giới tính"
                      value={getGenderText(studentInfo.gender)}
                    />
                  </div>
                </div>

                {/* Academic Info */}
                <div className="parent-student-card">
                  <h3>
                    <FaBookOpen /> Thông tin học tập
                  </h3>
                  <div className="parent-info-list">
                    <InfoItem
                      icon={<FaUserGraduate />}
                      label="Chuyên ngành"
                      value={studentInfo.major || "Chưa cập nhật"}
                    />
                    <InfoItem
                      icon={<FaIdCard />}
                      label="Mã sinh viên"
                      value={studentInfo.studentCode || "Chưa cập nhật"}
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="parent-student-card">
                  <h3>
                    <FaPhoneAlt /> Thông tin liên hệ
                  </h3>
                  <div className="parent-info-list">
                    <InfoItem
                      icon={<FaPhoneAlt />}
                      label="Số điện thoại"
                      value={studentInfo.phone || "Chưa cập nhật"}
                    />
                    <InfoItem
                      icon={<FaEnvelope />}
                      label="Email"
                      value={studentInfo.email || "Chưa cập nhật"}
                    />
                    <InfoItem
                      icon={<FaMapMarkerAlt />}
                      label="Địa chỉ"
                      value={studentInfo.address || "Chưa cập nhật"}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="parent-info-item">
      <div className="parent-info-icon">{icon}</div>
      <div className="parent-info-content">
        <span className="parent-info-label">{label}</span>
        <span className="parent-info-value">{value}</span>
      </div>
    </div>
  );
}

export default ParentStudentInfo;
