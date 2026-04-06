import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getParsedStorageItem } from '../utils/helpers';

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = getParsedStorageItem('user', null);

    if (userData) {
      // Check if user is admin
      if (userData.role !== 'ADMIN') {
        navigate('/');
        return;
      }
      setUser(userData);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="bg-white shadow-md border-r border-gray-200 h-screen fixed top-0 left-0 min-w-[250px] py-6 px-4 overflow-auto">
        <div className="relative flex flex-col h-full">
          <div className="flex flex-wrap items-center cursor-pointer relative">
            <div className="w-10 h-10 rounded flex items-center justify-center">
              <img
                src="/nike.svg"
                alt="Nike"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-900 font-medium">Bán Giày Admin</p>
              <p className="text-xs text-slate-500 mt-0.5">Admin Panel</p>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          <div>
            <h4 className="text-sm text-slate-500 mb-4">Quản Lý</h4>
            <ul className="space-y-4 px-2 flex-1">
              <li>
                <Link 
                  to="/admin/dashboard" 
                  className={`text-sm flex items-center font-medium transition-all ${
                    isActive('/admin/dashboard') 
                      ? 'text-blue-600' 
                      : 'text-slate-800 hover:text-blue-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                    <path d="M19.56 23.253H4.44a4.051 4.051 0 0 1-4.05-4.05v-9.115c0-1.317.648-2.56 1.728-3.315l7.56-5.292a4.062 4.062 0 0 1 4.644 0l7.56 5.292a4.056 4.056 0 0 1 1.728 3.315v9.115a4.051 4.051 0 0 1-4.05 4.05zM12 2.366a2.45 2.45 0 0 0-1.393.443l-7.56 5.292a2.433 2.433 0 0 0-1.037 1.987v9.115c0 1.34 1.09 2.43 2.43 2.43h15.12c1.34 0 2.43-1.09 2.43-2.43v-9.115c0-.788-.389-1.533-1.037-1.987l-7.56-5.292A2.438 2.438 0 0 0 12 2.377z"></path>
                    <path d="M16.32 23.253H7.68a.816.816 0 0 1-.81-.81v-5.4c0-2.83 2.3-5.13 5.13-5.13s5.13 2.3 5.13 5.13v5.4c0 .443-.367.81-.81.81zm-7.83-1.62h7.02v-4.59c0-1.933-1.577-3.51-3.51-3.51s-3.51 1.577-3.51 3.51z"></path>
                  </svg>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/reports" 
                  className={`text-sm flex items-center font-medium transition-all ${
                    isActive('/admin/reports') 
                      ? 'text-blue-600' 
                      : 'text-slate-800 hover:text-blue-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                  </svg>
                  <span>Báo Cáo</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/products" 
                  className={`text-sm flex items-center font-medium transition-all ${
                    isActive('/admin/products') 
                      ? 'text-blue-600' 
                      : 'text-slate-800 hover:text-blue-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4 mr-3" viewBox="0 0 511.414 511.414">
                    <path d="M497.695 108.838a16.002 16.002 0 0 0-9.92-14.8L261.787 1.2a16.003 16.003 0 0 0-12.16 0L23.639 94.038a16 16 0 0 0-9.92 14.8v293.738a16 16 0 0 0 9.92 14.8l225.988 92.838a15.947 15.947 0 0 0 12.14-.001c.193-.064-8.363 3.445 226.008-92.837a16 16 0 0 0 9.92-14.8zm-241.988 76.886-83.268-34.207L352.39 73.016l88.837 36.495zm-209.988-51.67 71.841 29.513v83.264c0 8.836 7.164 16 16 16s16-7.164 16-16v-70.118l90.147 37.033v257.797L45.719 391.851zM255.707 33.297l55.466 22.786-179.951 78.501-61.035-25.074zm16 180.449 193.988-79.692v257.797l-193.988 79.692z"></path>
                  </svg>
                  <span>Sản Phẩm</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/orders" 
                  className={`text-sm flex items-center font-medium transition-all ${
                    isActive('/admin/orders') 
                      ? 'text-blue-600' 
                      : 'text-slate-800 hover:text-blue-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4 mr-3" viewBox="0 0 193.769 193.769">
                    <path d="m149.203 41.104-9.348 12.009c20.15 15.679 30.201 41.063 26.234 66.253-2.906 18.484-12.838 34.73-27.964 45.748-15.131 11.012-33.64 15.488-52.124 12.567-38.157-6.008-64.32-41.938-58.322-80.098C30.585 79.097 40.52 62.85 55.648 51.835c13.208-9.615 28.991-14.233 45.086-13.317L87.579 52.319l9.759 9.313 20.766-21.801.005.008 9.303-9.769-9.752-9.303-.005.003L95.862 0l-9.31 9.769 14.2 13.525c-19.303-.913-38.21 4.702-54.059 16.242C28.28 52.943 16.19 72.717 12.65 95.221c-7.302 46.445 24.54 90.184 70.985 97.493a86.181 86.181 0 0 0 13.434 1.055c17.89 0 35.273-5.623 50.011-16.356 18.415-13.409 30.503-33.183 34.043-55.682 4.829-30.654-7.403-61.55-31.92-80.627z"></path>
                    <path d="M105.24 151.971v-.003h.001v-8.757c10.383-1.159 20.485-7.718 20.485-20.17 0-16.919-15.732-18.859-27.223-20.274-7.347-.878-12.97-1.897-12.97-6.348 0-6.188 8.722-6.855 12.473-6.855 5.567 0 11.507 2.617 13.525 5.957l.586.971 11.542-5.341-.571-1.164c-4.301-8.793-12.009-11.337-17.85-12.364v-7.71H91.723v7.677c-12.582 1.856-20.054 8.839-20.054 18.829 0 16.29 14.791 17.943 25.582 19.153 9.617 1.134 14.094 3.51 14.094 7.469 0 7.563-10.474 8.154-13.685 8.154-7.147 0-14.038-3.566-16.031-8.301l-.495-1.169-12.539 5.316.5 1.169c3.713 8.691 11.725 14.137 22.63 15.425v8.336h13.515z"></path>
                  </svg>
                  <span>Đơn Hàng</span>
                </Link>
              </li>
            </ul>
          </div>

          <hr className="my-6 border-gray-200" />

          <div className="flex-1">
            <h4 className="text-sm text-slate-500 mb-4">Hệ Thống</h4>
            <ul className="space-y-4 px-2 flex-1">
              <li>
                <Link 
                  to="/admin/categories" 
                  className={`text-sm flex items-center font-medium transition-all ${
                    isActive('/admin/categories') 
                      ? 'text-blue-600' 
                      : 'text-slate-800 hover:text-blue-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4 mr-3" viewBox="0 0 16 16">
                    <path d="M13 .5H3A2.503 2.503 0 0 0 .5 3v10A2.503 2.503 0 0 0 3 15.5h10a2.503 2.503 0 0 0 2.5-2.5V3A2.503 2.503 0 0 0 13 .5ZM14.5 13a1.502 1.502 0 0 1-1.5 1.5H3A1.502 1.502 0 0 1 1.5 13v-.793l3.5-3.5 1.647 1.647a.5.5 0 0 0 .706 0L10.5 7.207V8a.5.5 0 0 0 1 0V6a.502.502 0 0 0-.5-.5H9a.5.5 0 0 0 0 1h.793L7 9.293 5.354 7.647a.5.5 0 0 0-.707 0L1.5 10.793V3A1.502 1.502 0 0 1 3 1.5h10A1.502 1.502 0 0 1 14.5 3Z"></path>
                  </svg>
                  <span>Danh Mục</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/brands" 
                  className={`text-sm flex items-center font-medium transition-all ${
                    isActive('/admin/brands') 
                      ? 'text-blue-600' 
                      : 'text-slate-800 hover:text-blue-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Thương Hiệu</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/users" 
                  className={`text-sm flex items-center font-medium transition-all ${
                    isActive('/admin/users') 
                      ? 'text-blue-600' 
                      : 'text-slate-800 hover:text-blue-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4 mr-3" viewBox="0 0 512 512">
                    <path d="M437.02 74.98C388.668 26.63 324.379 0 256 0S123.332 26.629 74.98 74.98C26.63 123.332 0 187.621 0 256s26.629 132.668 74.98 181.02C123.332 485.37 187.621 512 256 512s132.668-26.629 181.02-74.98C485.37 388.668 512 324.379 512 256s-26.629-132.668-74.98-181.02zM111.105 429.297c8.454-72.735 70.989-128.89 144.895-128.89 38.96 0 75.598 15.179 103.156 42.734 23.281 23.285 37.965 53.687 41.742 86.152C361.641 462.172 311.094 482 256 482s-105.637-19.824-144.895-52.703zM256 269.507c-42.871 0-77.754-34.882-77.754-77.753C178.246 148.879 213.13 114 256 114s77.754 34.879 77.754 77.754c0 42.871-34.883 77.754-77.754 77.754zm170.719 134.427a175.9 175.9 0 0 0-46.352-82.004c-18.437-18.438-40.25-32.27-64.039-40.938 28.598-19.394 47.426-52.16 47.426-89.238C363.754 132.34 315.414 84 256 84s-107.754 48.34-107.754 107.754c0 37.098 18.844 69.875 47.465 89.266-21.887 7.976-42.14 20.308-59.566 36.542-25.235 23.5-42.758 53.465-50.883 86.348C50.852 364.242 30 312.512 30 256 30 131.383 131.383 30 256 30s226 101.383 226 226c0 56.523-20.86 108.266-55.281 147.934zm0 0"></path>
                  </svg>
                  <span>Người Dùng</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/reviews" 
                  className={`text-sm flex items-center font-medium transition-all ${
                    isActive('/admin/reviews') 
                      ? 'text-blue-600' 
                      : 'text-slate-800 hover:text-blue-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                    <path d="M2 3h20a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H7l-4.707 3.293A1 1 0 0 1 1 20.5V4a1 1 0 0 1 1-1zm2 4v2h16V7H4zm0 4v2h10v-2H4z"/>
                  </svg>
                  <span>Đánh Giá</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-4">
            <ul className="space-y-4 px-2">
              <li>
                <Link 
                  to="/admin/settings" 
                  className={`text-sm flex items-center font-medium transition-all ${
                    isActive('/admin/settings') 
                      ? 'text-blue-600' 
                      : 'text-slate-800 hover:text-blue-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                    <path d="M13.12 24h-2.24a1.498 1.498 0 0 1-1.486-1.32l-.239-1.876a9.45 9.45 0 0 1-1.374-.569l-1.494 1.161a1.492 1.492 0 0 1-1.985-.126l-1.575-1.575a1.488 1.488 0 0 1-.122-1.979l1.161-1.495a9.232 9.232 0 0 1-.569-1.374l-1.88-.239A1.501 1.501 0 0 1 0 13.12v-2.24c0-.757.567-1.396 1.32-1.486l1.876-.239a9.45 9.45 0 0 1 .569-1.374l-1.16-1.494a1.49 1.49 0 0 1 .127-1.986l1.575-1.575a1.489 1.489 0 0 1 1.979-.122L7.78 3.766a9.416 9.416 0 0 1 1.375-.569l.239-1.88C9.484.567 10.123 0 10.88 0h2.24c.757 0 1.396.567 1.486 1.32l.239 1.876c.478.155.938.346 1.375.569l1.494-1.161a1.49 1.49 0 0 1 1.985.127l1.575 1.575c.537.521.591 1.374.122 1.979L20.235 7.78c.224.437.415.897.569 1.374l1.88.239A1.5 1.5 0 0 1 24 10.88v2.24c0 .757-.567 1.396-1.32 1.486l-1.876.239a9.45 9.45 0 0 1-.569 1.374l1.161 1.494a1.49 1.49 0 0 1-.127 1.985l-1.575 1.575a1.487 1.487 0 0 1-1.979.122l-1.495-1.161a9.232 9.232 0 0 1-1.374.569l-.239 1.88A1.5 1.5 0 0 1 13.12 24zm-5.39-4.86c.083 0 .168.021.244.063a8.393 8.393 0 0 0 1.774.736.5.5 0 0 1 .358.417l.28 2.2c.03.251.247.444.494.444h2.24a.504.504 0 0 0 .493-.439l.281-2.204a.5.5 0 0 1 .358-.417 8.393 8.393 0 0 0 1.774-.736.499.499 0 0 1 .55.042l1.75 1.36a.492.492 0 0 0 .655-.034l1.585-1.585a.495.495 0 0 0 .039-.66l-1.36-1.75a.5.5 0 0 1-.042-.55 8.393 8.393 0 0 0 .736-1.774.5.5 0 0 1 .417-.358l2.2-.28A.507.507 0 0 0 23 13.12v-2.24a.504.504 0 0 0-.439-.493l-2.204-.281a.5.5 0 0 1-.417-.358 8.393 8.393 0 0 0-.736-1.774.497.497 0 0 1 .042-.55l1.36-1.75a.49.49 0 0 0-.033-.654l-1.585-1.585a.492.492 0 0 0-.66-.039l-1.75 1.36a.5.5 0 0 1-.551.042 8.359 8.359 0 0 0-1.774-.736.5.5 0 0 1-.358-.417l-.28-2.2A.507.507 0 0 0 13.12 1h-2.24a.504.504 0 0 0-.493.439l-.281 2.204a.502.502 0 0 1-.358.418 8.356 8.356 0 0 0-1.774.735.5.5 0 0 1-.551-.041l-1.75-1.36a.49.49 0 0 0-.654.033L3.434 5.014a.495.495 0 0 0-.039.66l1.36 1.75a.5.5 0 0 1 .042.55 8.341 8.341 0 0 0-.736 1.774.5.5 0 0 1-.417.358l-2.2.28A.505.505 0 0 0 1 10.88v2.24c0 .247.193.464.439.493l2.204.281a.5.5 0 0 1 .417.358c.18.626.428 1.223.736 1.774a.497.497 0 0 1-.042.55l-1.36 1.75a.49.49 0 0 0 .033.654l1.585 1.585a.494.494 0 0 0 .66.039l1.75-1.36a.515.515 0 0 1 .308-.104z"></path>
                    <path d="M12 17c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zm0-9c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4z"></path>
                  </svg>
                  <span>Cài Đặt</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="text-slate-800 text-sm flex items-center font-medium hover:text-blue-600 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                    <path d="M19.56 23.253H4.44a4.051 4.051 0 0 1-4.05-4.05v-9.115c0-1.317.648-2.56 1.728-3.315l7.56-5.292a4.062 4.062 0 0 1 4.644 0l7.56 5.292a4.056 4.056 0 0 1 1.728 3.315v9.115a4.051 4.051 0 0 1-4.05 4.05z"></path>
                  </svg>
                  <span>Về Trang Chủ</span>
                </Link>
              </li>
            </ul>

            <div className="flex flex-wrap items-center cursor-pointer border-t border-gray-200 py-2 mt-6">
              <div className="w-10 h-10 rounded-md border-2 border-white flex items-center justify-center overflow-hidden">
                <img
                  src="/nike.svg"
                  alt="Nike"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm text-slate-900 font-medium">{user.fullName}</p>
                <p className="text-xs text-slate-500 mt-0.5">Administrator</p>
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-600 transition-colors"
                title="Đăng xuất"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="ml-[250px] flex-1 p-8">
        {children}
      </div>
    </div>
  );
}

export default AdminLayout;
