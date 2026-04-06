import { useState } from 'react';
import { Upload, Button, Card, message, Spin, Descriptions, Steps, Alert, Divider, Tag, Typography, Row, Col } from 'antd';
import { InboxOutlined, CameraOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import footSizeService from '../services/footSizeService';

const { Dragger } = Upload;
const { Title, Text, Paragraph } = Typography;

function FootSizeCheckerPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ketQua, setKetQua] = useState(null);
  const navigate = useNavigate();

  // Xử lý khi chọn file
  const handleFile = (info) => {
    const f = info.file.originFileObj || info.file;

    // validate
    const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(f.type);
    if (!isImage) {
      message.error('Chỉ chấp nhận ảnh JPG, PNG hoặc WebP');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      message.error('Ảnh quá lớn, tối đa 5MB');
      return;
    }

    setFile(f);
    setKetQua(null);

    // tạo preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  // Gửi ảnh lên server
  const handleSubmit = async () => {
    if (!file) {
      message.warning('Chọn ảnh trước đã');
      return;
    }

    setLoading(true);
    try {
      const data = await footSizeService.phanTich(file);
      setKetQua(data);
      if (data.thanhCong) {
        message.success('Phân tích thành công!');
      } else {
        message.error(data.loi || 'Không thể phân tích ảnh này');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      message.error(msg);
      setKetQua({ thanhCong: false, loi: msg });
    } finally {
      setLoading(false);
    }
  };

  // Reset để thử lại
  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setKetQua(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Title level={2} className="text-center mb-2">
        📐 Nhận Dạng Kích Thước Chân
      </Title>
      <Text type="secondary" className="block text-center mb-8">
        Upload ảnh bàn chân để được gợi ý size giày phù hợp nhất
      </Text>

      <Row gutter={[24, 24]}>
        {/* CỘT TRÁI - UPLOAD + KẾT QUẢ */}
        <Col xs={24} md={14}>
          <Card className="shadow-md rounded-xl">
            {/* FORM UPLOAD */}
            {!ketQua && (
              <>
                {!preview ? (
                  <Dragger
                    accept="image/jpeg,image/png,image/webp"
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleFile}
                    style={{ padding: '30px 20px', borderRadius: 12 }}
                  >
                    <p className="text-5xl mb-4">📸</p>
                    <p className="text-lg font-semibold">Kéo thả ảnh vào đây hoặc click để chọn</p>
                    <p className="text-gray-400 text-sm">JPG, PNG, WebP — Tối đa 5MB</p>
                  </Dragger>
                ) : (
                  <div className="text-center">
                    <img
                      src={preview}
                      alt="preview"
                      style={{
                        maxWidth: 320, maxHeight: 320, borderRadius: 12,
                        border: '3px solid #1890ff', objectFit: 'cover'
                      }}
                    />
                    <div className="mt-3">
                      <Tag color="blue">{file?.name}</Tag>
                      <Button size="small" danger onClick={handleReset} className="ml-2">
                        Xóa ảnh
                      </Button>
                    </div>
                  </div>
                )}

                <div className="text-center mt-6">
                  <Button
                    type="primary" size="large"
                    icon={<CameraOutlined />}
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={!file}
                    style={{ borderRadius: 10, height: 48, paddingInline: 32, fontWeight: 600 }}
                  >
                    {loading ? 'Đang phân tích...' : 'Phân Tích Size Chân'}
                  </Button>
                </div>

                {loading && (
                  <div className="text-center mt-4">
                    <Spin size="large" />
                    <p className="text-gray-400 mt-2">Vui lòng đợi khoảng 10-15 giây...</p>
                  </div>
                )}
              </>
            )}

            {/* KẾT QUẢ THÀNH CÔNG */}
            {ketQua?.thanhCong && (
              <div>
                <Alert
                  type="success" showIcon
                  icon={<CheckCircleOutlined />}
                  message="Phân tích thành công!"
                  description="Dưới đây là size giày gợi ý dựa trên ảnh bàn chân của bạn"
                  className="mb-4"
                  style={{ borderRadius: 10 }}
                />

                {/* Bảng size */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'EU', value: ketQua.sizeEU, flag: '🇪🇺' },
                    { label: 'US', value: ketQua.sizeUS, flag: '🇺🇸' },
                    { label: 'UK', value: ketQua.sizeUK, flag: '🇬🇧' },
                    { label: 'VN (cm)', value: ketQua.sizeVN, flag: '🇻🇳' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="text-center p-4 rounded-xl"
                      style={{ background: '#f6f8fc', border: '1px solid #e8ecf1' }}
                    >
                      <div className="text-xl mb-1">{item.flag}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</div>
                      <div className="text-2xl font-bold mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Thông số */}
                <Descriptions bordered size="small" column={1} className="mb-4"
                              style={{ borderRadius: 10, overflow: 'hidden' }}>
                  <Descriptions.Item label="📏 Chiều dài">{ketQua.chieuDaiCm} cm</Descriptions.Item>
                  <Descriptions.Item label="↔️ Chiều rộng">{ketQua.chieuRongCm} cm</Descriptions.Item>
                  <Descriptions.Item label="🦶 Loại chân">{ketQua.loaiChan}</Descriptions.Item>
                </Descriptions>

                {/* Giải thích */}
                {ketQua.lyDo && (
                  <Card size="small" className="mb-3" style={{ borderRadius: 10, background: '#f0f5ff', borderColor: '#adc6ff' }}>
                    <Text strong>💡 Giải thích:</Text>
                    <Paragraph className="mb-0 mt-1">{ketQua.lyDo}</Paragraph>
                  </Card>
                )}

                {ketQua.loiKhuyen && (
                  <Card size="small" className="mb-3" style={{ borderRadius: 10, background: '#f6ffed', borderColor: '#b7eb8f' }}>
                    <Text strong>👟 Lời khuyên:</Text>
                    <Paragraph className="mb-0 mt-1">{ketQua.loiKhuyen}</Paragraph>
                  </Card>
                )}

                <Alert
                  type="warning" showIcon className="mb-4"
                  style={{ borderRadius: 10 }}
                  message="Kết quả mang tính tham khảo, có thể sai lệch ±0.5 size. Nên thử giày trực tiếp."
                />

                <div className="flex gap-3 justify-center">
                  <Button icon={<ReloadOutlined />} onClick={handleReset} size="large"
                          style={{ borderRadius: 10 }}>
                    Thử Lại
                  </Button>
                  <Button type="primary" icon={<ShoppingCartOutlined />}
                          onClick={() => navigate('/products')} size="large"
                          style={{ borderRadius: 10 }}>
                    Xem Giày
                  </Button>
                </div>
              </div>
            )}

            {/* KẾT QUẢ THẤT BẠI */}
            {ketQua && !ketQua.thanhCong && (
              <div>
                <Alert
                  type="error" showIcon
                  icon={<CloseCircleOutlined />}
                  message="Không thể phân tích"
                  description={ketQua.loi || 'Vui lòng thử lại với ảnh khác'}
                  className="mb-4"
                  style={{ borderRadius: 10 }}
                />
                <div className="text-center">
                  <Button icon={<ReloadOutlined />} onClick={handleReset} size="large" type="primary"
                          style={{ borderRadius: 10 }}>
                    Chụp Ảnh Lại
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* CỘT PHẢI - HƯỚNG DẪN CHỤP ẢNH */}
        <Col xs={24} md={10}>
          <Card
            className="shadow-md rounded-xl"
            style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fcd34d' }}
          >
            <Title level={5} className="mb-4">
              📷 Hướng Dẫn Chụp Ảnh
            </Title>

            <Steps
              direction="vertical" size="small"
              items={[
                {
                  title: 'Chuẩn bị',
                  description: 'Cởi giày, tất. Đặt chân trần trên sàn sáng màu (gạch trắng, sàn gỗ sáng). Lấy 1 tờ giấy A4 bất kỳ.',
                  status: 'process',
                },
                {
                  title: 'Đặt vị trí',
                  description: 'Đặt tờ A4 ngay bên cạnh chân phải, cạnh dài (29.7cm) chạy dọc song song với chiều dài bàn chân. Giấy nằm phẳng, không gấp cong.',
                  status: 'process',
                },
                {
                  title: 'Tư thế chân',
                  description: 'Đứng thẳng, dồn đều trọng lượng. Các ngón chân duỗi tự nhiên, không co hay bấm ngón.',
                  status: 'process',
                },
                {
                  title: 'Chụp ảnh',
                  description: 'Giơ điện thoại cách sàn ~60cm, chụp THẲNG TỪ TRÊN XUỐNG (vuông góc 90°). Đảm bảo cả bàn chân và tờ A4 nằm gọn trong khung hình.',
                  status: 'process',
                },
                {
                  title: 'Kiểm tra ảnh',
                  description: 'Ảnh phải rõ nét, đủ sáng, không bị mờ hay tối. Nếu chưa ổn thì chụp lại.',
                  status: 'process',
                },
              ]}
            />

            <Divider style={{ borderColor: '#fcd34d' }} />

            {/* Minh họa nhanh */}
            <div className="text-center p-4 rounded-xl" style={{ background: 'white' }}>
              <div className="text-4xl mb-2">🦶 📄</div>
              <Text type="secondary" className="text-xs">
                Chân trần + Giấy A4 bên cạnh + Nền sáng + Chụp từ trên
              </Text>
            </div>

            <Divider style={{ borderColor: '#fcd34d' }} />

            <div>
              <Text strong className="text-red-600">⚠️ Lưu ý quan trọng:</Text>
              <ul className="text-sm mt-2 mb-0 pl-4" style={{ color: '#92400e' }}>
                <li>Chỉ chụp <strong>1 chân</strong> (nên chân phải)</li>
                <li>Không chụp nghiêng, xiên góc</li>
                <li>Nền phải <strong>sáng, đơn sắc</strong> (tránh nền hoa văn)</li>
                <li>Tờ A4 phải <strong>nằm phẳng</strong> trên sàn</li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default FootSizeCheckerPage;
