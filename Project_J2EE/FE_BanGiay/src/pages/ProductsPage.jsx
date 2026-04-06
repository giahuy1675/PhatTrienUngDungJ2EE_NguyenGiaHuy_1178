import { Badge, Pagination, Statistic } from 'antd';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import brandService from '../services/brandService';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import Breadcrumb from '../components/Breadcrumb';
import { useCart } from '../contexts/CartContext';

const { Countdown } = Statistic;

function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [colorSearch, setColorSearch] = useState('');
  const [alert, setAlert] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const { addToCart } = useCart();
  const navigate = useNavigate();


  // Đọc query parameters từ URL khi component mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const brandParam = searchParams.get('brand');

    if (brandParam) {
      setSelectedBrand(brandParam);
    }

    // Fetch brands
    fetchBrands();

    // fetchCategories sẽ tải danh sách categories, sau đó tìm category theo tên
    if (categoryParam) {
      fetchCategories().then((cats) => {
        const foundCategory = cats.find(c => c.name.toLowerCase() === categoryParam.toLowerCase());
        if (foundCategory) {
          setSelectedCategory(foundCategory.id);
        }
      });
    } else {
      fetchCategories();
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    setCurrentPage(1);
  }, [selectedCategory, selectedBrand, selectedColors, priceRange]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
      return data; // Return data để có thể dùng trong useEffect
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
      return [];
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await brandService.getAllBrands();
      setBrands(data);
    } catch (err) {
      console.error('Lỗi khi tải thương hiệu:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let data;

      if (selectedCategory) {
        data = await productService.getProductsByCategory(selectedCategory);
      } else {
        data = await productService.getAllProducts();
      }

      // Parse JSON if response is string
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          setProducts([]);
          return;
        }
      }

      // Convert response to array
      let productsArray = [];

      if (Array.isArray(data)) {
        productsArray = data;
      } else if (data && typeof data === 'object') {
        // If response is an object, try to extract array from it
        if (Array.isArray(data.content)) {
          productsArray = data.content;
        } else if (Array.isArray(data.data)) {
          productsArray = data.data;
        } else {
          // If it's a plain object with products, convert to array
          productsArray = Object.values(data);
        }
      }

      // Safety check
      if (!Array.isArray(productsArray)) {
        console.error('productsArray is not an array:', productsArray);
        setProducts([]);
        return;
      }

      const colorsMap = new Map();
      productsArray.forEach((product) => {
        const addColor = (color, colorName) => {
          if (typeof color === 'string' && color.trim()) {
            const normalized = color.trim().toLowerCase();
            if (!colorsMap.has(normalized)) {
              colorsMap.set(normalized, {
                id: normalized,
                name: colorName?.trim() || '',
                hex: color.trim()
              });
            }
          }
        };

        if (product?.colors) {
          try {
            const parsedColors = Array.isArray(product.colors) ? product.colors : JSON.parse(product.colors);
            parsedColors.forEach((color) => addColor(color));
          } catch (error) {
            console.warn('Invalid colors data for product:', product?.id, error);
          }
        }

        if (product?.variants) {
          try {
            const parsedVariants = Array.isArray(product.variants) ? product.variants : JSON.parse(product.variants);
            parsedVariants.forEach((variant) => addColor(variant?.color, variant?.colorName));
          } catch (error) {
            console.warn('Invalid variants data for product:', product?.id, error);
          }
        }
      });
      setAvailableColors(Array.from(colorsMap.values()));

      // Apply client-side filters
      let filtered = productsArray;

      // Filter out inactive products
      filtered = filtered.filter(p => p.isActive !== false);

      // Filter by brand - now brand is an object with name property
      if (selectedBrand) {
        filtered = filtered.filter(p =>
          p.brand &&
          p.brand.name &&
          p.brand.name.toLowerCase() === selectedBrand.toLowerCase()
        );
      }

      // Filter by colors
      if (selectedColors.length > 0) {
        filtered = filtered.filter(p => {
          const collectedColors = [];

          if (p.colors) {
            try {
              const productColors = Array.isArray(p.colors) ? p.colors : JSON.parse(p.colors);
              collectedColors.push(...productColors.map(pc => String(pc).trim().toLowerCase()));
            } catch {
              return false;
            }
          }

          if (p.variants) {
            try {
              const productVariants = Array.isArray(p.variants) ? p.variants : JSON.parse(p.variants);
              collectedColors.push(...productVariants.map(variant => String(variant?.color || '').trim().toLowerCase()).filter(Boolean));
            } catch {
              return false;
            }
          }

          if (collectedColors.length === 0) return false;

          return selectedColors.some(selectedColor =>
            collectedColors.includes(selectedColor.toLowerCase())
          );
        });
      }

      // Filter by price range
      filtered = filtered.filter(p =>
        p.price >= priceRange.min && p.price <= priceRange.max
      );

      setProducts(filtered);
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      fetchProducts();
      return;
    }

    try {
      setLoading(true);
      const data = await productService.searchProducts(searchKeyword);
      setProducts(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Lỗi tìm kiếm:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlert({ type: 'warning', message: 'Vui lòng đăng nhập để thêm vào giỏ hàng!' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      await addToCart(product.id, 1);
      setAlert({ type: 'success', message: `Đã thêm "${product.name}" vào giỏ hàng!` });
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      setAlert({ type: 'danger', message: 'Không thể thêm vào giỏ hàng. Vui lòng thử lại!' });
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand('');
    setSelectedColors([]);
    setPriceRange({ min: 0, max: 10000000 });
    setSearchKeyword('');
  };

  const removeFilter = (type, value) => {
    if (type === 'category') setSelectedCategory(null);
    else if (type === 'brand') setSelectedBrand('');
    else if (type === 'color') {
      setSelectedColors(selectedColors.filter(c => c !== value));
    }
  };

  const toggleColor = (colorId) => {
    if (selectedColors.includes(colorId)) {
      setSelectedColors(selectedColors.filter(c => c !== colorId));
    } else {
      setSelectedColors([...selectedColors, colorId]);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const filteredColors = availableColors.filter(color => {
    const search = colorSearch.toLowerCase();
    return color.name.toLowerCase().includes(search) || color.hex.toLowerCase().includes(search);
  });

  const activeFilters = [];
  if (selectedCategory) {
    const cat = categories.find(c => c.id == selectedCategory);
    if (cat) activeFilters.push({ type: 'category', label: cat.name, value: selectedCategory });
  }
  if (selectedBrand) activeFilters.push({ type: 'brand', label: selectedBrand, value: selectedBrand });
  selectedColors.forEach(colorId => {
    const color = availableColors.find(c => c.id === colorId);
    if (color) activeFilters.push({ type: 'color', label: color.name || 'Màu sắc', value: colorId });
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="relative">
      {/* Alert - Fixed at top */}
      {alert && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Sản phẩm' }]} />

      <div className="flex">
        {/* Sidebar Filter */}
        <div className="w-full max-w-[280px] shrink-0 py-6 max-lg:hidden">
          <div className="flex items-center border-b border-gray-300 pb-4 px-6">
            <h3 className="text-slate-900 text-lg font-semibold">Bộ lọc</h3>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm text-red-500 font-semibold ml-auto cursor-pointer hover:text-red-600"
            >
              Xóa tất cả
            </button>
          </div>

          <div className="border-r border-gray-300 divide-y divide-gray-300">
            {/* Categories */}
            <div className="p-6">
              <h6 className="text-slate-900 text-sm font-semibold">Danh mục</h6>
              <div className="flex px-3 py-1.5 rounded-md border border-gray-300 bg-gray-100 overflow-hidden mt-2">
                <input
                  type="text"
                  placeholder="Tìm danh mục"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-900 text-sm"
                />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" className="w-3 fill-gray-600">
                  <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
                </svg>
              </div>
              <ul className="mt-6 space-y-4 max-h-64 overflow-y-auto">
                {filteredCategories.map(category => (
                  <li key={category.id} className="flex items-center gap-3">
                    <input
                      id={`cat-${category.id}`}
                      type="radio"
                      name="category"
                      checked={selectedCategory == category.id}
                      onChange={() => setSelectedCategory(category.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor={`cat-${category.id}`} className="text-slate-600 font-medium text-sm cursor-pointer">
                      {category.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Brand */}
            <div className="p-6">
              <h6 className="text-slate-900 text-sm font-semibold">Thương hiệu</h6>
              <div className="flex px-3 py-1.5 rounded-md border border-gray-300 bg-gray-100 overflow-hidden mt-2">
                <input
                  type="text"
                  placeholder="Tìm thương hiệu"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-900 text-sm"
                />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" className="w-3 fill-gray-600">
                  <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
                </svg>
              </div>
              <ul className="mt-6 space-y-4 max-h-64 overflow-y-auto">
                {filteredBrands.map(brand => (
                  <li key={brand.id} className="flex items-center gap-3">
                    <input
                      id={`brand-${brand.id}`}
                      type="checkbox"
                      checked={selectedBrand === brand.name}
                      onChange={() => setSelectedBrand(selectedBrand === brand.name ? '' : brand.name)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor={`brand-${brand.id}`} className="flex items-center gap-2 text-slate-600 font-medium text-sm cursor-pointer">
                      {brand.logo && (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="h-5 w-auto object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <span>{brand.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="p-6">
              <h6 className="text-slate-900 text-sm font-semibold">Giá</h6>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs text-slate-600">Giá tối thiểu: {priceRange.min.toLocaleString('vi-VN')}đ</label>
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600">Giá tối đa: {priceRange.max.toLocaleString('vi-VN')}đ</label>
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Color */}
            <div className="p-6">
              <h6 className="text-slate-900 text-sm font-semibold">Màu sắc</h6>
              <div className="flex px-3 py-1.5 rounded-md border border-gray-300 bg-gray-100 overflow-hidden mt-2">
                <input
                  type="text"
                  placeholder="Tìm màu"
                  value={colorSearch}
                  onChange={(e) => setColorSearch(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-900 text-sm"
                />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" className="w-3 fill-gray-600">
                  <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
                </svg>
              </div>
              <ul className="mt-6 space-y-4">
                {filteredColors.map(color => (
                  <li key={color.id} className="flex items-center gap-3">
                    <input
                      id={color.id}
                      type="checkbox"
                      checked={selectedColors.includes(color.id)}
                      onChange={() => toggleColor(color.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor={color.id} className="flex items-center gap-2 text-slate-600 font-medium text-sm cursor-pointer">
                      <span className="block rounded-full w-4 h-4 border border-gray-300" style={{ backgroundColor: color.hex }}></span>
                      {color.name || 'Màu sắc'}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full p-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tìm kiếm
              </button>
            </div>
          </form>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {activeFilters.map((filter, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => removeFilter(filter.type, filter.value)}
                  className="flex items-center gap-2 border border-gray-300 rounded-md text-[13px] text-slate-600 font-medium py-1 px-2 hover:bg-gray-50"
                >
                  {filter.label}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 cursor-pointer shrink-0 fill-gray-400 hover:fill-red-500" viewBox="0 0 320.591 320.591">
                    <path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"></path>
                    <path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"></path>
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* Products Count */}
          <div className="mb-4 text-sm text-slate-600">
            Hiển thị {Math.min((currentPage - 1) * pageSize + 1, products.length)}-{Math.min(currentPage * pageSize, products.length)} / {products.length} sản phẩm
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((product) => (
                  <div key={product.id} className="group overflow-hidden relative">
                    <Link to={`/product/${product.id}`} className="block">
                      {(product.originalPrice && product.originalPrice > product.price) ? (
                        <Badge.Ribbon
                          text={`GIẢM ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`}
                          color="red"
                        >
                          <div className="aspect-[3/4] bg-slate-100 w-full overflow-hidden relative">
                            <img
                              src={product.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600"%3E%3Crect fill="%23ddd" width="400" height="600"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E'}
                              alt={product.name}
                              className="w-full h-full object-cover object-top hover:scale-110 transition-all duration-700"
                            />
                          </div>
                        </Badge.Ribbon>
                      ) : (
                        <div className="aspect-[3/4] bg-slate-100 w-full overflow-hidden relative">
                          <img
                            src={product.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600"%3E%3Crect fill="%23ddd" width="400" height="600"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E'}
                            alt={product.name}
                            className="w-full h-full object-cover object-top hover:scale-110 transition-all duration-700"
                          />
                        </div>
                      )}
                    </Link>
                    <div className="p-4 relative">
                      <div className="flex flex-wrap justify-between gap-2 w-full absolute px-4 pt-3 z-10 transition-all duration-500 left-0 right-0 group-hover:bottom-20 lg:bottom-5 lg:opacity-0 lg:bg-white lg:group-hover:opacity-100 max-lg:bottom-20 max-lg:py-3 max-lg:bg-white/60">
                        <button
                          type="button"
                          title="Add to wishlist"
                          className="bg-transparent outline-0 border-0 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            alert('Tính năng yêu thích sẽ sớm được cập nhật!');
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="fill-slate-800 w-5 h-5 inline-block" viewBox="0 0 64 64">
                            <path d="M45.5 4A18.53 18.53 0 0 0 32 9.86 18.5 18.5 0 0 0 0 22.5C0 40.92 29.71 59 31 59.71a2 2 0 0 0 2.06 0C34.29 59 64 40.92 64 22.5A18.52 18.52 0 0 0 45.5 4ZM32 55.64C26.83 52.34 4 36.92 4 22.5a14.5 14.5 0 0 1 26.36-8.33 2 2 0 0 0 3.27 0A14.5 14.5 0 0 1 60 22.5c0 14.41-22.83 29.83-28 33.14Z"></path>
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="Add to cart"
                          className="bg-transparent outline-0 border-0 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="fill-slate-800 w-5 h-5 inline-block" viewBox="0 0 512 512">
                            <path d="M164.96 300.004h.024c.02 0 .04-.004.059-.004H437a15.003 15.003 0 0 0 14.422-10.879l60-210a15.003 15.003 0 0 0-2.445-13.152A15.006 15.006 0 0 0 497 60H130.367l-10.722-48.254A15.003 15.003 0 0 0 105 0H15C6.715 0 0 6.715 0 15s6.715 15 15 15h77.969c1.898 8.55 51.312 230.918 54.156 243.71C131.184 280.64 120 296.536 120 315c0 24.812 20.188 45 45 45h272c8.285 0 15-6.715 15-15s-6.715-15-15-15H165c-8.27 0-15-6.73-15-15 0-8.258 6.707-14.977 14.96-14.996zM477.114 90l-51.43 180H177.032l-40-180zM150 405c0 24.813 20.188 45 45 45s45-20.188 45-45-20.188-45-45-45-45 20.188-45 45zm45-15c8.27 0 15 6.73 15 15s-6.73 15-15 15-15-6.73-15-15 6.73-15 15-15zm167 15c0 24.813 20.188 45 45 45s45-20.188 45-45-20.188-45-45-45-45 20.188-45 45zm45-15c8.27 0 15 6.73 15 15s-6.73 15-15 15-15-6.73-15-15 6.73-15 15-15zm0 0"></path>
                          </svg>
                        </button>
                      </div>
                      <div className="z-20 relative bg-white">
                        <h6 className="text-[15px] font-semibold text-slate-900 truncate">{product.name}</h6>
                        <h6 className="text-sm text-slate-600 font-medium mt-2">
                          {product.price.toLocaleString('vi-VN')}đ
                        </h6>
                        {(product.discountEndAt && new Date(product.discountEndAt).getTime() > Date.now()) && (
                          <div className="mt-2 text-xs">
                            <Countdown
                              title="Kết thúc sau"
                              value={new Date(product.discountEndAt).getTime()}
                              format="HH:mm:ss"
                              valueStyle={{ fontSize: '14px', color: '#ef4444', fontWeight: 600 }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {products.length > pageSize && (
                <div className="flex justify-center mt-8 mb-4">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={products.length}
                    onChange={(page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    showSizeChanger={false}
                    showTotal={(total, range) => `${range[0]}-${range[1]} / ${total} sản phẩm`}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Không tìm thấy sản phẩm
              </h3>
              <p className="mt-1 text-gray-500">
                Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
