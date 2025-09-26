"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAppContext } from "../contexts/AppContext"
import Pagination from "../components/common/Pagination"

const STATUS_META = {
    pending: { label: "Chờ xác nhận", badge: "bg-yellow-100 text-yellow-800", icon: "⏳" },
    processing: { label: "Đang xử lý", badge: "bg-blue-100 text-blue-800", icon: "🔧" },
    shipped: { label: "Giao hàng thành công", badge: "bg-green-100 text-green-800", icon: "✅" },
    completed: { label: "Giao hàng thành công", badge: "bg-green-100 text-green-800", icon: "✅" },
    cancelled: { label: "Đã hủy", badge: "bg-red-100 text-red-800", icon: "❌" }
}

const TAB_CONFIG = [
    { key: "pending", label: "Chờ xác nhận", icon: "⏳" },
    { key: "processing", label: "Đang xử lý", icon: "🔧" },
    { key: "success", label: "Giao hàng thành công", icon: "✅" },
    { key: "cancelled", label: "Đã hủy", icon: "❌" }
]

const normalizeStatus = (raw) => {
    if (!raw) return "pending"
    const s = raw.toString().toLowerCase()
    if (s === "accept" || s === "accepted" || s === "confirmed") return "processing"
    if (["pending", "processing", "shipped", "completed", "cancelled"].includes(s)) return s
    if (s === "delivered") return "completed"
    return "pending"
}

const canCancelStatus = (status) => {
    const normalizedStatus = normalizeStatus(status)
    return normalizedStatus === "pending" || normalizedStatus === "processing"
}

const ORDERS_PER_PAGE = 5

// Component phụ cho các trạng thái sớm
const NotLoggedIn = ({ navigate }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
            <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem đơn hàng</p>
            <button
                onClick={() => navigate("/")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
                Về trang chủ
            </button>
        </div>
    </div>
)

const LoadingOrders = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
    </div>
)

