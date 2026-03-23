import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import orderService from '../services/orderService';
import Breadcrumb from '../components/Breadcrumb';
import { LikeOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import { Avatar, Button, Col, Descriptions, Divider, Drawer, List, Row, Space, Statistic, Tag } from 'antd';
function ProfilePage() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userProfile, setUserProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    fetchUserProfile();
    if (activeTab === 'dashboard') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setUserProfile(data);
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await orderService.getUserOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile(formData);
      await fetchUserProfile();
      setEditMode(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openOrderDrawer = (order) => {
    setSelectedOrder(order);
    setOrderDrawerOpen(true);
  };

  const closeOrderDrawer = () => {
    setOrderDrawerOpen(false);
    setSelectedOrder(null);
  };

  const DescriptionItem = ({ title, content }) => (
    <div className="mb-4">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{title}</p>
      <div className="text-gray-800">{content}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Tài khoản' }]} />
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              {/* Profile Section */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={userProfile?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userProfile?.fullName || 'User')}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                  />
                  <div className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-full shadow-sm cursor-pointer hover:bg-blue-700">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 19.5H3v-4.5L16.732 3.732z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">Xin chào</p>
                <h2 className="text-lg font-semibold mt-1">{userProfile?.fullName || 'Người dùng'}</h2>
                <p className="text-xs text-gray-500 mt-1">{userProfile?.email}</p>
              </div>

              <hr className="my-5 border-gray-200" />

              {/* Menu Section */}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-50 border border-blue-500 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Tổng quan
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    activeTab === 'orders'
                      ? 'bg-blue-50 border border-blue-500 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Đơn hàng
                </button>

                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    activeTab === 'account'
                      ? 'bg-blue-50 border border-blue-500 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Thông tin tài khoản
                </button>

                <button
                  onClick={() => setActiveTab('address')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    activeTab === 'address'
                      ? 'bg-blue-50 border border-blue-500 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Địa chỉ
                </button>

                <hr className="my-3 border-gray-200" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Đăng xuất
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-md p-6">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div>
                  <div className="rounded-xl border border-gray-200 overflow-hidden mb-6">
                    <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Tổng quan tài khoản</h2>
                        <p className="text-sm text-gray-500">Quản lý thông tin cá nhân và trạng thái đơn hàng</p>
                      </div>
                      <Tag color="blue">{userProfile?.role || 'USER'}</Tag>
                    </div>

                    <div className="bg-white px-6 py-5">
                      <Descriptions size="small" column={2} bordered>
                        <Descriptions.Item label="Họ và tên">{userProfile?.fullName || 'Chưa cập nhật'}</Descriptions.Item>
                        <Descriptions.Item label="Email">{userProfile?.email || 'Chưa cập nhật'}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{userProfile?.phoneNumber || 'Chưa cập nhật'}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">{userProfile?.address || 'Chưa cập nhật'}</Descriptions.Item>
                      </Descriptions>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <Row gutter={[32, 16]}>
                      <Statistic title="Tổng đơn hàng" value={orders.length} />
                      <Statistic
                        title="Đã hoàn thành"
                        value={orders.filter((o) => o.status === 'DELIVERED').length}
                      />
                      <Statistic
                        title="Đang xử lý"
                        value={orders.filter((o) => ['PENDING', 'CONFIRMED', 'SHIPPING'].includes(o.status)).length}
                      />
                    </Row>

                    <div className="mt-6 flex gap-3">
                      <Button type="primary" onClick={() => setActiveTab('account')}>
                        Chỉnh sửa thông tin
                      </Button>
                      <Button onClick={() => setActiveTab('orders')}>Xem đơn hàng</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Đơn hàng của tôi</h2>
                    <Button onClick={fetchOrders}>Làm mới</Button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <p className="text-gray-600">Bạn chưa có đơn hàng nào.</p>
                      <button
                        onClick={() => navigate('/products')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Mua sắm ngay
                      </button>
                    </div>
                  ) : (
                    <List
                      itemLayout="vertical"
                      size="large"
                      pagination={{
                        pageSize: 4,
                      }}
                      dataSource={orders}
                      renderItem={(order) => {
                        const paymentStatusLabel =
                          order.paymentStatus === 'PAID'
                            ? 'Đã thanh toán'
                            : order.paymentStatus === 'REFUNDED'
                            ? 'Đã hoàn tiền'
                            : 'Chưa thanh toán';

                        const totalAmount = typeof order.totalAmount === 'number'
                          ? `${order.totalAmount.toLocaleString('vi-VN')}đ`
                          : 'N/A';
                        const orderDate = order.createdAt
                          ? new Date(order.createdAt).toLocaleString('vi-VN')
                          : 'N/A';

                        return (
                          <List.Item
                            key={order.id}
                            actions={[
                              <Space key="order-total"><StarOutlined /> {totalAmount}</Space>,
                              <Space key="order-status">
                                <LikeOutlined /> {order.status || 'PENDING'} • {paymentStatusLabel}
                              </Space>,
                              <Space key="order-items"><MessageOutlined /> {(order.orderDetails?.length || 0) + ' sản phẩm'}</Space>,
                            ]}
                            extra={
                              <div className="text-right min-w-[180px]">
                                <Tag color={order.paymentStatus === 'PAID' ? 'green' : 'blue'}>
                                  {order.status || 'PENDING'} • {paymentStatusLabel}
                                </Tag>
                                <div className="mt-2">
                                  <Button type="link" onClick={() => openOrderDrawer(order)}>
                                    Xem chi tiết
                                  </Button>
                                </div>
                              </div>
                            }
                          >
                            <List.Item.Meta
                              avatar={
                                <Avatar src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.fullName || 'User')}`} />
                              }
                              title={`Đơn hàng #${order.id}`}
                              description={`Ngày đặt: ${orderDate}`}
                            />
                            <div>
                              <p className="text-gray-700">Phương thức thanh toán: {order.paymentMethod || 'N/A'}</p>
                              <p className="text-gray-700">Địa chỉ giao hàng: {order.shippingAddress || userProfile?.address || 'Chưa cập nhật'}</p>
                            </div>
                          </List.Item>
                        );
                      }}
                    />
                  )}
                </div>
              )}

              {/* Account Details Tab */}
              {activeTab === 'account' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Thông tin tài khoản</h2>
                    {!editMode && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 19.5H3v-4.5L16.732 3.732z" />
                        </svg>
                        Chỉnh sửa
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        disabled={!editMode}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        disabled={!editMode}
                        pattern="[0-9]{10,11}"
                        placeholder="0123456789"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        disabled={!editMode}
                        rows="3"
                        placeholder="Nhập địa chỉ của bạn"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    {editMode && (
                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                        >
                          Lưu thay đổi
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditMode(false);
                            setFormData({
                              fullName: userProfile?.fullName || '',
                              email: userProfile?.email || '',
                              phoneNumber: userProfile?.phoneNumber || '',
                              address: userProfile?.address || ''
                            });
                          }}
                          className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Address Tab */}
              {activeTab === 'address' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Địa chỉ của tôi</h2>
                  
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{userProfile?.fullName}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Mặc định</span>
                        </div>
                        <p className="text-gray-600 mb-1">{userProfile?.phoneNumber || 'Chưa cập nhật'}</p>
                        <p className="text-gray-600">{userProfile?.address || 'Chưa cập nhật địa chỉ'}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('account')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Chỉnh sửa
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setActiveTab('account')}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mx-auto"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Thêm địa chỉ mới
                    </button>
                  </div>
                </div>
              )}

              <Drawer
                width={720}
                placement="right"
                closable={false}
                onClose={closeOrderDrawer}
                open={orderDrawerOpen}
              >
                <p className="text-xl font-semibold mb-6">Chi tiết đơn hàng</p>

                <p className="font-semibold mb-3">Thông tin chung</p>
                <Row gutter={16}>
                  <Col span={12}>
                    <DescriptionItem title="Mã đơn" content={selectedOrder ? `#${selectedOrder.id}` : '-'} />
                  </Col>
                  <Col span={12}>
                    <DescriptionItem title="Trạng thái" content={selectedOrder?.status || '-'} />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <DescriptionItem
                      title="Ngày đặt"
                      content={selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : '-'}
                    />
                  </Col>
                  <Col span={12}>
                    <DescriptionItem
                      title="Tổng tiền"
                      content={typeof selectedOrder?.totalAmount === 'number' ? `${selectedOrder.totalAmount.toLocaleString('vi-VN')}đ` : '-'}
                    />
                  </Col>
                </Row>

                <Divider />

                <p className="font-semibold mb-3">Khách hàng & giao hàng</p>
                <Row gutter={16}>
                  <Col span={12}>
                    <DescriptionItem title="Họ tên" content={userProfile?.fullName || '-'} />
                  </Col>
                  <Col span={12}>
                    <DescriptionItem title="Email" content={userProfile?.email || '-'} />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <DescriptionItem title="Số điện thoại" content={userProfile?.phoneNumber || '-'} />
                  </Col>
                  <Col span={12}>
                    <DescriptionItem title="Thanh toán" content={selectedOrder?.paymentMethod || '-'} />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <DescriptionItem
                      title="Địa chỉ giao hàng"
                      content={selectedOrder?.shippingAddress || userProfile?.address || '-'}
                    />
                  </Col>
                </Row>

                <Divider />

                <p className="font-semibold mb-3">Sản phẩm</p>
                <List
                  bordered
                  dataSource={selectedOrder?.orderDetails || []}
                  locale={{ emptyText: 'Không có sản phẩm trong đơn hàng' }}
                  renderItem={(detail, index) => (
                    <List.Item key={`${selectedOrder?.id || 'order'}-${index}`}>
                      <List.Item.Meta
                        avatar={<Avatar src={detail.selectedImage || detail.product?.image || 'https://via.placeholder.com/48'} />}
                        title={detail.product?.name || 'Sản phẩm'}
                        description={`Số lượng: ${detail.quantity || 0}${detail.selectedSize ? ` - Size: ${detail.selectedSize}` : ''}${detail.selectedColor ? ` - Màu: ${detail.selectedColor}` : ''}`}
                      />
                      <div className="text-right">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
