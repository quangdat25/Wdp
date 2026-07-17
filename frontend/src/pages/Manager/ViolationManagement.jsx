import React, { useState, useEffect, useMemo } from "react";
import {
  getViolations,
  approveViolation,
  rejectViolation,
  revokeViolation,
} from "../../api/violationService";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import { showSuccess, showError, showConfirm } from "../../components/alert";
import { socket } from "../../socket";

import ViolationPageHeader from "./components/Violations/ViolationPageHeader";
import ViolationFilterBar from "./components/Violations/ViolationFilterBar";
import ViolationTable from "./components/Violations/ViolationTable";
import ViolationDetailModal from "./components/Violations/ViolationDetailModal";

function ViolationManagement() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [selectedViolation, setSelectedViolation] = useState(null);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const res = await getViolations();
      if (res.success) {
        // Soft sort by created descending
        const data = res.data || [];
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setViolations(data);
      }
    } catch (error) {
      showError("Lỗi tải danh sách vi phạm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();

    const handleNewViolation = () => {
      fetchViolations();
    };

    socket.on("new_violation_created", handleNewViolation);

    return () => {
      socket.off("new_violation_created", handleNewViolation);
    };
  }, []);

  const stats = useMemo(() => {
    return {
      pending: violations.filter((v) => v.status === "PENDING").length,
      approved: violations.filter((v) => v.status === "APPROVED").length,
      rejected: violations.filter((v) => v.status === "REJECTED").length,
      revoked: violations.filter((v) => v.status === "REVOKED").length,
    };
  }, [violations]);

  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      // Status Filter
      if (statusFilter !== "ALL" && v.status !== statusFilter) return false;

      // Search Filter
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const studentName = (v.studentId?.fullName || "").toLowerCase();
        const studentId = (v.studentId?.studentCode || "").toLowerCase();
        const roomName = (v.studentId?.roomId?.roomNumber || "").toLowerCase();

        if (!studentName.includes(lowerSearch) && !studentId.includes(lowerSearch) && !roomName.includes(lowerSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [violations, statusFilter, searchTerm]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  const handleView = (violation) => {
    setSelectedViolation(violation);
  };

  const handleApprove = async (violation, points = 5) => {
    try {
      await approveViolation(violation._id, Number(points));
      showSuccess("Duyệt thành công! Đã trừ điểm sinh viên.");
      setSelectedViolation(null);
      fetchViolations();
    } catch (error) {
      showError(error.response?.data?.message || "Lỗi khi duyệt");
    }
  };

  const handleReject = async (id) => {
    const confirm = await showConfirm(
      "Từ chối yêu cầu?",
      "Bạn có chắc chắn muốn từ chối biên bản này không? Sinh viên sẽ không bị trừ điểm.",
      "Từ chối",
    );

    if (!confirm) return;
    try {
      await rejectViolation(id);
      showSuccess("Đã từ chối biên bản");
      if (selectedViolation && selectedViolation._id === id) {
        setSelectedViolation(null);
      }
      fetchViolations();
    } catch (error) {
      showError(error.response?.data?.message || "Lỗi khi từ chối");
    }
  };

  const handleRevoke = async (violation, reason) => {
    if (!reason || !reason.trim()) {
      showError("Vui lòng nhập lý do thu hồi");
      return;
    }
    try {
      await revokeViolation(violation._id, reason);
      showSuccess("Đã thu hồi biên bản và hoàn lại điểm cho sinh viên");
      setSelectedViolation(null);
      fetchViolations();
    } catch (error) {
      showError(error.response?.data?.message || "Lỗi khi thu hồi");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F6FAF7",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Sidebar />
      <main
        style={{
          marginLeft: 270,
          flex: 1,
          padding: "24px 32px",
          height: "100vh",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <Header />

        <ViolationPageHeader stats={stats} />

        <ViolationFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onReset={handleResetFilters}
          onRefresh={fetchViolations}
        />

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#6B7280" }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>⏳</div>
            Đang tải dữ liệu...
          </div>
        ) : (
          <ViolationTable
            violations={filteredViolations}
            onView={handleView}
            onApprove={(v) => handleApprove(v, 5)} // Default from action menu
            onReject={(vId) => handleReject(vId)}
            onRevoke={(v) => handleView(v)} // Action menu -> Open modal to input reason
          />
        )}

        <ViolationDetailModal
          violation={selectedViolation}
          onClose={() => setSelectedViolation(null)}
          onApprove={handleApprove}
          onReject={(id) => handleReject(id)}
          onRevoke={handleRevoke}
        />
      </main>
    </div>
  );
}

export default ViolationManagement;