const ErrorOrders = ({ error, fetchOrders }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
            <p className="text-red-600 mb-4">Lỗi: {error}</p>
            <button
                onClick={() => fetchOrders?.()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
                Thử lại
            </button>
        </div>
    </div>
)

const OrderPage = () => {
    const navigate = useNavigate()
    const {
        currentUser,
        orders = [],
        products = [],
        fetchOrders,
        getOrderById,
        cancelOrder,
        updateOrderStatus,
        loading,
        error
    } = useAppContext()

    // 🔹 Tất cả hook luôn gọi ở top-level
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [cancelingId, setCancelingId] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [activeTab, setActiveTab] = useState("pending")
    const [processedOrders, setProcessedOrders] = useState(new Set())
    const verifyRef = useRef(false)

    const actionBtnBase = "inline-flex items-center px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

    const userOrders = useMemo(
        () => orders
            .map(o => ({ ...o, status: normalizeStatus(o.status) }))
            .filter(o => String(o.user_id) === String(currentUser?.id)),
        [orders, currentUser]
    )

    const filteredOrders = useMemo(() => {
        switch (activeTab) {
            case "pending":
                return userOrders.filter(o => o.status === "pending")
            case "processing":
                return userOrders.filter(o => o.status === "processing")
            case "success":
                return userOrders.filter(o => o.status === "shipped" || o.status === "completed")
            case "cancelled":
                return userOrders.filter(o => o.status === "cancelled")
            default:
                return userOrders
        }
    }, [userOrders, activeTab])

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE))
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ORDERS_PER_PAGE
        return filteredOrders.slice(start, start + ORDERS_PER_PAGE)
    }, [filteredOrders, currentPage])

    useEffect(() => { setCurrentPage(1) }, [activeTab])
    useEffect(() => { if (currentPage > totalPages) setCurrentPage(1) }, [currentPage, totalPages])

    useEffect(() => {
        if (!updateOrderStatus) return
        userOrders.forEach(order => {
            if (
                order.status === "pending" &&
                order.payment_status === "paid" &&
                !processedOrders.has(order.id)
            ) {
                updateOrderStatus(order.id, "processing")
                setProcessedOrders(prev => new Set([...prev, order.id]))
            }
        })
    }, [userOrders, updateOrderStatus, processedOrders])

    useEffect(() => {
        if (!currentUser) {
            navigate("/")
            return
        }
        if (!orders.length) fetchOrders?.()
    }, [currentUser, fetchOrders, navigate, orders.length])

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN").format(Number(price) || 0) + "đ"

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa rõ"
        try { return new Date(dateString).toLocaleString("vi-VN") }
        catch { return "Chưa rõ" }
    }

    const getStatusMeta = (status) => STATUS_META[normalizeStatus(status)] || { label: status, badge: "bg-gray-100 text-gray-800" }

    const handleViewDetail = async (order) => {
        const full = await getOrderById?.(order.id)
        if (full) setSelectedOrder({ ...full, status: normalizeStatus(full.status) })
        else setSelectedOrder(order)
        setShowDetailModal(true)
    }

    const handleCancelOrder = async (order) => {
        const normalizedStatus = normalizeStatus(order.status)
        if (!canCancelStatus(normalizedStatus)) return
        if (!confirm(`Bạn chắc chắn muốn hủy đơn hàng #${order.id}?`)) return
        setCancelingId(order.id)
        try {
            if (typeof cancelOrder === "function") {
                const ok = await cancelOrder(order.id)
                if (!ok) alert("Hủy đơn hàng thất bại")
            } else await updateOrderStatus?.(order.id, "cancelled")
            setSelectedOrder(prev => prev && prev.id === order.id ? { ...prev, status: "cancelled" } : prev)
        } finally { setCancelingId(null) }
    }

    const getProductDetails = (productId) => {
        if (!productId || !products.length) return null
        return products.find(p => p.id === productId || p._id === productId)
    }

    const getTabCount = (tabKey) => {
        switch (tabKey) {
            case "pending": return userOrders.filter(o => o.status === "pending").length
            case "processing": return userOrders.filter(o => o.status === "processing").length
            case "success": return userOrders.filter(o => o.status === "shipped" || o.status === "completed").length
            case "cancelled": return userOrders.filter(o => o.status === "cancelled").length
            default: return 0
        }
    }

    const verifyVnPayIfNeeded = async () => {
        if (verifyRef.current || typeof window === "undefined") return
        const params = new URLSearchParams(window.location.search)
        if (!params.has("vnp_TxnRef") || !params.has("vnp_ResponseCode")) return
        verifyRef.current = true
        try {
            const res = await fetch(`http://localhost:8081/api/payment/vnpay/check-payment-vnpay?${params.toString()}`)
            const data = await res.json().catch(() => ({}))
            if (res.ok && data.success) {
                alert("Thanh toán VNPAY thành công!")
                fetchOrders?.()
                window.history.replaceState({}, document.title, window.location.pathname)
            } else alert(data.message || "Thanh toán VNPAY thất bại hoặc bị hủy.")
        } catch (err) { console.error(err) }
    }

    useEffect(() => { verifyVnPayIfNeeded() }, [])

    // 🔹 Return conditional components
    if (!currentUser) return <NotLoggedIn navigate={navigate} />
    if (loading && userOrders.length === 0) return <LoadingOrders />
    if (error) return <ErrorOrders error={error} fetchOrders={fetchOrders} />

    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Đơn hàng của tôi
                            </h1>
                            <p className="text-gray-600 mt-1 flex items-center gap-2">
                                <span className="inline-flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    Xin chào {currentUser?.name || currentUser?.first_name || currentUser?.email}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    {userOrders.length} đơn hàng
                                </span>
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/")}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Về trang chủ
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <div className="flex overflow-x-auto">
                            {TAB_CONFIG.map((tab) => {
                                const count = getTabCount(tab.key)
                                const isActive = activeTab === tab.key
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-w-0 ${isActive
                                            ? "border-blue-500 text-blue-600 bg-blue-50"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        <span className="mr-2">{tab.icon}</span>
                                        <span className="mr-2">{tab.label}</span>
                                        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${isActive
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-600"
                                            }`}>
                                            {count}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {loading && userOrders.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải đơn hàng...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h3 className="text-red-800 font-medium">Có lỗi xảy ra</h3>
                                <p className="text-red-600 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => fetchOrders?.()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {!loading && filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-4xl">{TAB_CONFIG.find(t => t.key === activeTab)?.icon}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Không có đơn hàng nào
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Bạn chưa có đơn hàng nào ở trạng thái "{TAB_CONFIG.find(t => t.key === activeTab)?.label}".
                        </p>
                        {activeTab === "pending" && (
                            <button
                                onClick={() => navigate("/categories")}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Mua sắm ngay
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 mb-8">
                            {paginatedOrders.map(order => {
                                const statusNorm = normalizeStatus(order.status)
                                const meta = getStatusMeta(statusNorm)
                                const disabledCancel = !canCancelStatus(statusNorm)
                                // cũ: const showPaidBadge = order.payment_method !== "cod" && order.payment_status === "paid"
                                const isPaidNonCod = order.payment_method !== "cod" && order.payment_status === "paid"
                                const showRefundBadge = isPaidNonCod && statusNorm === "cancelled"
                                const showPaidBadge = isPaidNonCod && statusNorm !== "cancelled"

                                return (
                                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
                                        <div className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                                                <div className="flex items-center gap-4 mb-3 lg:mb-0">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        Đơn hàng #{order.id}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${meta.badge} border`}>
                                                            {meta.label}
                                                        </span>
                                                        {showPaidBadge && (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border">
                                                                Đã thanh toán
                                                            </span>
                                                        )}
                                                        {showRefundBadge && (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border">
                                                                Hoàn tiền
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleViewDetail(order)}
                                                        className={`${actionBtnBase} bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100`}
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Chi tiết
                                                    </button>

                                                    {!disabledCancel && (
                                                        <button
                                                            disabled={cancelingId === order.id}
                                                            onClick={() => handleCancelOrder(order)}
                                                            className={`${actionBtnBase} bg-red-50 text-red-700 border-red-200 hover:bg-red-100`}
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            {cancelingId === order.id ? "Đang hủy..." : "Hủy đơn"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8V9m4 2v4m0 0H8m8 0v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Ngày đặt</p>
                                                        <p className="font-medium text-gray-900">
                                                            {formatDate(order.created_at || order.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Tổng tiền</p>
                                                        <p className="font-bold text-green-600 text-lg">
                                                            {formatPrice(order.total)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Thanh toán</p>
                                                        <p className="font-medium text-gray-900">
                                                            {order.payment_method === "cod" ? "COD" : order.payment_method}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Sản phẩm</p>
                                                        <p className="font-medium text-gray-900">
                                                            {order.items?.length || 0} món
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className="bg-white rounded-xl shadow-sm p-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    totalItems={filteredOrders.length}
                                    itemsPerPage={ORDERS_PER_PAGE}
                                />
                            </div>
                        )}
                    </>
                )}

                {showDetailModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-bold">
                                            Chi tiết đơn hàng #{selectedOrder.id}
                                        </h3>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 border border-white/30">
                                                {getStatusMeta(selectedOrder.status).label}
                                            </span>
                                            {/* đổi hiển thị badge thanh toán */}
                                            {selectedOrder.payment_method !== "cod" &&
                                                selectedOrder.payment_status === "paid" && (
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
                                                        ${selectedOrder.status === "cancelled"
                                                            ? "bg-purple-100 text-purple-800 border-purple-200"
                                                            : "bg-green-100 text-green-800 border-green-200"}`}>
                                                        {selectedOrder.status === "cancelled" ? "Hoàn tiền" : "Đã thanh toán"}
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setShowDetailModal(false)}
                                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
                                <div className="border-b border-gray-200 pb-4">
                                    <h4 className="font-medium text-gray-900 mb-3">
                                        Thông tin đơn hàng
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Ngày đặt:</span>
                                            <div>{formatDate(selectedOrder.created_at || selectedOrder.createdAt)}</div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Thanh toán:</span>
                                            <div>
                                                {selectedOrder.payment_method === "cod"
                                                    ? "Thanh toán khi nhận hàng (COD)"
                                                    : selectedOrder.payment_method}
                                                {selectedOrder.payment_method !== "cod" &&
                                                    selectedOrder.payment_status === "paid" && (
                                                        <span className={`ml-2 ${selectedOrder.status === "cancelled" ? "text-purple-600" : "text-green-600"}`}>
                                                            ({selectedOrder.status === "cancelled" ? "Hoàn tiền" : "Đã thanh toán"})
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <span className="font-medium text-gray-700">Ghi chú:</span>
                                            <div>{selectedOrder.notes || "Không có ghi chú"}</div>
                                        </div>
                                    </div>
                                </div>

                                {selectedOrder.shipping_address && (
                                    <div className="border-b border-gray-200 pb-4">
                                        <h4 className="font-medium text-gray-900 mb-3">
                                            Địa chỉ giao hàng
                                        </h4>
                                        {typeof selectedOrder.shipping_address === "string" ? (
                                            <p className="text-sm text-gray-700">{selectedOrder.shipping_address}</p>
                                        ) : (
                                            <div className="text-sm text-gray-700 space-y-1">
                                                <p><span className="font-medium">Họ tên:</span> {selectedOrder.shipping_address.full_name}</p>
                                                <p><span className="font-medium">SĐT:</span> {selectedOrder.shipping_address.phone}</p>
                                                <p><span className="font-medium">Email:</span> {selectedOrder.shipping_address.email}</p>
                                                <p>
                                                    <span className="font-medium">Địa chỉ:</span>{" "}
                                                    {selectedOrder.shipping_address.address},{" "}
                                                    {selectedOrder.shipping_address.ward},{" "}
                                                    {selectedOrder.shipping_address.district},{" "}
                                                    {selectedOrder.shipping_address.city}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedOrder.items?.length > 0 && (
                                    <div className="border-b border-gray-200 pb-4">
                                        <h4 className="font-medium text-gray-900 mb-3">
                                            Sản phẩm đã đặt ({selectedOrder.items.length} sản phẩm)
                                        </h4>
                                        <div className="space-y-4">
                                            {selectedOrder.items.map((item, index) => {
                                                const productDetails = getProductDetails(item.product_id || item.book_id)
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg"
                                                    >
                                                        <div className="w-16 h-20 flex-shrink-0">
                                                            <img
                                                                src={productDetails?.image_url || "/api/placeholder/64/80"}
                                                                alt={productDetails?.title || "Sản phẩm"}
                                                                className="w-full h-full object-cover rounded"
                                                                onError={(e) => {
                                                                    e.target.src = "/api/placeholder/64/80"
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-gray-900 mb-1">
                                                                {productDetails?.title || `Sản phẩm ID: ${item.product_id || item.book_id || "N/A"}`}
                                                            </div>
                                                            {productDetails?.author && (
                                                                <div className="text-sm text-gray-600 mb-2">
                                                                    Tác giả: {productDetails.author}
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                                <div className="text-sm text-gray-600">
                                                                    Đơn giá: <span className="font-medium">{formatPrice(item.price)}</span>
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    Số lượng: <span className="font-medium">{item.quantity}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                ID: {item.product_id || item.book_id || "N/A"}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-semibold text-gray-900">
                                                                {formatPrice((item.quantity || 1) * (item.price || 0))}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Thành tiền
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                <span>Tổng số lượng:</span>
                                                <span className="font-medium">
                                                    {selectedOrder.items.reduce((total, item) => total + (item.quantity || 0), 0)} sản phẩm
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Tổng tiền hàng:</span>
                                                <span className="font-medium">
                                                    {formatPrice(
                                                        selectedOrder.items.reduce(
                                                            (total, item) => total + (item.quantity || 1) * (item.price || 0),
                                                            0
                                                        )
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-lg font-semibold border-t pt-4">
                                    <span>Tổng thanh toán:</span>
                                    <span className="text-green-600">
                                        {formatPrice(selectedOrder.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}


export default OrderPage

