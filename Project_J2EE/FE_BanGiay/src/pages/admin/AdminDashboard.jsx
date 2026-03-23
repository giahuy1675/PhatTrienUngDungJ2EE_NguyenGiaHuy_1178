import { useEffect, useMemo, useState } from 'react';
import { Space, Table, Tag } from 'antd';
import api from '../../services/api';

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [productsRes, ordersRes, usersRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/orders'),
        api.get('/admin/users'),
      ]);

      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Lỗi tải dashboard:', err);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const getOrderStatusText = (status) => {
    const map = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PROCESSING: 'Đang xử lý',
      SHIPPING: 'Đang giao',
      DELIVERED: 'Đã giao',
      CANCELLED: 'Đã hủy',
    };
    return map[status] || status;
  };

  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalUsers = users.length;

    const totalRevenue = orders
      .filter((order) => order.status !== 'CANCELLED')
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    return { totalProducts, totalOrders, totalUsers, totalRevenue };
  }, [products, orders, users]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-lg text-gray-600">Đang tải dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Xin chào! Chào mừng đến với trang quản trị</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng Sản Phẩm</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalProducts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đơn Hàng</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalOrders}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Người Dùng</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalUsers}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Doanh Thu</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(metrics.totalRevenue)}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Đơn Hàng Gần Đây</h2>
        <Table dataSource={recentOrders} pagination={false} rowKey={(record) => record.id}>
          <Table.Column
            title="Mã ĐH"
            key="orderNumber"
            render={(_, record) => <span className="font-medium">#{record.orderNumber || record.id}</span>}
          />
          <Table.Column
            title="Khách Hàng"
            key="customer"
            render={(_, record) => record.receiverName || record.user?.fullName || 'Khách hàng'
            }
          />
          <Table.Column
            title="Ngày"
            dataIndex="createdAt"
            key="createdAt"
            render={(value) => (value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A')}
          />
          <Table.Column
            title="Tổng Tiền"
            dataIndex="totalAmount"
            key="totalAmount"
            render={(value) => <span className="font-semibold">{formatCurrency(value)}</span>}
          />
          <Table.Column
            title="Trạng Thái"
            dataIndex="status"
            key="status"
            render={(status) => {
              const color = status === 'CANCELLED' ? 'red' : status === 'PENDING' ? 'gold' : 'green';
              return <Tag color={color}>{getOrderStatusText(status).toUpperCase()}</Tag>;
            }}
          />
          <Table.Column
            title="Action"
            key="action"
            render={(_, record) => (
              <Space size="middle">
                <a href={`/admin/orders`}>Xem {record.orderNumber || record.id}</a>
              </Space>
            )}
          />
        </Table>
      </div>
    </div>
  );
}

export default AdminDashboard;
