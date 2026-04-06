import { useState, useEffect } from 'react';
import { Pagination, notification } from 'antd';
import axios from 'axios';

function AdminBrandManagement() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deletingBrand, setDeletingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    isActive: true
  });
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/brands/admin/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBrands(response.data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name || '',
      description: brand.description || '',
      logo: brand.logo || '',
      isActive: brand.isActive !== undefined ? brand.isActive : true
    });
    setLogoPreview(brand.logo || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setFormData({
      name: '',
      description: '',
      logo: '',
      isActive: true
    });
    setLogoPreview('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notification.warning({
          message: 'Cảnh báo',
          description: 'Kích thước ảnh phải nhỏ hơn 5MB'
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => ({ ...prev, logo: base64String }));
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:8080/api/brands/admin/${editingBrand.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      notification.success({
        message: 'Thành công',
        description: 'Cập nhật thương hiệu thành công!'
      });
      handleCloseModal();
      fetchBrands();
    } catch (error) {
      console.error('Error updating brand:', error);
      notification.error({
        message: 'Thất bại',
        description: 'Có lỗi khi cập nhật thương hiệu!'
      });
    }
  };

  const handleDeleteClick = (brand) => {
    setDeletingBrand(brand);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/brands/admin/${deletingBrand.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      notification.success({
        message: 'Thành công',
        description: 'Xóa thương hiệu thành công!'
      });
      setIsDeleteModalOpen(false);
      setDeletingBrand(null);
      fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      notification.error({
        message: 'Thất bại',
        description: 'Không thể xóa thương hiệu này!'
      });
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingBrand(null);
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      description: '',
      logo: '',
      isActive: true
    });
    setLogoPreview('');
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:8080/api/brands/admin',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      notification.success({
        message: 'Thành công',
        description: 'Thêm thương hiệu thành công!'
      });
      setIsAddModalOpen(false);
      fetchBrands();
    } catch (error) {
      console.error('Error adding brand:', error);
      notification.error({
        message: 'Thất bại',
        description: 'Có lỗi khi thêm thương hiệu!'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter brands based on search
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBrands = filteredBrands.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);

  if (loading) {
    return <div className="p-8">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Thương Hiệu</h1>
          <p className="text-gray-600 mt-2">Quản lý thương hiệu sản phẩm trong hệ thống</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Thêm Thương Hiệu
        </button>
      </div>

      <div className="overflow-x-auto p-6">
        <div className="flex gap-4 flex-wrap justify-between items-center mb-4">
          <div className="flex items-center px-4 py-2 rounded-md bg-white border border-gray-300 overflow-hidden max-w-xs w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904"
              className="fill-gray-600 mr-2 w-4 h-4">
              <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z" />
            </svg>
            <input 
              type="text" 
              placeholder="Tìm kiếm thương hiệu..." 
              className="w-full outline-none bg-transparent text-slate-600 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="min-w-full border border-gray-200">
          <thead className="bg-white whitespace-nowrap">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-[13px] font-medium text-slate-600 border-r border-gray-200">
                Thương Hiệu
              </th>
              <th className="px-4 py-3 text-left text-[13px] font-medium text-slate-600 border-r border-gray-200">
                Mô Tả
              </th>
              <th className="px-4 py-3 text-left text-[13px] font-medium text-slate-600 border-r border-gray-200">
                Số Sản Phẩm
              </th>
              <th className="px-4 py-3 text-left text-[13px] font-medium text-slate-600 border-r border-gray-200">
                Ngày Tạo
              </th>
              <th className="px-4 py-3 text-left text-[13px] font-medium text-slate-600 border-r border-gray-200">
                Trạng Thái
              </th>
              <th className="px-4 py-3 text-left text-[13px] font-medium text-slate-600">
                Thao Tác
              </th>
            </tr>
          </thead>

          <tbody className="whitespace-nowrap divide-y divide-gray-200">
            {currentBrands.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  {searchTerm ? 'Không tìm thấy thương hiệu nào' : 'Chưa có thương hiệu nào'}
                </td>
              </tr>
            ) : (
              currentBrands.map((brand) => (
                <tr key={brand.id} className="odd:bg-gray-50">
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="flex items-center w-max">
                      {brand.logo ? (
                        <img 
                          src={brand.logo} 
                          alt={brand.name}
                          className="w-[40px] h-[40px] object-contain bg-white rounded"
                        />
                      ) : (
                        <div className="w-[40px] h-[40px] shrink-0 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {brand.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="text-[13px] text-slate-900 font-medium">{brand.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <p className="text-[13px] text-slate-600 max-w-xs truncate">{brand.description || '-'}</p>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {brand.productCount || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <p className="text-[13px] text-slate-600">{formatDate(brand.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold ${
                      brand.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {brand.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(brand)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Chỉnh sửa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(brand)}
                        className="text-red-600 hover:text-red-800"
                        title="Xóa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 gap-4">
            <p className="text-sm text-gray-600">
              Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredBrands.length)} trong {filteredBrands.length} thương hiệu
            </p>
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={filteredBrands.length}
              onChange={(page, size) => {
                setCurrentPage(page);
                if (size !== itemsPerPage) {
                  setItemsPerPage(size);
                }
              }}
              showSizeChanger
              pageSizeOptions={["10", "20", "50", "100"]}
            />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Chỉnh Sửa Thương Hiệu</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Thương Hiệu *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô Tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Thương Hiệu
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {logoPreview && (
                  <div className="mt-2">
                    <img src={logoPreview} alt="Logo Preview" className="h-20 object-contain" />
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Kích hoạt</span>
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Thêm Thương Hiệu Mới</h2>
            <form onSubmit={handleAddSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Thương Hiệu *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô Tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Thương Hiệu
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {logoPreview && (
                  <div className="mt-2">
                    <img src={logoPreview} alt="Logo Preview" className="h-20 object-contain" />
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Kích hoạt</span>
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingBrand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-600">Xác Nhận Xóa</h2>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa thương hiệu <strong>{deletingBrand.name}</strong>?
              <br />
              <span className="text-sm text-gray-600">Thao tác này không thể hoàn tác.</span>
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBrandManagement;
