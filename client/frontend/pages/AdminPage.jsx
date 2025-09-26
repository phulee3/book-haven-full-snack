import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { useAppContext } from "../contexts/AppContext"
import AdminSidebar from "../components/admin/AdminSidebar"

const AdminPage = () => {
  const {
    orders,
    users,
    categories,
    products,
    handleLogout,
    navigate
  } = useAppContext()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // close sidebar on route change (mobile)
    setSidebarOpen(false)
  }, [location.pathname])

  // Get current tab from URL
  const getCurrentTab = () => {
    const path = location.pathname
    if (path === "/admin" || path === "/admin/") return "dashboard"
    return path.split("/admin/")[1] || "dashboard"
  }

  const currentTab = getCurrentTab()

  const handleLogoutClick = () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      handleLogout()
      navigate("/", { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          orders={orders}
          users={users}
          categories={categories}
          products={products}
          currentTab={currentTab}
          onLogout={handleLogoutClick}
        />

        {/* Main content */}
        <div className="flex-1 min-h-screen lg:ml-64">
          {/* Mobile top bar */}
          <div className="lg:hidden bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                aria-label="Mở menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                title="Về trang chủ"
              >

                Trang chủ
              </button>
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between">

              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                title="Về trang chủ"
              >

                Trang chủ
              </button>
            </div>
          </div>

          <main className="p-4 lg:p-6 min-h-[calc(100vh-6rem)]">
            <div className="max-w-none mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminPage