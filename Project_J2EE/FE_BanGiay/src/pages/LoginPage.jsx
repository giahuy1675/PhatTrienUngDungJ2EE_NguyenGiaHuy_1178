import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    if (name === 'identifier') {
      if (!value.trim()) return 'Email hoặc số điện thoại không được để trống';
      return '';
    }

    if (name === 'password') {
      if (!value.trim()) return 'Mật khẩu không được để trống';
      return '';
    }

    return '';
  };

  const validateForm = () => {
    const nextErrors = {
      identifier: validateField('identifier', formData.identifier),
      password: validateField('password', formData.password)
    };

    setFieldErrors(nextErrors);
    setTouched({ identifier: true, password: true });

    return !nextErrors.identifier && !nextErrors.password;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }));

    if (name === 'identifier' || name === 'password') {
      setFieldErrors(prev => ({
        ...prev,
        [name]: validateField(name, nextValue)
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'identifier' || name === 'password') {
      setTouched(prev => ({ ...prev, [name]: true }));
      setFieldErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await login(formData.identifier, formData.password);
      
      if (response.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/số điện thoại và mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await loginWithGoogle(credentialResponse.credential);
      if (response.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
  };

  const getFieldClass = (field) => {
    if (!touched[field]) return 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    if (fieldErrors[field]) return 'border-red-500 focus:ring-red-500 focus:border-red-500';
    return 'border-green-500 focus:ring-green-500 focus:border-green-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} noValidate>
          <h5 className="text-xl font-semibold text-gray-900 mb-6">Đăng nhập tài khoản</h5>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="identifier" className="block mb-2.5 text-sm font-medium text-gray-900">
              Email hoặc số điện thoại
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full px-3 py-2.5 shadow-xs placeholder:text-gray-400 ${getFieldClass('identifier')}`}
              placeholder="example@company.com hoặc 09xxxxxxxx"
            />
            {touched.identifier && fieldErrors.identifier && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.identifier}</p>
            )}
            {touched.identifier && !fieldErrors.identifier && (
              <p className="mt-1 text-sm text-green-600">Thông tin đăng nhập hợp lệ</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block mb-2.5 text-sm font-medium text-gray-900">
              Mật khẩu
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
            {touched.password && fieldErrors.password && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
            )}
            {touched.password && !fieldErrors.password && (
              <p className="mt-1 text-sm text-green-600">Mật khẩu đã được nhập</p>
            )}
          </div>

          <div className="flex items-start my-6">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-blue-300"
              />
              <label htmlFor="rememberMe" className="ms-2 text-sm font-medium text-gray-900">
                Ghi nhớ đăng nhập
              </label>
            </div>
            <Link to="/forgot-password" className="ms-auto text-sm font-medium text-blue-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 shadow-xs font-medium leading-5 rounded-lg text-sm px-4 py-2.5 focus:outline-none w-full mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-500">Hoặc</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
          </div>

          <div className="text-sm font-medium text-gray-600 mt-4">
            Chưa có tài khoản? <Link to="/register" className="text-blue-600 hover:underline">Đăng ký ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
