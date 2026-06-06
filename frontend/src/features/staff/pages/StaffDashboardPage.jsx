import { useState, useMemo } from "react";
import StaffLayout from "../layout/StaffLayout";
import GateAccessManager from "../components/GateAccessManager";
import MaintenanceTaskManager from "../components/MaintenanceTaskManager";
import RoomCleanManager from "../components/RoomCleanManager";
import { useStaff } from "../hooks/useStaff";

const StaffDashboardPage = () => {
  const [activeRole, setActiveRole] = useState("security");
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
    updateMaintenanceStatus,
    addMaintenanceNote,
    markRoomAsReady,
    reportRoomDamage,
  } = useStaff();

  // Dynamic calculations for operational highlights
  const stats = useMemo(() => {
    return {
      lateInputs: gateAccesses.filter((g) => g.status === "LATE").length,
      pendingRepairs: maintenanceTasks.filter((t) => t.status === "PENDING")
        .length,
      pendingCleanups: cleanTasks.filter((c) => c.status !== "READY").length,
    };
  }, [gateAccesses, maintenanceTasks, cleanTasks]);

  const handleRoleChange = (roleId) => {
    setActiveRole(roleId);
  };

  return (
    <div id="staff-dashboard-page-container">
      <StaffLayout
        currentRole={activeRole}
        onRoleChange={handleRoleChange}
        stats={stats}
      >
        {/* Banner Success Alert */}
        {successMessage && (
          <div
            className="mb-md p-md bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-sm shadow-sm animate-in fade-in duration-200"
            id="toast-success"
          >
            <span className="material-symbols-outlined text-emerald-600">
              check_circle
            </span>
            <span className="text-xs font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Banner Error Alert */}
        {error && (
          <div
            className="mb-md p-md bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl flex items-center gap-sm shadow-sm animate-in fade-in duration-200"
            id="toast-error"
          >
            <span className="material-symbols-outlined text-rose-600">
              error
            </span>
            <span className="text-xs font-semibold">{error}</span>
          </div>
        )}

        {/* Global Loading overlay indicator */}
        {loading && (
          <div
            className="mb-md p-sm bg-blue-50 text-blue-800 border border-blue-100 rounded-xl flex items-center gap-sm text-xs font-semibold animate-pulse"
            id="global-loading"
          >
            <span className="material-symbols-outlined rotate-12">sync</span>
            Đang đồng bộ dữ liệu với bộ nhớ máy chủ...
          </div>
        )}

        {/* Switch matching subcomponent viewport */}
        {activeRole === "security" && (
          <GateAccessManager
            gateAccesses={gateAccesses}
            students={students}
            onViewStudentDetails={viewStudentDetails}
            selectedStudent={selectedStudent}
            onCloseStudentDetails={() => setSelectedStudent(null)}
            onAddViolation={addViolation}
          />
        )}

        {activeRole === "maintenance" && (
          <MaintenanceTaskManager
            tasks={maintenanceTasks}
            onUpdateStatus={updateMaintenanceStatus}
            onAddNote={addMaintenanceNote}
          />
        )}

        {activeRole === "cleaner" && (
          <RoomCleanManager
            cleanTasks={cleanTasks}
            onMarkReady={markRoomAsReady}
            onReportDamage={reportRoomDamage}
          />
        )}
      </StaffLayout>
    </div>
  );
};

export default StaffDashboardPage;
