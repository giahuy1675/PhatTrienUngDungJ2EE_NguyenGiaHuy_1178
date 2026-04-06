import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="w-full bg-slate-100 py-16 px-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-slate-900 text-base font-semibold mb-4">Sản Phẩm</h3>
              <ul className="space-y-2">
                <li><Link to="/products" className="text-slate-900 text-sm hover:text-blue-700">Giày Chạy Bộ</Link></li>
                <li><Link to="/products" className="text-slate-900 text-sm hover:text-blue-700">Giày Bóng Rổ</Link></li>
                <li><Link to="/products" className="text-slate-900 text-sm hover:text-blue-700">Giày Lifestyle</Link></li>
                <li><Link to="/products" className="text-slate-900 text-sm hover:text-blue-700">Giày Thể Thao</Link></li>
                <li><Link to="/products" className="text-slate-900 text-sm hover:text-blue-700">Giày Nike</Link></li>
                <li><Link to="/products" className="text-slate-900 text-sm hover:text-blue-700">Giày Adidas</Link></li>
                <li><Link to="/products" className="text-slate-900 text-sm hover:text-blue-700">Giày Puma</Link></li>
                <li><Link to="/products" className="text-slate-900 text-sm hover:text-blue-700">Sản Phẩm Mới</Link></li>
                <li><Link to="/products" className="text-slate-900 text-sm hover:text-blue-700">Sản Phẩm Bán Chạy</Link></li>
                <li><Link to="/products" className="text-slate-900 text-sm hover:text-blue-700">Giày Sale</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-slate-900 text-base font-semibold mb-4">Dịch Vụ & Hỗ Trợ</h3>
              <ul className="space-y-2">
                <li><Link to="/profile" className="text-slate-900 text-sm hover:text-blue-700">Tài Khoản Của Bạn</Link></li>
                <li><Link to="/orders" className="text-slate-900 text-sm hover:text-blue-700">Đơn Hàng</Link></li>
                <li><Link to="/cart" className="text-slate-900 text-sm hover:text-blue-700">Giỏ Hàng</Link></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Chính Sách Đổi Trả</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Theo Dõi Đơn Hàng</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Hỗ Trợ Khách Hàng</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Hướng Dẫn Mua Hàng</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Hướng Dẫn Thanh Toán</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Thẻ Quà Tặng</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Chương Trình Khách Hàng Thân Thiết</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Hỗ Trợ Kỹ Thuật</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Bảo Hành & Bảo Trì</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Thanh Toán Linh Hoạt</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-slate-900 text-base font-semibold mb-4">Về Chúng Tôi</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-slate-900 text-sm hover:text-blue-700">Giới Thiệu</Link></li>
                <li><Link to="/contact" className="text-slate-900 text-sm hover:text-blue-700">Liên Hệ</Link></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Tuyển Dụng</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Tin Tức</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Blog</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Đối Tác</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Cửa Hàng</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Hệ Thống Phân Phối</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Trách Nhiệm Xã Hội</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Môi Trường</a></li>
                <li><a href="#" className="text-slate-900 text-sm hover:text-blue-700">Chương Trình Học Bổng</a></li>
              </ul>
            </div>
          </div>

          <div className="max-w-lg">
            <h3 className="text-slate-900 text-base font-semibold mb-4">Đăng Ký Nhận Tin</h3>
            <p className="text-sm text-slate-900 leading-relaxed">
              Đăng ký nhận bản tin của chúng tôi để cập nhật tin tức mới nhất, 
              các chương trình khuyến mãi và ưu đãi đặc biệt. Tham gia cộng đồng của chúng tôi ngay hôm nay!
            </p>

            <div className="bg-white border border-gray-600 flex p-1 rounded-full mt-8">
              <input 
                type='email' 
                placeholder='Nhập email của bạn'
                className="w-full outline-none text-slate-900 text-sm bg-transparent pl-4" 
              />
              <button 
                type='button'
                className="bg-black transition-all text-white font-medium text-sm rounded-full px-4 py-2 ml-4 cursor-pointer hover:bg-gray-800"
              >
                Đăng Ký
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 mt-10">
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-900">Khu vực:</p>
            <select className="outline-0 text-sm text-slate-900">
              <option>Việt Nam</option>
              <option>Hà Nội</option>
              <option>TP. Hồ Chí Minh</option>
              <option>Đà Nẵng</option>
              <option>Cần Thơ</option>
              <option>Hải Phòng</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-900">Thanh toán:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <img src='https://readymadeui.com/images/master.webp' alt="MasterCard" className="w-10 object-contain" />
              <img src='https://readymadeui.com/images/visa.webp' alt="Visa" className="w-10 object-contain" />
              <img src='https://readymadeui.com/images/american-express.webp' alt="Amex" className="w-10 object-contain" />
            </div>
          </div>

          <ul className="flex space-x-4">
            <li>
              <a href='#' aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" className="fill-blue-600 w-8 h-8" viewBox="0 0 49.652 49.652">
                  <path d="M24.826 0C11.137 0 0 11.137 0 24.826c0 13.688 11.137 24.826 24.826 24.826 13.688 0 24.826-11.138 24.826-24.826C49.652 11.137 38.516 0 24.826 0zM31 25.7h-4.039v14.396h-5.985V25.7h-2.845v-5.088h2.845v-3.291c0-2.357 1.12-6.04 6.04-6.04l4.435.017v4.939h-3.219c-.524 0-1.269.262-1.269 1.386v2.99h4.56z" />
                </svg>
              </a>
            </li>
            <li>
              <a href='#' aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 112.196 112.196">
                  <circle cx="56.098" cy="56.097" r="56.098" fill="#007ab9" />
                  <path fill="#fff" d="M89.616 60.611v23.128H76.207V62.161c0-5.418-1.936-9.118-6.791-9.118-3.705 0-5.906 2.491-6.878 4.903-.353.862-.444 2.059-.444 3.268v22.524h-13.41s.18-36.546 0-40.329h13.411v5.715c-.027.045-.065.089-.089.132h.089v-.132c1.782-2.742 4.96-6.662 12.085-6.662 8.822 0 15.436 5.764 15.436 18.149zm-54.96-36.642c-4.587 0-7.588 3.011-7.588 6.967 0 3.872 2.914 6.97 7.412 6.97h.087c4.677 0 7.585-3.098 7.585-6.97-.089-3.956-2.908-6.967-7.496-6.967zm-6.791 59.77H41.27v-40.33H27.865v40.33z" />
                </svg>
              </a>
            </li>
            <li>
              <a href='#' aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 152 152">
                  <linearGradient id="a" x1="22.26" x2="129.74" y1="22.26" y2="129.74" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#fae100" />
                    <stop offset=".15" stopColor="#fcb720" />
                    <stop offset=".3" stopColor="#ff7950" />
                    <stop offset=".5" stopColor="#ff1c74" />
                    <stop offset="1" stopColor="#6c1cd1" />
                  </linearGradient>
                  <g>
                    <g>
                      <rect width="152" height="152" fill="url(#a)" rx="76" />
                      <g fill="#fff">
                        <path fill="#ffffff10" d="M133.2 26c-11.08 20.34-26.75 41.32-46.33 60.9S46.31 122.12 26 133.2q-1.91-1.66-3.71-3.46A76 76 0 1 1 129.74 22.26q1.8 1.8 3.46 3.74z" />
                        <path d="M94 36H58a22 22 0 0 0-22 22v36a22 22 0 0 0 22 22h36a22 22 0 0 0 22-22V58a22 22 0 0 0-22-22zm15 54.84A18.16 18.16 0 0 1 90.84 109H61.16A18.16 18.16 0 0 1 43 90.84V61.16A18.16 18.16 0 0 1 61.16 43h29.68A18.16 18.16 0 0 1 109 61.16z" />
                        <path d="m90.59 61.56-.19-.19-.16-.16A20.16 20.16 0 0 0 76 55.33 20.52 20.52 0 0 0 55.62 76a20.75 20.75 0 0 0 6 14.61 20.19 20.19 0 0 0 14.42 6 20.73 20.73 0 0 0 14.55-35.05zM76 89.56A13.56 13.56 0 1 1 89.37 76 13.46 13.46 0 0 1 76 89.56zm26.43-35.18a4.88 4.88 0 0 1-4.85 4.92 4.81 4.81 0 0 1-3.42-1.43 4.93 4.93 0 0 1 3.43-8.39 4.82 4.82 0 0 1 3.09 1.12l.1.1a3.05 3.05 0 0 1 .44.44l.11.12a4.92 4.92 0 0 1 1.1 3.12z" />
                      </g>
                    </g>
                  </g>
                </svg>
              </a>
            </li>
            <li>
              <a href='#' aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 1227 1227">
                  <path d="M613.5 0C274.685 0 0 274.685 0 613.5S274.685 1227 613.5 1227 1227 952.315 1227 613.5 952.315 0 613.5 0z" />
                  <path fill="#fff" d="m680.617 557.98 262.632-305.288h-62.235L652.97 517.77 470.833 252.692H260.759l275.427 400.844-275.427 320.142h62.239l240.82-279.931 192.35 279.931h210.074L680.601 557.98zM345.423 299.545h95.595l440.024 629.411h-95.595z" />
                </svg>
              </a>
            </li>
          </ul>
        </div>

        <hr className="border-gray-300 my-8" />

        <div className="flex flex-wrap gap-6 justify-between">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <a href='#' className="hover:text-blue-700 text-slate-900 text-sm font-normal">Điều Khoản Dịch Vụ</a>
            </li>
            <li>
              <a href='#' className="hover:text-blue-700 text-slate-900 text-sm font-normal">Chính Sách Bảo Mật</a>
            </li>
            <li>
              <a href='#' className="hover:text-blue-700 text-slate-900 text-sm font-normal">Bảo Mật</a>
            </li>
          </ul>
          <div>
            <p className="text-slate-900 text-sm">© 2026 Bán Giày Online. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
