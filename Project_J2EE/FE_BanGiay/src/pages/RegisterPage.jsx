import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value, currentFormData) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email không được trống';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email không hợp lệ';
        return '';

      case 'password':
        if (!value) return 'Mật khẩu không được trống';
        if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
        return '';

      case 'confirmPassword':
        if (!value) return 'Vui lòng xác nhận mật khẩu';
        if (currentFormData.password !== value) return 'Mật khẩu xác nhận không khớp';
        return '';

      case 'fullName':
        if (!value) return 'Họ tên không được trống';
        if (value.length < 2 || value.length > 100) return 'Họ tên phải từ 2-100 ký tự';
        return '';

      case 'phoneNumber':
        if (value && !/^[0-9]{10,15}$/.test(value)) return 'Số điện thoại không hợp lệ (10-15 số)';
        return '';

      case 'address':
        if (value && value.length > 500) return 'Địa chỉ không được vượt quá 500 ký tự';
        return '';

      default:
        return '';
    }
  };

  const validateForm = () => {
    const fields = ['email', 'password', 'confirmPassword', 'fullName', 'phoneNumber', 'address'];
    const newErrors = {};

    fields.forEach((field) => {
      const message = validateField(field, formData[field], formData);
      if (message) newErrors[field] = message;
    });

    setErrors(newErrors);
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      fullName: true,
      phoneNumber: true,
      address: true
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextFormData = {
      ...formData,
      [name]: value
    };

    setFormData(nextFormData);

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, nextFormData)
      }));
    }

    if (name === 'password' && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField('confirmPassword', nextFormData.confirmPassword, nextFormData)
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, formData)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber || null,
        address: formData.address || null
      };

      await register(registerData);
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const getFieldClass = (fieldName) => {
    if (!touched[fieldName]) {
      return 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    }

    if (errors[fieldName]) {
      return 'border-red-500 focus:ring-red-500 focus:border-red-500';
    }

    return 'border-green-500 focus:ring-green-500 focus:border-green-500';
  };

  const renderHelperText = (fieldName, successText) => {
    if (!touched[fieldName]) return null;
    if (errors[fieldName]) return <p className="mt-1 text-sm text-red-500">{errors[fieldName]}</p>;
    return <p className="mt-1 text-sm text-green-600">{successText}</p>;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} noValidate>
          <h5 className="text-xl font-semibold text-gray-900 mb-6">Đăng ký tài khoản</h5>
          
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block mb-2.5 text-sm font-medium text-gray-900">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full px-3 py-2.5 shadow-xs placeholder:text-gray-400 ${getFieldClass('email')}`}
              placeholder="example@company.com"
            />
            {renderHelperText('email', 'Email hợp lệ')}
          </div>

          <div className="mb-4">
            <label htmlFor="fullName" className="block mb-2.5 text-sm font-medium text-gray-900">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full px-3 py-2.5 shadow-xs placeholder:text-gray-400 ${getFieldClass('fullName')}`}
              placeholder="Nguyễn Văn A"
            />
            {renderHelperText('fullName', 'Họ tên hợp lệ')}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block mb-2.5 text-sm font-medium text-gray-900">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full px-3 py-2.5 shadow-xs placeholder:text-gray-400 ${getFieldClass('password')}`}
              placeholder="•••••••••"
            />
            {renderHelperText('password', 'Mật khẩu hợp lệ')}
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block mb-2.5 text-sm font-medium text-gray-900">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full px-3 py-2.5 shadow-xs placeholder:text-gray-400 ${getFieldClass('confirmPassword')}`}
              placeholder="•••••••••"
            />
            {renderHelperText('confirmPassword', 'Mật khẩu xác nhận khớp')}
          </div>

          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block mb-2.5 text-sm font-medium text-gray-900">
              Số điện thoại
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full px-3 py-2.5 shadow-xs placeholder:text-gray-400 ${getFieldClass('phoneNumber')}`}
              placeholder="0123456789"
            />
            {renderHelperText('phoneNumber', 'Số điện thoại hợp lệ')}
          </div>

          <div className="mb-6">
            <label htmlFor="address" className="block mb-2.5 text-sm font-medium text-gray-900">
              Địa chỉ
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="2"
              className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full px-3 py-2.5 shadow-xs placeholder:text-gray-400 ${getFieldClass('address')}`}
              placeholder="Nhập địa chỉ của bạn"
            />
            {renderHelperText('address', 'Địa chỉ hợp lệ')}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 shadow-xs font-medium leading-5 rounded-lg text-sm px-4 py-2.5 focus:outline-none w-full mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          <div className="text-sm font-medium text-gray-600">
            Đã có tài khoản? <Link to="/login" className="text-blue-600 hover:underline">Đăng nhập ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
