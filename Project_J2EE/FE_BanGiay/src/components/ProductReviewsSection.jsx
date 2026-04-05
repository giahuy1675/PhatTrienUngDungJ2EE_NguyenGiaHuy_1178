import { useEffect, useState } from 'react';
import { Avatar, Button, Form, Input, List, Pagination, Rate } from 'antd';
import reviewService from '../services/reviewService';

const { TextArea } = Input;

function ProductReviewsSection({ productId, fallbackRating = 0, fallbackReviewCount = 0 }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [unreviewedOrderIds, setUnreviewedOrderIds] = useState([]);
  const [hasReviewedOnProduct, setHasReviewedOnProduct] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setCurrentPage(1);
    fetchReviews();
    checkCanReview();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getProductReviews(productId);
      const reviewList = data || [];
      setReviews(reviewList);

      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const hasReviewed = reviewList.some((review) => review?.author?.id === currentUser?.id);
      setHasReviewedOnProduct(hasReviewed);
    } catch (error) {
      console.error('Lỗi tải đánh giá:', error);
      setHasReviewedOnProduct(false);
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCanReview(false);
        setUnreviewedOrderIds([]);
        return;
      }
      const data = await reviewService.canReview(productId);
      setCanReview(!!data?.canReview);
      setUnreviewedOrderIds(data?.unreviewedOrderIds || []);
    } catch {
      setCanReview(false);
      setUnreviewedOrderIds([]);
    }
  };

  const submitReview = async () => {
    if (!newContent.trim()) return;
    if (unreviewedOrderIds.length === 0) {
      alert('Không tìm thấy đơn hàng để đánh giá');
      return;
    }
    try {
      setSubmitting(true);
      await reviewService.createReview(productId, {
        rating: newRating,
        content: newContent.trim(),
        orderId: unreviewedOrderIds[0],
      });
      setNewContent('');
      setNewRating(5);
      await fetchReviews();
      await checkCanReview();
    } catch (error) {
      console.error('Lỗi gửi đánh giá:', error);
      alert(error?.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const renderReview = (item, isReply = false) => (
    <div
      key={item.id}
      className={`${isReply ? 'mt-3 ml-8 border-l-2 border-gray-200 pl-4' : 'mt-4 border border-gray-200 rounded-lg p-4 bg-white'}`}
    >
      <div className="flex items-start gap-3">
        <Avatar>{(item.author?.fullName || 'U').charAt(0).toUpperCase()}</Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-800">{item.author?.fullName || 'Khách hàng'}</span>
            <span className="text-xs text-slate-500">
              {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}
            </span>
          </div>
          {!isReply && <Rate disabled allowHalf value={item.rating || 0} className="mt-1" />}
          <p className="mt-2 text-slate-700">{item.content}</p>

          {(item.replies || []).map((reply) => renderReview(reply, true))}
        </div>
      </div>
    </div>
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : fallbackRating.toFixed(1);

  const totalReview = reviews.length || fallbackReviewCount;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedReviews = reviews.slice(startIndex, endIndex);

  return (
    <div>
      <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Đánh giá khách hàng</h3>

      <div className="mt-4 flex items-center gap-4">
        <Rate disabled allowHalf value={Number(avgRating)} />
        <span className="text-slate-500 text-sm">{avgRating} / 5 ({totalReview} đánh giá)</span>
      </div>

      {canReview && unreviewedOrderIds.length > 0 && (
        <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-3">Viết đánh giá của bạn</h4>
          <Form layout="vertical">
            <Form.Item label="Số sao">
              <Rate allowHalf value={newRating} onChange={setNewRating} />
            </Form.Item>
            <Form.Item label="Nội dung">
              <TextArea rows={4} value={newContent} onChange={(e) => setNewContent(e.target.value)} />
            </Form.Item>
            <Button type="primary" loading={submitting} onClick={submitReview}>
              Gửi đánh giá
            </Button>
          </Form>
        </div>
      )}

      <div className="mt-6">
        <List
          loading={loading}
          dataSource={paginatedReviews}
          locale={{ emptyText: 'Chưa có đánh giá nào cho sản phẩm này.' }}
          renderItem={(item) => renderReview(item)}
        />

        {reviews.length > pageSize && (
          <div className="mt-4 flex justify-center">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={reviews.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductReviewsSection;
