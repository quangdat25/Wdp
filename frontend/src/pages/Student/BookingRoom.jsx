import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBed,
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaArrowRight,
  FaDoorOpen,
  FaStar,
  FaFileInvoice,
  FaCheck,
  FaCreditCard,
  FaMoneyBillWave,
} from "react-icons/fa";

import "./BookingRoom.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import { checkEligibility, getAvailableRooms, createBooking, createBookingPayment } from "../../api/bookingService";
import { getAllBuildings } from "../../api/roomService";

function BookingRoom() {
  const navigate = useNavigate();

  // Step management: 1=check, 2=select room, 3=select bed
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 state
  const [checking, setChecking] = useState(true);
  const [eligible, setEligible] = useState(null);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [eligibilityMessage, setEligibilityMessage] = useState("");
  const [eligibilityReason, setEligibilityReason] = useState("");

  // Step 2 state
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Step 3 state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);

  // Modal & booking state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Check eligibility on mount
  useEffect(() => {
    handleCheckEligibility();
  }, []);

  const handleCheckEligibility = async () => {
    setChecking(true);
    setEligible(null);
    try {
      const res = await checkEligibility();
      setEligible(true);
      setEligibilityData(res.data);
      setEligibilityMessage(res.message);
      // Auto advance after short delay
      setTimeout(() => setCurrentStep(2), 1500);
    } catch (err) {
      const data = err.response?.data;
      setEligible(false);
      setEligibilityData(data?.data || {});
      setEligibilityMessage(data?.message || "Không thể kiểm tra điều kiện. Vui lòng thử lại.");
      setEligibilityReason(data?.reason || "unknown");
    } finally {
      setChecking(false);
    }
  };

  // Step 2: Load buildings
  useEffect(() => {
    if (currentStep === 2) {
      loadBuildings();
    }
  }, [currentStep]);

  const loadBuildings = async () => {
    try {
      const res = await getAllBuildings();
      setBuildings(res.data || []);
    } catch (err) {
      console.error("Error loading buildings:", err);
    }
  };

  // Load rooms when building or floor changes
  useEffect(() => {
    if (selectedBuilding) {
      loadRooms();
    }
  }, [selectedBuilding, selectedFloor]);

  const loadRooms = async () => {
    if (!selectedBuilding) return;
    setLoadingRooms(true);
    try {
      const res = await getAvailableRooms(selectedBuilding._id, selectedFloor);
      setRooms(res.data || []);
    } catch (err) {
      console.error("Error loading rooms:", err);
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSelectBuilding = (building) => {
    setSelectedBuilding(building);
    setSelectedFloor(1);
    setSelectedRoom(null);
    setSelectedBed(null);
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setSelectedBed(null);
    setCurrentStep(3);
  };

  const handleSelectBed = (bedNumber) => {
    setSelectedBed(bedNumber);
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoom || !selectedBed) return;
    setSubmitting(true);
    try {
      const res = await createBooking({
        roomId: selectedRoom._id,
        bedNumber: selectedBed,
        semester: "Summer 2026",
      });
      setBookingResult(res);
      setShowConfirmModal(false);
      // Chuyển sang bước thanh toán thay vì thành công
      setCurrentStep(4);
    } catch (err) {
      const msg = err.response?.data?.message || "Đặt phòng thất bại. Vui lòng thử lại.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý thanh toán VNPAY
  const handlePayVNPay = async () => {
    if (!bookingResult?.data?.booking?._id) return;
    setSubmitting(true);
    try {
      const res = await createBookingPayment(bookingResult.data.booking._id);
      if (res.data && res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể tạo thanh toán. Vui lòng thử lại.";
      alert(msg);
      setSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: "Kiểm tra điều kiện" },
    { id: 2, label: "Chọn phòng" },
    { id: 3, label: "Chọn giường" },
    { id: 4, label: "Thanh toán" },
  ];

  // ============= RENDER =============
  return (
    <div className="student-shell">
      <Sidebar />
      <main className="student-main">
        <Header />

        {/* Success screen */}
        {bookingSuccess ? (
          <SuccessScreen result={bookingResult} navigate={navigate} />
        ) : (
          <>
            {/* Step Indicator */}
            <StepIndicator steps={steps} currentStep={currentStep} />

            {/* Step 1: Eligibility Check */}
            {currentStep === 1 && (
              <EligibilityScreen
                checking={checking}
                eligible={eligible}
                data={eligibilityData}
                message={eligibilityMessage}
                reason={eligibilityReason}
                onRetry={handleCheckEligibility}
                onGoBack={() => navigate("/student/dashboard")}
                onContinue={() => setCurrentStep(2)}
              />
            )}

            {/* Step 2: Select Building & Room */}
            {currentStep === 2 && (
              <RoomSelectionScreen
                buildings={buildings}
                selectedBuilding={selectedBuilding}
                selectedFloor={selectedFloor}
                rooms={rooms}
                loadingRooms={loadingRooms}
                onSelectBuilding={handleSelectBuilding}
                onSelectFloor={setSelectedFloor}
                onSelectRoom={handleSelectRoom}
                onGoBack={() => setCurrentStep(1)}
              />
            )}

            {/* Step 3: Select Bed */}
            {currentStep === 3 && selectedRoom && (
              <BedSelectionScreen
                room={selectedRoom}
                selectedBed={selectedBed}
                onSelectBed={handleSelectBed}
                onConfirm={() => setShowConfirmModal(true)}
                onGoBack={() => {
                  setCurrentStep(2);
                  setSelectedRoom(null);
                  setSelectedBed(null);
                }}
              />
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && bookingResult && (
              <PaymentScreen
                result={bookingResult}
                submitting={submitting}
                onPayVNPay={handlePayVNPay}
              />
            )}

            {/* Confirm Modal */}
            {showConfirmModal && (
              <ConfirmModal
                room={selectedRoom}
                bedNumber={selectedBed}
                submitting={submitting}
                onConfirm={handleConfirmBooking}
                onCancel={() => setShowConfirmModal(false)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* =============== SUB-COMPONENTS =============== */

function StepIndicator({ steps, currentStep }) {
  return (
    <div className="booking-steps">
      {steps.map((step, idx) => (
        <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
          <div
            className={`booking-step ${
              currentStep === step.id
                ? "is-active"
                : currentStep > step.id
                  ? "is-completed"
                  : ""
            }`}
          >
            <span className="booking-step__number">
              {currentStep > step.id ? <FaCheck /> : step.id}
            </span>
            {step.label}
          </div>
          {idx < steps.length - 1 && (
            <span
              className={`booking-step-connector ${
                currentStep > step.id ? "is-active" : ""
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function EligibilityScreen({
  checking,
  eligible,
  data,
  message,
  reason,
  onRetry,
  onGoBack,
  onContinue,
}) {
  if (checking) {
    return (
      <div className="booking-eligibility">
        <div className="booking-eligibility__spinner" />
        <h3>Đang kiểm tra điều kiện...</h3>
        <p>Hệ thống đang xác minh điểm CFD và tình trạng hóa đơn của bạn</p>
      </div>
    );
  }

  if (eligible === true) {
    return (
      <div className="booking-eligibility">
        <div className="booking-eligibility__icon booking-eligibility__icon--success">
          <FaCheckCircle />
        </div>
        <h3>Bạn đủ điều kiện đặt phòng! ✨</h3>
        <p>{message}</p>
        <div className="booking-eligibility__details">
          <div className="booking-eligibility__detail-card is-pass">
            <span><FaStar style={{ marginRight: 4 }} />Điểm CFD</span>
            <strong>{data?.CFDScore || 0}</strong>
          </div>
          <div className="booking-eligibility__detail-card is-pass">
            <span><FaFileInvoice style={{ marginRight: 4 }} />Công nợ</span>
            <strong>0đ</strong>
          </div>
        </div>
        <button className="booking-btn-primary" onClick={onContinue}>
          <FaArrowRight /> Chọn phòng ngay
        </button>
      </div>
    );
  }

  return (
    <div className="booking-eligibility">
      <div className="booking-eligibility__icon booking-eligibility__icon--error">
        <FaTimesCircle />
      </div>
      <h3>Không đủ điều kiện đặt phòng</h3>
      <p>{message}</p>
      <div className="booking-eligibility__details">
        {(reason === "low_cfd" || data?.CFDScore !== undefined) && (
          <div
            className={`booking-eligibility__detail-card ${
              (data?.CFDScore || 0) >= 80 ? "is-pass" : "is-fail"
            }`}
          >
            <span><FaStar style={{ marginRight: 4 }} />Điểm CFD</span>
            <strong>
              {data?.CFDScore || 0}
              {(data?.CFDScore || 0) < 80 && " / 80"}
            </strong>
          </div>
        )}
        {(reason === "unpaid_invoice" || data?.totalUnpaid !== undefined) && (
          <div
            className={`booking-eligibility__detail-card ${
              (data?.totalUnpaid || 0) === 0 ? "is-pass" : "is-fail"
            }`}
          >
            <span><FaFileInvoice style={{ marginRight: 4 }} />Công nợ</span>
            <strong>
              {data?.totalUnpaid
                ? `${data.totalUnpaid.toLocaleString("vi-VN")}đ`
                : "0đ"}
            </strong>
          </div>
        )}
      </div>
      <div className="booking-btn-group">
        <button className="booking-btn-secondary" onClick={onGoBack}>
          <FaArrowLeft /> Quay lại
        </button>
        <button className="booking-btn-primary" onClick={onRetry}>
          Kiểm tra lại
        </button>
      </div>
    </div>
  );
}

function RoomSelectionScreen({
  buildings,
  selectedBuilding,
  selectedFloor,
  rooms,
  loadingRooms,
  onSelectBuilding,
  onSelectFloor,
  onSelectRoom,
  onGoBack,
}) {
  const floors = [1, 2, 3, 4];

  return (
    <div className="booking-buildings">
      {/* Building selection */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <button className="booking-btn-secondary" onClick={onGoBack} style={{ minHeight: 36, padding: "0 14px", fontSize: 13 }}>
          <FaArrowLeft />
        </button>
        <h3 className="booking-section-title">Chọn tòa nhà</h3>
      </div>
      <p className="booking-section-desc">
        Chọn tòa nhà bạn muốn ở. Mỗi tòa có 4 tầng, mỗi phòng 4 giường.
      </p>

      <div className="booking-building-grid">
        {buildings.map((b) => (
          <div
            key={b._id}
            className={`booking-building-card ${
              selectedBuilding?._id === b._id ? "is-selected" : ""
            }`}
            onClick={() => onSelectBuilding(b)}
          >
            <div className="booking-building-card__icon">
              <FaBuilding />
            </div>
            <h4>Tòa {b.name}</h4>
            <p>{b.description || `Ký túc xá tòa ${b.name}`}</p>
            {b.availableRooms !== undefined && (
              <span className="rooms-count">
                <FaDoorOpen /> {b.availableRooms} phòng trống
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Floor tabs + Room grid */}
      {selectedBuilding && (
        <>
          <h3 className="booking-section-title" style={{ marginTop: 8 }}>
            Phòng trống - Tòa {selectedBuilding.name}
          </h3>
          <p className="booking-section-desc">
            Chọn tầng và phòng bạn muốn. Xanh = trống, Vàng = gần đầy.
          </p>

          <div className="booking-floor-tabs">
            {floors.map((f) => (
              <button
                key={f}
                className={`booking-floor-tab ${selectedFloor === f ? "is-active" : ""}`}
                onClick={() => onSelectFloor(f)}
              >
                Tầng {f}
              </button>
            ))}
          </div>

          {loadingRooms ? (
            <div className="booking-loading-rooms">
              <div className="booking-eligibility__spinner" />
              <p>Đang tải danh sách phòng...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="booking-empty">
              <div className="booking-empty__icon"><FaDoorOpen /></div>
              <h4>Không có phòng trống</h4>
              <p>Tầng này không còn phòng trống. Hãy thử tầng khác.</p>
            </div>
          ) : (
            <div className="booking-rooms-grid">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  className="booking-room-card"
                  onClick={() => onSelectRoom(room)}
                >
                  <div className="booking-room-card__header">
                    <span className="booking-room-card__name">
                      {room.displayName || room.roomNumber}
                    </span>
                    <span
                      className={`booking-room-card__badge ${
                        room.availableCount <= 1
                          ? "booking-room-card__badge--almost-full"
                          : "booking-room-card__badge--available"
                      }`}
                    >
                      {room.availableCount} giường trống
                    </span>
                  </div>

                  <div className="booking-room-card__beds">
                    {[1, 2, 3, 4].map((bed) => (
                      <div
                        key={bed}
                        className={`booking-room-card__bed ${
                          room.availableBeds.includes(bed)
                            ? "booking-room-card__bed--free"
                            : "booking-room-card__bed--taken"
                        }`}
                      >
                        {bed}
                      </div>
                    ))}
                  </div>

                  <div className="booking-room-card__info">
                    Tầng {room.floor} · {room.currentOccupants}/{room.capacity} sinh viên
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BedSelectionScreen({
  room,
  selectedBed,
  onSelectBed,
  onConfirm,
  onGoBack,
}) {
  return (
    <div className="booking-bed-selection">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button className="booking-btn-secondary" onClick={onGoBack} style={{ minHeight: 36, padding: "0 14px", fontSize: 13 }}>
          <FaArrowLeft />
        </button>
        <h3 className="booking-section-title" style={{ margin: 0 }}>Chọn giường</h3>
      </div>

      <div className="booking-selected-room-info">
        <div className="booking-selected-room-info__icon">
          <FaDoorOpen />
        </div>
        <div>
          <h4>{room.displayName || room.roomNumber}</h4>
          <p>
            Tầng {room.floor} · Tòa {room.building?.name || "N/A"} ·{" "}
            {room.availableCount} giường trống
          </p>
        </div>
      </div>

      <div className="booking-bed-layout">
        {[1, 2, 3, 4].map((bed) => {
          const isFree = room.availableBeds.includes(bed);
          const isSelected = selectedBed === bed;
          const occupant = room.students?.find((s) => s.bedNumber === bed);

          return (
            <div
              key={bed}
              className={`booking-bed-item ${
                isSelected
                  ? "booking-bed-item--selected"
                  : isFree
                    ? "booking-bed-item--free"
                    : "booking-bed-item--taken"
              }`}
              onClick={() => isFree && onSelectBed(bed)}
            >
              {isSelected && (
                <div className="booking-bed-item__check">
                  <FaCheck />
                </div>
              )}
              <div className="booking-bed-item__icon">
                <FaBed />
              </div>
              <h5>Giường {bed}</h5>
              <span>
                {isFree
                  ? isSelected
                    ? "✓ Đã chọn"
                    : "Còn trống"
                  : occupant?.fullName || "Đã có người"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="booking-btn-group">
        <button className="booking-btn-secondary" onClick={onGoBack}>
          <FaArrowLeft /> Chọn phòng khác
        </button>
        <button
          className="booking-btn-primary"
          disabled={!selectedBed}
          onClick={onConfirm}
          style={{ opacity: selectedBed ? 1 : 0.5 }}
        >
          Xác nhận đặt phòng <FaArrowRight />
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({ room, bedNumber, submitting, onConfirm, onCancel }) {
  return (
    <div className="booking-modal-overlay" onClick={onCancel}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="booking-modal__icon">
          <FaBed />
        </div>
        <h3>Xác nhận đặt phòng</h3>
        <p>Vui lòng kiểm tra thông tin trước khi xác nhận</p>

        <div className="booking-modal__details">
          <div className="booking-modal__detail-row">
            <span>Tòa nhà</span>
            <span>Tòa {room.building?.name || "N/A"}</span>
          </div>
          <div className="booking-modal__detail-row">
            <span>Phòng</span>
            <span>{room.displayName || room.roomNumber}</span>
          </div>
          <div className="booking-modal__detail-row">
            <span>Tầng</span>
            <span>Tầng {room.floor}</span>
          </div>
          <div className="booking-modal__detail-row">
            <span>Giường</span>
            <span>Giường số {bedNumber}</span>
          </div>
          <div className="booking-modal__detail-row">
            <span>Học kỳ</span>
            <span>Summer 2026</span>
          </div>
        </div>

        <div className="booking-modal__actions">
          <button className="booking-btn-cancel" onClick={onCancel} disabled={submitting}>
            Hủy
          </button>
          <button
            className="booking-btn-confirm"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? "Đang xử lý..." : "✓ Xác nhận đặt phòng"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentScreen({ result, submitting, onPayVNPay }) {
  const roomData = result?.data?.room;
  const price = result?.data?.price || 2000000;
  const bedNumber = result?.data?.bedNumber;
  const booking = result?.data?.booking;

  return (
    <div className="booking-payment">
      <div className="booking-payment__header">
        <div className="booking-payment__icon">
          <FaCreditCard />
        </div>
        <h3>Thanh toán đặt phòng</h3>
        <p>Vui lòng thanh toán để hoàn tất việc đặt phòng</p>
      </div>

      <div className="booking-payment__summary">
        <h4>Thông tin đơn đặt phòng</h4>
        <div className="booking-payment__row">
          <span>Phòng</span>
          <span>{roomData?.displayName || roomData?.roomNumber || "N/A"}</span>
        </div>
        <div className="booking-payment__row">
          <span>Tòa nhà</span>
          <span>Tòa {roomData?.building?.name || "N/A"}</span>
        </div>
        <div className="booking-payment__row">
          <span>Tầng</span>
          <span>Tầng {roomData?.floor || "N/A"}</span>
        </div>
        <div className="booking-payment__row">
          <span>Giường</span>
          <span>Giường số {bedNumber}</span>
        </div>
        <div className="booking-payment__row">
          <span>Học kỳ</span>
          <span>{booking?.semester || "Summer 2026"}</span>
        </div>
        <div className="booking-payment__row">
          <span>Trạng thái</span>
          <span className="booking-payment__status--pending">Chờ thanh toán</span>
        </div>
        <div className="booking-payment__divider" />
        <div className="booking-payment__row booking-payment__row--total">
          <span><FaMoneyBillWave style={{ marginRight: 6 }} />Tổng tiền</span>
          <span className="booking-payment__price">{price.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>

      <div className="booking-payment__actions">
        <button
          className="booking-btn-vnpay"
          onClick={onPayVNPay}
          disabled={submitting}
        >
          {submitting ? (
            "Đang xử lý..."
          ) : (
            <>
              <FaCreditCard style={{ marginRight: 8 }} />
              Thanh toán qua VNPAY
            </>
          )}
        </button>
      </div>

      <p className="booking-payment__note">
        Bạn sẽ được chuyển hướng đến cổng thanh toán VNPAY để hoàn tất giao dịch.
        Sau khi thanh toán thành công, đơn đặt phòng sẽ được xác nhận tự động.
      </p>
    </div>
  );
}

function SuccessScreen({ result, navigate }) {
  return (
    <div className="booking-success">
      <div className="booking-success__icon">
        <FaCheckCircle />
      </div>
      <h3>Đặt phòng thành công! 🎉</h3>
      <p>{result?.message || "Bạn đã đặt phòng thành công. Chúc bạn có trải nghiệm tốt!"}</p>

      <div className="booking-success__info">
        <div className="booking-success__info-icon">
          <FaBed />
        </div>
        <div className="booking-success__info-text">
          <strong>
            {result?.data?.room?.displayName || "Phòng"} – Giường{" "}
            {result?.data?.bedNumber || "N/A"}
          </strong>
          <span>
            Tòa {result?.data?.room?.building?.name || "N/A"} · Tầng{" "}
            {result?.data?.room?.floor || "N/A"} · Summer 2026
          </span>
        </div>
      </div>

      <div className="booking-btn-group">
        <button
          className="booking-btn-primary"
          onClick={() => navigate("/student/dashboard")}
        >
          <FaArrowLeft /> Về trang chủ
        </button>
      </div>
    </div>
  );
}

export default BookingRoom;
