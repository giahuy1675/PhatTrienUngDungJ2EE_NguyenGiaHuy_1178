import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/orderService';
import userService from '../services/userService';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import Breadcrumb from '../components/Breadcrumb';

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, fetchCart, clearCart } = useCart();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [promoCode, setPromoCode] = useState('');
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  useEffect(() => {
    const initCheckout = async () => {
      if (!authUser) {
        alert('Vui lòng đăng nhập để thanh toán!');
        navigate('/login');
        return;
      }

      try {
        const userProfile = await userService.getProfile();

        if (userProfile.fullName) {
          const nameParts = userProfile.fullName.trim().split(' ');
          const lastName = nameParts.pop() || '';
          const firstName = nameParts.join(' ') || '';

          setFormData((prev) => ({
            ...prev,
            firstName,
            lastName,
            phone: userProfile.phoneNumber || '',
            address: userProfile.address || ''
          }));
        }

        if (cart.length === 0) {
          await fetchCart();
        }
      } catch (error) {
        console.error('Error loading checkout data:', error);
        setAlert({ type: 'danger', message: 'Không thể tải thông tin. Vui lòng thử lại!' });
      } finally {
        setLoading(false);
      }
    };

    initCheckout();
  }, [authUser]);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const response = await fetch('https://provinces.open-api.vn/api/v1/');
        if (!response.ok) {
          throw new Error('Không thể tải danh sách tỉnh/thành');
        }
        const data = await response.json();
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        setProvinces(sorted);
      } catch (error) {
        console.error('Error loading provinces:', error);
        setAlert({ type: 'danger', message: 'Không thể tải danh sách tỉnh/thành. Vui lòng thử lại!' });
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedProvince) {
        setDistricts([]);
        return;
      }

      try {
        const response = await fetch(`https://provinces.open-api.vn/api/v1/p/${selectedProvince}?depth=2`);
        if (!response.ok) {
          throw new Error('Không thể tải danh sách quận/huyện');
        }
        const data = await response.json();
        const sorted = (data.districts || []).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        setDistricts(sorted);
      } catch (error) {
        console.error('Error loading districts:', error);
        setAlert({ type: 'danger', message: 'Không thể tải danh sách quận/huyện. Vui lòng thử lại!' });
      }
    };

    fetchDistricts();
  }, [selectedProvince]);

  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedDistrict) {
        setWards([]);
        return;
      }

      try {
        const response = await fetch(`https://provinces.open-api.vn/api/v1/d/${selectedDistrict}?depth=2`);
        if (!response.ok) {
          throw new Error('Không thể tải danh sách phường/xã');
        }
        const data = await response.json();
        const sorted = (data.wards || []).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        setWards(sorted);
      } catch (error) {
        console.error('Error loading wards:', error);
        setAlert({ type: 'danger', message: 'Không thể tải danh sách phường/xã. Vui lòng thử lại!' });
      }
    };

    fetchWards();
  }, [selectedDistrict]);

  useEffect(() => {
    if (cart.length === 0 && !loading) {
      setTimeout(() => {
        alert('Giỏ hàng trống! Vui lòng thêm sản phẩm.');
        navigate('/cart');
      }, 500);
    }
  }, [cart]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProvinceChange = (e) => {
    const value = e.target.value;
    setSelectedProvince(value);
    setSelectedDistrict('');
    setSelectedWard('');
    setDistricts([]);
    setWards([]);
    const selected = provinces.find((province) => String(province.code) === value);
    setFormData((prev) => ({
      ...prev,
      state: selected?.name || '',
      city: '',
      zipCode: ''
    }));
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    setSelectedDistrict(value);
    setSelectedWard('');
    setWards([]);
    const selected = districts.find((district) => String(district.code) === value);
    setFormData((prev) => ({
      ...prev,
      city: selected?.name || '',
      zipCode: ''
    }));
  };

  const handleWardChange = (e) => {
    const value = e.target.value;
    setSelectedWard(value);
    const selected = wards.find((ward) => String(ward.code) === value);
    setFormData((prev) => ({
      ...prev,
      zipCode: selected?.name || ''
    }));
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
  const calculateShipping = () => 30000;
  const calculateTax = () => calculateSubtotal() * 0.1;
  const calculateTotal = () => calculateSubtotal() + calculateShipping() + calculateTax();

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setAlert({ type: 'info', message: 'Tính năng mã giảm giá đang được phát triển!' });
    }
  };

  const validateForm = () => {
    const { firstName, lastName, phone, address, city, state, zipCode } = formData;

    if (!firstName.trim() || !lastName.trim()) {
      setAlert({ type: 'warning', message: 'Vui lòng nhập họ và tên!' });
      return false;
    }

    if (!phone.trim() || phone.length < 10) {
      setAlert({ type: 'warning', message: 'Vui lòng nhập số điện thoại hợp lệ (ít nhất 10 số)!' });
      return false;
    }

    if (!address.trim() || !state.trim() || !city.trim() || !zipCode.trim()) {
      setAlert({ type: 'warning', message: 'Vui lòng chọn đầy đủ tỉnh/thành, quận/huyện và phường/xã!' });
      return false;
    }

    return true;
  };

  const buildOrderData = () => {
    const receiverName = `${formData.firstName} ${formData.lastName}`;
    const addressParts = [formData.address, formData.zipCode, formData.city, formData.state].filter(Boolean);
    const receiverAddress = addressParts.join(', ');

    return {
      receiverName: receiverName.trim(),
      receiverPhone: formData.phone.trim(),
      receiverAddress: receiverAddress.trim(),
      note: `Phương thức thanh toán: ${paymentMethod === 'vnpay' ? 'VNPAY' : 'COD - Thanh toán khi nhận hàng'}`,
      paymentMethod: paymentMethod.toUpperCase(),
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.productPrice),
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        selectedImage: item.selectedImage
      })),
      totalAmount: Number(calculateTotal().toFixed(0))
    };
  };

  const handleCompletePurchase = async () => {
    if (!validateForm()) return;
    if (cart.length === 0) {
      setAlert({ type: 'warning', message: 'Giỏ hàng trống!' });
      return;
    }

    try {
      setLoading(true);
      const orderData = buildOrderData();

      if (paymentMethod === 'vnpay') {
        const response = await orderService.createVnpayPayment(orderData);
        if (response?.paymentUrl) {
          window.location.href = response.paymentUrl;
          return;
        }
        throw new Error('Không tạo được link thanh toán VNPAY');
      }

      const response = await orderService.createOrder(orderData);
      await clearCart();
      navigate('/payment/vnpay-return', {
        state: {
          success: true,
          message: `Đặt hàng thành công! Mã đơn hàng: #${response.id}`,
          txnRef: response?.id,
          paymentMethod: 'COD'
        }
      });
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Không thể đặt hàng. Vui lòng thử lại!' });
    } finally {
      setLoading(false);
    }
  };

  if (loading || cart.length === 0) return <Loading />;

  return (
    <div className="bg-white">
      <div className="pt-6">
        <Breadcrumb items={[{ label: 'Giỏ hàng', link: '/cart' }, { label: 'Thanh toán' }]} />
      </div>

      {alert && (
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      <div className="flex max-md:flex-col gap-12 max-lg:gap-4 h-full">
        <div className="bg-gray-100 md:h-screen md:sticky md:top-0 md:min-w-[370px]">
          <div className="relative h-full">
            <div className="px-6 py-8 md:overflow-auto md:h-screen">
              <h2 className="text-xl text-slate-900 font-semibold mb-6">Đơn hàng của bạn</h2>

              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="w-24 h-24 flex p-3 shrink-0 bg-white rounded-md">
                      <img
                        src={item.selectedImage || item.productImage || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E'}
                        alt={item.productName}
                        className="w-full object-contain"
                      />
                    </div>
                    <div className="w-full">
                      <h3 className="text-sm text-slate-900 font-semibold">{item.productName}</h3>
                      {(item.selectedSize || item.selectedColor) && (
                        <p className="text-xs text-gray-600 mt-1">
                          {item.selectedSize && `Size: ${item.selectedSize}`}
                          {item.selectedSize && item.selectedColor && ' • '}
                          {item.selectedColor && `Màu: ${item.selectedColor}`}
                        </p>
                      )}
                      <ul className="text-xs text-slate-900 space-y-2 mt-3">
                        <li className="flex flex-wrap gap-4">Số lượng <span className="ml-auto">{item.quantity}</span></li>
                        <li className="flex flex-wrap gap-4">Tổng <span className="ml-auto font-semibold">{(item.productPrice * item.quantity).toLocaleString('vi-VN')}đ</span></li>
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="border-gray-300 my-8" />

              <ul className="text-slate-500 font-medium space-y-4">
                <li className="flex flex-wrap gap-4 text-sm">Tạm tính <span className="ml-auto font-semibold text-slate-900">{calculateSubtotal().toLocaleString('vi-VN')}đ</span></li>
                <li className="flex flex-wrap gap-4 text-sm">Phí vận chuyển <span className="ml-auto font-semibold text-slate-900">{calculateShipping().toLocaleString('vi-VN')}đ</span></li>
                <li className="flex flex-wrap gap-4 text-sm">Thuế (10%) <span className="ml-auto font-semibold text-slate-900">{calculateTax().toLocaleString('vi-VN')}đ</span></li>
                <hr className="border-slate-300" />
                <li className="flex flex-wrap gap-4 text-[15px] font-semibold text-slate-900">Tổng cộng <span className="ml-auto">{calculateTotal().toLocaleString('vi-VN')}đ</span></li>
              </ul>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleCompletePurchase}
                  disabled={loading}
                  className="rounded-md px-4 py-2.5 w-full text-sm font-medium tracking-wide bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : paymentMethod === 'vnpay' ? 'Thanh toán qua VNPAY' : 'Hoàn tất đặt hàng'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl w-full h-max rounded-md px-4 py-8 max-md:-order-1">
          <form onSubmit={(e) => { e.preventDefault(); handleCompletePurchase(); }}>
            <div>
              <h2 className="text-xl text-slate-900 font-semibold mb-6">Thông tin giao hàng</h2>
              <div className="grid lg:grid-cols-2 gap-y-6 gap-x-4">
                <div><label className="text-sm text-slate-900 font-medium block mb-2">Họ</label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600" required /></div>
                <div><label className="text-sm text-slate-900 font-medium block mb-2">Tên</label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600" required /></div>
                <div><label className="text-sm text-slate-900 font-medium block mb-2">Số điện thoại</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600" required /></div>
                <div><label className="text-sm text-slate-900 font-medium block mb-2">Địa chỉ (số nhà, tên đường)</label><input type="text" name="address" value={formData.address} onChange={handleInputChange} className="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600" required /></div>
                <div>
                  <label className="text-sm text-slate-900 font-medium block mb-2">Tỉnh/Thành phố</label>
                  <select
                    name="state"
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    disabled={loadingProvinces}
                    className="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600"
                    required
                  >
                    <option value="">{loadingProvinces ? 'Đang tải...' : '-- Chọn tỉnh/thành --'}</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-900 font-medium block mb-2">Quận/Huyện</label>
                  <select
                    name="city"
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvince}
                    className="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600 disabled:bg-gray-100"
                    required
                  >
                    <option value="">-- Chọn quận/huyện --</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-900 font-medium block mb-2">Phường/Xã</label>
                  <select
                    name="zipCode"
                    value={selectedWard}
                    onChange={handleWardChange}
                    disabled={!selectedDistrict}
                    className="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600 disabled:bg-gray-100"
                    required
                  >
                    <option value="">-- Chọn phường/xã --</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-xl text-slate-900 font-semibold mb-6">Phương thức thanh toán</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className={`bg-gray-100 p-4 rounded-md border ${paymentMethod === 'vnpay' ? 'border-blue-600' : 'border-gray-300'} max-w-sm cursor-pointer`} onClick={() => setPaymentMethod('vnpay')}>
                  <div className="flex items-center">
                    <input type="radio" name="method" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 cursor-pointer" id="vnpay" />
                    <label htmlFor="vnpay" className="ml-4 cursor-pointer text-lg font-semibold">VNPAY</label>
                  </div>
                  <p className="mt-4 text-sm text-slate-500 font-medium">Thanh toán online qua cổng VNPAY Sandbox</p>
                </div>

                <div className={`bg-gray-100 p-4 rounded-md border ${paymentMethod === 'cod' ? 'border-blue-600' : 'border-gray-300'} max-w-sm cursor-pointer`} onClick={() => setPaymentMethod('cod')}>
                  <div className="flex items-center">
                    <input type="radio" name="method" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 cursor-pointer" id="cod" />
                    <label htmlFor="cod" className="ml-4 cursor-pointer text-lg font-semibold">COD</label>
                  </div>
                  <p className="mt-4 text-sm text-slate-500 font-medium">Thanh toán khi nhận hàng</p>
                </div>
              </div>
            </div>

            <div className="mt-12 max-w-md">
              <p className="text-slate-900 text-sm font-medium mb-2">Bạn có mã giảm giá?</p>
              <div className="flex gap-4">
                <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Nhập mã giảm giá" className="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600" />
                <button type="button" onClick={handleApplyPromo} className="flex items-center justify-center font-medium tracking-wide bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-md text-sm text-white cursor-pointer">Áp dụng</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
