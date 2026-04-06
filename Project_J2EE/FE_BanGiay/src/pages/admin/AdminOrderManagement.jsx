import { useState, useEffect } from 'react';
import { Avatar, Button, Col, Divider, Drawer, List, Pagination, Row } from 'antd';
import axios from 'axios';

const DescriptionItem = ({ title, content }) => (
  <div className="mb-4">
    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{title}</p>
    <div className="text-gray-800">{content}</div>
  </div>
);

function AdminOrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/orders', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const openOrderDrawer = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const closeOrderDrawer = () => {
    setDrawerOpen(false);
    setSelectedOrder(null);
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      PENDING: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Chờ xử lý' },
      CONFIRMED: { color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Đã xác nhận' },
      PROCESSING: { color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Đang xử lý' },
      SHIPPING: { color: 'text-indigo-600', bgColor: 'bg-indigo-100', label: 'Đang giao' },
      DELIVERED: { color: 'text-green-600', bgColor: 'bg-green-100', label: 'Đã giao' },
      CANCELLED: { color: 'text-red-600', bgColor: 'bg-red-100', label: 'Đã hủy' }
    };
    return statusConfig[status] || statusConfig.PENDING;
  };

  const getPaymentStatusInfo = (paymentStatus) => {
    const statusConfig = {
      UNPAID: { label: 'Chưa thanh toán', color: 'text-orange-600' },
      PAID: { label: 'Đã thanh toán', color: 'text-green-600' },
      REFUNDED: { label: 'Đã hoàn tiền', color: 'text-blue-600' }
    };
    return statusConfig[paymentStatus] || statusConfig.UNPAID;
  };

  const getPaymentMethodLabel = (method) => {
    const methodMap = {
      COD: 'Tiền mặt',
      BANK_TRANSFER: 'Chuyển khoản',
      CREDIT_CARD: 'Thẻ tín dụng',
      E_WALLET: 'Ví điện tử'
    };
    return methodMap[method] || method;
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:8080/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = (status) => {
    const progressMap = {
      PENDING: 20,
      CONFIRMED: 40,
      PROCESSING: 60,
      SHIPPING: 80,
      DELIVERED: 100,
      CANCELLED: 0
    };
    return progressMap[status] || 0;
  };

  const getProgressColor = (status) => {
    if (status === 'CANCELLED') return 'bg-red-500';
    if (status === 'DELIVERED') return 'bg-green-500';
    return 'bg-orange-500';
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const sortedOrders = Array.isArray(orders)
    ? [...orders].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        // Mới nhất trước
        return bTime - aTime || (b.id || 0) - (a.id || 0);
      })
    : [];
  const currentOrders = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return <div className="p-8">Đang tải...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Hàng</h1>
        <p className="text-gray-600 mt-2">Theo dõi và xử lý đơn hàng của khách hàng</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="whitespace-nowrap bg-gray-100 rounded">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-slate-900">Khách Hàng</th>
              <th className="p-4 text-left text-sm font-semibold text-slate-900">Tổng Tiền</th>
              <th className="p-4 text-left text-sm font-semibold text-slate-900">Ngày Đặt</th>
              <th className="p-4 text-left text-sm font-semibold text-slate-900">Thanh Toán</th>
              <th className="p-4 text-left text-sm font-semibold text-slate-900">Tiến Độ</th>
            </tr>
          </thead>

          <tbody className="whitespace-nowrap">
            {currentOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">Chưa có đơn hàng nào</td>
              </tr>
            ) : (
              currentOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const paymentInfo = getPaymentStatusInfo(order.paymentStatus);
                const progressPercent = getProgressPercentage(order.status);
                const progressColor = getProgressColor(order.status);

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openOrderDrawer(order)}
                  >
                    <td className="p-4 text-sm text-slate-900 font-medium">
                      <div className="flex items-center w-max">
                        <div className="w-9 h-9 rounded-md shrink-0 bg-blue-600 flex items-center justify-center text-white font-bold">
                          {order.receiverName ? order.receiverName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="ml-4">
                          <p className="font-medium">{order.receiverName}</p>
                          <p className="text-xs text-slate-500 mt-1">#{order.orderNumber}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openOrderDrawer(order);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-900 font-medium">
                      {order.totalAmount?.toLocaleString('vi-VN')}đ
                      <p className={`text-xs mt-1 ${statusInfo.color}`}>{statusInfo.label}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-900 font-medium">
                      {formatDate(order.createdAt)}
                      <p className={`text-xs mt-1 ${paymentInfo.color}`}>{paymentInfo.label}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-900 font-medium">
                      {getPaymentMethodLabel(order.paymentMethod)}
                      <p className="text-xs text-slate-500 mt-1">{order.receiverPhone}</p>
                    </td>
                    <td className="p-4">
                      <div className="bg-gray-300 rounded-full w-full h-2">
                        <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${progressPercent}%` }}></div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-500">
                          {order.status === 'CANCELLED' ? 'Đã hủy' : `${progressPercent}%`}
                        </p>
                        <select
                          value={order.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="PENDING">Chờ xử lý</option>
                          <option value="CONFIRMED">Đã xác nhận</option>
                          <option value="PROCESSING">Đang xử lý</option>
                          <option value="SHIPPING">Đang giao</option>
                          <option value="DELIVERED">Đã giao</option>
                          <option value="CANCELLED">Đã hủy</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="md:flex m-4 items-center justify-between gap-4">
          <p className="text-sm text-slate-600 flex-1">
            Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, orders.length)} trong tổng số {orders.length} đơn hàng
          </p>

          <Pagination
            current={currentPage}
            pageSize={itemsPerPage}
            total={orders.length}
            onChange={(page, size) => {
              setCurrentPage(page);
              if (size !== itemsPerPage) {
                setItemsPerPage(size);
              }
            }}
            showSizeChanger
            pageSizeOptions={["5", "10", "20", "50", "100"]}
          />
        </div>
      </div>

      <Drawer width={720} placement="right" closable={false} onClose={closeOrderDrawer} open={drawerOpen}>
        <p className="text-xl font-semibold mb-6">Chi tiết đơn hàng</p>

        <p className="font-semibold mb-3">Thông tin đơn hàng</p>
        <Row gutter={16}>
          <Col span={12}>
            <DescriptionItem title="Mã đơn" content={selectedOrder?.orderNumber || '-'} />
          </Col>
          <Col span={12}>
            <DescriptionItem title="Trạng thái" content={getStatusInfo(selectedOrder?.status || 'PENDING').label} />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <DescriptionItem title="Ngày đặt" content={formatDate(selectedOrder?.createdAt)} />
          </Col>
          <Col span={12}>
            <DescriptionItem
              title="Tổng tiền"
              content={typeof selectedOrder?.totalAmount === 'number' ? `${selectedOrder.totalAmount.toLocaleString('vi-VN')}đ` : '-'}
            />
          </Col>
        </Row>

        <Divider />

        <p className="font-semibold mb-3">Người nhận</p>
        <Row gutter={16}>
          <Col span={12}>
            <DescriptionItem title="Họ tên" content={selectedOrder?.receiverName || '-'} />
          </Col>
          <Col span={12}>
            <DescriptionItem title="Số điện thoại" content={selectedOrder?.receiverPhone || '-'} />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <DescriptionItem title="Thanh toán" content={getPaymentMethodLabel(selectedOrder?.paymentMethod)} />
          </Col>
          <Col span={12}>
            <DescriptionItem title="Tình trạng TT" content={getPaymentStatusInfo(selectedOrder?.paymentStatus).label} />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <DescriptionItem title="Địa chỉ giao hàng" content={selectedOrder?.shippingAddress || '-'} />
          </Col>
        </Row>

        <Divider />

        <p className="font-semibold mb-3">Sản phẩm trong đơn</p>
        <List
          bordered
          dataSource={selectedOrder?.orderDetails || []}
          locale={{ emptyText: 'Không có sản phẩm' }}
          renderItem={(detail, index) => (
            <List.Item key={`${selectedOrder?.id || 'order'}-${index}`}>
              <List.Item.Meta
                avatar={<Avatar src={detail.selectedImage || detail.product?.image || 'https://via.placeholder.com/48'} />}
                title={detail.product?.name || 'Sản phẩm'}
                description={`SL: ${detail.quantity || 0}${detail.selectedSize ? ` - Size: ${detail.selectedSize}` : ''}${detail.selectedColor ? ` - Màu: ${detail.selectedColor}` : ''}`}
              />
              <div>
                {typeof detail.unitPrice === 'number' ? `${detail.unitPrice.toLocaleString('vi-VN')}đ` : ''}
              </div>
            </List.Item>
          )}
        />

        <div className="mt-6 text-right">
          <Button onClick={closeOrderDrawer}>Đóng</Button>
        </div>
      </Drawer>
    </div>
  );
}

export default AdminOrderManagement;
