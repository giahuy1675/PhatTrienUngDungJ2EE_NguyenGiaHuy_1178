import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, Rate, Select, Switch, Tag, message } from 'antd';
import reviewService from '../../services/reviewService';

function AdminReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getAdminReviews();
      setReviews(data || []);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const rootReviews = useMemo(() => {
    let data = reviews.filter((r) => !r.parentId);

    if (statusFilter === 'active') {
      data = data.filter((r) => r.isActive);
    }

    if (statusFilter === 'inactive') {
      data = data.filter((r) => !r.isActive);
    }

    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      data = data.filter((r) =>
        (r.productName || '').toLowerCase().includes(q) ||
        (r.author?.fullName || '').toLowerCase().includes(q) ||
        (r.content || '').toLowerCase().includes(q)
      );
    }

    return data;
  }, [reviews, keyword, statusFilter]);

  const repliesByParent = useMemo(() => {
    const map = new Map();
    reviews
      .filter((r) => r.parentId)
      .forEach((reply) => {
        const arr = map.get(reply.parentId) || [];
        arr.push(reply);
        map.set(reply.parentId, arr);
      });
    return map;
  }, [reviews]);

  const toggleActive = async (review) => {
    try {
      await reviewService.toggleReviewActive(review.id, !review.isActive);
      message.success('Cập nhật trạng thái thành công');
      fetchReviews();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const openReplyModal = (review) => {
    setSelectedReview(review);
    setReplyContent('');
    setReplyModalOpen(true);
  };

  const submitReply = async () => {
    if (!selectedReview) return;
    if (!replyContent.trim()) {
      message.warning('Vui lòng nhập nội dung phản hồi');
      return;
    }

    try {
      setSubmitting(true);
      await reviewService.replyAsAdmin(selectedReview.id, replyContent.trim());
      message.success('Phản hồi thành công');
      setReplyModalOpen(false);
      setSelectedReview(null);
      setReplyContent('');
      fetchReviews();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Không thể phản hồi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đánh giá</h1>
        <p className="text-gray-600 mt-2">Theo dõi đánh giá sản phẩm và phản hồi khách hàng</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Tìm theo sản phẩm, khách hàng, nội dung..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="max-w-md"
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-44"
          options={[
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: 'active', label: 'Đang hiển thị' },
            { value: 'inactive', label: 'Đã ẩn' },
          ]}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : rootReviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không có đánh giá phù hợp</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {rootReviews.map((review) => {
              const replies = repliesByParent.get(review.id) || [];
              return (
                <div key={review.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800">{review.author?.fullName || 'Khách hàng'}</span>
                        <Tag color="blue">{review.productName || `SP #${review.productId}`}</Tag>
                        <Tag>Order #{review.orderId || '-'}</Tag>
                        <span className="text-xs text-slate-500">
                          {review.createdAt ? new Date(review.createdAt).toLocaleString('vi-VN') : ''}
                        </span>
                      </div>
                      <Rate disabled value={review.rating || 0} />
                      <p className="mt-2 text-slate-700">{review.content}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">Ẩn/Hiện</span>
                      <Switch checked={!!review.isActive} onChange={() => toggleActive(review)} />
                      <Button type="primary" onClick={() => openReplyModal(review)} disabled={!review.isActive}>
                        Reply
                      </Button>
                    </div>
                  </div>

                  {replies.length > 0 && (
                    <div className="mt-3 pl-6 border-l-2 border-gray-200 space-y-2">
                      {replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 rounded p-3">
                          <div className="text-sm font-medium text-slate-800">
                            {reply.author?.fullName || 'Admin'}
                            <span className="ml-2 text-xs text-slate-500">
                              {reply.createdAt ? new Date(reply.createdAt).toLocaleString('vi-VN') : ''}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 mt-1">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        title="Phản hồi đánh giá"
        open={replyModalOpen}
        onCancel={() => setReplyModalOpen(false)}
        footer={null}
      >
        <Input.TextArea
          rows={4}
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Nhập nội dung phản hồi cho khách hàng..."
        />
        <div className="flex justify-end mt-4">
          <Button type="primary" loading={submitting} onClick={submitReply}>
            Gửi phản hồi
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminReviewManagement;
