import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import bookingService from "../../api/bookingService";
import semesterService from "../../api/semesterService";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import { showError } from "../../components/alert";

const statusColors = {
  pending: { background: "#fef3c7", color: "#92400e", label: "Chờ thanh toán" },
  confirmed: { background: "#dbeafe", color: "#1d4ed8", label: "Đã xác nhận" },
  checked_in: { background: "#dcfce7", color: "#166534", label: "Đang ở" },
  checked_out: { background: "#f1f5f9", color: "#475569", label: "Đã trả phòng" },
  cancelled: { background: "#fee2e2", color: "#b91c1c", label: "Đã hủy" },
};

const filterOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "upcoming", label: "Sắp tới" },
  { value: "staying", label: "Đang trong kì" },
  { value: "completed", label: "Đã kết thúc" },
];

const MyRoom = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentSemester, setCurrentSemester] = useState(null);
  const [allSemesters, setAllSemesters] = useState([]);

  const [showRoommates, setShowRoommates] = useState(false);
  const [selectedRoommates, setSelectedRoommates] = useState([]);
  const [loadingRoommates, setLoadingRoommates] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [historyResult, semesterResult, allSemestersResult] = await Promise.allSettled([
          bookingService.getMyBookingHistory(),
          semesterService.getCurrentSemester(),
          semesterService.getAllSemesters(),
        ]);

        if (historyResult.status === "fulfilled" && historyResult.value?.success) {
          setHistory(historyResult.value.data);
        } else if (historyResult.status === "rejected") {
          console.error("Lỗi khi tải lịch sử phòng:", historyResult.reason);
          showError("Lỗi khi tải lịch sử phòng.");
        }

        if (semesterResult.status === "fulfilled" && semesterResult.value) {
          setCurrentSemester(semesterResult.value);
        } else if (semesterResult.status === "rejected") {
          console.error("Không tải được kỳ hiện tại:", semesterResult.reason);
        }

        if (allSemestersResult.status === "fulfilled" && allSemestersResult.value) {
          // allSemestersResult.value is an array of Year objects, each having a 'semesters' array
          // We can flatten it so it's easier to find a semester by code
          const flatSemesters = allSemestersResult.value.flatMap(year => year.semesters || []);
          setAllSemesters(flatSemesters);
        }
      } catch (err) {
        showError("Lỗi không mong muốn khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredHistory = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return history.filter((booking) => {
      // Hide pending bookings as they are handled in the invoice section
      if (booking.status === "pending") return false;

      const room = booking.roomId || {};
      const buildingName = room.building?.name || "";
      const roomName = room.displayName || "";

      // Filter by status category
      let matchStatus = true;
      if (statusFilter === "upcoming") {
        matchStatus = booking.status === "confirmed";
      } else if (statusFilter === "staying") {
        matchStatus = booking.status === "checked_in";
      } else if (statusFilter === "completed") {
        matchStatus = booking.status === "checked_out" || booking.status === "cancelled";
      }

      // Filter by keyword
      const matchKeyword = keyword
        ? [buildingName, roomName, booking.semester, booking.status]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
        : true;

      return matchStatus && matchKeyword;
    });
  }, [history, searchText, statusFilter]);

  const formatSemesterDisplay = (semesterStr) => {
    if (!semesterStr) return "N/A";
    if (semesterStr.includes(" ")) return semesterStr;

    const prefix = semesterStr.substring(0, 2).toUpperCase();
    const yearSuffix = semesterStr.substring(2);
    
    let season = "";
    if (prefix === "SU") season = "Summer";
    else if (prefix === "FA") season = "Fall";
    else if (prefix === "SP") season = "Spring";
    else return semesterStr;
    
    return `${season} 20${yearSuffix}`;
  };

  const groupedHistory = useMemo(() => {
    const groups = {};
    filteredHistory.forEach((booking) => {
      const sem = formatSemesterDisplay(booking.semester);
      if (!groups[sem]) groups[sem] = [];
      groups[sem].push(booking);
    });
    return groups;
  }, [filteredHistory]);

  const handleRenew = (booking, hasRenewed) => {
    // 1. Kiểm tra xem sinh viên đã gia hạn chưa
    if (hasRenewed) {
      const renewedBooking = history.find(b => b.renewedFrom === booking._id);
      const roomName = renewedBooking?.roomId?.displayName || "N/A";
      const buildingName = renewedBooking?.roomId?.building?.name || "N/A";
      const bedNo = renewedBooking?.bedNumber || "N/A";
      
      showError(`Bạn đã book phòng cho kì sau: Giường ${bedNo} - Phòng ${roomName} - Tòa ${buildingName}`);
      return;
    }

    // 2. Lấy thông tin chi tiết của kỳ học của booking này
    const bookingSemData = allSemesters.find(s => s.code === booking.semester || `${s.name} ${s.year}` === booking.semester) || currentSemester;

    if (!bookingSemData?.renewalStartDate || !bookingSemData?.renewalEndDate) {
      showError("Hệ thống chưa thiết lập thời gian gia hạn.");
      return;
    }

    const startStr = formatDate(bookingSemData.renewalStartDate);
    const endStr = formatDate(bookingSemData.renewalEndDate);

    // 3. Nếu là phòng của kỳ tương lai (chưa ở)
    if (booking.status === "confirmed") {
      showError(`Chưa đến ngày gia hạn cho kì học này. Thời gian gia hạn: từ ${startStr} đến ${endStr}`);
      return;
    }

    // 4. Logic cho kỳ hiện tại
    const now = new Date().getTime();
    const start = new Date(bookingSemData.renewalStartDate).setHours(0, 0, 0, 0);
    const end = new Date(bookingSemData.renewalEndDate).setHours(23, 59, 59, 999);

    const bookingSemesterMatch = booking.semester === currentSemester.code || booking.semester === `${currentSemester.name} ${currentSemester.year}`;

    if (!bookingSemesterMatch) {
      showError(`Phòng này thuộc kỳ ${booking.semester}, hiện tại đang là kỳ ${currentSemester.name} ${currentSemester.year} nên chưa thể gia hạn.`);
      return;
    }

    if (now < start || now > end) {
      showError(`Chưa đến thời gian gia hạn phòng hoặc hệ thống chưa mở. Thời gian gia hạn: từ ${startStr} đến ${endStr}`);
      return;
    }

    navigate("/student/booking", {
      state: {
        isRenew: true,
        roomId: booking.roomId._id,
        roomNumber: booking.roomId.displayName,
        bedNumber: booking.bedNumber,
        renewedFrom: booking._id,
      },
    });
  };

  const handleShowRoommates = async (booking) => {
    try {
      setLoadingRoommates(true);
      setShowRoommates(true);
      const res = await bookingService.getRoommates(booking.roomId._id, booking.semester);
      if (res && res.success) {
        setSelectedRoommates(res.data);
      } else {
        showError("Không thể lấy danh sách bạn cùng phòng");
        setSelectedRoommates([]);
      }
    } catch (error) {
      console.error(error);
      showError("Lỗi khi lấy danh sách bạn cùng phòng");
      setSelectedRoommates([]);
    } finally {
      setLoadingRoommates(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Chưa có";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatDateTime = (date) => {
    if (!date) return "Chưa có";
    return new Date(date).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getCheckinDisplay = (booking) => {
    if (booking.status === "confirmed" || booking.status === "pending") {
      return "—";
    }
    return formatDate(booking.startDate);
  };

  const getCheckoutDisplay = (booking) => {
    if (booking.status === "checked_out") {
      return formatDate(booking.checkOutDate || booking.updatedAt);
    }
    return "—";
  };

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("vi-VN") + "đ";
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#f8fbff] to-[#f3f8f6]">
      <Sidebar />
      <main className="ml-[270px] w-[calc(100%-270px)] p-6 min-h-screen font-sans relative">
        <Header />

        <div className="bg-white/70 border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between mb-6 backdrop-blur-md mt-6">
          <div>
            <h1 className="text-[34px] text-[#1e4f8f] m-0 font-bold">Lịch sử phòng ở</h1>
            <p className="text-slate-500 m-0 mt-1">Xem danh sách các phòng bạn đã đặt và tiến hành gia hạn.</p>
          </div>
        </div>

        <section className="bg-white/80 rounded-3xl p-6 shadow-md border border-slate-200 backdrop-blur-md">
          <div className="flex flex-wrap gap-4 justify-between items-center mb-5">
            <div>
              <h2 className="m-0 text-[22px] font-bold text-slate-800">Danh sách phòng</h2>
              <p className="m-0 mt-1.5 text-slate-500">
                Có {filteredHistory.length} kết quả phù hợp
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_220px] gap-3 mb-5">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm theo tòa nhà, phòng, kỳ..."
              className="min-h-[46px] rounded-xl border border-slate-300 px-4 text-sm bg-white outline-none focus:border-blue-500 transition-colors shadow-inner"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-[46px] rounded-xl border border-slate-300 px-4 text-sm bg-white outline-none focus:border-blue-500 transition-colors"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded-[18px] border border-slate-100">
              Đang tải dữ liệu...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded-[18px] border border-slate-100">
              Không có dữ liệu lịch sử phòng
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedHistory).map(([semesterName, bookings]) => (
                <div key={semesterName} className="bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-[#f0f5fa] px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="m-0 text-[18px] font-bold text-[#1e4f8f] flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3b82f6]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Kỳ học: {semesterName}
                    </h3>
                    <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                      {bookings.length} phòng
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="bg-white text-left">
                          <th className="px-5 py-4 border-b border-slate-100 text-slate-500 font-semibold text-sm uppercase tracking-wider">Mã sinh viên</th>
                          <th className="px-5 py-4 border-b border-slate-100 text-slate-500 font-semibold text-sm uppercase tracking-wider">Phòng & Tòa</th>
                          <th className="px-5 py-4 border-b border-slate-100 text-slate-500 font-semibold text-sm uppercase tracking-wider">Ngày check-in</th>
                          <th className="px-5 py-4 border-b border-slate-100 text-slate-500 font-semibold text-sm uppercase tracking-wider">Ngày trả phòng</th>
                          <th className="px-5 py-4 border-b border-slate-100 text-slate-500 font-semibold text-sm uppercase tracking-wider">Giá phòng</th>
                          <th className="px-5 py-4 border-b border-slate-100 text-slate-500 font-semibold text-sm uppercase tracking-wider">Trạng thái</th>
                          <th className="px-5 py-4 border-b border-slate-100 text-slate-500 font-semibold text-sm uppercase tracking-wider text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => {
                          const room = booking.roomId || {};
                          const building = room.building || {};
                          const badge = statusColors[booking.status] || statusColors.pending;
                          const studentCode = JSON.parse(localStorage.getItem("user"))?.studentCode || "N/A";
                          
                          // Kiểm tra xem phòng này đã được gia hạn chưa
                          const hasRenewed = history.some(b => b.renewedFrom === booking._id);

                          return (
                            <tr key={booking._id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="px-5 py-4 border-b border-slate-100 align-middle text-slate-800 font-medium">
                                {studentCode}
                              </td>
                              <td className="px-5 py-4 border-b border-slate-100 align-middle">
                                <div className="font-bold text-slate-800 text-[15px] group-hover:text-[#1e4f8f] transition-colors">{room.displayName || "N/A"} - Giường {booking.bedNumber}</div>
                                <div className="text-[13px] text-slate-500 mt-1 font-medium">{building.name || "Chưa có tòa"}</div>
                              </td>
                              <td className="px-5 py-4 border-b border-slate-100 align-middle text-slate-700 font-medium">
                                {getCheckinDisplay(booking)}
                              </td>
                              <td className="px-5 py-4 border-b border-slate-100 align-middle text-slate-700 font-medium">
                                {getCheckoutDisplay(booking)}
                              </td>
                              <td className="px-5 py-4 border-b border-slate-100 align-middle text-slate-700 font-medium">
                                {formatMoney(room.price)}
                              </td>
                              <td className="px-5 py-4 border-b border-slate-100 align-middle">
                                <span
                                  className="inline-flex items-center justify-center whitespace-nowrap min-w-[110px] px-3 py-1.5 rounded-full font-bold text-[12px] uppercase tracking-wide"
                                  style={{ backgroundColor: badge.background, color: badge.color, border: `1px solid ${badge.color}30` }}
                                >
                                  {badge.label}
                                </span>
                              </td>
                              <td className="px-5 py-4 border-b border-slate-100 align-middle text-center">
                                <div className="flex items-center justify-center gap-3">
                                  <button
                                    onClick={() => handleShowRoommates(booking)}
                                    className="bg-[#0056b3] hover:bg-[#004494] text-white font-semibold py-2 px-4 rounded-lg transition-all text-[13px] shadow-sm"
                                  >
                                    Roommates
                                  </button>
                                  {(booking.status === "checked_in" || booking.status === "confirmed") && (
                                    <button
                                      onClick={() => handleRenew(booking, hasRenewed)}
                                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2 px-5 rounded-lg shadow-md shadow-orange-500/20 transition-all text-[13px] border border-orange-600/20"
                                    >
                                      Gia hạn
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {showRoommates && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-slate-200">
                <h3 className="text-[16px] font-medium text-slate-800 m-0">Roommates</h3>
                <button
                  onClick={() => setShowRoommates(false)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-light"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-x-auto">
                {loadingRoommates ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e4f8f]"></div>
                    <span className="ml-3 text-slate-600 font-medium">Đang tải danh sách...</span>
                  </div>
                ) : selectedRoommates.length > 0 ? (
                  <table className="w-full border-collapse text-sm border border-solid border-[#b8daff]">
                    <thead>
                      <tr>
                        <th className="border border-solid border-[#b8daff] text-[#0056b3] font-medium py-3 px-4 text-center whitespace-nowrap">Mã Sinh Viên</th>
                        <th className="border border-solid border-[#b8daff] text-[#0056b3] font-medium py-3 px-4 text-center">Họ và tên</th>
                        <th className="border border-solid border-[#b8daff] text-[#0056b3] font-medium py-3 px-4 text-center whitespace-nowrap">Số Điện thoại</th>
                        <th className="border border-solid border-[#b8daff] text-[#0056b3] font-medium py-3 px-4 text-center whitespace-nowrap">Bed No</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRoommates.map((r, idx) => (
                        <tr key={idx}>
                          <td className="border border-solid border-[#b8daff] py-3 px-4 text-center text-slate-600">{r.student?.studentCode || "N/A"}</td>
                          <td className="border border-solid border-[#b8daff] py-3 px-4 text-center text-slate-600">{r.student?.fullName || "Chưa có thông tin"}</td>
                          <td className="border border-solid border-[#b8daff] py-3 px-4 text-center text-slate-600">{r.student?.phone || "N/A"}</td>
                          <td className="border border-solid border-[#b8daff] py-3 px-4 text-center text-slate-600">Bed {r.bedNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-slate-500 text-center py-4">Phòng hiện chưa có sinh viên nào khác trong kỳ này.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyRoom;
