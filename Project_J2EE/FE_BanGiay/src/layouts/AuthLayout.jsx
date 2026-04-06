// Layout cho các trang authentication (Login, Register)
// Không có Navbar và Footer

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}

export default AuthLayout;
