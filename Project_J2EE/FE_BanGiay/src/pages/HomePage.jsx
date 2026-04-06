import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import categoryService from '../services/categoryService';
import { getParsedStorageItem } from '../utils/helpers';

function HomePage() {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showFlashSale, setShowFlashSale] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const currentUser = getParsedStorageItem('user', null);
    if (currentUser) {
      setUser(currentUser);
    }

    // Lấy danh sách categories
    fetchCategories();

    // Countdown timer
    const targetTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours from now
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
    }
  };

  // Mapping ảnh cho categories dựa trên tên
  const getCategoryImage = (categoryName) => {
    const imageMap = {
      'Giày Chạy Bộ': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      'Giày Bóng Rổ': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop',
      'Giày Lifestyle': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
      'Running': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
      'Giày Thể Thao': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
      'Giày Sneaker': 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop',
      'Giày Nike': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      'Giày Adidas': 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop',
      'Giày Puma': 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop',
      'Giày Casual': 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop',
      'Giày Bóng Đá': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=400&fit=crop',
      'Giày Tây': 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&h=400&fit=crop',
    };

    // Tìm exact match hoặc partial match
    for (const [key, value] of Object.entries(imageMap)) {
      if (categoryName.includes(key) || key.includes(categoryName)) {
        return value;
      }
    }

    // Fallback: random shoe image
    return 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=400&fit=crop';
  };

  return (
    <div className="bg-gray-50">
      {/* Flash Sale Banner */}
      {showFlashSale && (
        <div className="bg-gray-100 px-4 py-2.5 gap-4 relative">
          <div className="flex items-center justify-center flex-wrap gap-y-3 gap-x-6 pr-7">
            <div>
              <h6 className="text-base text-slate-900 font-semibold">Flash Sale! -</h6>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mt-0.5">
                Limited time offer - Up to 50% off
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-pink-200 px-4 py-1.5 rounded-lg text-center">
                <span className="text-base font-semibold text-slate-900">{String(timeLeft.hours).padStart(2, '0')}</span>
                <p className="text-xs text-slate-600 font-medium">Hours</p>
              </div>
              <div className="bg-pink-200 px-4 py-1.5 rounded-lg text-center">
                <span className="text-base font-semibold text-slate-900">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <p className="text-xs text-slate-600 font-medium">Minutes</p>
              </div>
              <div className="bg-pink-200 px-4 py-1.5 rounded-lg text-center">
                <span className="text-base font-semibold text-slate-900">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <p className="text-xs text-slate-600 font-medium">Seconds</p>
              </div>
            </div>
          </div>

          <div className="absolute right-4 top-2 cursor-pointer" onClick={() => setShowFlashSale(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 fill-slate-900 inline-block" viewBox="0 0 320.591 320.591">
              <path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z" />
              <path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="pt-16 pb-80 sm:pt-24 sm:pb-40 lg:pt-40 lg:pb-48">
          <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
            <div className="sm:max-w-lg">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Bộ Sưu Tập Giày Mới Nhất
              </h1>
              <p className="mt-4 text-xl text-gray-500">
                Khám phá những mẫu giày thể thao hot nhất năm nay. Phong cách trẻ trung, năng động cùng chất lượng đỉnh cao.
              </p>
            </div>
            <div>
              <div className="mt-10">
                {/* Decorative image grid */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none lg:absolute lg:inset-y-0 lg:mx-auto lg:w-full lg:max-w-7xl"
                >
                  <div className="absolute transform sm:top-0 sm:left-1/2 sm:translate-x-8 lg:top-1/2 lg:left-1/2 lg:translate-x-8 lg:-translate-y-1/2">
                    <div className="flex items-center space-x-6 lg:space-x-8">
                      <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                        <div className="h-64 w-44 overflow-hidden rounded-lg sm:opacity-0 lg:opacity-100">
                          <img
                            alt="Giày thể thao"
                            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=600&fit=crop"
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="h-64 w-44 overflow-hidden rounded-lg">
                          <img
                            alt="Giày sneaker"
                            src="https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=600&fit=crop"
                            className="size-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                        <div className="h-64 w-44 overflow-hidden rounded-lg">
                          <img
                            alt="Giày cao cấp"
                            src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=600&fit=crop"
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="h-64 w-44 overflow-hidden rounded-lg">
                          <img
                            alt="Giày running"
                            src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=600&fit=crop"
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="h-64 w-44 overflow-hidden rounded-lg">
                          <img
                            alt="Giày thời trang"
                            src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop"
                            className="size-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                        <div className="h-64 w-44 overflow-hidden rounded-lg">
                          <img
                            alt="Giày nam"
                            src="https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=600&fit=crop"
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="h-64 w-44 overflow-hidden rounded-lg">
                          <img
                            alt="Giày nữ"
                            src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=600&fit=crop"
                            className="size-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  to="/products"
                  className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-center font-medium text-white hover:bg-indigo-700"
                >
                  Xem Bộ Sưu Tập
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="bg-gray-100 rounded-[20px] sm:p-8 p-6">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-slate-900 text-xl font-bold mb-6">Danh Mục Nổi Bật</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="shadow-sm bg-white p-1.5 rounded-md overflow-hidden cursor-pointer relative hover:shadow-md">
                <Link to={`/products?category=${category.id}`} className="block">
                  <div className="bg-gray-200 aspect-square">
                    <img 
                      src={category.image || getCategoryImage(category.name)} 
                      alt={category.name}
                      className="w-full h-full object-cover object-center" 
                    />
                  </div>
                  <div className="p-3 pb-1.5 text-center">
                    <h6 className="text-slate-900 text-sm font-bold truncate">{category.name}</h6>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Collections Section */}
      <section className="sm:px-4 px-6 py-16">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-slate-900 font-bold text-2xl mb-6">Bộ Sưu Tập Mới</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl overflow-hidden relative before:absolute before:inset-0 before:w-full before:h-full before:bg-black/20 before:z-10">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop" 
                  className="w-full aspect-square object-cover object-top" 
                  alt="Giày Thể Thao"
                />
              </div>
              <div className="space-y-4 absolute bottom-0 z-20 px-4 py-2 w-max bg-white/50">
                <div>
                  <h3 className="text-sm font-semibold">Giảm Giá Đến 50%</h3>
                </div>
                <Link to="/products">
                  <button className="bg-pink-600 text-sm font-medium text-white px-4 py-2 cursor-pointer rounded-full hover:opacity-90 transition-opacity">
                    Mua Ngay →
                  </button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden relative before:absolute before:inset-0 before:w-full before:h-full before:bg-black/20 before:z-10">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop" 
                  className="w-full aspect-square object-cover object-top" 
                  alt="Giày Sneaker"
                />
              </div>
              <div className="space-y-4 absolute bottom-0 z-20 px-4 py-2 w-max bg-white/50">
                <div>
                  <h3 className="text-sm font-semibold">Giảm Giá Đến 50%</h3>
                </div>
                <Link to="/products">
                  <button className="bg-pink-600 text-sm font-medium text-white px-4 py-2 cursor-pointer rounded-full hover:opacity-90 transition-opacity">
                    Mua Ngay →
                  </button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden relative before:absolute before:inset-0 before:w-full before:h-full before:bg-black/20 before:z-10">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&h=800&fit=crop" 
                  className="w-full aspect-square object-cover object-top" 
                  alt="Giày Cao Cấp"
                />
              </div>
              <div className="space-y-4 absolute bottom-0 z-20 px-4 py-2 w-max bg-white/50">
                <div>
                  <h3 className="text-sm font-semibold">Giảm Giá Đến 50%</h3>
                </div>
                <Link to="/products">
                  <button className="bg-pink-600 text-sm font-medium text-white px-4 py-2 cursor-pointer rounded-full hover:opacity-90 transition-opacity">
                    Mua Ngay →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chất lượng đảm bảo</h3>
              <p className="text-gray-600">100% hàng chính hãng, bảo hành toàn quốc</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Giá tốt nhất</h3>
              <p className="text-gray-600">Cam kết giá rẻ nhất thị trường</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Giao hàng nhanh</h3>
              <p className="text-gray-600">Giao hàng toàn quốc trong 2-3 ngày</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="p-4">
          <div className="bg-white flex max-lg:flex-col gap-12 max-w-[1400px] mx-auto p-8 rounded-lg">
            <div className="max-w-2xl">
              <h2 className="text-slate-900 md:text-4xl text-3xl font-bold mb-6 md:!leading-[45px] leading-[40px]">Tại sao chọn chúng tôi?</h2>
              <p className="text-slate-600 text-[15px] leading-relaxed">
                Chúng tôi không chỉ bán giày, mà còn mang đến trải nghiệm mua sắm tuyệt vời với dịch vụ chuyên nghiệp, sản phẩm đa dạng và chính sách khách hàng linh hoạt. Khám phá những ưu điểm vượt trội khi mua sắm tại cửa hàng của chúng tôi.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 max-sm:max-w-lg mx-auto">
              <div className="text-left bg-gray-100 rounded-lg border border-gray-200 p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="fill-black w-11 h-11 inline-block bg-white p-2.5 rounded-lg" viewBox="0 0 100 100">
                  <path d="M65.156 4.42c-8.327 0-15.13 6.855-15.13 15.202s6.803 15.165 15.13 15.165c7.017 0 12.924-4.863 14.626-11.382h13.843a3.798 3.798 0 0 0 3.791-3.805 3.798 3.798 0 0 0-3.79-3.8h-13.86C78.053 9.294 72.16 4.42 65.156 4.42zM6.391 15.8a3.798 3.798 0 0 0-3.79 3.805 3.798 3.798 0 0 0 3.79 3.8h36.397c-.21-1.234-.348-2.493-.348-3.783 0-1.304.134-2.575.348-3.821zm28.47 18.987c-7.018 0-12.92 4.89-14.619 11.418H6.392a3.783 3.783 0 0 0-.363 0 3.801 3.801 0 0 0-3.52 4.062 3.798 3.798 0 0 0 3.882 3.535H20.25c1.71 6.511 7.604 11.382 14.61 11.382 8.328 0 15.167-6.848 15.167-15.195 0-8.347-6.84-15.202-15.166-15.202zm22.383 11.418c.21 1.234.347 2.494.347 3.784 0 1.3-.134 2.57-.347 3.813h36.381a3.795 3.795 0 0 0 3.874-3.714 3.796 3.796 0 0 0-3.874-3.883H57.244zm7.912 18.979c-8.327 0-15.13 6.855-15.13 15.202S56.83 95.58 65.157 95.58c7.007 0 12.907-4.87 14.618-11.382h13.851a3.796 3.796 0 0 0 3.706-3.883 3.795 3.795 0 0 0-3.706-3.714H79.782c-1.701-6.527-7.608-11.418-14.626-11.418zM6.029 76.602a3.801 3.801 0 0 0-3.52 4.062 3.798 3.798 0 0 0 3.882 3.535h36.412a22.541 22.541 0 0 1-.348-3.813c0-1.29.138-2.55.348-3.784H6.39a3.783 3.783 0 0 0-.362 0z" />
                </svg>
                <h3 className="text-slate-900 text-base font-semibold mt-5 mb-2.5">Tùy chỉnh cá nhân hóa</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed">
                  Tìm kiếm và lọc sản phẩm theo size, màu sắc, thương hiệu yêu thích. Hệ thống gợi ý thông minh giúp bạn tìm đôi giày hoàn hảo.
                </p>
                <Link to="/products" className="text-blue-700 font-medium inline-flex items-center text-[15px] mt-6">
                  Khám phá <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1.5 fill-current" viewBox="0 0 24 24"><path d="m23.564 11.235-7.56-7.56a1.08 1.08 0 0 0-1.528 1.528l5.717 5.716H1.2a1.08 1.08 0 0 0 0 2.16h18.993l-5.717 5.716a1.08 1.08 0 1 0 1.528 1.528l7.56-7.56a1.08 1.08 0 0 0 0-1.528z" /></svg>
                </Link>
              </div>

              <div className="text-left bg-gray-100 rounded-lg border border-gray-200 p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="fill-black w-11 h-11 inline-block bg-white p-2.5 rounded-lg" viewBox="0 0 682.667 682.667">
                  <defs>
                    <clipPath id="b" clipPathUnits="userSpaceOnUse">
                      <path d="M0 512h512V0H0Z" />
                    </clipPath>
                  </defs>
                  <mask id="a">
                    <rect width="100%" height="100%" fill="#fff" />
                  </mask>
                  <g mask="url(#a)">
                    <g fill="none" stroke="#000" strokeMiterlimit="10" strokeWidth="30" clipPath="url(#b)" transform="matrix(1.33333 0 0 -1.33333 0 682.667)">
                      <path d="M458.172 372.633a533.882 533.882 0 0 0-.474 16.345c-.303 20.475-16.411 37.184-36.856 38.326-62.529 3.493-111.431 24.292-152.737 64.553-6.912 6.336-17.279 6.336-24.191 0-41.306-40.261-90.208-61.06-152.737-64.553-20.445-1.142-36.553-17.851-36.857-38.325a530.642 530.642 0 0 0-.473-16.346C51.549 251.97 48.104 86.598 248.803 16.615a22.014 22.014 0 0 1 2.942-.801l.01-.002a21.72 21.72 0 0 1 8.509 0c1.002.2 1.996.47 2.961.807C463.342 86.602 460.47 251.398 458.172 372.633Z" />
                      <path d="M368.408 256c0-62.082-50.327-112.409-112.408-112.409S143.592 193.918 143.592 256c0 62.082 50.327 112.409 112.408 112.409S368.408 318.082 368.408 256Z" />
                      <path strokeLinecap="round" d="m303.227 284.952-69.785-69.785M206.773 241.834l26.668-26.668" />
                    </g>
                  </g>
                </svg>
                <h3 className="text-slate-900 text-base font-semibold mt-5 mb-2.5">Bảo mật thanh toán</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed">
                  Hệ thống thanh toán an toàn được mã hóa SSL. Hỗ trợ đa dạng phương thức: COD, chuyển khoản, thẻ, ví điện tử.
                </p>
                <a href="#" className="text-blue-700 font-medium inline-flex items-center text-[15px] mt-6">
                  Tìm hiểu thêm <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1.5 fill-current" viewBox="0 0 24 24"><path d="m23.564 11.235-7.56-7.56a1.08 1.08 0 0 0-1.528 1.528l5.717 5.716H1.2a1.08 1.08 0 0 0 0 2.16h18.993l-5.717 5.716a1.08 1.08 0 1 0 1.528 1.528l7.56-7.56a1.08 1.08 0 0 0 0-1.528z" /></svg>
                </a>
              </div>

              <div className="text-left bg-gray-100 rounded-lg border border-gray-200 p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="fill-black w-11 h-11 inline-block bg-white p-2.5 rounded-lg" viewBox="0 0 512 512">
                  <path d="M495.984 252.588c-17.119-14.109-44.177-15.319-61.936 3.74l-44.087 47.327c-5.7-18.319-22.809-31.658-42.977-31.658h-78.675c-5.97 0-7.969-2.28-18.339-10.269-39.538-34.468-98.924-34.358-138.342.33L82.71 287.516c-12.999-6.88-28.178-7.05-41.248-.52L8.294 303.575c-7.41 3.71-10.409 12.719-6.71 20.129l89.995 179.989c3.71 7.41 12.719 10.409 20.129 6.71l33.168-16.589c16.349-8.169 25.448-24.849 24.858-41.827h177.249c32.868 0 64.276-15.699 83.995-41.997l72.006-96.014c13.969-18.61 11.759-45.899-7-61.388zM131.456 466.985l-19.749 9.879-76.585-153.16 19.759-9.879c7.41-3.7 16.409-.71 20.119 6.71l63.166 126.332c3.7 7.409.7 16.408-6.71 20.118zm347.529-171.009L406.98 391.99c-14.089 18.789-36.518 29.998-59.996 29.998H159.265l-56.207-112.423 28.388-24.988c28.248-24.849 70.846-24.849 99.094 0 16.639 14.649 26.988 17.419 37.768 17.419h78.675c8.27 0 14.999 6.73 14.999 14.999s-6.73 14.999-14.999 14.999h-76.605c-8.28 0-14.999 6.72-14.999 14.999s6.72 14.999 14.999 14.999h86.655c12.449 0 24.449-5.22 32.928-14.329l66.036-70.886c6.04-6.48 15.299-5.94 20.979-.97 5.939 5.199 6.58 14.089 2.009 20.169zm-163.6-193.609c10.269-10.769 16.599-25.328 16.599-41.358 0-33.018-26.678-60.996-59.996-60.996-33.068 0-60.996 27.928-60.996 60.996 0 15.539 6.09 30.208 17.149 41.478-27.428 15.379-47.147 44.897-47.147 79.515v14.999c0 8.279 6.72 14.999 14.999 14.999h150.991c8.279 0 14.999-6.72 14.999-14.999v-14.999c-.001-33.938-18.668-63.916-46.598-79.635zm-43.397-72.355c16.259 0 29.998 14.199 29.998 30.998 0 16.539-13.459 29.998-29.998 29.998-16.799 0-30.998-13.739-30.998-29.998 0-16.509 14.489-30.998 30.998-30.998zm-60.996 151.99c0-33.068 27.928-60.996 60.996-60.996 33.078 0 59.996 27.358 59.996 60.996H210.992z" />
                </svg>
                <h3 className="text-slate-900 text-base font-semibold mt-5 mb-2.5">Hỗ trợ 24/7</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed">
                  Đội ngũ tư vấn chuyên nghiệp sẵn sàng hỗ trợ qua hotline, email, chat. Chính sách đổi trả linh hoạt trong 7 ngày.
                </p>
                <a href="#" className="text-blue-700 font-medium inline-flex items-center text-[15px] mt-6">
                  Liên hệ ngay <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1.5 fill-current" viewBox="0 0 24 24"><path d="m23.564 11.235-7.56-7.56a1.08 1.08 0 0 0-1.528 1.528l5.717 5.716H1.2a1.08 1.08 0 0 0 0 2.16h18.993l-5.717 5.716a1.08 1.08 0 1 0 1.528 1.528l7.56-7.56a1.08 1.08 0 0 0 0-1.528z" /></svg>
                </a>
              </div>

              <div className="text-left bg-gray-100 rounded-lg border border-gray-200 p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="fill-black w-11 h-11 inline-block bg-white p-2.5 rounded-lg" viewBox="0 0 512 512">
                  <path d="M451 257v215c0 22.5-14.1 40-32.1 40H375c-18 0-32.1-17.6-32.1-40V257c0-22.5 14.1-40 32.1-40h43.9c17.9 0 32.1 17.6 32.1 40zm.7-126.1c-3 2.1-6.9 2.2-10.1.3l-30-18C362.2 195 292.5 272 157.9 272c-28.4 0-59.7-3.4-94.3-11-5-1.1-8.2-6-7.2-11.1 1-4.6 5.2-7.7 9.9-7.3 8.4.7 203.6 13.8 285.6-166.7L321.2 61c-4.6-2.2-6.6-7.8-4.4-12.4 1-2.1 2.7-3.7 4.8-4.6L423.5.7c4.7-2 10.2.2 12.2 4.9.3.7.5 1.4.6 2.1l19.3 113.9c.7 3.6-.9 7.3-3.9 9.3zM310.1 336v136c0 22.5-14.1 40-32.1 40h-44c-18 0-32.1-17.6-32.1-40V336c0-22.5 14.1-40 32.1-40h43.9c18.1-.1 32.2 17.5 32.2 40zm-137.8 65.8V472c0 22.4-14.1 40-32.1 40h-44c-18 0-32.1-17.6-32.1-40v-70.2c0-22.5 14.1-40 32.1-40h43.9c18.1-.1 32.2 17.5 32.2 40z" />
                </svg>
                <h3 className="text-slate-900 text-base font-semibold mt-5 mb-2.5">Hiệu suất vượt trội</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed">
                  Website tải nhanh, tìm kiếm thông minh, thanh toán nhanh chóng. Trải nghiệm mua sắm mượt mà trên mọi thiết bị.
                </p>
                <Link to="/products" className="text-blue-700 font-medium inline-flex items-center text-[15px] mt-6">
                  Mua sắm ngay <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1.5 fill-current" viewBox="0 0 24 24"><path d="m23.564 11.235-7.56-7.56a1.08 1.08 0 0 0-1.528 1.528l5.717 5.716H1.2a1.08 1.08 0 0 0 0 2.16h18.993l-5.717 5.716a1.08 1.08 0 1 0 1.528 1.528l7.56-7.56a1.08 1.08 0 0 0 0-1.528z" /></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="p-4">
          <div className="max-w-6xl max-lg:max-w-xl mx-auto">
            <div className="grid lg:grid-cols-2 items-start gap-12">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold text-slate-900 !leading-tight">Khách hàng nói gì về chúng tôi</h2>
                <p className="text-[15px] mt-6 leading-relaxed text-slate-600">
                  Hàng ngàn khách hàng đã tin tưởng và hài lòng với chất lượng sản phẩm cũng như dịch vụ của chúng tôi. Đọc những đánh giá thật từ khách hàng đã mua sắm tại cửa hàng.
                </p>
              </div>

              <div>
                <div>
                  <p className="text-slate-700 text-[15px] font-normal leading-relaxed">
                    Giày chất lượng tốt, giao hàng nhanh. Tôi đã mua 3 đôi giày ở đây và đều rất hài lòng. Size chuẩn, đóng gói cẩn thận. Đặc biệt là giá cả hợp lý so với chất lượng nhận được.
                  </p>
                </div>
                <div className="flex items-center mt-4">
                  <img src="https://readymadeui.com/team-1.webp" className="w-11 h-11 border border-slate-600 rounded-full" alt="Anh Minh" />
                  <div className="ml-4">
                    <h4 className="text-slate-900 text-[15px] font-semibold">Anh Minh</h4>
                    <p className="mt-0.5 text-xs text-slate-500">Khách hàng thân thiết</p>
                  </div>
                </div>

                <hr className="my-6 border-gray-300" />

                <div className="mt-4">
                  <p className="text-slate-700 text-[15px] font-normal leading-relaxed">
                    Shop uy tín, giá cả hợp lý. Nhân viên tư vấn nhiệt tình, giúp tôi chọn được đôi giày phù hợp nhất. Chính sách đổi trả rõ ràng làm tôi yên tâm khi mua online. Sẽ giới thiệu bạn bè mua.
                  </p>
                </div>
                <div className="flex items-center mt-4">
                  <img src="https://readymadeui.com/team-2.webp" className="w-11 h-11 border border-slate-600 rounded-full" alt="Chị Hương" />
                  <div className="ml-4">
                    <h4 className="text-slate-900 text-[15px] font-semibold">Chị Hương</h4>
                    <p className="mt-0.5 text-xs text-slate-500">Khách hàng tại Hà Nội</p>
                  </div>
                </div>

                <hr className="my-6 border-gray-300" />

                <div className="mt-4">
                  <p className="text-slate-700 text-[15px] font-normal leading-relaxed">
                    Mua giày online lần đầu và không thất vọng. Sản phẩm đúng như mô tả, chính sách đổi trả rõ ràng. Giao hàng rất nhanh, chỉ 2 ngày đã nhận được. Shop này đáng tin cậy, tôi sẽ quay lại.
                  </p>
                </div>
                <div className="flex items-center mt-4">
                  <img src="https://readymadeui.com/team-3.webp" className="w-11 h-11 border border-slate-600 rounded-full" alt="Anh Tuấn" />
                  <div className="ml-4">
                    <h4 className="text-slate-900 text-[15px] font-semibold">Anh Tuấn</h4>
                    <p className="mt-0.5 text-xs text-slate-500">Khách hàng tại TP.HCM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng mua sắm?</h2>
          <p className="text-lg mb-8">Khám phá hàng ngàn mẫu giày độc đáo</p>
          <Link
            to="/products"
            className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold inline-block"
          >
            Xem sản phẩm
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
