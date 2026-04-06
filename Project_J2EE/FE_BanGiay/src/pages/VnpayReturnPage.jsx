import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import orderService from '../services/orderService';
import Loading from '../components/Loading';
import Breadcrumb from '../components/Breadcrumb';
import { useCart } from '../contexts/CartContext';

function VnpayReturnPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const verify = async () => {
      if (location.state?.success) {
        setResult(location.state);
        setLoading(false);
        return;
      }

      try {
        const query = location.search.startsWith('?') ? location.search.slice(1) : location.search;
        const res = await orderService.verifyVnpayReturn(query);
        setResult(res);
        if (res?.success) {
          await clearCart();
        }
      } catch (error) {
        setResult({
          success: false,
          message: error.response?.data?.message || 'Không thể xác minh thanh toán VNPAY',
        });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [location.search, location.state, clearCart]);

  if (loading) return <Loading />;

  const isSuccess = result?.success;
  const isCod = result?.paymentMethod === 'COD';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: isCod ? 'Đặt hàng thành công' : 'Thanh toán VNPAY' }]} />

      <div className="mt-6 flex justify-center">
        <Result
          status={isSuccess ? 'success' : 'error'}
          title={isSuccess ? (isCod ? 'Đặt hàng thành công!' : 'Thanh toán thành công!') : 'Thanh toán thất bại hoặc bị hủy'}
          subTitle={
            isSuccess
              ? isCod
                ? result?.message || 'Đơn hàng của bạn đã được ghi nhận.'
                : `Mã tham chiếu thanh toán: ${result?.txnRef || 'Không xác định'}`
              : result?.message || 'Không rõ trạng thái thanh toán'
          }
          extra={[
            <Button type="primary" key="orders" onClick={() => navigate('/orders')}>
              Xem đơn hàng
            </Button>,
            <Button key="home" onClick={() => navigate('/')}>Về trang chủ</Button>,
          ]}
        />
      </div>

      {isSuccess && !isCod && (
        <div className="mt-4 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Mã giao dịch (VNPAY TxnRef):</span>{' '}
            {result?.txnRef || 'Không xác định'}
          </p>
          <p>
            <span className="font-semibold">Mã phản hồi:</span>{' '}
            {result?.responseCode || 'Không xác định'}
          </p>
          <p className="mt-2 text-gray-600">
            Bạn có thể vào trang <span className="font-semibold">Đơn hàng của tôi</span> để xem chi tiết đơn hàng
            và trạng thái thanh toán.
          </p>
        </div>
      )}

      {isSuccess && isCod && (
        <div className="mt-4 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Mã đơn hàng:</span>{' '}
            {result?.txnRef || 'Không xác định'}
          </p>
          <p className="mt-2 text-gray-600">
            Bạn có thể vào trang <span className="font-semibold">Đơn hàng của tôi</span> để xem chi tiết đơn hàng
            và trạng thái giao hàng.
          </p>
        </div>
      )}
    </div>
  );
}

export default VnpayReturnPage;
