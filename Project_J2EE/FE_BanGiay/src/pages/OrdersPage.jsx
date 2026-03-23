import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Modal, Rate, message } from 'antd';
import orderService from '../services/orderService';
import reviewService from '../services/reviewService';
import Breadcrumb from '../components/Breadcrumb';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewDetail, setSelectedReviewDetail] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewedOrderProductKeys, setReviewedOrderProductKeys] = useState(new Set());
  const itemsPerPage = 5;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    fetchReviewedProducts();
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getUserOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewedProducts = async () => {
    try {
      const deliveredOrders = orders.filter((order) => order.status === 'DELIVERED');
      if (!deliveredOrders.length) {
        setReviewedOrderProductKeys(new Set());
        return;
      }

      const orderProductPairs = deliveredOrders
        .flatMap((order) => (order.orderDetails || []).map((detail) => ({
          orderId: order.id,
          productId: detail?.product?.id,
        })))
        .filter((pair) => pair.orderId && pair.productId);

      const uniqueProductIds = [...new Set(orderProductPairs.map((pair) => pair.productId))];
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const reviewsByProduct = new Map();

      await Promise.all(
        uniqueProductIds.map(async (productId) => {
          try {
            const reviews = await reviewService.getProductReviews(productId);
            reviewsByProduct.set(productId, reviews || []);
          } catch {
            reviewsByProduct.set(productId, []);
          }
        })
      );

      const reviewedKeys = new Set();
      orderProductPairs.forEach(({ orderId, productId }) => {
        const reviews = reviewsByProduct.get(productId) || [];
        const hasReviewedForOrder = reviews.some(
          (review) => review?.author?.id === currentUser?.id && review?.orderId === orderId
        );

        if (hasReviewedForOrder) {
          reviewedKeys.add(`${orderId}-${productId}`);
        }
      });

      setReviewedOrderProductKeys(reviewedKeys);
    } catch {
      setReviewedOrderProductKeys(new Set());
    }
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-900',
      CONFIRMED: 'bg-blue-100 text-blue-900',
      PROCESSING: 'bg-orange-100 text-orange-900',
      SHIPPING: 'bg-purple-100 text-purple-900',
      DELIVERED: 'bg-green-100 text-green-900',
      CANCELLED: 'bg-red-100 text-red-900'
    };
    return colors[status] || 'bg-gray-100 text-gray-900';
  };

  const getOrderStatusText = (status) => {
    const texts = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PROCESSING: 'Đang xử lý',
      SHIPPING: 'Đang giao hàng',
      DELIVERED: 'Đã giao hàng',
      CANCELLED: 'Đã hủy'
    };
    return texts[status] || status;
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'price-high':
        return b.totalAmount - a.totalAmount;
      case 'price-low':
        return a.totalAmount - b.totalAmount;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = sortedOrders.slice(startIndex, endIndex);

  const openReviewModal = (order, detail) => {
    setSelectedReviewDetail({ orderId: order.id, detail });
    setReviewRating(5);
    setReviewContent('');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedReviewDetail?.detail?.product?.id) return;
    if (!reviewContent.trim()) {
      message.warning('Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      setReviewSubmitting(true);
      await reviewService.createReview(selectedReviewDetail.detail.product.id, {
        orderId: selectedReviewDetail.orderId,
        rating: reviewRating,
        content: reviewContent.trim(),
      });

      message.success('Gửi đánh giá thành công');
      setIsReviewModalOpen(false);
      setSelectedReviewDetail(null);
      setReviewContent('');
      setReviewRating(5);
      await fetchReviewedProducts();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 px-4 py-8 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 px-4 py-8 min-h-screen">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Lịch sử đơn hàng' }]} />
      
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-6 mb-12">
          <div className="max-w-96">
            <h2 className="text-slate-900 text-2xl font-bold mb-3">Lịch sử đơn hàng</h2>
            <p className="text-base text-slate-600">Xem và quản lý các đơn hàng đã đặt</p>
          </div>
          <div>
            <input
              type="text"
              className="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-indigo-600"
              placeholder="Tìm kiếm đơn hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-8 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[15px] font-medium text-slate-600">Lọc theo:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium hover:bg-indigo-700 transition ${
                filter === 'all'
                  ? 'bg-indigo-600 border border-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-slate-900 hover:bg-gray-50'
              }`}
            >
              Tất cả đơn hàng
            </button>
            <button
              onClick={() => setFilter('DELIVERED')}
              className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition ${
                filter === 'DELIVERED'
                  ? 'bg-indigo-600 border border-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-slate-900 hover:bg-gray-50'
              }`}
            >
              Đã giao
            </button>
            <button
              onClick={() => setFilter('SHIPPING')}
              className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition ${
                filter === 'SHIPPING'
                  ? 'bg-indigo-600 border border-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-slate-900 hover:bg-gray-50'
              }`}
            >
              Đang giao
            </button>
            <button
              onClick={() => setFilter('CANCELLED')}
              className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition ${
                filter === 'CANCELLED'
                  ? 'bg-indigo-600 border border-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-slate-900 hover:bg-gray-50'
              }`}
            >
              Đã hủy
            </button>
          </div>
          <div className="ml-auto">
            <select
              className="appearance-none px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-indigo-600 cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sắp xếp: Mới nhất</option>
              <option value="oldest">Sắp xếp: Cũ nhất</option>
              <option value="price-high">Sắp xếp: Giá cao đến thấp</option>
              <option value="price-low">Sắp xếp: Giá thấp đến cao</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {currentOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-300">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {filter === 'all' ? 'Không tìm thấy đơn hàng' : 'Không có đơn hàng phù hợp'}
            </h3>
            <p className="text-gray-500 mb-6">Hãy khám phá và đặt hàng những sản phẩm yêu thích của bạn!</p>
            <Link to="/products" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-medium transition-colors">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {currentOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-300 overflow-hidden p-6">
                {/* Order Header */}
                <div className="flex flex-wrap justify-between gap-6 mb-6">
                  <div className="max-w-96">
                    <div className="flex items-center gap-4">
                      <span className="text-[15px] font-semibold text-slate-600">
                        Đơn hàng #{order.orderNumber}
                      </span>
                      <span className={`px-3 py-1.5 ${getOrderStatusColor(order.status)} text-xs font-medium rounded-md`}>
                        {getOrderStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mt-3">
                      Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })} lúc {new Date(order.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900">
                      {order.totalAmount?.toLocaleString('vi-VN')}₫
                    </p>
                    <p className="text-slate-600 text-sm mt-2">
                      {order.orderDetails?.length || 0} sản phẩm
                    </p>
                  </div>
                </div>

                <hr className="border-gray-300 my-6" />

                {/* Order Products */}
                <div className="flex flex-wrap items-center gap-8 mb-8">
                  {order.orderDetails?.slice(0, 3).map((detail, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 p-1 rounded-md overflow-hidden">
                        <img
                          src={detail.selectedImage || detail.product?.image || 'https://via.placeholder.com/64'}
                          alt={detail.product?.name}
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=No+Image' }}
                        />
                      </div>
                      <div>
                        <p className="text-[15px] font-medium text-slate-900 line-clamp-1">
                          {detail.product?.name || 'Sản phẩm'}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Số lượng: {detail.quantity}
                          {detail.selectedSize && ` - Size: ${detail.selectedSize}`}
                          {detail.selectedColor && ` - Màu: ${detail.selectedColor}`}
                        </p>
                        {order.status === 'DELIVERED' && (
                          reviewedOrderProductKeys.has(`${order.id}-${detail?.product?.id}`) ? (
                            <span className="inline-flex mt-2 px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                              Bạn đã đánh giá rồi
                            </span>
                          ) : (
                            <Button
                              size="small"
                              className="mt-2"
                              onClick={() => openReviewModal(order, detail)}
                            >
                              Đánh giá
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                  {order.orderDetails?.length > 3 && (
                    <div className="text-sm text-slate-600">
                      +{order.orderDetails.length - 3} sản phẩm khác
                    </div>
                  )}
                </div>

                {/* Order Actions */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    to={`/orders/${order.id}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-slate-900 font-medium cursor-pointer hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 511.999 511.999">
                      <path d="M508.745 246.041c-4.574-6.257-113.557-153.206-252.748-153.206S7.818 239.784 3.249 246.035a16.896 16.896 0 0 0 0 19.923c4.569 6.257 113.557 153.206 252.748 153.206s248.174-146.95 252.748-153.201a16.875 16.875 0 0 0 0-19.922zM255.997 385.406c-102.529 0-191.33-97.533-217.617-129.418 26.253-31.913 114.868-129.395 217.617-129.395 102.524 0 191.319 97.516 217.617 129.418-26.253 31.912-114.868 129.395-217.617 129.395z" fill="currentColor" />
                      <path d="M255.997 154.725c-55.842 0-101.275 45.433-101.275 101.275s45.433 101.275 101.275 101.275S357.272 311.842 357.272 256s-45.433-101.275-101.275-101.275zm0 168.791c-37.23 0-67.516-30.287-67.516-67.516s30.287-67.516 67.516-67.516 67.516 30.287 67.516 67.516-30.286 67.516-67.516 67.516z" fill="currentColor" />
                    </svg>
                    Xem chi tiết
                  </Link>
                  {order.status === 'DELIVERED' && (
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-slate-900 font-medium cursor-pointer hover:bg-gray-50 transition flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M12.005 23.8c-3.186 0-6.136-1.18-8.378-3.422-.472-.472-.472-1.18 0-1.652s1.18-.472 1.652 0c1.888 1.77 4.248 2.714 6.726 2.714 5.192 0 9.44-4.248 9.44-9.44s-4.248-9.44-9.44-9.44c-2.478 0-4.838.944-6.726 2.714-.944.944-2.95 3.304-3.068 3.422-.472.472-1.18.59-1.652.118s-.59-1.18-.118-1.652c.118-.118 2.124-2.478 3.186-3.422C5.869 1.38 8.819.2 12.005.2c6.49 0 11.8 5.31 11.8 11.8s-5.31 11.8-11.8 11.8z" fill="currentColor" />
                        <path d="M6.105 9.05h-4.72c-.708 0-1.18-.472-1.18-1.18V3.15c0-.708.472-1.18 1.18-1.18s1.18.472 1.18 1.18v3.54h3.54c.708 0 1.18.472 1.18 1.18s-.472 1.18-1.18 1.18z" fill="currentColor" />
                      </svg>
                      Mua lại
                    </button>
                  )}
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-slate-900 font-medium cursor-pointer hover:bg-gray-50 transition flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 512 512">
                      <path d="m433.798 106.268-96.423-91.222C327.119 5.343 313.695 0 299.577 0H116C85.673 0 61 24.673 61 55v402c0 30.327 24.673 55 55 55h280c30.327 0 55-24.673 55-55V146.222c0-15.049-6.27-29.612-17.202-39.954zM404.661 120H330c-2.757 0-5-2.243-5-5V44.636zM396 482H116c-13.785 0-25-11.215-25-25V55c0-13.785 11.215-25 25-25h179v85c0 19.299 15.701 35 35 35h91v307c0 13.785-11.215 25-25 25z" fill="currentColor" />
                      <path d="M363 200H143c-8.284 0-15 6.716-15 15s6.716 15 15 15h220c8.284 0 15-6.716 15-15s-6.716-15-15-15zm0 80H143c-8.284 0-15 6.716-15 15s6.716 15 15 15h220c8.284 0 15-6.716 15-15s-6.716-15-15-15zm-147.28 80H143c-8.284 0-15 6.716-15 15s6.716 15 15 15h72.72c8.284 0 15-6.716 15-15s-6.716-15-15-15z" fill="currentColor" />
                    </svg>
                    Hóa đơn
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {sortedOrders.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
              <span className="font-medium">{Math.min(endIndex, sortedOrders.length)}</span> trong tổng số{' '}
              <span className="font-medium">{sortedOrders.length}</span> đơn hàng
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 492 492">
                  <path d="M198.608 246.104 382.664 62.04c5.068-5.056 7.856-11.816 7.856-19.024 0-7.212-2.788-13.968-7.856-19.032l-16.128-16.12C361.476 2.792 354.712 0 347.504 0s-13.964 2.792-19.028 7.864L109.328 227.008c-5.084 5.08-7.868 11.868-7.848 19.084-.02 7.248 2.76 14.028 7.848 19.112l218.944 218.932c5.064 5.072 11.82 7.864 19.032 7.864 7.208 0 13.964-2.792 19.032-7.864l16.124-16.12c10.492-10.492 10.492-27.572 0-38.06L198.608 246.104z" fill="currentColor" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition cursor-pointer ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 492.004 492.004">
                  <path d="M382.678 226.804 163.73 7.86C158.666 2.792 151.906 0 144.698 0s-13.968 2.792-19.032 7.86l-16.124 16.12c-10.492 10.504-10.492 27.576 0 38.064L293.398 245.9l-184.06 184.06c-5.064 5.068-7.86 11.824-7.86 19.028 0 7.212 2.796 13.968 7.86 19.04l16.124 16.116c5.068 5.068 11.824 7.86 19.032 7.86s13.968-2.792 19.032-7.86L382.678 265c5.076-5.084 7.864-11.872 7.848-19.088.016-7.244-2.772-14.028-7.848-19.108z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Đánh giá sản phẩm"
        open={isReviewModalOpen}
        onCancel={() => setIsReviewModalOpen(false)}
        footer={null}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-2">Số sao</p>
            <Rate allowHalf value={reviewRating} onChange={setReviewRating} />
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-2">Nội dung</p>
            <Input.TextArea
              rows={4}
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
            />
          </div>
          <div className="flex justify-end">
            <Button type="primary" loading={reviewSubmitting} onClick={handleSubmitReview}>
              Gửi đánh giá
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default OrdersPage;

