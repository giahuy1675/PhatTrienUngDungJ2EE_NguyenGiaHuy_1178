import { Badge, Pagination, notification } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [bulkDiscount, setBulkDiscount] = useState('');
  const [bulkDurationHours, setBulkDurationHours] = useState('24');
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    stockQuantity: '',
    brandId: '',
    categoryId: '',
    image: '',
    color: '',
    colors: '',
    sizes: '',
    variants: '[]', // JSON array of color variants
    tag: '',
    isFeatured: false,
    isActive: true
  });
  const [priceDisplay, setPriceDisplay] = useState('');
  const [originalPriceDisplay, setOriginalPriceDisplay] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  // Variant management states
  const [variants, setVariants] = useState([]);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);
  const [variantForm, setVariantForm] = useState({
    color: '#000000',
    colorName: '',
    mainImage: '',
    images: [],
    stockQuantity: 0
  });
  const [variantImagePreviews, setVariantImagePreviews] = useState([]);
  const [variantMainImagePreview, setVariantMainImagePreview] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/products', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      let data = response.data;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/brands');
      setBrands(response.data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      stockQuantity: '',
      brandId: '',
      categoryId: '',
      image: '',
      color: '',
      colors: '',
      sizes: '',
      tag: '',
      isFeatured: false,
      isActive: true
    });
    setPriceDisplay('');
    setOriginalPriceDisplay('');
    setImagePreview('');
    setImageFile(null);
    setAdditionalPreviews([]);
    setAdditionalImages([]);
    setVariants([]);
    setIsAddModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);

    // Parse colors nếu là JSON string
    let colorsStr = '';
    if (product.colors) {
      if (typeof product.colors === 'string') {
        try {
          const colorsParsed = JSON.parse(product.colors);
          colorsStr = Array.isArray(colorsParsed) ? colorsParsed.join(', ') : product.colors;
        } catch (e) {
          colorsStr = product.colors;
        }
      } else if (Array.isArray(product.colors)) {
        colorsStr = product.colors.join(', ');
      }
    }

    // Parse sizes nếu là JSON string
    let sizesStr = '';
    if (product.sizes) {
      if (typeof product.sizes === 'string') {
        try {
          const sizesParsed = JSON.parse(product.sizes);
          sizesStr = Array.isArray(sizesParsed) ? sizesParsed.join(', ') : product.sizes;
        } catch (e) {
          sizesStr = product.sizes;
        }
      } else if (Array.isArray(product.sizes)) {
        sizesStr = product.sizes.join(', ');
      }
    }

    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      stockQuantity: product.stockQuantity || '',
      brandId: product.brand?.id || '',
      categoryId: product.category?.id || '',
      image: product.image || '',
      color: product.color || '',
      colors: colorsStr,
      sizes: sizesStr,
      tag: product.tag || '',
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== undefined ? product.isActive : true
    });

    // Format giá hiển thị
    setPriceDisplay(product.price ? product.price.toLocaleString('vi-VN') : '');
    setOriginalPriceDisplay(product.originalPrice ? product.originalPrice.toLocaleString('vi-VN') : '');

    // Hiển thị ảnh chính hiện tại
    if (product.image) {
      setImagePreview(product.image);
      setImageFile(null);
    } else {
      setImagePreview('');
      setImageFile(null);
    }

    // Hiển thị ảnh phụ hiện tại - parse JSON nếu cần
    if (product.images) {
      let imagesList = [];
      if (typeof product.images === 'string') {
        try {
          imagesList = JSON.parse(product.images);
        } catch (e) {
          console.error('Error parsing images:', e);
        }
      } else if (Array.isArray(product.images)) {
        imagesList = product.images;
      }
      setAdditionalPreviews(imagesList);
      setAdditionalImages([]);
    } else {
      setAdditionalPreviews([]);
      setAdditionalImages([]);
    }

    // Load variants if exists
    if (product.variants) {
      try {
        const variantsList = typeof product.variants === 'string'
          ? JSON.parse(product.variants)
          : product.variants;
        setVariants(Array.isArray(variantsList) ? variantsList : []);
      } catch (e) {
        console.error('Error parsing variants:', e);
        setVariants([]);
      }
    } else {
      setVariants([]);
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      stockQuantity: '',
      brandId: '',
      categoryId: '',
      image: '',
      color: '',
      colors: '',
      sizes: '',
      tag: '',
      isFeatured: false,
      isActive: true
    });
    // Reset state ảnh
    setImagePreview('');
    setImageFile(null);
    setAdditionalPreviews([]);
    setAdditionalImages([]);
    setPriceDisplay('');
    setOriginalPriceDisplay('');
    setVariants([]);
  };

  // Variant management functions
  const handleAddVariant = () => {
    setVariantForm({
      color: '#000000',
      colorName: '',
      mainImage: '',
      images: [],
      stockQuantity: 0
    });
    setVariantImagePreviews([]);
    setVariantMainImagePreview('');
    setEditingVariantIndex(null);
    setIsVariantModalOpen(true);
  };

  const handleEditVariant = (index) => {
    const variant = variants[index];
    setVariantForm({
      color: variant.color || '#000000',
      colorName: variant.colorName || '',
      mainImage: variant.mainImage || '',
      images: variant.images || [],
      stockQuantity: variant.stockQuantity || 0
    });
    setVariantImagePreviews(variant.images || []);
    setVariantMainImagePreview(variant.mainImage || '');
    setEditingVariantIndex(index);
    setIsVariantModalOpen(true);
  };

  const handleDeleteVariant = (index) => {
    if (confirm('Bạn có chắc muốn xóa màu này?')) {
      const newVariants = variants.filter((_, i) => i !== index);
      setVariants(newVariants);
    }
  };

  const handleVariantFormChange = (e) => {
    const { name, value } = e.target;
    setVariantForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVariantImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 6) {
      notification.warning({
      message: 'Cảnh báo',
      description: 'Chỉ được chọn tối đa 6 ảnh cho mỗi màu!'
    });
      return;
    }

    const previews = [];
    const imageFiles = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length) {
          setVariantImagePreviews(previews);
          setVariantForm(prev => ({
            ...prev,
            images: previews
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVariantMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVariantMainImagePreview(reader.result);
        setVariantForm(prev => ({
          ...prev,
          mainImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveVariant = () => {
    if (!variantForm.colorName) {
      notification.warning({
        message: 'Cảnh báo',
        description: 'Vui lòng nhập tên màu!'
      });
      return;
    }
    if (!variantForm.mainImage) {
      notification.warning({
        message: 'Cảnh báo',
        description: 'Vui lòng chọn ảnh chính!'
      });
      return;
    }
    if (!variantForm.images || variantForm.images.length === 0) {
      notification.warning({
        message: 'Cảnh báo',
        description: 'Vui lòng chọn ít nhất 1 ảnh phụ!'
      });
      return;
    }

    const newVariant = {
      color: variantForm.color,
      colorName: variantForm.colorName,
      mainImage: variantForm.mainImage,
      images: variantForm.images,
      stockQuantity: parseInt(variantForm.stockQuantity) || 0
    };

    if (editingVariantIndex !== null) {
      // Update existing variant
      const newVariants = [...variants];
      newVariants[editingVariantIndex] = newVariant;
      setVariants(newVariants);
    } else {
      // Add new variant
      setVariants([...variants, newVariant]);
    }

    setIsVariantModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'price') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, price: numericValue }));
      setPriceDisplay(numericValue ? parseInt(numericValue).toLocaleString('vi-VN') : '');
    } else if (name === 'originalPrice') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, originalPrice: numericValue }));
      setOriginalPriceDisplay(numericValue ? parseInt(numericValue).toLocaleString('vi-VN') : '');
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert comma-separated strings to JSON string for backend
      const colorsArray = formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(c => c) : [];
      const sizesArray = formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(s => s) : [];

      const payload = {
        ...editingProduct,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
        stockQuantity: parseInt(formData.stockQuantity),
        brand: formData.brandId ? { id: parseInt(formData.brandId) } : null,
        image: imagePreview || formData.image,
        images: JSON.stringify(additionalPreviews),
        color: formData.color,
        colors: JSON.stringify(colorsArray), // Convert to JSON string
        sizes: JSON.stringify(sizesArray), // Convert to JSON string
        variants: JSON.stringify(variants), // Save variants
        tag: formData.tag,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        category: {
          id: parseInt(formData.categoryId)
        }
      };

      await axios.put(
        `http://localhost:8080/api/admin/products/${editingProduct.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      notification.success({
        message: 'Thành công',
        description: 'Cập nhật sản phẩm thành công!'
      });
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      notification.error({
        message: 'Thất bại',
        description: 'Có lỗi khi cập nhật sản phẩm!'
      });
    }
  };

  const handleDeleteClick = (product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;

    try {
      const response = await axios.delete(`http://localhost:8080/api/admin/products/${deletingProduct.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Check if response has message
      if (response.data && response.data.message) {
        notification.info({
          message: 'Thông báo',
          description: response.data.message
        });
      } else {
        notification.success({
          message: 'Thành công',
          description: 'Xóa sản phẩm thành công!'
        });
      }

      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error.response && error.response.data && error.response.data.error) {
        notification.error({
          message: 'Thất bại',
          description: 'Lỗi: ' + error.response.data.error
        });
      } else {
        notification.error({
          message: 'Thất bại',
          description: 'Có lỗi khi xóa sản phẩm!'
        });
      }
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingProduct(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    try {
      const colorsArray = formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(c => c) : [];
      const sizesArray = formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(s => s) : [];

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice) || 0,
        stockQuantity: parseInt(formData.stockQuantity),
        brand: formData.brandId ? { id: parseInt(formData.brandId) } : null,
        image: imagePreview || formData.image || '',
        images: JSON.stringify(additionalPreviews),
        color: formData.color || '',
        colors: JSON.stringify(colorsArray),
        sizes: JSON.stringify(sizesArray),
        variants: JSON.stringify(variants),
        tag: formData.tag || '',
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        category: {
          id: parseInt(formData.categoryId)
        }
      };

      await axios.post(
        'http://localhost:8080/api/admin/products',
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      notification.success({
        message: 'Thành công',
        description: 'Thêm sản phẩm thành công!'
      });
      setIsAddModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      notification.error({
        message: 'Thất bại',
        description: 'Có lỗi khi thêm sản phẩm!'
      });
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(currentProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const toggleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handleApplyBulkDiscount = async () => {
    if (selectedProducts.length === 0) {
      notification.warning({
        message: 'Cảnh báo',
        description: 'Vui lòng chọn ít nhất 1 sản phẩm để giảm giá!'
      });
      return;
    }

    const discountValue = Number(bulkDiscount);
    if (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
      notification.warning({
        message: 'Cảnh báo',
        description: 'Phần trăm giảm giá phải trong khoảng 0 đến 100'
      });
      return;
    }

    const durationValue = Number(bulkDurationHours);
    if (Number.isNaN(durationValue) || durationValue <= 0) {
      notification.warning({
        message: 'Cảnh báo',
        description: 'Thời gian giảm giá (giờ) phải lớn hơn 0'
      });
      return;
    }

    try {
      await axios.put(
        'http://localhost:8080/api/admin/products/discount',
        {
          productIds: selectedProducts,
          discountPercentage: discountValue,
          durationHours: durationValue
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      notification.success({
        message: 'Thành công',
        description: `Đã áp dụng giảm ${discountValue}% trong ${durationValue} giờ cho ${selectedProducts.length} sản phẩm`
      });
      setBulkDiscount('');
      setBulkDurationHours('24');
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error applying bulk discount:', error);
      const message = error.response?.data?.error || 'Có lỗi khi áp dụng giảm giá!';
      notification.error({
        message: 'Thất bại',
        description: message
      });
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 inline mr-1" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M7 0L9.4687 3.60213L13.6574 4.83688L10.9944 8.29787L11.1145 12.6631L7 11.2L2.8855 12.6631L3.00556 8.29787L0.342604 4.83688L4.5313 3.60213L7 0Z"
            fill={i <= rating ? "#facc15" : "#CED5D8"}
          />
        </svg>
      );
    }
    return stars;
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Sản Phẩm</h1>
          <p className="text-gray-600 mt-2">Quản lý toàn bộ sản phẩm trong hệ thống</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Thêm Sản Phẩm
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            Đã chọn: {selectedProducts.length} sản phẩm
          </span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={bulkDiscount}
            onChange={(e) => setBulkDiscount(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Nhập % giảm"
            className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="number"
            min="1"
            step="1"
            value={bulkDurationHours}
            onChange={(e) => setBulkDurationHours(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Số giờ"
            className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleApplyBulkDiscount}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm disabled:opacity-50"
            disabled={selectedProducts.length === 0 || bulkDiscount === '' || bulkDurationHours === ''}
          >
            Áp dụng giảm giá
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 whitespace-nowrap">
              <tr>
                <th className="pl-4 w-8">
                  <input
                    id="checkbox-all"
                    type="checkbox"
                    className="hidden peer"
                    checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <label
                    htmlFor="checkbox-all"
                    className="relative flex items-center justify-center p-0.5 peer-checked:before:hidden before:block before:absolute before:w-full before:h-full before:bg-white w-4 h-4 cursor-pointer bg-blue-500 border border-gray-400 rounded overflow-hidden"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-full fill-white" viewBox="0 0 520 520">
                      <path d="M79.423 240.755a47.529 47.529 0 0 0-36.737 77.522l120.73 147.894a43.136 43.136 0 0 0 36.066 16.009c14.654-.787 27.884-8.626 36.319-21.515L486.588 56.773a6.13 6.13 0 0 1 .128-.2c2.353-3.613 1.59-10.773-3.267-15.271a13.321 13.321 0 0 0-19.362 1.343q-.135.166-.278.327L210.887 328.736a10.961 10.961 0 0 1-15.585.843l-83.94-76.386a47.319 47.319 0 0 0-31.939-12.438z" />
                    </svg>
                  </label>
                </th>
                <th className="p-4 text-left text-sm font-semibold text-slate-900">Sản Phẩm</th>
                <th className="p-4 text-left text-sm font-semibold text-slate-900">Giá</th>
                <th className="p-4 text-left text-sm font-semibold text-slate-900">Tồn Kho</th>
                <th className="p-4 text-left text-sm font-semibold text-slate-900">Danh Mục</th>
                <th className="p-4 text-left text-sm font-semibold text-slate-900">Trạng Thái</th>
                <th className="p-4 text-left text-sm font-semibold text-slate-900">Đánh Giá</th>
                <th className="p-4 text-left text-sm font-semibold text-slate-900">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="whitespace-nowrap divide-y divide-gray-200">
              {currentProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(product);
                  }}
                >
                  <td className="pl-4 w-8">
                    <input
                      id={`checkbox-${product.id}`}
                      type="checkbox"
                      className="hidden peer"
                      checked={selectedProducts.includes(product.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelectProduct(product.id)}
                    />
                    <label
                      htmlFor={`checkbox-${product.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="relative flex items-center justify-center p-0.5 peer-checked:before:hidden before:block before:absolute before:w-full before:h-full before:bg-white w-4 h-4 cursor-pointer bg-blue-500 border border-gray-400 rounded overflow-hidden"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-full fill-white" viewBox="0 0 520 520">
                        <path d="M79.423 240.755a47.529 47.529 0 0 0-36.737 77.522l120.73 147.894a43.136 43.136 0 0 0 36.066 16.009c14.654-.787 27.884-8.626 36.319-21.515L486.588 56.773a6.13 6.13 0 0 1 .128-.2c2.353-3.613 1.59-10.773-3.267-15.271a13.321 13.321 0 0 0-19.362 1.343q-.135.166-.278.327L210.887 328.736a10.961 10.961 0 0 1-15.585.843l-83.94-76.386a47.319 47.319 0 0 0-31.939-12.438z" />
                      </svg>
                    </label>
                  </td>
                  <td className="p-4 text-sm text-slate-900 font-medium">
                    <div className="flex items-center cursor-pointer">
                      <img
                        src={product.image || product.imageUrl || 'https://via.placeholder.com/40'}
                        alt={product.name}
                        className="w-10 h-10 p-1.5 shrink-0 bg-gray-100 object-cover"
                      />
                      <div className="mx-4">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{product.name}</p>
                          {(product.discountPercentage > 0 && product.discountEndAt && new Date(product.discountEndAt) > new Date()) && (
                            <Badge color="red" text="Đang giảm giá" />
                          )}
                        </div>
                        {product.brand && <p className="text-xs text-gray-500">{product.brand.name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-medium">
                    {product.price?.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-medium">
                    {product.stockQuantity || 0}
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-medium">
                    {product.category?.name || 'N/A'}
                  </td>
                  <td className="p-4">
                    {product.isActive !== false ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Đang bán
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Ngừng bán
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {renderStars(product.rating || 4)}
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(product);
                      }}
                      title="Edit"
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(product);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="md:flex m-4 items-center justify-between gap-4">
            <p className="text-sm text-gray-500 flex-1">
              Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, products.length)} trong tổng số {products.length} sản phẩm
            </p>

            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={products.length}
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
      </div>

      {/* Modal Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto">
          <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-8 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center">
              <h3 className="text-blue-600 text-xl font-semibold flex-1">Chỉnh Sửa Sản Phẩm</h3>
              <svg
                onClick={handleCloseModal}
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5 ml-2 cursor-pointer shrink-0 fill-gray-400 hover:fill-red-500"
                viewBox="0 0 320.591 320.591"
              >
                <path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z" />
                <path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z" />
              </svg>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-900 text-sm mb-2 block">Tên sản phẩm</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nhập tên sản phẩm"
                    required
                    className="px-4 py-3 bg-gray-100 w-full text-slate-900 text-sm border-none focus:outline-blue-600 focus:bg-transparent rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-slate-900 text-sm mb-2 block">Danh mục</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-3 bg-gray-100 w-full text-slate-900 text-sm border-none focus:outline-blue-600 focus:bg-transparent rounded-lg"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-900 text-sm mb-2 block">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder='Viết mô tả về sản phẩm'
                  className="px-4 py-3 bg-gray-100 w-full text-slate-900 text-sm border-none focus:outline-blue-600 focus:bg-transparent rounded-lg"
                  rows="2"
                ></textarea>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-slate-900 text-sm mb-2 block">Giá bán</label>
                  <input
                    type="text"
                    name="price"
                    value={priceDisplay}
                    onChange={handleInputChange}
                    placeholder="Nhập giá bán"
                    required
                    className="px-4 py-3 bg-gray-100 w-full text-slate-900 text-sm border-none focus:outline-blue-600 focus:bg-transparent rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-slate-900 text-sm mb-2 block">Giá gốc</label>
                  <input
                    type="text"
                    name="originalPrice"
                    value={originalPriceDisplay}
                    onChange={handleInputChange}
                    placeholder="Nhập giá gốc"
                    className="px-4 py-3 bg-gray-100 w-full text-slate-900 text-sm border-none focus:outline-blue-600 focus:bg-transparent rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-900 text-sm mb-2 block">Số lượng</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    placeholder="Nhập số lượng"
                    required
                    className="px-4 py-3 bg-gray-100 w-full text-slate-900 text-sm border-none focus:outline-blue-600 focus:bg-transparent rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-slate-900 text-sm mb-2 block">Thương hiệu *</label>
                  <select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-3 bg-gray-100 w-full text-slate-900 text-sm border-none focus:outline-blue-600 focus:bg-transparent rounded-lg"
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-900 text-sm mb-2 block">Ảnh chính</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result);
                          setFormData(prev => ({ ...prev, image: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="px-4 py-3 bg-gray-100 w-full text-slate-900 text-sm border-none focus:outline-blue-600 focus:bg-transparent rounded-lg"
                  />
                  {imagePreview ? (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border" />
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500 italic">Chưa có ảnh chính. Chọn file để tải lên.</p>
                  )}
                </div>

                <div>
                  <label className="text-slate-900 text-sm mb-2 block">Ảnh phụ (nhiều ảnh)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setAdditionalImages(files);

                      const previews = [];
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          previews.push(reader.result);
                          if (previews.length === files.length) {
                            setAdditionalPreviews([...previews]);
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    className="px-4 py-3 bg-gray-100 w-full text-slate-900 text-sm border-none focus:outline-blue-600 focus:bg-transparent rounded-lg"
                  />
                  {additionalPreviews.length > 0 ? (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {additionalPreviews.map((preview, index) => (
                        <img key={index} src={preview} alt={`Preview ${index + 1}`} className="h-16 w-16 object-cover rounded-lg border" />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500 italic">Chưa có ảnh phụ. Chọn các file để tải lên.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-900 text-sm mb-2 block">Màu chính (mã hex)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="#cf1322"
                      className="px-4 py-3 bg-gray-100 flex-1 text-slate-900 text-sm border-none focus:outline-blue-600 focus:bg-transparent rounded-lg"
                    />
                    {formData.color && formData.color.startsWith('#') && (
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-gray-300"
                        style={{ backgroundColor: formData.color }}
                        title={formData.color}
                      ></div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-slate-900 text-sm mb-2 block">Tag/Nhãn</label>
                  <input
                    type="text"
                    name="tag"
                    value={formData.tag}
                    onChange={handleInputChange}
                    placeholder="hot, sale, new"
                    className="px-4 py-3 bg-gray-100 w-full text-slate-900 text-sm border-none focus:outline-blue-600 focus:bg-transparent rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-900 text-sm mb-2 block">Các màu (mã hex, phân cách dấu phẩy)</label>
                  <input
                    type="text"
                    name="colors"
                    value={formData.colors}
                    onChange={handleInputChange}
                    placeholder="#000000, #ffffff, #1890ff"
                    className="px-4 py-3 bg-gray-100 w-full text-slate-900 text-sm border-none focus:outline-blue-600 focus:bg-transparent rounded-lg"
                  />
                  {formData.colors && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {formData.colors.split(',').map((color, index) => {
                        const trimmedColor = color.trim();
                        if (trimmedColor.startsWith('#')) {
                          return (
                            <div
                              key={index}
                              className="w-8 h-8 rounded border-2 border-gray-300"
                              style={{ backgroundColor: trimmedColor }}
                              title={trimmedColor}
                            ></div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-slate-900 text-sm mb-2 block">Các size (phân cách dấu phẩy)</label>
                  <input
                    type="text"
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleInputChange}
                    placeholder="38, 39, 40, 41, 42"
                    className="px-4 py-3 bg-gray-100 w-full text-slate-900 text-sm border-none focus:outline-blue-600 focus:bg-transparent rounded-lg"
                  />
                </div>
              </div>

              {/* Variants Section */}
              <div className="mb-4 border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-slate-900">Biến thể sản phẩm (Màu sắc & Ảnh)</h4>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2"
                  >
                    + Thêm màu
                  </button>
                </div>

                {variants.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">Chưa có biến thể màu nào. Nhấn "Thêm màu" để thêm.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {variants.map((variant, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded border-2 border-gray-300"
                              style={{ backgroundColor: variant.color }}
                            ></div>
                            <div>
                              <p className="font-semibold text-slate-900">{variant.colorName}</p>
                              <p className="text-xs text-gray-500">{variant.color}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditVariant(index)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Sửa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVariant(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Xóa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Tồn kho: <span className="font-semibold">{variant.stockQuantity}</span>
                        </p>

                        {/* Main Image */}
                        {variant.mainImage && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-1">Ảnh chính:</p>
                            <img
                              src={variant.mainImage}
                              alt={`${variant.colorName} main`}
                              className="w-full h-32 object-cover rounded border-2 border-blue-500"
                            />
                          </div>
                        )}

                        {/* Additional Images */}
                        {variant.images && variant.images.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Ảnh phụ:</p>
                            <div className="flex flex-wrap gap-1">
                              {variant.images.slice(0, 4).map((img, imgIndex) => (
                                <img
                                  key={imgIndex}
                                  src={img}
                                  alt={`${variant.colorName} ${imgIndex + 1}`}
                                  className="w-12 h-12 object-cover rounded border"
                                />
                              ))}
                              {variant.images.length > 4 && (
                                <div className="w-12 h-12 flex items-center justify-center bg-gray-300 rounded border text-xs font-semibold">
                                  +{variant.images.length - 4}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-6 items-center">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isFeatured" className="ml-2 text-sm text-slate-900">Sản phẩm nổi bật</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-slate-900">Đang hoạt động</label>
                </div>
              </div>

              <div className="flex gap-4 !mt-8">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg cursor-pointer text-white text-sm font-medium border-none outline-none tracking-wide bg-blue-600 hover:bg-blue-700"
                >
                  Cập nhật
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 rounded-lg cursor-pointer text-slate-900 text-sm font-medium border-none outline-none tracking-wide bg-gray-200 hover:bg-gray-300"
                >
                  Hủy
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
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-6 text-center">
              <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Bạn có chắc chắn muốn xóa sản phẩm <span className="font-semibold text-gray-900 dark:text-white">{deletingProduct?.name}</span>?
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

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000]">
          <div className="fixed inset-0 bg-gray-900 opacity-50" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-800 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Thêm Sản Phẩm Mới
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 md:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tên sản phẩm</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Danh mục</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Giá bán</label>
                  <input
                    type="text"
                    name="price"
                    value={priceDisplay}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Giá gốc</label>
                  <input
                    type="text"
                    name="originalPrice"
                    value={originalPriceDisplay}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Số lượng</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Thương hiệu *</label>
                  <select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ảnh chính</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ảnh phụ</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setAdditionalImages(files);
                      const previews = [];
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          previews.push(reader.result);
                          if (previews.length === files.length) {
                            setAdditionalPreviews(previews);
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {additionalPreviews.map((preview, index) => (
                      <img key={index} src={preview} alt={`Preview ${index}`} className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Màu chính</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="#000000"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                    {formData.color && (
                      <div
                        className="w-12 h-10 rounded border border-gray-300"
                        style={{ backgroundColor: formData.color }}
                      ></div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tag</label>
                  <input
                    type="text"
                    name="tag"
                    value={formData.tag}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Màu sắc (phân cách bằng dấu phẩy, ví dụ: #ff0000, #00ff00)</label>
                  <input
                    type="text"
                    name="colors"
                    value={formData.colors}
                    onChange={handleInputChange}
                    placeholder="#ff0000, #00ff00, #0000ff"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                  {formData.colors && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.colors.split(',').map((color, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <div
                            className="w-8 h-8 rounded border border-gray-300"
                            style={{ backgroundColor: color.trim() }}
                          ></div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">{color.trim()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Kích thước (phân cách bằng dấu phẩy, ví dụ: 38, 39, 40)</label>
                  <input
                    type="text"
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleInputChange}
                    placeholder="38, 39, 40, 41, 42"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
              </div>

              {/* Variants Section */}
              <div className="mb-4 border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Biến thể sản phẩm (Màu sắc & Ảnh)</h4>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2"
                  >
                    + Thêm màu
                  </button>
                </div>

                {variants.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">Chưa có biến thể màu nào. Nhấn "Thêm màu" để thêm.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {variants.map((variant, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded border-2 border-gray-300"
                              style={{ backgroundColor: variant.color }}
                            ></div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{variant.colorName}</p>
                              <p className="text-xs text-gray-500">{variant.color}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditVariant(index)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Sửa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVariant(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Xóa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          Tồn kho: <span className="font-semibold">{variant.stockQuantity}</span>
                        </p>

                        {/* Main Image */}
                        {variant.mainImage && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-1">Ảnh chính:</p>
                            <img
                              src={variant.mainImage}
                              alt={`${variant.colorName} main`}
                              className="w-full h-32 object-cover rounded border-2 border-blue-500"
                            />
                          </div>
                        )}

                        {/* Additional Images */}
                        {variant.images && variant.images.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Ảnh phụ:</p>
                            <div className="flex flex-wrap gap-1">
                              {variant.images.slice(0, 4).map((img, imgIndex) => (
                                <img
                                  key={imgIndex}
                                  src={img}
                                  alt={`${variant.colorName} ${imgIndex + 1}`}
                                  className="w-12 h-12 object-cover rounded border"
                                />
                              ))}
                              {variant.images.length > 4 && (
                                <div className="w-12 h-12 flex items-center justify-center bg-gray-300 rounded border text-xs font-semibold">
                                  +{variant.images.length - 4}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Sản phẩm nổi bật</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Kích hoạt</label>
                </div>
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
                  Thêm sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Variant Modal */}
      {isVariantModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[1001]">
          <div className="fixed inset-0 bg-gray-900 opacity-50" onClick={() => setIsVariantModalOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-800 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingVariantIndex !== null ? 'Chỉnh Sửa Màu' : 'Thêm Màu Mới'}
              </h3>
              <button
                onClick={() => setIsVariantModalOpen(false)}
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            <div className="p-4 md:p-5">
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mã màu</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="color"
                    value={variantForm.color}
                    onChange={handleVariantFormChange}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    name="color"
                    value={variantForm.color}
                    onChange={handleVariantFormChange}
                    placeholder="#000000"
                    className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tên màu</label>
                <input
                  type="text"
                  name="colorName"
                  value={variantForm.colorName}
                  onChange={handleVariantFormChange}
                  placeholder="Ví dụ: Đỏ tươi, Nâu đậm..."
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Số lượng tồn kho</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={variantForm.stockQuantity}
                  onChange={handleVariantFormChange}
                  min="0"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Ảnh chính <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleVariantMainImageChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {variantMainImagePreview && (
                  <div className="mt-3">
                    <img
                      src={variantMainImagePreview}
                      alt="Main preview"
                      className="w-full h-48 object-cover rounded border-2 border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Ảnh phụ (tối đa 6 ảnh)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleVariantImagesChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {variantImagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-2">
                    {variantImagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded border-2 border-gray-300"
                        />
                        <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVariantModalOpen(false)}
                  className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveVariant}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  {editingVariantIndex !== null ? 'Cập nhật' : 'Thêm màu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProductManagement;

