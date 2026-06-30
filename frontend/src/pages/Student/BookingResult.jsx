import { useSearchParams, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaRedo } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import "./BookingRoom.css";

function BookingResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status");
  const message = searchParams.get("message");
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="student-shell">
      <Sidebar />
      <main className="student-main">
        <Header />

        <div className="booking-success" style={{ marginTop: "2rem" }}>
          {status === "success" ? (
            <>
              <div className="booking-success__icon" style={{ color: "#4caf50" }}>
                <FaCheckCircle size={64} />
              </div>
              <h3>Thanh toán thành công! 🎉</h3>
              <p>
                Đơn đặt phòng của bạn đã được xác nhận. Chúc bạn có trải nghiệm
                tốt tại ký túc xá!
              </p>
              {bookingId && (
                <p style={{ fontSize: 13, color: "#94a3b8" }}>
                  Mã đặt phòng: <strong>{bookingId}</strong>
                </p>
              )}
            </>
          ) : (
            <>
              <div className="booking-success__icon" style={{ color: "#f44336" }}>
                <FaTimesCircle size={64} />
              </div>
              <h3>Thanh toán thất bại</h3>
              <p>
                {message === "BookingNotFound"
                  ? "Không tìm thấy thông tin đặt phòng."
                  : message === "PaymentFailed"
                    ? "Giao dịch thanh toán đã bị hủy hoặc thất bại. Giường đã được nhả ra để người khác đặt."
                    : "Đã có lỗi xảy ra trong quá trình thanh toán."}
              </p>
            </>
          )}

          <div
            className="booking-btn-group"
            style={{ marginTop: "2rem", justifyContent: "center" }}
          >
            <button
              className="booking-btn-primary"
              onClick={() => navigate("/student/dashboard")}
            >
              <FaArrowLeft /> Về trang chủ
            </button>
            {status !== "success" && (
              <button
                className="booking-btn-secondary"
                onClick={() => navigate("/student/booking")}
              >
                <FaRedo style={{ marginRight: 6 }} /> Đặt lại phòng
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default BookingResult;
