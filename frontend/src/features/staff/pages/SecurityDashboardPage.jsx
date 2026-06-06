import React, { useMemo } from "react";
import StaffLayout from "../layout/StaffLayout";
import GateAccessManager from "../components/GateAccessManager";
import { useStaff } from "../hooks/useStaff";

const SecurityDashboardPage = () => {
  const {
    loading,
    error,
    successMessage,
    students,
    gateAccesses,
    maintenanceTasks,
    cleanTasks,
    selectedStudent,
    setSelectedStudent,
    viewStudentDetails,
    addViolation,
  } = useStaff();

  const stats = useMemo(() => {
    return {
      lateInputs: gateAccesses.filter((g) => g.status === "LATE").length,
      pendingRepairs: maintenanceTasks.filter((t) => t.status === "PENDING")
        .length,
      pendingCleanups: cleanTasks.filter((c) => c.status !== "READY").length,
    };
  }, [gateAccesses, maintenanceTasks, cleanTasks]);

  return (
    <div id="security-dashboard-container">
      <StaffLayout currentRole="security" stats={stats} hideRoleSelector={true}>
        {successMessage && (
          <div
            className="mb-md p-md bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-sm shadow-sm animate-in fade-in"
            id="toast-success"
          >
            <span className="material-symbols-outlined text-emerald-600">
              check_circle
            </span>
            <span className="text-xs font-semibold">{successMessage}</span>
          </div>
        )}

        {error && (
          <div
            className="mb-md p-md bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl flex items-center gap-sm shadow-sm animate-in fade-in"
            id="toast-error"
          >
            <span className="material-symbols-outlined text-rose-600">
              error
            </span>
            <span className="text-xs font-semibold">{error}</span>
          </div>
        )}

        {loading && (
          <div className="mb-md p-sm bg-blue-50 text-blue-800 border border-blue-100 rounded-xl flex items-center gap-sm text-xs font-semibold animate-pulse">
            <span className="material-symbols-outlined rotate-12">sync</span>
            Đồng bộ dữ liệu an ninh...
          </div>
        )}

        <GateAccessManager
          gateAccesses={gateAccesses}
          students={students}
          onViewStudentDetails={viewStudentDetails}
          selectedStudent={selectedStudent}
          onCloseStudentDetails={() => setSelectedStudent(null)}
          onAddViolation={addViolation}
        />
      </StaffLayout>
    </div>
  );
};

export default SecurityDashboardPage;
