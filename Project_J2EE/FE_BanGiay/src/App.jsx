import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import VnpayReturnPage from './pages/VnpayReturnPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'
import FootSizeCheckerPage from './pages/FootSizeCheckerPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminReportDashboard from './pages/admin/AdminReportDashboard'
import AdminProductManagement from './pages/admin/AdminProductManagement'
import AdminOrderManagement from './pages/admin/AdminOrderManagement'
import AdminUserManagement from './pages/admin/AdminUserManagement'
import AdminCategoryManagement from './pages/admin/AdminCategoryManagement'
import AdminBrandManagement from './pages/admin/AdminBrandManagement'
import AdminReviewManagement from './pages/admin/AdminReviewManagement'
import { CartProvider } from './contexts/CartContext'

function App() {
  return (
    <CartProvider>
      <Routes>
        {/* Routes với MainLayout (có Navbar + Footer) */}
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/products" element={<MainLayout><ProductsPage /></MainLayout>} />
        <Route path="/product/:id" element={<MainLayout><ProductDetailPage /></MainLayout>} />
        <Route path="/cart" element={<MainLayout><CartPage /></MainLayout>} />
        <Route path="/checkout" element={<MainLayout><CheckoutPage /></MainLayout>} />
        <Route path="/payment/vnpay-return" element={<MainLayout><VnpayReturnPage /></MainLayout>} />
        <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
        <Route path="/orders" element={<MainLayout><OrdersPage /></MainLayout>} />
        <Route path="/foot-size-checker" element={<MainLayout><FootSizeCheckerPage /></MainLayout>} />
        <Route path="/about" element={<MainLayout><div className="container mx-auto px-4 py-8"><h1 className="text-2xl font-bold">Giới thiệu</h1></div></MainLayout>} />
        <Route path="/contact" element={<MainLayout><div className="container mx-auto px-4 py-8"><h1 className="text-2xl font-bold">Liên hệ</h1></div></MainLayout>} />

        {/* Routes Auth dùng MainLayout để đồng bộ Header + Footer */}
        <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
        <Route path="/register" element={<MainLayout><RegisterPage /></MainLayout>} />

        {/* Admin Routes với AdminLayout (Sidebar riêng) */}
        <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/reports" element={<AdminLayout><AdminReportDashboard /></AdminLayout>} />
        <Route path="/admin/products" element={<AdminLayout><AdminProductManagement /></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><AdminOrderManagement /></AdminLayout>} />
        <Route path="/admin/categories" element={<AdminLayout><AdminCategoryManagement /></AdminLayout>} />
        <Route path="/admin/brands" element={<AdminLayout><AdminBrandManagement /></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><AdminUserManagement /></AdminLayout>} />
        <Route path="/admin/reviews" element={<AdminLayout><AdminReviewManagement /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><div className="p-8"><h1 className="text-3xl font-bold">Cài Đặt</h1></div></AdminLayout>} />
      </Routes>
    </CartProvider>
  )
}

export default App
