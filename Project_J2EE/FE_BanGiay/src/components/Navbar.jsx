import { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react';
import { Bars3Icon, MagnifyingGlassIcon, ShoppingBagIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import CartDrawer from './CartDrawer';
import { useCart } from '../contexts/CartContext';
import categoryService from '../services/categoryService';
import brandService from '../services/brandService';
import { getParsedStorageItem } from '../utils/helpers';

const pages = [
  { name: 'Đo Size Chân', href: '/foot-size-checker' },
  { name: 'Về chúng tôi', href: '/about' },
  { name: 'Liên hệ', href: '/contact' },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount } = useCart();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const currentUser = getParsedStorageItem('user', null);
    if (currentUser) {
      setUser(currentUser);
    }

    // Fetch categories và brands
    const fetchData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          categoryService.getAllCategories(),
          brandService.getAllBrands()
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error('Error fetching navigation data:', error);
      }
    };

    fetchData();
  }, [location.pathname]);

  // Tạo navigation động từ categories và brands
  const navigation = {
    categories: [
      {
        id: 'products',
        name: 'Sản Phẩm',
        featured: categories.slice(0, 2).map((cat, index) => ({
          name: cat.name,
          href: `/products?category=${encodeURIComponent(cat.name)}`,
          imageSrc: cat.imageUrl && !cat.imageUrl.startsWith('/images/')
            ? cat.imageUrl
            : index === 0
              ? 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'
              : 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&q=80',
          imageAlt: cat.name,
        })),
        sections: [
          {
            id: 'categories',
            name: 'Danh Mục',
            items: [
              ...categories.map(cat => ({
                name: cat.name,
                href: `/products?category=${encodeURIComponent(cat.name)}`
              })),
              { name: 'Tất cả sản phẩm', href: '/products' }
            ],
          },
          {
            id: 'brands',
            name: 'Thương Hiệu',
            items: brands.map(brand => ({
              name: brand.name,
              href: `/products?brand=${encodeURIComponent(brand.name)}`,
              logo: brand.logo
            })),
          },
        ],
      },
    ],
    pages,
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="bg-white">
      {/* Mobile menu */}
      <Dialog open={open} onClose={setOpen} className="relative z-40 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />
        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <div className="flex px-4 pt-5 pb-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
              >
                <span className="sr-only">Đóng menu</span>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Links */}
            <TabGroup className="mt-2">
              <div className="border-b border-gray-200">
                <TabList className="-mb-px flex space-x-8 px-4">
                  {navigation.categories.map((category) => (
                    <Tab
                      key={category.name}
                      className="flex-1 border-b-2 border-transparent px-1 py-4 text-base font-medium whitespace-nowrap text-gray-900 data-selected:border-blue-600 data-selected:text-blue-600"
                    >
                      {category.name}
                    </Tab>
                  ))}
                </TabList>
              </div>
              <TabPanels as={Fragment}>
                {navigation.categories.map((category) => (
                  <TabPanel key={category.name} className="space-y-10 px-4 pt-10 pb-8">
                    <div className="grid grid-cols-2 gap-x-4">
                      {category.featured.map((item) => (
                        <div key={item.name} className="group relative text-sm">
                          <img
                            alt={item.imageAlt}
                            src={item.imageSrc}
                            className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
                          />
                          <Link to={item.href} onClick={() => setOpen(false)} className="mt-6 block font-medium text-gray-900">
                            <span className="absolute inset-0 z-10" />
                            {item.name}
                          </Link>
                          <p className="mt-1">Mua ngay</p>
                        </div>
                      ))}
                    </div>
                    {category.sections.map((section) => (
                      <div key={section.name}>
                        <p className="font-medium text-gray-900">{section.name}</p>
                        <ul className="mt-6 flex flex-col space-y-6">
                          {section.items.map((item) => (
                            <li key={item.name} className="flow-root">
                              <Link to={item.href} onClick={() => setOpen(false)} className="-m-2 flex items-center gap-2 p-2 text-gray-500">
                                {section.id === 'brands' && item.logo && (
                                  <img
                                    src={item.logo}
                                    alt={item.name}
                                    className="h-4 w-auto object-contain"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                )}
                                <span>{item.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </TabPanel>
                ))}
              </TabPanels>
            </TabGroup>

            <div className="space-y-6 border-t border-gray-200 px-4 py-6">
              {navigation.pages.map((page) => (
                <div key={page.name} className="flow-root">
                  <Link to={page.href} onClick={() => setOpen(false)} className="-m-2 block p-2 font-medium text-gray-900">
                    {page.name}
                  </Link>
                </div>
              ))}
            </div>

            <div className="space-y-6 border-t border-gray-200 px-4 py-6">
              {user ? (
                <>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-xs">{user.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setOpen(false)} className="block -m-2 p-2 font-medium text-gray-900">
                    Tài khoản
                  </Link>
                  <Link to="/orders" onClick={() => setOpen(false)} className="block -m-2 p-2 font-medium text-gray-900">
                    Đơn hàng
                  </Link>
                  <button onClick={() => { handleLogout(); setOpen(false); }} className="block w-full text-left -m-2 p-2 font-medium text-red-600">
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="block -m-2 p-2 font-medium text-gray-900">
                    Đăng nhập
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="block -m-2 p-2 font-medium text-gray-900">
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <header className="relative bg-white">
        {/* Promo banner */}
        <p className="flex h-10 items-center justify-center bg-blue-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
          Miễn phí vận chuyển cho đơn hàng trên 500.000đ
        </p>

        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden"
              >
                <span className="sr-only">Mở menu</span>
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Logo */}
              <div className="ml-4 flex lg:ml-0">
                <Link to="/">
                  <span className="sr-only">Bán Giày</span>
                  <div className="flex items-center space-x-2">
                    <svg className="h-8 w-8 text-gray-900" fill="currentColor" viewBox="0 0 192.756 192.756" xmlns="http://www.w3.org/2000/svg">
                      <path d="M42.741 71.477c-9.881 11.604-19.355 25.994-19.45 36.75-.037 4.047 1.255 7.58 4.354 10.256 4.46 3.854 9.374 5.213 14.264 5.221 7.146.01 14.242-2.873 19.798-5.096 9.357-3.742 112.79-48.659 112.79-48.659.998-.5.811-1.123-.438-.812-.504.126-112.603 30.505-112.603 30.505a24.771 24.771 0 0 1-6.524.934c-8.615.051-16.281-4.731-16.219-14.808.024-3.943 1.231-8.698 4.028-14.291z" />
                    </svg>
                    <span className="text-xl font-bold text-gray-900">Bán Giày</span>
                  </div>
                </Link>
              </div>

              {/* Desktop Flyout menus */}
              <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full space-x-8">
                  {navigation.categories.map((category) => (
                    <Popover key={category.name} className="flex">
                      <div className="relative flex">
                        <PopoverButton className="group relative flex items-center justify-center text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-gray-800 data-open:text-blue-600 outline-none">
                          {category.name}
                          <span className="absolute inset-x-0 -bottom-px z-30 h-0.5 transition duration-200 group-data-open:bg-blue-600" />
                        </PopoverButton>
                      </div>
                      <PopoverPanel
                        transition
                        className="absolute inset-x-0 top-full z-20 bg-white text-sm text-gray-500 transition data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
                      >
                        <div className="absolute inset-0 top-1/2 bg-white shadow" />
                        <div className="relative bg-white">
                          <div className="mx-auto max-w-7xl px-8">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-16">
                              <div className="col-start-2 grid grid-cols-2 gap-x-8">
                                {category.featured.map((item) => (
                                  <div key={item.name} className="group relative text-base sm:text-sm">
                                    <img
                                      alt={item.imageAlt}
                                      src={item.imageSrc}
                                      className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
                                    />
                                    <Link to={item.href} className="mt-6 block font-medium text-gray-900">
                                      <span className="absolute inset-0 z-10" />
                                      {item.name}
                                    </Link>
                                    <p className="mt-1">Mua ngay</p>
                                  </div>
                                ))}
                              </div>
                              <div className="row-start-1 grid grid-cols-2 gap-x-8 gap-y-10 text-sm">
                                {category.sections.map((section) => (
                                  <div key={section.name}>
                                    <p className="font-medium text-gray-900">{section.name}</p>
                                    <ul className="mt-6 space-y-6 sm:mt-4 sm:space-y-4">
                                      {section.items.map((item) => (
                                        <li key={item.name} className="flex">
                                          <Link to={item.href} className="hover:text-gray-800">
                                            {item.name}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </PopoverPanel>
                    </Popover>
                  ))}
                  {navigation.pages.map((page) => (
                    <Link
                      key={page.name}
                      to={page.href}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      {page.name}
                    </Link>
                  ))}
                </div>
              </PopoverGroup>

              <div className="ml-auto flex items-center">
                {/* Auth Links - Desktop */}
                <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                  {user ? (
                    <>
                      <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-gray-800 flex items-center gap-1">
                        <UserIcon className="h-5 w-5" />
                        {user.fullName}
                      </Link>
                      <span className="h-6 w-px bg-gray-200" />
                      <button onClick={handleLogout} className="text-sm font-medium text-gray-700 hover:text-gray-800">
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-800">
                        Đăng nhập
                      </Link>
                      <span className="h-6 w-px bg-gray-200" />
                      <Link to="/register" className="text-sm font-medium text-gray-700 hover:text-gray-800">
                        Đăng ký
                      </Link>
                    </>
                  )}
                </div>

                {/* Search */}
                <div className="flex lg:ml-6">
                  <Link to="/products" className="p-2 text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Tìm kiếm</span>
                    <MagnifyingGlassIcon className="h-6 w-6" />
                  </Link>
                </div>

                {/* Cart */}
                <div className="ml-4 flow-root lg:ml-6">
                  <button
                    onClick={() => setCartOpen(true)}
                    className="group -m-2 flex items-center p-2"
                  >
                    <ShoppingBagIcon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-gray-500" />
                    <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">{cartCount}</span>
                    <span className="sr-only">sản phẩm trong giỏ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} setOpen={setCartOpen} />
    </div>
  );
}

export default Navbar;
