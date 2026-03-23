import { Badge } from 'antd';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/helpers';

function ProductCard({ product, onAddToCart }) {
  const discountPercent = product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);

    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-5 h-5 ${i < fullStars ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
        </svg>
      );
    }
    return stars;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (onAddToCart) onAddToCart(product);
  };

  const cardContent = (
    <div className="w-full max-w-sm bg-white p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/product/${product.id}`}>
        <div className="relative">
          <img
            className="rounded-lg mb-6 w-full h-64 object-cover"
            src={product.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E'}
            alt={product.name}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      </Link>

      <div>
        {product.rating > 0 && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center space-x-1">{renderStars(product.rating)}</div>
            <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-2 py-0.5 rounded">
              {product.rating?.toFixed(1)} / 5
            </span>
            {product.reviews > 0 && <span className="text-xs text-gray-500">({product.reviews} đánh giá)</span>}
          </div>
        )}

        <Link to={`/product/${product.id}`}>
          <h5 className="text-lg text-gray-900 font-semibold tracking-tight hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h5>
        </Link>

        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          {product.brand && (
            <div className="flex items-center gap-1.5">
              {product.brand.logo && (
                <img
                  src={product.brand.logo}
                  alt={product.brand.name}
                  className="h-4 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <span className="font-medium">{product.brand.name}</span>
            </div>
          )}
          {product.stockQuantity !== undefined && (
            <span className={`text-xs ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stockQuantity > 0 ? `Còn ${product.stockQuantity}` : 'Hết hàng'}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-2xl font-extrabold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
            className="inline-flex items-center text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed border border-transparent focus:ring-4 focus:ring-blue-300 shadow-sm font-medium rounded-lg text-sm px-3 py-2 focus:outline-none transition-colors"
          >
            <svg className="w-4 h-4 me-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7H7.312" />
            </svg>
            {product.stockQuantity === 0 ? 'Hết hàng' : 'Thêm'}
          </button>
        </div>
      </div>
    </div>
  );

  if (discountPercent > 0 || product.tag) {
    return (
      <Badge.Ribbon
        text={discountPercent > 0 ? `GIẢM ${discountPercent}%` : product.tag}
        color={discountPercent > 0 ? 'red' : 'volcano'}
      >
        {cardContent}
      </Badge.Ribbon>
    );
  }

  return cardContent;
}

export default ProductCard;
