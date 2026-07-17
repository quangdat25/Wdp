import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status");
  const message = searchParams.get("message");

  const isSuccess = status === "success";

  const handleBackToInvoices = () => {
    navigate("/student/invoices", {
      replace: true,
    });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      handleBackToInvoices();
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-y-auto bg-slate-100 px-4 py-8">
      <div className="w-full max-w-[460px] rounded-[24px] border border-slate-200 bg-white px-6 py-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.15)] sm:px-10 sm:py-10">
        <div
          className={`mx-auto flex h-[88px] w-[88px] items-center justify-center rounded-full text-[48px] font-bold leading-none ${
            isSuccess
              ? "bg-emerald-100 text-emerald-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          <span className="-mt-1">{isSuccess ? "✓" : "×"}</span>
        </div>

        <h1 className="mt-6 text-[26px] font-extrabold leading-tight text-slate-900">
          {isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}
        </h1>

        <p className="mx-auto mt-3 max-w-[360px] text-[15px] leading-6 text-slate-500">
          {isSuccess
            ? "Hóa đơn của bạn đã được cập nhật sang trạng thái đã thanh toán."
            : getErrorMessage(message)}
        </p>

        <button
          type="button"
          onClick={handleBackToInvoices}
          className="mt-7 inline-flex h-[48px] w-full items-center justify-center rounded-xl bg-blue-600 px-6 text-[15px] font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
        >
          Quay về hóa đơn
        </button>

        <p className="mt-4 text-sm text-slate-400">
          Tự động quay lại sau 3 giây...
        </p>
      </div>
    </div>
  );
}

function getErrorMessage(message) {
  const messages = {
    InvalidSignature: "Chữ ký thanh toán không hợp lệ.",
    PaymentFailed: "Giao dịch chưa hoàn tất hoặc đã bị hủy.",
    InvoiceNotFound: "Không tìm thấy hóa đơn.",
    InvalidPaymentType: "Loại thanh toán không hợp lệ.",
  };

  return messages[message] || "Có lỗi xảy ra trong quá trình thanh toán.";
}

export default PaymentResult;