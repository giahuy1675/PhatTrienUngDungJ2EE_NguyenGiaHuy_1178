import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/helpers';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import Breadcrumb from '../components/Breadcrumb';

function CartPage() {
  const { cart, cartCount, removeFromCart, updateCartItem, getCartTotal, loading } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [alert, setAlert] = useState(null);

  const handleRemove = (cartItemId, productName) => {
    setItemToDelete({ id: cartItemId, name: productName });
    setModalOpen(true);
  };

  const confirmRemove = async () => {
    try {
      await removeFromCart(itemToDelete.id);
      setAlert({ type: 'success', message: `Đã xóa "${itemToDelete.name}" khỏi giỏ hàng` });
      setModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      setAlert({ type: 'danger', message: 'Không thể xóa sản phẩm. Vui lòng thử lại!' });
      setModalOpen(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(cartItemId, newQuantity);
    } catch (error) {
      setAlert({ type: 'danger', message: 'Không thể cập nhật số lượng. Vui lòng thử lại!' });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="pt-6">
        <Breadcrumb items={[{ label: 'Giỏ hàng' }]} />
      </div>
      
      {/* Modal xác nhận xóa */}
      <Modal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmRemove}
        title="Xác nhận xóa sản phẩm"
        confirmText="Xóa"
        cancelText="Hủy"
      >
        <p className="text-slate-600 text-sm leading-relaxed">
          Bạn có chắc chắn muốn xóa sản phẩm <strong>"{itemToDelete?.name}"</strong> khỏi giỏ hàng không?
        </p>
        <p className="text-slate-500 text-xs mt-2">
          Hành động này không thể hoàn tác.
        </p>
      </Modal>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng ({cartCount})</h1>

        {/* Alert */}
        {alert && (
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert(null)} 
          />
        )}

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">Giỏ hàng trống</h3>
            <p className="mt-2 text-gray-500">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link
              to="/products"
              className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm">
                <ul role="list" className="divide-y divide-gray-200">
                  {cart.map((item) => {
                    // Debug log
                    const imageToUse = item.selectedImage || item.productImage || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                    
                    console.log('🛒 Cart item render:', {
                      id: item.id,
                      productName: item.productName,
                      selectedColor: item.selectedColor,
                      selectedSize: item.selectedSize,
                      hasSelectedImage: !!item.selectedImage,
                      hasProductImage: !!item.productImage,
                      selectedImagePreview: item.selectedImage ? item.selectedImage.substring(0, 80) + '...' : null,
                      productImagePreview: item.productImage ? item.productImage.substring(0, 80) + '...' : null,
                      imageToUsePreview: imageToUse.substring(0, 80) + '...'
                    });
                    
                    return (
                    <li key={item.id} className="p-6 sm:p-8">
                      <div className="flex items-start sm:items-center">
                        <div className="h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                          <img
                            alt={item.productName || 'Product'}
                            src={imageToUse}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="ml-4 sm:ml-6 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                                <Link
                                  to={`/product/${item.productId}`}
                                  className="hover:text-blue-600"
                                >
                                  {item.productName}
                                </Link>
                              </h3>
                              {(item.selectedSize || item.selectedColor) && (
                                <p className="mt-1 text-sm text-gray-500">
                                  {item.selectedSize && `Size: ${item.selectedSize}`}
                                  {item.selectedSize && item.selectedColor && ' - '}
                                  {item.selectedColor && `Màu: ${item.selectedColor}`}
                                </p>
                              )}
                            </div>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatPrice((item.productPrice || 0) * item.quantity)}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3 border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-100 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={item.quantity <= 1}
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="px-4 text-base font-medium text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="p-2 hover:bg-gray-100 rounded-r-lg"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemove(item.id, item.productName)}
                              className="text-sm font-medium text-red-600 hover:text-red-500"
                            >
                              Xóa
                            </button>
                          </div>

                          <p className="mt-2 text-sm text-gray-500">
                            Đơn giá: {formatPrice(item.productPrice || 0)}
                          </p>
                        </div>
                      </div>
                    </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-8 lg:mt-0 lg:col-span-4">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-base text-gray-600">
                    <p>Tạm tính ({cartCount} sản phẩm)</p>
                    <p>{formatPrice(getCartTotal())}</p>
                  </div>
                  <div className="flex justify-between text-base text-gray-600">
                    <p>Phí vận chuyển</p>
                    <p className="text-sm text-gray-500">Tính khi thanh toán</p>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <p>Tổng cộng</p>
                      <p>{formatPrice(getCartTotal())}</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="mt-6 w-full flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Thanh toán
                </Link>

                <div className="mt-4 text-center">
                  <Link
                    to="/products"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Tiếp tục mua sắm
                    <span aria-hidden="true"> &rarr;</span>
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Chính sách</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Miễn phí vận chuyển đơn &gt; 500k
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Đổi trả trong 7 ngày
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Bảo hành chính hãng
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
