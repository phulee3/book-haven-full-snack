import { useAppContext } from "../../contexts/AppContext"
import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { currentUser } = useAppContext()

    // Nếu chưa đăng nhập => chuyển về trang chủ (ứng xử login ở header bằng modal)
    if (!currentUser) {
        return <Navigate to="/" replace />
    }

    // Nếu cần quyền admin mà người dùng không phải admin => về trang chủ
    if (requireAdmin && currentUser.role !== "admin") {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute