import { useAppContext } from "../contexts/AppContext"

export default function LoginModal({ isOpen, onClose }) {
    const { showRegister, setShowRegister, loading, handleLogin, handleRegister } = useAppContext()

    const onLoginSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        handleLogin(formData.get("email"), formData.get("password")).then(success => {
            if (success) onClose()
        })
    }

    const onRegisterSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const payload = {
            first_name: formData.get("firstName"),
            last_name: formData.get("lastName"),
            email: formData.get("email"),
            password: formData.get("password"),
            phone: formData.get("phone"),
            city: formData.get("city"),
            district: formData.get("district"),
            ward: formData.get("ward"),
            address: formData.get("address")
        }
        handleRegister(payload)
    }

    if (!isOpen) return null
    return (
        <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {showRegister ? "Đăng ký tài khoản" : "Đăng nhập"}
                    </h1>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {!showRegister ? (
                    <form onSubmit={onLoginSubmit} className="space-y-4">
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
                            disabled={loading}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </button>
                        <div className="text-sm text-center">
                            Chưa có tài khoản?{" "}
                            <button
                                type="button"
                                className="text-blue-600 hover:underline"
                                onClick={() => setShowRegister(true)}
                            >
                                Đăng ký tài khoản
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={onRegisterSubmit} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                name="firstName"
                                placeholder="Tên"
                                className="px-3 py-2 border border-gray-300 rounded"
                                required
                            />
                            <input
                                name="lastName"
                                placeholder="Họ"
                                className="px-3 py-2 border border-gray-300 rounded"
                                required
                            />
                        </div>
                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            required
                        />
                        <input
                            name="password"
                            type="password"
                            placeholder="Mật khẩu"
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            required
                        />
                        <input
                            name="phone"
                            placeholder="Điện thoại"
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                name="city"
                                placeholder="Thành phố"
                                className="px-3 py-2 border border-gray-300 rounded"
                            />
                            <input
                                name="district"
                                placeholder="Quận/Huyện"
                                className="px-3 py-2 border border-gray-300 rounded"
                            />
                        </div>
                        <input
                            name="ward"
                            placeholder="Phường/Xã"
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                        <input
                            name="address"
                            placeholder="Địa chỉ cụ thể"
                            className="w-full px-3 py-2 border border-gray-300 rounded"
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
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? "Đang đăng ký..." : "Đăng ký"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
