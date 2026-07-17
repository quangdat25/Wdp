import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status");
  const message = searchParams.get("message");

  const isSuccess = status === "success";

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/student/invoices");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <div
          className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
            isSuccess
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isSuccess ? "✓" : "×"}
        </div>

        <h1 className="text-2xl font-extrabold text-slate-800">
          {isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}
        </h1>

        <p className="mt-3 text-slate-500">
          {isSuccess
            ? "Hóa đơn của bạn đã được cập nhật trạng thái đã thanh toán."
            : getErrorMessage(message)}
        </p>

        <button
          type="button"
          onClick={() => navigate("/student/invoices")}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
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
  const map = {
    InvalidSignature: "Chữ ký thanh toán không hợp lệ.",
    PaymentFailed: "Giao dịch chưa hoàn tất hoặc đã bị hủy.",
    InvoiceNotFound: "Không tìm thấy hóa đơn.",
    InvalidPaymentType: "Loại thanh toán không hợp lệ.",
  };

  return map[message] || "Có lỗi xảy ra trong quá trình thanh toán.";
}

export default PaymentResult;