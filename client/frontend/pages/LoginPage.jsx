import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAppContext } from "../contexts/AppContext"

export default function LoginPage() {
  const {
    showRegister,
    setShowRegister,
    handleLogin,
    handleRegister,
    currentUser,
  } = useAppContext()

  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === "admin" ? "/admin" : "/")
    }
  }, [currentUser, navigate])

  const onLogin = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const email = formData.get("email")
    const password = formData.get("password")
    const success = handleLogin(email, password)

    if (success) {
      navigate(currentUser?.role === "admin" ? "/admin" : "/")
    } else {
      alert("Thông tin đăng nhập không chính xác")
    }
  }

  const onRegister = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      province: formData.get("province"),
      district: formData.get("district"),
      ward: formData.get("ward"),
      address: formData.get("address"),
    }

    const result = handleRegister(payload)
    if (result.success) {
      alert("Đăng ký thành công!")
      setShowRegister(false)
    } else {
      alert(result.message || "Có lỗi xảy ra khi đăng ký")
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {showRegister ? "Đăng ký tài khoản" : "Đăng nhập"}
          </h1>
          <p className="text-gray-600 mt-2">
            {showRegister ? "Tạo tài khoản mới" : "Chào mừng bạn quay trở lại"}
          </p>
        </div>

        {!showRegister ? (
          <form onSubmit={onLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mật khẩu</label>
              <input
                type="password"
                name="password"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Đăng nhập
            </button>
            <div className="text-sm text-center">
              Chưa có tài khoản?{" "}
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => setShowRegister(true)}
              >
                Đăng ký OKe Phu le login page
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={onRegister} className="space-y-3">
            <input
              name="name"
              placeholder="Họ tên"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
            <input
              name="phone"
              placeholder="Điện thoại"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                name="province"
                placeholder="Tỉnh"
                className="px-3 py-2 border border-gray-300 rounded"
                required
              />
              <input
                name="district"
                placeholder="Huyện"
                className="px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            <input
              name="ward"
              placeholder="Xã"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
            <input
              name="address"
              placeholder="Địa chỉ cụ thể"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Đăng ký
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}