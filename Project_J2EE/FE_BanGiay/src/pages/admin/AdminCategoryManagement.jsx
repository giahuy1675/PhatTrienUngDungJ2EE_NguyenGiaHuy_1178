import { useState, useEffect } from 'react';
import { Pagination, notification } from 'antd';
import axios from 'axios';

function AdminCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/categories/admin/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        await axios.delete(`http://localhost:8080/api/admin/categories/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        notification.error({
          message: 'Thất bại',
          description: 'Không thể xóa danh mục này!'
        });
      }
    }
  };

  const handleEdit = (category) => {
    console.log('Editing category:', category); // Debug log
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      isActive: category.isActive !== undefined ? category.isActive : true
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting update for category:', editingCategory);
    console.log('Form data:', formData);
    try {
      const url = `http://localhost:8080/api/categories/admin/${editingCategory.id}`;
      console.log('PUT URL:', url);
      
      await axios.put(
        url,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      notification.success({
        message: 'Thành công',
        description: 'Cập nhật danh mục thành công!'
      });
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      console.error('Error response:', error.response?.data);
      notification.error({
        message: 'Thất bại',
        description: 'Có lỗi khi cập nhật danh mục!'
      });
    }
  };

  const handleDeleteClick = (category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/categories/admin/${deletingCategory.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      notification.success({
        message: 'Thành công',
        description: 'Xóa danh mục thành công!'
      });
      setIsDeleteModalOpen(false);
      setDeletingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      notification.error({
          message: 'Thất bại',
          description: 'Không thể xóa danh mục này!'
        });
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingCategory(null);
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:8080/api/categories/admin',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      notification.success({
        message: 'Thành công',
        description: 'Thêm danh mục thành công!'
      });
      setIsAddModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      notification.error({
        message: 'Thất bại',
        description: 'Có lỗi khi thêm danh mục!'
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

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  if (loading) {
    return <div className="p-8">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Danh Mục</h1>
          <p className="text-gray-600 mt-2">Quản lý danh mục sản phẩm trong hệ thống</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Thêm Danh Mục
        </button>
      </div>

      <div className="overflow-x-auto p-6">
        <div className="flex gap-4 flex-wrap justify-between items-center mb-4">
          <div className="flex items-center px-4 py-2 rounded-md bg-white border border-gray-300 overflow-hidden max-w-xs w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904"
              className="fill-gray-600 mr-2 w-4 h-4">
              <path
                d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z">
              </path>
            </svg>
            <input 
              type="text" 
              placeholder="Tìm kiếm danh mục..." 
              className="w-full outline-none bg-transparent text-slate-600 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            type='button'
            className="text-slate-900 font-medium flex items-center px-4 py-2 rounded-md bg-white hover:bg-gray-50 border border-gray-300 overflow-hidden cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2 fill-current inline" viewBox="0 0 67.671 67.671">
              <path d="M52.946 23.348H42.834v6h10.112c3.007 0 5.34 1.536 5.34 2.858v26.606c0 1.322-2.333 2.858-5.34 2.858H14.724c-3.007 0-5.34-1.536-5.34-2.858V32.207c0-1.322 2.333-2.858 5.34-2.858h10.11v-6h-10.11c-6.359 0-11.34 3.891-11.34 8.858v26.606c0 4.968 4.981 8.858 11.34 8.858h38.223c6.358 0 11.34-3.891 11.34-8.858V32.207c-.001-4.968-4.982-8.859-11.341-8.859z" />
              <path d="M24.957 14.955a2.99 2.99 0 0 0 2.121-.879l3.756-3.756v30.522a3 3 0 1 0 6 0V10.117l3.959 3.959c.586.586 1.354.879 2.121.879s1.535-.293 2.121-.879a2.998 2.998 0 0 0 0-4.242L36.078.877A2.987 2.987 0 0 0 33.958 0h-.046c-.767 0-1.534.291-2.12.877l-8.957 8.957a2.998 2.998 0 0 0 2.122 5.121z" />
            </svg>
            Export
          </button>
        </div>

        <table className="min-w-full border border-gray-200">
          <thead className="bg-white whitespace-nowrap">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-[13px] font-medium text-slate-600 border-r border-gray-200">
                Tên Danh Mục
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
              <th className="px-4 py-3 text-left text-[13px] font-medium text-slate-600 border-r border-gray-200">
                Thao Tác
              </th>
            </tr>
          </thead>

          <tbody className="whitespace-nowrap divide-y divide-gray-200">
            {currentCategories.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  {searchTerm ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào'}
                </td>
              </tr>
            ) : (
              currentCategories.map((category) => (
                <tr key={category.id} className="odd:bg-gray-50">
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="flex items-center w-max">
                      {category.imageUrl ? (
                        <img 
                          src={category.imageUrl} 
                          alt={category.name}
                          className="w-[18px] h-[18px] shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="w-[18px] h-[18px] shrink-0 rounded bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="ml-2">
                        <p className="text-[13px] text-slate-900 font-medium">{category.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-900 font-medium border-r border-gray-200">
                    {category.description ? (
                      <span className="line-clamp-2">{category.description}</span>
                    ) : (
                      <span className="text-gray-400 italic">Chưa có mô tả</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-900 font-medium border-r border-gray-200">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {category.productCount || 0} sản phẩm
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-900 font-medium border-r border-gray-200">
                    {formatDate(category.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium border-r border-gray-200">
                    {category.isActive ? (
                      <span className="text-green-600">Đang hoạt động</span>
                    ) : (
                      <span className="text-red-500">Ngừng hoạt động</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800 text-[13px] font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(category)}
                        className="text-red-600 hover:text-red-800 text-[13px] font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="md:flex mt-6 m-4 items-center justify-between gap-4">
          <p className="text-sm text-slate-600 flex-1">
            Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredCategories.length)} trong tổng số {filteredCategories.length} danh mục
          </p>

          <Pagination
            current={currentPage}
            pageSize={itemsPerPage}
            total={filteredCategories.length}
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
      </div>

      {/* Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000]">
          <div className="fixed inset-0 bg-gray-900 opacity-50" onClick={handleCloseModal}></div>
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-800 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Chỉnh Sửa Danh Mục
              </h3>
              <button
                onClick={handleCloseModal}
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-5">
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tên danh mục</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000]">
          <div className="fixed inset-0 bg-gray-900 opacity-50" onClick={handleDeleteCancel}></div>
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 max-w-md w-full mx-4">
            <button
              onClick={handleDeleteCancel}
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-6 text-center">
              <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
              </svg>
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Bạn có chắc chắn muốn xóa danh mục <span className="font-semibold text-gray-900 dark:text-white">{deletingCategory?.name}</span>?
              </h3>
              <button
                onClick={handleDeleteConfirm}
                type="button"
                className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
              >
                Có, tôi chắc chắn
              </button>
              <button
                onClick={handleDeleteCancel}
                type="button"
                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
              >
                Không, hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000]">
          <div className="fixed inset-0 bg-gray-900 opacity-50" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-800 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Thêm Danh Mục Mới
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 md:p-5">
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tên danh mục</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Thêm danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategoryManagement;
