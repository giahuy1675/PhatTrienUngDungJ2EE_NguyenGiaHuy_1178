import { Badge, Card, Image, Statistic } from 'antd';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { useCart } from '../contexts/CartContext';
import Alert from '../components/Alert';
import Breadcrumb from '../components/Breadcrumb';
import ProductReviewsSection from '../components/ProductReviewsSection';

const { Countdown } = Statistic;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState(0);
  const [alert, setAlert] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variants, setVariants] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const getRandomProducts = (products = [], count = 4) => {
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      setProduct(data);

      // Debug: Log raw product data
      console.log('📦 Product data from API:', {
        id: data.id,
        name: data.name,
        color: data.color,
        hasImage: !!data.image,
        imagePreview: data.image ? data.image.substring(0, 80) + '...' : null,
        variantsRaw: data.variants
      });

      // Parse variants if available
      let parsedVariants = [];
      if (data.variants) {
        try {
          parsedVariants = typeof data.variants === 'string'
            ? JSON.parse(data.variants)
            : data.variants;
          console.log('🔄 Parsed variants from database:', parsedVariants.map((v, idx) => ({
            index: idx,
            colorName: v.colorName,
            color: v.color,
            hasMainImage: !!v.mainImage,
            mainImagePreview: v.mainImage ? v.mainImage.substring(0, 80) + '...' : null
          })));
        } catch (e) {
          console.error('Error parsing variants:', e);
        }
      }

      // Normalize variant colors to valid hex values for UI rendering
      parsedVariants = parsedVariants.map((variant) => {
        const normalizedColor = normalizeColorToHex(variant?.color);
        return {
          ...variant,
          color: normalizedColor,
          colorName: variant?.colorName || getColorName(normalizedColor)
        };
      });

      // Add main product color as first variant option if color exists
      if (data.color) {
        const mainImages = data.images ? JSON.parse(data.images) : [];
        const mainVariant = {
          color: normalizeColorToHex(data.color),
          colorName: getColorName(normalizeColorToHex(data.color)),
          mainImage: data.image,
          images: mainImages,
          stockQuantity: data.stockQuantity
        };

        // Add main variant at the beginning
        parsedVariants = [mainVariant, ...parsedVariants];
      }

      // Debug: Log final variants array
      console.log('📊 Final variants array (after merging):', parsedVariants.map((v, idx) => ({
        index: idx,
        colorName: v.colorName,
        color: v.color,
        hasMainImage: !!v.mainImage,
        mainImagePreview: v.mainImage ? v.mainImage.substring(0, 80) + '...' : null,
        stockQuantity: v.stockQuantity
      })));

      setVariants(parsedVariants);

      // Set first variant (main product) as default
      if (parsedVariants.length > 0) {
        setSelectedVariant(parsedVariants[0]);
        setSelectedColor(parsedVariants[0].color);
      } else {
        // Fallback to old color system if no variants and no main color
        const colors = data.colors ? JSON.parse(data.colors) : [];
        if (colors.length > 0) setSelectedColor(colors[0]);
      }

      // Set default size
      const sizes = data.sizes ? JSON.parse(data.sizes) : [];
      if (sizes.length > 0) setSelectedSize(sizes[0]);

      // Lấy ngẫu nhiên sản phẩm liên quan từ trang sản phẩm (loại trừ sản phẩm hiện tại)
      try {
        const productsData = await productService.getAllProducts();
        let productsArray = [];

        if (Array.isArray(productsData)) {
          productsArray = productsData;
        } else if (productsData && typeof productsData === 'object') {
          if (Array.isArray(productsData.content)) {
            productsArray = productsData.content;
          } else if (Array.isArray(productsData.data)) {
            productsArray = productsData.data;
          } else {
            productsArray = Object.values(productsData);
          }
        }

        const filteredProducts = productsArray.filter(
          (p) => p?.id !== data.id && p?.isActive !== false
        );
        setRelatedProducts(getRandomProducts(filteredProducts, 4));
      } catch (relatedErr) {
        console.error('Lỗi khi tải sản phẩm liên quan:', relatedErr);
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function: normalize color value (hex/name) to valid hex for UI
  const normalizeColorToHex = (colorValue) => {
    if (!colorValue) return '#262626';

    const normalized = colorValue.trim().toLowerCase();

    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized)) {
      return normalized;
    }

    const nameToHexMap = {
      'đen': '#262626',
      'den': '#262626',
      'black': '#262626',
      'trắng': '#ffffff',
      'trang': '#ffffff',
      'white': '#ffffff',
      'đỏ': '#f52224',
      'do': '#f52224',
      'red': '#f52224',
      'xanh lá': '#52c41a',
      'xanh la': '#52c41a',
      'green': '#52c41a',
      'xanh dương': '#1677ff',
      'xanh duong': '#1677ff',
      'blue': '#1677ff',
      'vàng': '#fadb14',
      'vang': '#fadb14',
      'yellow': '#fadb14',
      'xám': '#8c8c8c',
      'xam': '#8c8c8c',
      'gray': '#8c8c8c',
      'grey': '#8c8c8c',
      'cam': '#fa8c16',
      'orange': '#fa8c16',
      'nâu': '#8b4513',
      'nau': '#8b4513',
      'brown': '#8b4513'
    };

    return nameToHexMap[normalized] || '#262626';
  };

  // Helper function to get color name from hex code
  const getColorName = (hexColor) => {
    if (!hexColor) return 'Màu chính';

    const colorMap = {
      '#000000': 'Đen',
      '#262626': 'Đen',
      '#ffffff': 'Trắng',
      '#ff0000': 'Đỏ',
      '#f52224': 'Đỏ',
      '#52c41a': 'Xanh lá',
      '#00ff00': 'Xanh lá',
      '#1677ff': 'Xanh dương',
      '#0000ff': 'Xanh dương',
      '#ffff00': 'Vàng',
      '#fadb14': 'Vàng',
      '#ff00ff': 'Tím',
      '#00ffff': 'Xanh ngọc',
      '#808080': 'Xám',
      '#8c8c8c': 'Xám',
      '#ffa500': 'Cam',
      '#fa8c16': 'Cam',
      '#ffc0cb': 'Hồng',
      '#a52a2a': 'Nâu',
      '#8b4513': 'Nâu'
    };

    const normalized = hexColor?.toLowerCase();
    return colorMap[normalized] || 'Màu chính';
  };

  const handleVariantSelect = (variant) => {
    console.log('🎨 Variant selected:', {
      colorName: variant.colorName,
      color: variant.color,
      hasMainImage: !!variant.mainImage,
      mainImagePreview: variant.mainImage ? variant.mainImage.substring(0, 80) + '...' : null,
      stockQuantity: variant.stockQuantity,
      imagesCount: variant.images ? variant.images.length : 0
    });

    setSelectedVariant(variant);
    setSelectedColor(variant.color);
    setSelectedImageIndex(0); // Reset to first image
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlert({ type: 'warning', message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      // Get color name and image from selected variant or use defaults
      let colorToSend = selectedColor;
      let imageToSend = product.image;

      if (selectedVariant) {
        if (selectedVariant.colorName) {
          colorToSend = selectedVariant.colorName;
        }
        if (selectedVariant.mainImage) {
          imageToSend = selectedVariant.mainImage;
        }
      }

      // Debug log
      console.log('🛒 Adding to cart:', {
        productId: product.id,
        quantity,
        selectedSize,
        colorToSend,
        imageToSend: imageToSend ? imageToSend.substring(0, 50) + '...' : null,
        selectedVariant: selectedVariant ? {
          colorName: selectedVariant.colorName,
          color: selectedVariant.color,
          hasMainImage: !!selectedVariant.mainImage
        } : null
      });

      await addToCart(product.id, quantity, selectedSize, colorToSend, imageToSend);

      let message = `Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`;
      if (selectedSize || colorToSend) {
        message += ' (';
        if (selectedSize) message += `Size: ${selectedSize}`;
        if (selectedSize && colorToSend) message += ', ';
        if (colorToSend) message += `Màu: ${colorToSend}`;
        message += ')';
      }

      setAlert({ type: 'success', message });
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      setAlert({ type: 'danger', message: 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Không tìm thấy sản phẩm</div>
      </div>
    );
  }

  // Get images from selected variant or fallback to product images
  let allImages = [];
  if (selectedVariant && selectedVariant.mainImage) {
    // Use variant images
    allImages = [selectedVariant.mainImage, ...(selectedVariant.images || [])].filter(Boolean);
  } else {
    // Fallback to product images
    const images = product.images ? JSON.parse(product.images) : [];
    allImages = [product.image, ...images].filter(Boolean);
  }

  const colors = product.colors
    ? JSON.parse(product.colors).map((color) => normalizeColorToHex(color))
    : [];
  const sizes = product.sizes ? JSON.parse(product.sizes) : [];
  const specs = product.specs ? JSON.parse(product.specs) : [];
  const rating = product.rating || 0;
  const reviewCount = product.reviews || 0;

  // Get stock quantity from variant or product
  const currentStock = selectedVariant
    ? selectedVariant.stockQuantity
    : product.stockQuantity;

  return (
    <div className="p-4">
      {/* Alert */}
      {alert && (
        <div className="lg:max-w-6xl max-w-xl mx-auto mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}


      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        items={[
          { label: 'Sản phẩm', link: '/products' },
          ...(product.category ? [{ label: product.category.name, link: `/category/${product.category.id}` }] : []),
          { label: product.name }
        ]} 
      />

      <div className="lg:max-w-6xl max-w-xl mx-auto">
        <div className="grid items-start grid-cols-1 lg:grid-cols-2 gap-8 max-lg:gap-12 max-sm:gap-8">
          {/* Left: Image Gallery */}
          <div className="w-full lg:sticky top-0">
            <div className="flex flex-row gap-2">
              {/* Thumbnails */}
              <div className="flex flex-col gap-2 w-16 max-sm:w-14 shrink-0">
                {allImages.map((img, index) => (
                  <img
                    key={index}
                    src={img || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="85"%3E%3Crect fill="%23ddd" width="64" height="85"/%3E%3C/svg%3E'}
                    alt={`${product.name} ${index + 1}`}
                    className={`aspect-[64/85] object-cover object-top w-full cursor-pointer border-b-2 ${selectedImageIndex === index ? 'border-black' : 'border-transparent'}`}
                    onMouseEnter={() => setSelectedImageIndex(index)}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
              {/* Main Image */}
              <div className="flex-1">
                <Image.PreviewGroup items={allImages}>
                  <Image
                    src={allImages[selectedImageIndex] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="548" height="712"%3E%3Crect fill="%23ddd" width="548" height="712"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E'}
                    alt={product.name}
                    preview={{ mask: 'Xem ảnh lớn' }}
                    className="w-full aspect-[548/712] object-cover"
                  />
                </Image.PreviewGroup>
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full">
            <div>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900">{product.name}</h3>
                  {(product.originalPrice && product.originalPrice > product.price) && (
                    <div className="mt-2 inline-block">
                      <Badge.Ribbon
                        text={`GIẢM ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`}
                        color="red"
                      >
                        <div className="w-[120px] h-[34px] bg-gray-50 rounded-md" />
                      </Badge.Ribbon>
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
                  )}
                </div>
                {product.isActive === false && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Ngừng bán
                  </span>
                )}
              </div>
              {product.description && (
                <p className="text-slate-500 mt-2 text-sm">{product.description}</p>
              )}
              <div className="flex items-center flex-wrap gap-4 mt-6">
                <h4 className="text-slate-900 text-2xl sm:text-3xl font-semibold">
                  {product.price.toLocaleString('vi-VN')}đ
                </h4>
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-slate-500 text-lg">
                    <strike>{product.originalPrice.toLocaleString('vi-VN')}đ</strike>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1 text-lg px-2.5 bg-green-600 text-white rounded-full">
                  <p>{rating > 0 ? rating.toFixed(1) : '0.0'}</p>
                  <svg className="w-[13px] h-[13px] fill-white" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 0L9.4687 3.60213L13.6574 4.83688L10.9944 8.29787L11.1145 12.6631L7 11.2L2.8855 12.6631L3.00556 8.29787L0.342604 4.83688L4.5313 3.60213L7 0Z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">{reviewCount} đánh giá</p>
              </div>
            </div>

            <hr className="my-6 border-slate-300" />

            {/* Sizes */}
            {sizes.length > 0 && (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Kích cỡ</h3>
                <div className="flex flex-wrap gap-4 mt-4">
                  {sizes.map((size, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-10 h-9 px-3 border text-sm cursor-pointer flex items-center justify-center shrink-0 ${selectedSize === size ? 'border-blue-600' : 'border-slate-300 hover:border-blue-600'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Colors - Show variants if available, otherwise fallback to old color system */}
                {variants.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-3">Màu sắc</h3>
                    <div className="flex flex-wrap gap-3">
                      {variants.map((variant, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleVariantSelect(variant)}
                          className={`relative group`}
                          title={`${variant.colorName} - Còn ${variant.stockQuantity}`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full border-2 transition-all ${selectedVariant === variant
                              ? 'border-blue-600 ring-2 ring-blue-200'
                              : 'border-gray-300 hover:border-blue-400'
                              }`}
                            style={{ backgroundColor: variant.color }}
                          />
                          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                            {variant.colorName}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : colors.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-3">Màu sắc</h3>
                    <div className="flex gap-3">
                      {colors.map((color, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full border-2 ${selectedColor === color ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300'
                            }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Stock */}
                <div className="mt-8">
                  <p className="text-sm text-slate-600">
                    Còn lại: <span className="font-semibold">{currentStock}</span> sản phẩm
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  {/* Add to Cart Button - White with Black Border */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.stockQuantity === 0 || product.isActive === false}
                    className="relative px-6 py-3.5 w-full cursor-pointer border-2 border-black bg-white hover:bg-gray-50 text-black text-sm font-semibold uppercase tracking-wide transition-all disabled:bg-gray-200 disabled:border-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed overflow-hidden group"
                  >
                    <span className="relative z-10">
                      {product.isActive === false ? 'Ngừng bán' : product.stockQuantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                    </span>
                    {/* Ripple effect */}
                    <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity"></span>
                  </button>

                  {/* Buy Now Button - Black */}
                  <button
                    type="button"
                    onClick={async () => {
                      await handleAddToCart();
                      setTimeout(() => navigate('/checkout'), 500);
                    }}
                    disabled={product.stockQuantity === 0 || product.isActive === false}
                    className="relative px-6 py-3.5 w-full cursor-pointer border-2 border-black bg-black hover:bg-gray-900 text-white text-sm font-semibold uppercase tracking-wide transition-all disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed overflow-hidden group"
                  >
                    <span className="relative z-10">
                      {product.isActive === false ? 'Ngừng bán' : product.stockQuantity === 0 ? 'Hết hàng' : 'Mua ngay'}
                    </span>
                    {/* Ripple effect */}
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></span>
                  </button>
                </div>
              </div>
            )}

            <hr className="my-6 border-slate-300" />

            {/* Product Information Accordion */}
            {product.description && (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Thông tin sản phẩm</h3>
                <div className="mt-4">
                  <div className="hover:bg-slate-100 transition-all">
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(openAccordion === 0 ? -1 : 0)}
                      className="w-full text-sm font-semibold cursor-pointer text-left px-4 py-2.5 text-slate-900 flex items-center"
                    >
                      <span className="mr-4">Chi tiết sản phẩm</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-3 h-3 fill-current ml-auto shrink-0 transition-transform ${openAccordion === 0 ? '-rotate-180' : '-rotate-90'}`}
                        viewBox="0 0 24 24"
                      >
                        <path fillRule="evenodd" d="M11.99997 18.1669a2.38 2.38 0 0 1-1.68266-.69733l-9.52-9.52a2.38 2.38 0 1 1 3.36532-3.36532l7.83734 7.83734 7.83734-7.83734a2.38 2.38 0 1 1 3.36532 3.36532l-9.52 9.52a2.38 2.38 0 0 1-1.68266.69734z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                    {openAccordion === 0 && (
                      <div className="pb-4 px-4">
                        <p className="text-sm text-slate-500 leading-relaxed">{product.description}</p>
                        {product.brand && (
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-3">
                            <span>Thương hiệu:</span>
                            {product.brand.logo && (
                              <img 
                                src={product.brand.logo} 
                                alt={product.brand.name}
                                className="h-6 w-auto object-contain"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <span className="font-medium">{product.brand.name}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {specs.length > 0 && (
                    <div className="hover:bg-slate-100 transition-all">
                      <button
                        type="button"
                        onClick={() => setOpenAccordion(openAccordion === 1 ? -1 : 1)}
                        className="w-full text-sm font-semibold cursor-pointer text-left px-4 py-2.5 text-slate-900 flex items-center"
                      >
                        <span className="mr-4">Đặc điểm nổi bật</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`w-3 h-3 fill-current ml-auto shrink-0 transition-transform ${openAccordion === 1 ? '-rotate-180' : '-rotate-90'}`}
                          viewBox="0 0 24 24"
                        >
                          <path fillRule="evenodd" d="M11.99997 18.1669a2.38 2.38 0 0 1-1.68266-.69733l-9.52-9.52a2.38 2.38 0 1 1 3.36532-3.36532l7.83734 7.83734 7.83734-7.83734a2.38 2.38 0 1 1 3.36532 3.36532l-9.52 9.52a2.38 2.38 0 0 1-1.68266.69734z" clipRule="evenodd"></path>
                        </svg>
                      </button>
                      {openAccordion === 1 && (
                        <div className="pb-4 px-4">
                          <ul className="list-disc list-inside space-y-1">
                            {specs.map((spec, index) => (
                              <li key={index} className="text-sm text-slate-500">{spec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <hr className="my-6 border-slate-300" />

            <ProductReviewsSection
              productId={product.id}
              fallbackRating={rating}
              fallbackReviewCount={reviewCount}
            />
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-slate-900 mb-6">Sản phẩm liên quan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <Card
                  key={item.id}
                  hoverable
                  style={{ width: '100%' }}
                  cover={
                    <img
                      alt={item.name}
                      src={item.image || 'https://via.placeholder.com/300x220?text=No+Image'}
                      className="h-[220px] object-cover"
                    />
                  }
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <Card.Meta
                    title={item.name}
                    description={`${Number(item.price || 0).toLocaleString('vi-VN')}đ`}
                  />
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
