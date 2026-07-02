import { useState, useEffect } from "react";
import { getStudentInfo } from "../../api/parentService";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";

function ParentStudentInfo() {
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getStudentInfo();
        if (data && data.success) {
          setStudentInfo(data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin sinh viên:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getGenderText = (gender) => {
    if (gender === "male") return "Nam";
    if (gender === "female") return "Nữ";
    return "Khác";
  };

  return (
    <div className="flex bg-white min-h-screen font-sans text-[#0b1c30]">
      <Sidebar />
      <main className="ml-[270px] flex-1">
        <Header avatarText="P" />

        <div className="p-8 max-w-[1400px] mx-auto">
          {loading ? (
            <div className="bg-[#F6FAF5] p-8 rounded-lg border border-[#bccac0]">
              <h3 className="text-lg font-semibold text-gray-700">Đang tải dữ liệu của con...</h3>
            </div>
          ) : !studentInfo ? (
            <div className="bg-[#F6FAF5] p-8 rounded-lg border border-[#bccac0]">
              <h3 className="text-lg font-semibold text-gray-700">Không tìm thấy thông tin sinh viên</h3>
            </div>
          ) : (
            <>
              {/* Student Profile Header Card */}
              <div className="bg-[#F6FAF5] border border-[#bccac0] rounded-lg p-8 mb-6 shadow-sm transition-all hover:border-[#006948]/30">
                <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                  <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg bg-[#00855d] text-[#f5fff7] flex items-center justify-center text-5xl font-bold shadow-md">
                      {studentInfo.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full border border-[#bccac0]">
                      <span className="material-symbols-outlined text-[#006948]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                      <h2 className="text-4xl font-bold text-[#0b1c30]">{studentInfo.fullName}</h2>
                      <span className="inline-flex items-center px-3 py-1 bg-[#006948]/10 text-[#006948] rounded-sm font-bold text-sm tracking-wide uppercase">
                        {studentInfo.status === "active" ? (
                          <>
                            <span className="w-2 h-2 bg-[#059669] rounded-full mr-2 animate-pulse"></span>
                            Đang theo học
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            Đã nghỉ
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2 mt-4">
                      <div className="flex items-center text-[#3d4a42]">
                        <span className="material-symbols-outlined mr-2 text-[#006948]">id_card</span>
                        <span className="font-mono text-lg uppercase text-[#545f73] mr-2">Mã sinh viên:</span>
                        <span className="text-lg font-semibold text-[#0b1c30]">{studentInfo.studentCode || "N/A"}</span>
                      </div>

                    </div>
                  </div>
                  <div className="hidden xl:block h-24 w-px bg-[#bccac0]"></div>
                </div>
              </div>

              {/* Bento Grid Information Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Personal Info Section */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <section className="bg-[#F6FAF5] border border-[#bccac0] rounded-lg overflow-hidden flex-1 group hover:border-[#006948]/20 transition-all">
                    <div className="bg-transparent px-6 py-4 border-b border-[#bccac0] flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-[#0b1c30] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006948]">account_circle</span>
                        Thông tin cá nhân
                      </h3>

                    </div>
                    <div className="p-6 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-[#006948]/5 p-3 rounded-sm">
                          <span className="material-symbols-outlined text-[#006948]">cake</span>
                        </div>
                        <div>
                          <p className="font-mono text-xs text-[#545f73] uppercase mb-1">Ngày sinh</p>
                          <p className="text-lg font-medium">{formatDate(studentInfo.dateOfBirth)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="bg-[#006948]/5 p-3 rounded-sm">
                          <span className="material-symbols-outlined text-[#006948]">wc</span>
                        </div>
                        <div>
                          <p className="font-mono text-xs text-[#545f73] uppercase mb-1">Giới tính</p>
                          <p className="text-lg font-medium">{getGenderText(studentInfo.gender)}</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Academic Info Section */}
                <div className="lg:col-span-8">
                  <section className="bg-[#F6FAF5] border border-[#bccac0] rounded-lg h-full group hover:border-[#006948]/20 transition-all">
                    <div className="bg-transparent px-6 py-4 border-b border-[#bccac0] flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-[#0b1c30] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006948]">school</span>
                        Thông tin học tập
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="flex items-start gap-4">
                          <div className="bg-[#006948]/5 p-3 rounded-sm">
                            <span className="material-symbols-outlined text-[#006948]">terminal</span>
                          </div>
                          <div>
                            <p className="font-mono text-xs text-[#545f73] uppercase mb-1">Chuyên ngành</p>
                            <p className="text-lg font-semibold">{studentInfo.major || "Chưa cập nhật"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="bg-[#006948]/5 p-3 rounded-sm">
                            <span className="material-symbols-outlined text-[#006948]">badge</span>
                          </div>
                          <div>
                            <p className="font-mono text-xs text-[#545f73] uppercase mb-1">Mã sinh viên</p>
                            <p className="text-lg font-semibold">{studentInfo.studentCode || "Chưa cập nhật"}</p>
                          </div>
                        </div>


                      </div>
                    </div>
                  </section>
                </div>

                {/* Contact Info Section */}
                <div className="lg:col-span-12">
                  <section className="bg-[#F6FAF5] border border-[#bccac0] rounded-lg overflow-hidden group hover:border-[#006948]/20 transition-all">
                    <div className="bg-transparent px-6 py-4 border-b border-[#bccac0] flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-[#0b1c30] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006948]">contact_mail</span>
                        Thông tin liên hệ
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex items-center gap-4 group/item">
                          <div className="bg-[#006948]/5 p-4 rounded-sm group-hover/item:bg-[#006948] group-hover/item:text-white transition-colors">
                            <span className="material-symbols-outlined">call</span>
                          </div>
                          <div>
                            <p className="font-mono text-xs text-[#545f73] uppercase mb-1">Số điện thoại</p>
                            <p className="text-lg font-bold">{studentInfo.phone || "Chưa cập nhật"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 group/item">
                          <div className="bg-[#006948]/5 p-4 rounded-sm group-hover/item:bg-[#006948] group-hover/item:text-white transition-colors">
                            <span className="material-symbols-outlined">mail</span>
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-mono text-xs text-[#545f73] uppercase mb-1">Email</p>
                            <p className="text-lg font-bold truncate">{studentInfo.email || "Chưa cập nhật"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 group/item">
                          <div className="bg-[#006948]/5 p-4 rounded-sm group-hover/item:bg-[#006948] group-hover/item:text-white transition-colors">
                            <span className="material-symbols-outlined">location_on</span>
                          </div>
                          <div>
                            <p className="font-mono text-xs text-[#545f73] uppercase mb-1">Địa chỉ</p>
                            <p className="text-lg font-bold">{studentInfo.address || "Chưa cập nhật"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Footer Meta */}
              <footer className="mt-6 pt-8 border-t border-[#bccac0] flex flex-col md:flex-row justify-between items-center gap-4 opacity-60">
                <p className="font-mono text-xs text-[#545f73]">Cập nhật lần cuối: 24/10/2023 • 14:35</p>
                <div className="flex items-center gap-6">
                  <a className="font-mono text-xs hover:text-[#006948] transition-colors uppercase" href="#">Quy định KTX</a>
                  <a className="font-mono text-xs hover:text-[#006948] transition-colors uppercase" href="#">Bảo mật thông tin</a>
                  <a className="font-mono text-xs hover:text-[#006948] transition-colors uppercase" href="#">Hỗ trợ phụ huynh</a>
                </div>
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default ParentStudentInfo;
