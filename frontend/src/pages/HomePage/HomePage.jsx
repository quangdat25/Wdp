import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

/* Placeholder images */
const HERO_SLIDES = [
  {
    img: '/public/img/707454477_1400714095420183_1797950806403973180_n.jpg',
    title: 'KTX ĐẠI HỌC FPT',
    subtitle: 'Không gian sống xanh',
  },
  {
   img: '/public/img/anh3.jpg',
    title: 'KTX ĐẠI HỌC FPT',
    subtitle: 'Tiện nghi – Hiện đại',
  },
  {
    img: '/public/img/4248_150A1A42-2FD3-4037-ABB0-04D05B060259.jpg',
    title: 'KTX ĐẠI HỌC FPT',
    subtitle: 'Ngôi nhà thứ hai của bạn',
  },
];

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  /* Auto-play slider */
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="home" id="home-page">
      {/* ======== HERO SLIDER ======== */}
      <section className="hero" id="hero-section">
        <div className="hero__slides">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`hero__slide ${index === currentSlide ? 'hero__slide--active' : ''}`}
            >
              <img src={slide.img} alt={slide.subtitle} className="hero__slide-img" />
            </div>
          ))}
        </div>

        {/* Overlay + Content */}
        <div className="hero__overlay">
          <div className="hero__content">
            <h1 className="hero__title" id="hero-title">
              {HERO_SLIDES[currentSlide].title}
            </h1>
            <p className="hero__subtitle">
              {HERO_SLIDES[currentSlide].subtitle}
            </p>
          </div>
        </div>

        {/* Arrows */}
        <button className="hero__arrow hero__arrow--left" onClick={prevSlide} aria-label="Previous slide" id="hero-prev">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button className="hero__arrow hero__arrow--right" onClick={nextSlide} aria-label="Next slide" id="hero-next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        {/* Dots */}
        <div className="hero__dots">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              className={`hero__dot ${index === currentSlide ? 'hero__dot--active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ======== QUICK LINKS ======== */}
      <section className="quick-links" id="quick-links-section">
        <div className="container">
          <div className="quick-links__grid">
            <Link to="/info" className="quick-link-card" id="quick-link-info">
              <div className="quick-link-card__border"></div>
              <h3 className="quick-link-card__title">Thông tin KTX Đại học FPT</h3>
              <span className="quick-link-card__action">
                Thông tin <span className="quick-link-card__arrow">→</span>
              </span>
            </Link>

            <Link to="/register" className="quick-link-card" id="quick-link-register">
              <div className="quick-link-card__border"></div>
              <h3 className="quick-link-card__title">Đăng ký sử dụng KTX</h3>
              <span className="quick-link-card__action">
                Xem hướng dẫn <span className="quick-link-card__arrow">→</span>
              </span>
            </Link>

            <Link to="/faq" className="quick-link-card" id="quick-link-faq">
              <div className="quick-link-card__border"></div>
              <h3 className="quick-link-card__title">Các câu hỏi thường gặp</h3>
              <span className="quick-link-card__action">
                FAQ <span className="quick-link-card__arrow">→</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ======== INFO CHANNEL BANNER ======== */}
      <section className="info-channel" id="info-channel-section">
        <div className="container">
          <div className="info-channel__banner">
            <img
               src="/public/img/background.jpg"
              alt="Kênh thông tin KTX"
              className="info-channel__img"
            />
            <div className="info-channel__overlay">
              <h2 className="info-channel__title">Kênh thông tin</h2>
              <p className="info-channel__subtitle">Ký túc xá Đại Học FPT</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======== DORM INFO ======== */}
      <section className="dorm-info" id="dorm-info-section">
        <div className="container">
          <h2 className="section-title" id="dorm-info-title">Thông tin Ký túc xá Đại Học FPT</h2>

          <p className="dorm-info__cta">
            Để biết thêm chi tiết về KTX, các bạn có thể truy cập vào <a href="#" className="dorm-info__link">File PDF</a> để tìm hiểu thêm.
          </p>

          {/* Block 1 */}
          <div className="dorm-info__block">
            <div className="dorm-info__text">
              <p>
                Trường Đại học FPT là một trong những ngôi trường nổi tiếng đào tạo đa ngành, 
                với chất lượng đào tạo đạt chuẩn quốc tế. Trường không chỉ quan tâm đến chất lượng 
                đào tạo, công tác tuyển sinh mà còn chăm lo cho đời sống sinh viên.
              </p>
              <p>
                Bằng việc đầu tư, xây dựng khu <strong>Ký túc xá</strong> đầy đủ trang thiết bị cần thiết, 
                không gian thoáng mát, sạch sẽ. Để đáp ứng nhu cầu và tạo không gian học tập, 
                sinh hoạt thoải mái nhất cho sinh viên. <strong>KTX</strong> cũng được xem như ngôi nhà 
                thứ 2 của nhiều <strong>sinh viên</strong>.
              </p>
            </div>
            <div className="dorm-info__image">
              <img
                src="/public/img/anh5.jpg"
                alt="Tòa nhà KTX"
              />
            </div>
          </div>

          {/* Block 2 */}
          <div className="dorm-info__block dorm-info__block--reverse">
            <div className="dorm-info__image">
              <img
                src="/public/img/anh4.jpg"
                alt="Khuôn viên KTX"
              />
            </div>
            <div className="dorm-info__text">
              <p>
                <strong>Ký túc xá</strong> của trường Đại học FPT là chỗ ở lý tưởng dành cho sinh viên 
                với đầy đủ tiện nghi như điều hòa, nóng lạnh, WiFi tốc độ cao, khu tự học, 
                phòng gym, sân thể thao và nhiều tiện ích khác.
              </p>
              <p>
                Mỗi phòng ở được thiết kế khoa học, thoáng mát, đảm bảo không gian riêng tư 
                cho mỗi sinh viên. Đội ngũ quản lý KTX luôn sẵn sàng hỗ trợ 24/7, 
                tạo môi trường an toàn và thân thiện cho tất cả các bạn sinh viên.
              </p>
            </div>
          </div>
        </div>
      </section>

    
      {/* ======== DORM DETAIL DESCRIPTION ======== */}
      <section className="dorm-detail" id="dorm-detail-section">
        <div className="container">
          <div className="dorm-detail__image-wrapper">
            <img
              src="/public/img/background.jpg"
              alt="Tổng quan ký túc xá Đại học FPT"
              className="dorm-detail__img"
            />
          </div>
          <div className="dorm-detail__content">
            <p className="dorm-detail__highlight">
              Ký túc xá trường Đại học FPT được xây dựng với thiết kế hiện đại, thoáng mát và đầy đủ tiện nghi.
            </p>
            <p>
              Khu <strong>KTX</strong> gồm các tòa nhà. Mỗi tòa <strong>KTX</strong> có các tầng rộng rãi, sạch sẽ, có cả wifi, máy bán nước tự động, máy giặt sấy tự động... Xung quanh còn là cây cối xanh mướt trong lành, dễ chịu, thoáng mát. Phòng ở được thiết kế hiện đại, không gian thoải mái, thiết kế phù hợp cho từng loại phòng 3-4-6-8 người. Mỗi phòng sẽ được trang bị các thiết bị cần thiết, đầy đủ phục vụ cho những nhu cầu thiết yếu của sinh viên như giường tầng, bàn học, giá phơi quần áo, bình nóng lạnh, điều hòa, tủ để giày, nhà vệ sinh riêng cho mỗi phòng... giúp sinh viên an tâm học tập trong quãng thời gian gắn bó với đại học FPT, <strong>đem đến cho sinh viên cảm giác thoải mái tiện nghi như ở nhà</strong>.
            </p>
          </div>
        </div>
      </section>
        {/* ======== FEATURES ======== */}
      <section className="features" id="features-section">
        <div className="container">
          <h2 className="section-title" id="features-title">Tiện ích nổi bật</h2>
          <div className="features__grid">
            <div className="feature-card" id="feature-1">
              <div className="feature-card__icon">🛏️</div>
              <h3 className="feature-card__title">Phòng ở tiện nghi</h3>
              <p className="feature-card__desc">Phòng ở được trang bị đầy đủ nội thất hiện đại, điều hòa, nóng lạnh.</p>
            </div>
            <div className="feature-card" id="feature-2">
              <div className="feature-card__icon">📶</div>
              <h3 className="feature-card__title">WiFi tốc độ cao</h3>
              <p className="feature-card__desc">Kết nối Internet tốc độ cao phủ sóng toàn bộ khu KTX.</p>
            </div>
            <div className="feature-card" id="feature-3">
              <div className="feature-card__icon">🏋️</div>
              <h3 className="feature-card__title">Phòng Gym & Thể thao</h3>
              <p className="feature-card__desc">Khu thể thao đa năng, phòng gym hiện đại phục vụ sinh viên.</p>
            </div>
            <div className="feature-card" id="feature-4">
              <div className="feature-card__icon">🔒</div>
              <h3 className="feature-card__title">An ninh 24/7</h3>
              <p className="feature-card__desc">Hệ thống camera, bảo vệ 24/7, thẻ từ ra vào đảm bảo an toàn.</p>
            </div>
          </div>
        </div>
      </section>


      {/* ======== FAQ ======== */}
      <section className="faq" id="faq-section">
        <div className="container">
          <h2 className="faq__main-title" id="faq-title">FAQ</h2>

          {/* FAQ 1 */}
          <div className="faq-item" id="faq-1">
            <div className="faq-item__header">
              <h3>1. Khi ở KTX cần lưu ý điều gì?</h3>
            </div>
            <div className="faq-item__body">
              <p><strong>Ký túc xá có một số điều cần lưu ý khi ở như sau:</strong></p>
              <ul>
                <li>Không được nuôi vật nuôi, thú cưng (chó, mèo,...).</li>
                <li>Không được uống rượu, bia, chơi cờ bạc, sử dụng các chất kích thích và chất cấm.</li>
                <li>Không được nấu ăn trong ký túc xá.</li>
                <li>Không được đưa người lạ không ở trong ký túc xá vào phòng sau giờ giới nghiêm.</li>
                <li>Giờ giới nghiêm trong ký túc xá là sau 10 giờ 30 phút tối.</li>
                <li>Giữ gìn vệ sinh chung và đổ rác trước 9 giờ sáng.</li>
              </ul>
              <p className="faq-item__note">Tất cả các lỗi vi phạm đều bị trừ điểm uy tín dựa trên mức độ lỗi vi phạm.</p>
            </div>
          </div>

          {/* FAQ 2 */}
          <div className="faq-item" id="faq-2">
            <div className="faq-item__header">
              <h3>2. Thời hạn lưu trú và thông tin phòng ở (FPTU HN)</h3>
            </div>
            <div className="faq-item__body">
              <h4 className="faq-item__sub-title">Thời hạn lưu trú các kỳ</h4>
              <ul>
                <li>Kỳ Spring: Tháng 1 – tháng 4</li>
                <li>Kỳ Summer: Tháng 5 – tháng 8</li>
                <li>Kỳ Fall: Tháng 9 – tháng 12</li>
              </ul>

              <h4 className="faq-item__sub-title">Phụ trội Điện nước/kỳ</h4>
              <ul>
                <li><strong>Định mức miễn phí:</strong> 200 số Điện & 12 số nước</li>
                <li><strong>Dùng vượt định mức:</strong> Nộp phí phụ trội</li>
                <li><strong>Đơn giá:</strong> 2,500đ/số điện, 10,000đ/số nước</li>
              </ul>

              <h4 className="faq-item__sub-title">Thông tin phòng ở</h4>
              <ul>
                <li><strong>Kích thước giường:</strong> 2000x900mm (Dom CDFH), 1930x900mm (Dom AB)</li>
                <li><strong>CSVC cung cấp:</strong> Giường tầng, tủ đồ, tủ giày, bàn học (tùy loại phòng), giá phơi quần áo</li>
                <li><strong>Thiết bị:</strong> Đèn chiếu sáng, điều hòa, bình nóng lạnh</li>
                <li><strong>Dịch vụ nhà trường cung cấp:</strong> ăn uống, tiện ích (giặt là, cắt tóc, siêu thị, phòng gym): phí SV tự túc</li>
                <li><strong>Internet:</strong> KTX không trực tiếp cung cấp. Hỗ trợ hạ tầng cho các nhà mạng FPT telecom, Viettel cung cấp dịch vụ cho SV</li>
                <li><strong>Điểm tiếp nhận đăng ký mạng:</strong> Phòng trực Dom C hoặc liên hệ hotline đặt tại sảnh các Dom</li>
                <li><strong>Đồ dùng cá nhân:</strong> sinh viên tự trang bị như chăn, màn, ga, gối, đệm,......</li>
              </ul>
            </div>
          </div>

          {/* FAQ 3 */}
          <div className="faq-item" id="faq-3">
            <div className="faq-item__header">
              <h3>3. Điểm uy tín là gì?</h3>
            </div>
            <div className="faq-item__body">
              <p><strong>Điểm uy tín (Credibility in FPT Dormitory - CFD score)</strong> là một trong những yếu tố để tạo ra môi trường KTX văn minh và lành mạnh hơn</p>
              <ul>
                <li>Điểm uy tín là tiêu chí để đánh giá ý thức của sinh viên khi sử dụng dịch vụ ký túc xá.</li>
                <li>Điểm uy tín thay đổi dựa theo những hành vi, hoạt động và sự đóng góp của sinh viên trong suốt thời gian ở ký túc xá.</li>
                <li>Điểm uy tín sẽ được tăng, giảm tương ứng theo các quy định đã được đề ra trong nội quy KTX.</li>
                <li>Điểm uy tín là một trong những tiêu chí được dùng để xét duyệt xem sinh viên có được sử dụng ký túc xá trong kỳ hay không.</li>
              </ul>
            </div>
          </div>

          {/* FAQ 4 */}
          <div className="faq-item" id="faq-4">
            <div className="faq-item__header">
              <h3>4. Làm thế nào để gửi yêu cầu tới Ban Quản lý KTX?</h3>
            </div>
            <div className="faq-item__body">
              <p>Bước 1: Vào chức năng <strong>My request</strong>.</p>
              <p>Bước 2: Bấm vào nút <strong>Create new request</strong> -&gt; Chọn <strong>loại yêu cầu (Type request)</strong> thích hợp.</p>
              <p>Bước 3: Điền nội dung của yêu cầu ở phần <strong>Content</strong>.</p>
              <p>Bước 4: Bấm vào nút <strong>Create request</strong>.</p>
            </div>
          </div>

          {/* FAQ 5 */}
          <div className="faq-item" id="faq-5">
            <div className="faq-item__header">
              <h3>5. Làm thế nào để báo cáo sửa chữa đồ dùng trong phòng?</h3>
            </div>
            <div className="faq-item__body">
              <p>Bước 1: Vào chức năng <strong>My request</strong></p>
              <p>Bước 2: Bấm vào nút <strong>Create new request</strong> -&gt; Chọn <strong>Báo cáo vấn đề kỹ thuật</strong> ở mục <strong>Type request</strong></p>
              <p>Bước 3: Hệ thống sẽ dẫn tới trang https://cim.fpt.edu.vn/</p>
              <p>Bước 4: Điền những thông tin cần thiết và gửi ảnh tình trạng thiết bị (trên hệ thống CIM)</p>
              <p>Bước 5: Bấm vào nút <strong>Create</strong> (trên hệ thống CIM)</p>
            </div>
          </div>

          {/* FAQ 6 */}
          <div className="faq-item" id="faq-6">
            <div className="faq-item__header">
              <h3>6. Thông tin liên lạc của bảo vệ và y tế là gì?</h3>
            </div>
            <div className="faq-item__body">
              <p><strong>Thông tin liên lạc của phòng bảo vệ và phòng y tế (24/7):</strong></p>
              <ul>
                <li><strong>Phòng bảo vệ:</strong> &nbsp;(024) 668 05913</li>
                <li><strong>Phòng y tế:</strong> &nbsp;(024) 668 05917</li>
              </ul>
              <p className="faq-item__note">Thông tin chi tiết và cụ thể hơn, sinh viên cần <strong>Đăng nhập</strong> và xem thêm ở trang <strong>Home</strong></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
