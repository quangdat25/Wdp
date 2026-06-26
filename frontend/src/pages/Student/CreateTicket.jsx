import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { showError, showSuccess } from "../../components/alert";
import { createTicket, getCurrentRoom } from "../../api/ticketService";
import { uploadImage } from "../../api/uploadImageService";
import Header from "../../components/Headers";

const ticketTypes = [
  { value: "Điện", label: "Điện" },
  { value: "Nước", label: "Nước" },
  { value: "Internet", label: "Internet" },
  { value: "Nội thất", label: "Nội thất" },
  { value: "Vệ sinh", label: "Vệ sinh" },
  { value: "An ninh", label: "An ninh" },
  { value: "Khác", label: "Khác" },
];

function CreateTicket() {
  const [currentRoom, setCurrentRoom] = useState({
    buildingName: "",
    roomNumber: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roomLoading, setRoomLoading] = useState(true);
  const [canCreateTicket, setCanCreateTicket] = useState(false);

  const previewImage = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    const fetchCurrentRoom = async () => {
      try {
        setRoomLoading(true);

        const res = await getCurrentRoom();
        const roomData = res.data.data;

        setCurrentRoom({
          buildingName: roomData.buildingName || "",
          roomNumber: roomData.roomNumber || "",
        });

        setCanCreateTicket(true);
      } catch (error) {
        setCanCreateTicket(false);
        showError(
          error.response?.data?.message ||
            "Không lấy được thông tin phòng hiện tại"
        );
      } finally {
        setRoomLoading(false);
      }
    };

    fetchCurrentRoom();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Chỉ được chọn file ảnh");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    e.target.value = "";
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "",
      description: "",
    });
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canCreateTicket) {
      showError("Chỉ sinh viên đang ở ký túc xá mới được gửi yêu cầu hỗ trợ");
      return;
    }

    if (!formData.title || !formData.type || !formData.description) {
      showError("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = "";

      if (imageFile) {
        const imageData = new FormData();
        imageData.append("image", imageFile);

        const uploadRes = await uploadImage(imageData);
        imageUrl = uploadRes.data.url;
      }

      await createTicket({
        title: formData.title,
        type: formData.type,
        description: formData.description,
        image: imageUrl,
      });

      showSuccess("Gửi yêu cầu hỗ trợ thành công");
      resetForm();
    } catch (error) {
      showError(error.response?.data?.message || "Gửi yêu cầu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50">
      <Sidebar />

      <main className="ml-[270px] min-h-screen w-[calc(100%-270px)] px-7 py-6">
        <Header />

        <div className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 px-6 py-6 shadow-sm backdrop-blur">
          <h1 className="m-0 text-3xl font-extrabold text-blue-800">
            Gửi yêu cầu hỗ trợ
          </h1>
          <p className="mt-2 text-slate-500">
            Sinh viên gửi yêu cầu sửa chữa, hỗ trợ phòng ở hoặc vấn đề ký túc xá.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div
              className={`rounded-2xl border px-4 py-4 text-sm font-semibold ${
                canCreateTicket
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {roomLoading
                ? "Đang kiểm tra thông tin phòng hiện tại..."
                : canCreateTicket
                ? "Thông tin tòa nhà và phòng được lấy tự động từ booking hiện tại."
                : "Bạn chưa có booking đang ở ký túc xá nên chưa thể gửi yêu cầu hỗ trợ."}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Tòa nhà
                </label>
                <input
                  value={roomLoading ? "Đang tải..." : currentRoom.buildingName}
                  disabled
                  className="h-12 w-full cursor-not-allowed rounded-2xl border border-slate-300 bg-slate-100 px-4 font-semibold text-slate-600 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Phòng
                </label>
                <input
                  value={roomLoading ? "Đang tải..." : currentRoom.roomNumber}
                  disabled
                  className="h-12 w-full cursor-not-allowed rounded-2xl border border-slate-300 bg-slate-100 px-4 font-semibold text-slate-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={!canCreateTicket || roomLoading}
                placeholder="Ví dụ: Bóng đèn phòng bị hỏng"
                className="h-12 w-full rounded-2xl border border-slate-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-700">
                Loại yêu cầu <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={!canCreateTicket || roomLoading}
                className="h-12 w-full rounded-2xl border border-slate-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="">Chọn loại yêu cầu</option>
                {ticketTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-700">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!canCreateTicket || roomLoading}
                rows={6}
                placeholder="Mô tả rõ vấn đề cần hỗ trợ..."
                className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-700">
                Ảnh minh họa
              </label>

              <label
                className={`flex min-h-[150px] flex-col items-center justify-center rounded-3xl border-2 border-dashed px-5 py-6 text-center transition ${
                  canCreateTicket && !roomLoading
                    ? "cursor-pointer border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40"
                    : "cursor-not-allowed border-slate-200 bg-slate-100 opacity-70"
                }`}
              >
                <div className="text-base font-extrabold text-slate-800">
                  Chọn 1 ảnh từ máy
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  Hỗ trợ JPG, PNG, JPEG
                </div>
                <div className="mt-4 rounded-2xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
                  Chọn file
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={!canCreateTicket || roomLoading}
                  className="hidden"
                />
              </label>

              {previewImage && (
                <div className="mt-4 w-full max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt={imageFile?.name}
                      className="h-48 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => setImageFile(null)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/75 text-lg font-bold text-white hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>

                  <div className="truncate px-3 py-2 text-xs font-semibold text-slate-600">
                    {imageFile?.name}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading || !canCreateTicket || roomLoading}
                className="h-12 rounded-2xl border border-slate-300 bg-white px-6 font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Làm mới
              </button>

              <button
                type="submit"
                disabled={loading || !canCreateTicket || roomLoading}
                className="h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-7 font-bold text-white shadow-lg shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default CreateTicket;