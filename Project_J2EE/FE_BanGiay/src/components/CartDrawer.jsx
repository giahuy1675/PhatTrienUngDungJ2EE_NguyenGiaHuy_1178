import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/helpers';

function CartDrawer({ open, setOpen }) {
  const { cart, cartCount, removeFromCart, updateCartItem, getCartTotal, loading } = useCart();

  const handleRemove = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
    } catch (error) {
      alert('Không thể xóa sản phẩm');
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(cartItemId, newQuantity);
    } catch (error) {
      alert('Không thể cập nhật số lượng');
    }
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full"
            >
              <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-lg font-medium text-gray-900">
                      Giỏ hàng ({cartCount})
                    </DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Đóng</span>
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-8">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : cart.length === 0 ? (
                      <div className="text-center py-8">
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
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        <p className="mt-4 text-gray-500">Giỏ hàng trống</p>
                      </div>
                    ) : (
                      <div className="flow-root">
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                          {cart.map((item) => (
                            <li key={item.id} className="flex py-6">
                              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img
                                  alt={item.productName || 'Product'}
                                  src={item.selectedImage || item.productImage || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E'}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>
                                      <Link 
                                        to={`/product/${item.productId}`}
                                        onClick={() => setOpen(false)}
                                      >
                                        {item.productName}
                                      </Link>
                                    </h3>
                                    <p className="ml-4">{formatPrice(item.productPrice || 0)}</p>
                                  </div>
                                  {(item.selectedSize || item.selectedColor) && (
                                    <p className="mt-1 text-sm text-gray-500">
                                      {item.selectedSize && `Size: ${item.selectedSize}`}
                                      {item.selectedSize && item.selectedColor && ' - '}
                                      {item.selectedColor && `Màu: ${item.selectedColor}`}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                      className="p-1 rounded hover:bg-gray-100"
                                      disabled={item.quantity <= 1}
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                      </svg>
                                    </button>
                                    <span className="text-gray-700 font-medium">{item.quantity}</span>
                                    <button
                                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                      className="p-1 rounded hover:bg-gray-100"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                      </svg>
                                    </button>
                                  </div>

                                  <div className="flex">
                                    <button
                                      type="button"
                                      onClick={() => handleRemove(item.id)}
                                      className="font-medium text-blue-600 hover:text-blue-500"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {cart.length > 0 && (
                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Tổng cộng</p>
                      <p>{formatPrice(getCartTotal())}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Phí vận chuyển sẽ được tính khi thanh toán
                    </p>
                    <div className="mt-6">
                      <Link
                        to="/checkout"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
                      >
                        Thanh toán
                      </Link>
                    </div>
                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                      <p>
                        hoặc{' '}
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          Tiếp tục mua sắm
                          <span aria-hidden="true"> &rarr;</span>
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default CartDrawer;
