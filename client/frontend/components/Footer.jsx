const Footer = () => {
  return (
    <footer className="bg-pink-100 text-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

          {/* Logo and Contact */}
          <div>
            <div className="mb-6 h-50 w-[auto] overflow-hidden relative">
              <img
                src="/BookHaven (1).png"
                alt="BookHaven"
                className="absolute inset-0 w-full h-full object-contain scale-[1.25] mix-blend-multiply origin-center"
                draggable="false"
              />
            </div>

            <div className="space-y-3 text-sm ml-5">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/whatsapp-icon.png" alt="WhatsApp" className="w-5 h-5" />
                <span className="">0987654321</span>
              </div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/email-icon.png" alt="Email" className="w-5 h-5" />
                <span className="">cskhbookhaven@gmail.com</span>
              </div>
              <div className="flex items-start space-x-3 mb-4">
                <img src="/location-icon.png" alt="Location" className="w-5 h-5" />
                <span className="capitalize">
                  Km10, đường Nguyễn Trãi, q. Hà Đông, Hà Nội
                </span>
              </div>
            </div>
          </div>

          {/* TIN TỨC */}
          <div className="ml-10">
            <h3 className="font-bold uppercase mb-4 text-lg">TIN TỨC</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors capitalize">
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors capitalize">
                  Sự kiện
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors capitalize">
                  Tin khuyến mại
                </a>
              </li>
            </ul>
          </div>

          {/* HỖ TRỢ KHÁCH HÀNG */}
          <div>
            <h3 className="font-bold uppercase mb-4 text-lg">HỖ TRỢ KHÁCH HÀNG</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors capitalize">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors capitalize">
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors capitalize">
                  Phương thức thanh toán
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors capitalize">
                  Phương thức giao hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors capitalize">
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors capitalize">
                  Bảo mật thông tin
                </a>
              </li>
            </ul>
          </div>

          {/* THÔNG TIN */}
          <div className="ml-7">
            <h3 className="font-bold uppercase mb-4 text-lg">THÔNG TIN</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors capitalize">
                  Đăng nhập
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors capitalize">
                  Đăng ký
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors capitalize">
                  Tra cứu đơn hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors capitalize">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* MẠNG XÃ HỘI & VẬN CHUYỂN */}
          <div>
            <h3 className="font-bold uppercase mb-4 text-lg">MẠNG XÃ HỘI</h3>
            <div className="flex space-x-3 mb-6">
              <a href="https://www.facebook.com/phulee.9.10/" className="flex items-center justify-center w-10 h-10 rounded bg-pink-100 hover:opacity-80 transition-opacity">
                <img src="/facebook-icon.png" alt="Facebook" className="w-6 h-6 mix-blend-multiply" />
              </a>
              <a href="https://www.tiktok.com/@nwphus" className="flex items-center justify-center w-10 h-10 rounded bg-pink-100 hover:opacity-80 transition-opacity">
                <img src="/tiktok-icon.png" alt="TikTok" className="w-8 h-8 mix-blend-multiply" />
              </a>
              <a href="https://www.instagram.com/phu_lee_/" className="flex items-center justify-center w-10 h-10 rounded bg-pink-100 hover:opacity-80 transition-opacity">
                <img src="/instagram-icon.png" alt="Instagram" className="w-6 h-6 mix-blend-multiply" />
              </a>
            </div>

            <h3 className="font-bold uppercase mb-4 text-lg">VẬN CHUYỂN</h3>
            <div className="flex space-x-4">
              <img src="/grab-express-icon.png" alt="Grab Express" className="h-8 w-auto" />
              <img src="/ahamove-icon.png" alt="Ahamove" className="h-8 w-auto" />
              <img src="/vietnam-post-icon.png" alt="Vietnam Post" className="h-8 w-auto" />
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
