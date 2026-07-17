import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBed,
  FaBuilding,
  FaCheck,
  FaCheckCircle,
  FaCreditCard,
  FaDoorOpen,
  FaFileInvoice,
  FaMoneyBillWave,
  FaStar,
  FaTimesCircle,
} from "react-icons/fa";

import "./BookingRoom.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import {
  checkEligibility,
  createBooking,
  createBookingPayment,
  getAvailableRooms,
  getRoomBedAvailability,
} from "../../api/bookingService";
import semesterService from "../../api/semesterService";
import { getAllBuildings } from "../../api/roomService";
import { showError } from "../../components/alert";

function BookingRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const renewState = location.state;

  const [currentStep, setCurrentStep] = useState(1);

  const [checking, setChecking] = useState(true);
  const [eligible, setEligible] = useState(null);
  const [eligibilityData, setEligibilityData] =
    useState(null);
  const [eligibilityMessage, setEligibilityMessage] =
    useState("");
  const [eligibilityReason, setEligibilityReason] =
    useState("");
  const [nextSemester, setNextSemester] = useState(null);

  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] =
    useState(null);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [beds, setBeds] = useState([]);
  const [loadingBeds, setLoadingBeds] = useState(false);

  const [showConfirmModal, setShowConfirmModal] =
    useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    handleCheckEligibility();
    loadNextSemester();
  }, []);

  useEffect(() => {
    if (currentStep === 2 && !renewState?.isRenew) {
      loadBuildings();
    }
  }, [currentStep]);

  useEffect(() => {
    if (selectedBuilding?._id && !renewState?.isRenew) {
      loadRooms();
    }
  }, [selectedBuilding?._id, selectedFloor]);

  useEffect(() => {
    if (currentStep === 3 && selectedRoom?._id) {
      loadBedAvailability(selectedRoom._id);
    }
  }, [currentStep, selectedRoom?._id]);

  const loadNextSemester = async () => {
    try {
      const response =
        await semesterService.getNextSemester();

      setNextSemester(response?.data || response);
    } catch (error) {
      console.error("GET NEXT SEMESTER ERROR:", error);
    }
  };

  const handleCheckEligibility = async () => {
    try {
      setChecking(true);
      setEligible(null);

      const response = await checkEligibility(renewState?.isRenew || false);

      setEligible(Boolean(response?.eligible));
      setEligibilityData(response?.data || {});
      setEligibilityMessage(response?.message || "");
      setEligibilityReason(response?.reason || "");

      if (response?.eligible) {
        setTimeout(() => {
          if (renewState?.isRenew && renewState?.roomId) {
            // Jump directly to renewal confirm step
            setSelectedRoom({ _id: renewState.roomId, roomNumber: renewState.roomNumber });
            setSelectedBed(renewState.bedNumber);
            setCurrentStep(2); 
          } else {
            setCurrentStep(2);
          }
        }, 800);
      }
    } catch (error) {
      const data = error.response?.data;

      setEligible(false);
      setEligibilityData(data?.data || {});
      setEligibilityMessage(
        data?.message ||
          "Không thể kiểm tra điều kiện đặt phòng.",
      );
      setEligibilityReason(data?.reason || "unknown");
    } finally {
      setChecking(false);
    }
  };

  const loadBuildings = async () => {
    try {
      const response = await getAllBuildings();
      setBuildings(response?.data || []);
    } catch (error) {
      console.error("GET BUILDINGS ERROR:", error);
      showError("Không thể tải danh sách tòa nhà");
    }
  };

  const loadRooms = async () => {
    if (!selectedBuilding?._id) return;

    try {
      setLoadingRooms(true);

      const response = await getAvailableRooms(
        selectedBuilding._id,
        selectedFloor,
      );

      setRooms(response?.data || []);
    } catch (error) {
      setRooms([]);
      showError(
        error.response?.data?.message ||
          "Không thể tải danh sách phòng",
      );
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadBedAvailability = async (roomId) => {
    try {
      setLoadingBeds(true);
      setSelectedBed(null);

      const response =
        await getRoomBedAvailability(roomId);

      const bedData = response?.data;

      setBeds(bedData?.beds || []);

      setSelectedRoom((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          semester:
            bedData?.semester || previous.semester,
          availableCount:
            bedData?.availableCount ??
            previous.availableCount,
          availableBeds: (bedData?.beds || [])
            .filter((bed) => bed.available)
            .map((bed) => bed.bedNumber),
          beds: bedData?.beds || previous.beds || [],
        };
      });
    } catch (error) {
      setBeds([]);
      showError(
        error.response?.data?.message ||
          "Không thể tải tình trạng giường",
      );
    } finally {
      setLoadingBeds(false);
    }
  };

  const handleSelectBuilding = (building) => {
    setSelectedBuilding(building);
    setSelectedFloor(1);
    setSelectedRoom(null);
    setSelectedBed(null);
    setBeds([]);
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setSelectedBed(null);
    setBeds(room.beds || []);
    setCurrentStep(3);
  };

  const handleSelectBed = (bedNumber) => {
    const bed = beds.find(
      (item) => item.bedNumber === bedNumber,
    );

    if (!bed?.available) return;

    setSelectedBed(bedNumber);
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoom?._id || !selectedBed) return;

    try {
      setSubmitting(true);

      /*
       * Refresh lại ngay trước khi tạo booking để UX chính xác hơn.
       * Backend + unique index vẫn là lớp bảo vệ cuối cùng.
       */
      if (!renewState?.isRenew) {
        const availabilityResponse = await getRoomBedAvailability(selectedRoom._id);
        const latestBeds = availabilityResponse?.data?.beds || [];
        const selectedBedInfo = latestBeds.find((bed) => bed.bedNumber === selectedBed);

        if (!selectedBedInfo?.available) {
          setBeds(latestBeds);
          setSelectedBed(null);
          setShowConfirmModal(false);
          showError(`Giường ${selectedBed} vừa được sinh viên khác đặt. Vui lòng chọn giường khác.`);
          return;
        }
      }

      const response = await createBooking({
        roomId: selectedRoom._id,
        bedNumber: selectedBed,
        renewedFrom: renewState?.renewedFrom || null,
      });

      setBookingResult(response);
      setShowConfirmModal(false);
      setCurrentStep(renewState?.isRenew ? 3 : 4);
    } catch (error) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        "Đặt phòng thất bại. Vui lòng thử lại.";

      showError(message);

      if (status === 409 && selectedRoom?._id) {
        await loadBedAvailability(selectedRoom._id);
      }

      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayVNPay = async () => {
    const bookingId =
      bookingResult?.data?.booking?._id;

    if (!bookingId) {
      showError("Không xác định được booking");
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await createBookingPayment(bookingId);

      const paymentUrl =
        response?.data?.paymentUrl;

      if (!paymentUrl) {
        showError(
          "Không tạo được liên kết thanh toán VNPay",
        );
        return;
      }

      window.location.href = paymentUrl;
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Không thể tạo thanh toán VNPay",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const steps = renewState?.isRenew
    ? [
        { id: 1, label: "Kiểm tra điều kiện" },
        { id: 2, label: "Xác nhận gia hạn" },
        { id: 3, label: "Thanh toán" },
      ]
    : [
        { id: 1, label: "Kiểm tra điều kiện" },
        { id: 2, label: "Chọn phòng" },
        { id: 3, label: "Chọn giường" },
        { id: 4, label: "Thanh toán" },
      ];

  return (
    <div className="student-shell">
      <Sidebar />

      <main className="student-main">
        <Header />

        <StepIndicator
          steps={steps}
          currentStep={currentStep}
        />

        {currentStep === 1 && (
          <EligibilityScreen
            checking={checking}
            eligible={eligible}
            data={eligibilityData}
            message={eligibilityMessage}
            reason={eligibilityReason}
            onRetry={handleCheckEligibility}
            onGoBack={() =>
              navigate("/student/dashboard")
            }
            onContinue={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && renewState?.isRenew && selectedRoom && (
          <RenewalConfirmScreen
            room={selectedRoom}
            bedNumber={selectedBed}
            submitting={submitting}
            onConfirm={handleConfirmBooking}
            onGoBack={() => navigate("/student/dashboard")}
            semester={nextSemester ? `${nextSemester.name} ${nextSemester.year}` : "—"}
          />
        )}

        {currentStep === 2 && !renewState?.isRenew && (
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

        {currentStep === 3 && !renewState?.isRenew && selectedRoom && (
          <BedSelectionScreen
            room={selectedRoom}
            beds={beds}
            loadingBeds={loadingBeds}
            selectedBed={selectedBed}
            onSelectBed={handleSelectBed}
            onRefresh={() => loadBedAvailability(selectedRoom._id)}
            onConfirm={() => setShowConfirmModal(true)}
            onGoBack={() => {
              setCurrentStep(2);
              setSelectedRoom(null);
              setSelectedBed(null);
              setBeds([]);
            }}
          />
        )}

        {((currentStep === 3 && renewState?.isRenew) || (currentStep === 4 && !renewState?.isRenew)) && bookingResult && (
          <PaymentScreen
            result={bookingResult}
            submitting={submitting}
            onPayVNPay={handlePayVNPay}
          />
        )}

        {showConfirmModal && selectedRoom && (
          <ConfirmModal
            semester={
              selectedRoom.semester ||
              bookingResult?.data?.booking?.semester ||
              (nextSemester
                ? `${nextSemester.name} ${nextSemester.year}`
                : "—")
            }
            room={selectedRoom}
            bedNumber={selectedBed}
            submitting={submitting}
            onConfirm={handleConfirmBooking}
            onCancel={() =>
              setShowConfirmModal(false)
            }
          />
        )}
      </main>
    </div>
  );
}

function StepIndicator({ steps, currentStep }) {
  return (
    <div className="booking-steps">
      {steps.map((step, index) => (
        <div
          key={step.id}
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
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
              {currentStep > step.id ? (
                <FaCheck />
              ) : (
                step.id
              )}
            </span>
            {step.label}
          </div>

          {index < steps.length - 1 && (
            <span
              className={`booking-step-connector ${
                currentStep > step.id
                  ? "is-active"
                  : ""
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
        <p>
          Hệ thống đang xác minh điểm CFD và công nợ.
        </p>
      </div>
    );
  }

  if (eligible) {
    return (
      <div className="booking-eligibility">
        <div className="booking-eligibility__icon booking-eligibility__icon--success">
          <FaCheckCircle />
        </div>

        <h3>Bạn đủ điều kiện đặt phòng</h3>
        <p>{message}</p>

        <div className="booking-eligibility__details">
          <div className="booking-eligibility__detail-card is-pass">
            <span>
              <FaStar style={{ marginRight: 4 }} />
              Điểm CFD
            </span>
            <strong>{data?.CFDScore || 0}</strong>
          </div>

          <div className="booking-eligibility__detail-card is-pass">
            <span>
              <FaFileInvoice
                style={{ marginRight: 4 }}
              />
              Công nợ
            </span>
            <strong>0đ</strong>
          </div>
        </div>

        <button
          className="booking-btn-primary"
          onClick={onContinue}
        >
          Chọn phòng <FaArrowRight />
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
        {(reason === "low_cfd" ||
          data?.CFDScore !== undefined) && (
          <div
            className={`booking-eligibility__detail-card ${
              Number(data?.CFDScore || 0) >= 80
                ? "is-pass"
                : "is-fail"
            }`}
          >
            <span>
              <FaStar style={{ marginRight: 4 }} />
              Điểm CFD
            </span>
            <strong>
              {data?.CFDScore || 0}
              {Number(data?.CFDScore || 0) < 80 &&
                " / 80"}
            </strong>
          </div>
        )}

        {(reason === "unpaid_invoice" ||
          data?.totalUnpaid !== undefined) && (
          <div
            className={`booking-eligibility__detail-card ${
              Number(data?.totalUnpaid || 0) === 0
                ? "is-pass"
                : "is-fail"
            }`}
          >
            <span>
              <FaFileInvoice
                style={{ marginRight: 4 }}
              />
              Công nợ
            </span>

            <strong>
              {Number(
                data?.totalUnpaid || 0,
              ).toLocaleString("vi-VN")}
              đ
            </strong>
          </div>
        )}
      </div>

      <div className="booking-btn-group">
        <button
          className="booking-btn-secondary"
          onClick={onGoBack}
        >
          <FaArrowLeft /> Quay lại
        </button>

        <button
          className="booking-btn-primary"
          onClick={onRetry}
        >
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 4,
        }}
      >
        <button
          className="booking-btn-secondary"
          onClick={onGoBack}
          style={{
            minHeight: 36,
            padding: "0 14px",
            fontSize: 13,
          }}
        >
          <FaArrowLeft />
        </button>

        <h3 className="booking-section-title">
          Chọn tòa nhà
        </h3>
      </div>

      <p className="booking-section-desc">
        Chọn tòa nhà và tầng muốn đăng ký.
      </p>

      <div className="booking-building-grid">
        {buildings.map((building) => (
          <button
            type="button"
            key={building._id}
            className={`booking-building-card ${
              selectedBuilding?._id === building._id
                ? "is-selected"
                : ""
            }`}
            onClick={() =>
              onSelectBuilding(building)
            }
          >
            <div className="booking-building-card__icon">
              <FaBuilding />
            </div>

            <h4>Tòa {building.name}</h4>

            <p>
              {building.description ||
                `Ký túc xá tòa ${building.name}`}
            </p>
          </button>
        ))}
      </div>

      {selectedBuilding && (
        <>
          <h3
            className="booking-section-title"
            style={{ marginTop: 8 }}
          >
            Phòng còn giường - Tòa{" "}
            {selectedBuilding.name}
          </h3>

          <p className="booking-section-desc">
            Giường đã được sinh viên khác giữ sẽ hiển
            thị màu xám.
          </p>

          <div className="booking-floor-tabs">
            {floors.map((floor) => (
              <button
                type="button"
                key={floor}
                className={`booking-floor-tab ${
                  selectedFloor === floor
                    ? "is-active"
                    : ""
                }`}
                onClick={() =>
                  onSelectFloor(floor)
                }
              >
                Tầng {floor}
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
              <div className="booking-empty__icon">
                <FaDoorOpen />
              </div>
              <h4>Không còn phòng trống</h4>
              <p>Hãy thử tầng hoặc tòa nhà khác.</p>
            </div>
          ) : (
            <div className="booking-rooms-grid">
              {rooms.map((room) => (
                <button
                  type="button"
                  key={room._id}
                  className="booking-room-card"
                  onClick={() =>
                    onSelectRoom(room)
                  }
                >
                  <div className="booking-room-card__header">
                    <span className="booking-room-card__name">
                      {room.displayName ||
                        room.roomNumber}
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
                    {(room.beds ||
                      Array.from(
                        {
                          length:
                            room.capacity || 4,
                        },
                        (_, index) => ({
                          bedNumber: index + 1,
                          available:
                            room.availableBeds?.includes(
                              index + 1,
                            ),
                        }),
                      )
                    ).map((bed) => (
                      <div
                        key={bed.bedNumber}
                        className={`booking-room-card__bed ${
                          bed.available
                            ? "booking-room-card__bed--free"
                            : "booking-room-card__bed--taken"
                        }`}
                      >
                        {bed.bedNumber}
                      </div>
                    ))}
                  </div>

                  <div className="booking-room-card__info">
                    Tầng {room.floor} ·{" "}
                    {room.availableCount}/
                    {room.capacity} giường trống
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RenewalConfirmScreen({
  room,
  bedNumber,
  submitting,
  onConfirm,
  onGoBack,
  semester,
}) {
  return (
    <div className="booking-bed-selection">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button
          type="button"
          className="booking-btn-secondary"
          onClick={onGoBack}
          style={{ minHeight: 36, padding: "0 14px", fontSize: 13 }}
        >
          <FaArrowLeft />
        </button>
        <h3 className="booking-section-title" style={{ margin: 0 }}>Xác nhận gia hạn phòng</h3>
      </div>

      <div className="booking-selected-room-info" style={{ marginTop: 24, padding: 24, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
        <div className="booking-selected-room-info__icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
          <FaCheckCircle />
        </div>
        <div>
          <h4 style={{ fontSize: 18, color: "#1e293b", marginBottom: 8 }}>
            Phòng {room.roomNumber} - Giường {bedNumber}
          </h4>
          <p style={{ color: "#64748b", margin: 0 }}>
            Bạn đang yêu cầu gia hạn phòng hiện tại cho học kỳ: <strong style={{ color: "#334155" }}>{semester}</strong>
          </p>
        </div>
      </div>

      <div className="booking-btn-group" style={{ marginTop: 32 }}>
        <button type="button" className="booking-btn-secondary" onClick={onGoBack} disabled={submitting}>
          <FaArrowLeft /> Trở về
        </button>
        <button type="button" className="booking-btn-primary" onClick={onConfirm} disabled={submitting}>
          {submitting ? "Đang xử lý..." : "Xác nhận gia hạn và Thanh toán"} <FaArrowRight />
        </button>
      </div>
    </div>
  );
}

function BedSelectionScreen({
  room,
  beds,
  loadingBeds,
  selectedBed,
  onSelectBed,
  onRefresh,
  onConfirm,
  onGoBack,
}) {
  return (
    <div className="booking-bed-selection">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          className="booking-btn-secondary"
          onClick={onGoBack}
          style={{
            minHeight: 36,
            padding: "0 14px",
            fontSize: 13,
          }}
        >
          <FaArrowLeft />
        </button>

        <h3
          className="booking-section-title"
          style={{ margin: 0 }}
        >
          Chọn giường
        </h3>
      </div>

      <div className="booking-selected-room-info">
        <div className="booking-selected-room-info__icon">
          <FaDoorOpen />
        </div>

        <div>
          <h4>
            {room.displayName || room.roomNumber}
          </h4>

          <p>
            Tầng {room.floor} · Tòa{" "}
            {room.building?.name || "N/A"} ·{" "}
            {room.availableCount || 0} giường trống
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loadingBeds}
          className="booking-btn-secondary"
          style={{
            marginLeft: "auto",
            minHeight: 36,
            padding: "0 14px",
            fontSize: 13,
          }}
        >
          {loadingBeds
            ? "Đang tải..."
            : "Làm mới"}
        </button>
      </div>

      {loadingBeds ? (
        <div className="booking-loading-rooms">
          <div className="booking-eligibility__spinner" />
          <p>Đang kiểm tra tình trạng giường...</p>
        </div>
      ) : (
        <div className="booking-bed-layout">
          {beds.map((bed) => {
            const isSelected =
              selectedBed === bed.bedNumber;
            const isUnavailable = !bed.available;

            return (
              <button
                type="button"
                key={bed.bedNumber}
                disabled={isUnavailable}
                className={`booking-bed-item ${
                  isSelected
                    ? "booking-bed-item--selected"
                    : isUnavailable
                      ? "booking-bed-item--taken"
                      : "booking-bed-item--free"
                }`}
                onClick={() =>
                  onSelectBed(bed.bedNumber)
                }
                title={
                  isUnavailable
                    ? "Giường đã có sinh viên đặt"
                    : `Chọn giường ${bed.bedNumber}`
                }
              >
                {isSelected && (
                  <div className="booking-bed-item__check">
                    <FaCheck />
                  </div>
                )}

                <div className="booking-bed-item__icon">
                  <FaBed />
                </div>

                <h5>Giường {bed.bedNumber}</h5>

                <span>
                  {isUnavailable
                    ? "Đã có người đặt"
                    : isSelected
                      ? "Đã chọn"
                      : "Còn trống"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="booking-btn-group">
        <button
          type="button"
          className="booking-btn-secondary"
          onClick={onGoBack}
        >
          <FaArrowLeft /> Chọn phòng khác
        </button>

        <button
          type="button"
          className="booking-btn-primary"
          disabled={
            !selectedBed || loadingBeds
          }
          onClick={onConfirm}
          style={{
            opacity:
              selectedBed && !loadingBeds ? 1 : 0.5,
          }}
        >
          Xác nhận đặt phòng <FaArrowRight />
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({
  room,
  bedNumber,
  submitting,
  onConfirm,
  onCancel,
  semester,
}) {
  return (
    <div
      className="booking-modal-overlay"
      onClick={onCancel}
    >
      <div
        className="booking-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="booking-modal__icon">
          <FaBed />
        </div>

        <h3>Xác nhận đặt phòng</h3>
        <p>Kiểm tra thông tin trước khi xác nhận.</p>

        <div className="booking-modal__details">
          <DetailRow
            label="Tòa nhà"
            value={`Tòa ${
              room.building?.name || "N/A"
            }`}
          />
          <DetailRow
            label="Phòng"
            value={
              room.displayName ||
              room.roomNumber
            }
          />
          <DetailRow
            label="Tầng"
            value={`Tầng ${room.floor}`}
          />
          <DetailRow
            label="Giường"
            value={`Giường số ${bedNumber}`}
          />
          <DetailRow
            label="Học kỳ"
            value={semester}
          />
        </div>

        <div className="booking-modal__actions">
          <button
            type="button"
            className="booking-btn-cancel"
            onClick={onCancel}
            disabled={submitting}
          >
            Hủy
          </button>

          <button
            type="button"
            className="booking-btn-confirm"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting
              ? "Đang xử lý..."
              : "Xác nhận đặt phòng"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="booking-modal__detail-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function PaymentScreen({
  result,
  submitting,
  onPayVNPay,
}) {
  const room = result?.data?.room;
  const booking = result?.data?.booking;
  const bedNumber = result?.data?.bedNumber;
  const price = Number(
    result?.data?.price || 2000000,
  );
  const paymentExpiresAt =
    result?.data?.paymentExpiresAt ||
    booking?.paymentExpiresAt;

  return (
    <div className="booking-payment">
      <div className="booking-payment__header">
        <div className="booking-payment__icon">
          <FaCreditCard />
        </div>

        <h3>Thanh toán đặt phòng</h3>
        <p>
          Giường đang được giữ tạm thời. Hoàn tất
          thanh toán để xác nhận booking.
        </p>
      </div>

      <div className="booking-payment__summary">
        <h4>Thông tin đơn đặt phòng</h4>

        <PaymentRow
          label="Phòng"
          value={
            room?.displayName ||
            room?.roomNumber ||
            "N/A"
          }
        />

        <PaymentRow
          label="Tòa nhà"
          value={`Tòa ${
            room?.building?.name || "N/A"
          }`}
        />

        <PaymentRow
          label="Tầng"
          value={`Tầng ${room?.floor || "N/A"}`}
        />

        <PaymentRow
          label="Giường"
          value={`Giường số ${bedNumber}`}
        />

        <PaymentRow
          label="Học kỳ"
          value={booking?.semester || "N/A"}
        />

        <PaymentRow
          label="Giữ chỗ đến"
          value={
            paymentExpiresAt
              ? formatDateTime(paymentExpiresAt)
              : "—"
          }
        />

        <div className="booking-payment__row">
          <span>Trạng thái</span>
          <span className="booking-payment__status--pending">
            Chờ thanh toán
          </span>
        </div>

        <div className="booking-payment__divider" />

        <div className="booking-payment__row booking-payment__row--total">
          <span>
            <FaMoneyBillWave
              style={{ marginRight: 6 }}
            />
            Tổng tiền
          </span>

          <span className="booking-payment__price">
            {price.toLocaleString("vi-VN")}đ
          </span>
        </div>
      </div>

      <div className="booking-payment__actions">
        <button
          type="button"
          className="booking-btn-vnpay"
          onClick={onPayVNPay}
          disabled={submitting}
        >
          {submitting ? (
            "Đang xử lý..."
          ) : (
            <>
              <FaCreditCard
                style={{ marginRight: 8 }}
              />
              Thanh toán qua VNPay
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function PaymentRow({ label, value }) {
  return (
    <div className="booking-payment__row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function formatDateTime(date) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default BookingRoom;