"use client"

import React, {
  useState,
  useEffect,
  useMemo,
  useRef
} from "react"
import { useAppContext } from "@/frontend/contexts/AppContext"

// Cấu hình
const ITEMS_PER_PAGE = 8
const ROW_HEIGHT = 64 // px - chiều cao cố định cho mỗi row
const MOBILE_CARD_HEIGHT = 140 // px - chiều cao cố định cho mobile card

// Enum trạng thái chuẩn theo DB
const ORDER_STATUS = ["pending", "processing", "shipped", "completed", "cancelled"]

// Meta cho trạng thái
const STATUS_META = {
  pending: { label: "Chờ xử lý", className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "⏳" },
  processing: { label: "Đang xử lý", className: "bg-blue-100 text-blue-800 border-blue-200", icon: "🔧" },
  shipped: { label: "Đang giao", className: "bg-purple-100 text-purple-800 border-purple-200", icon: "🚚" },
  completed: { label: "Hoàn thành", className: "bg-green-100 text-green-800 border-green-200", icon: "✅" },
  cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800 border-red-200", icon: "❌" }
}
const DEFAULT_STATUS_CLASS = "bg-gray-100 text-gray-800 border-gray-200"

const Truncate = ({ children, title, className = "", maxWidth = "max-w-[140px]" }) => (
  <div
    className={`truncate whitespace-nowrap ${maxWidth} ${className}`}
    title={title || (typeof children === "string" ? children : "")}
  >
    {children}
  </div>
)

const OrdersTab = () => {
  const {
    orders = [],
    products = [],
    users = [], // Thêm users để lấy thông tin khách hàng
    updateOrderStatus,
    fetchOrders,
    getOrderById,
    loading,
    error
  } = useAppContext()

  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailOrder, setDetailOrder] = useState(null)

  // Row đang chuyển trạng thái (in-place editing)
  const [editingStatusOrderId, setEditingStatusOrderId] = useState(null)
  const [savingStatusId, setSavingStatusId] = useState(null)

  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(price || 0) + "đ"

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // Function để lấy thông tin khách hàng từ user_id
  const getUserInfo = (userId) => {
    if (!userId || !users.length) return null
    return users.find(u => u.id === userId || u._id === userId)
  }

  const normalizeOrder = (order) => {
    const shippingAddress = order?.shipping_address
    const userInfo = getUserInfo(order.user_id)

    let customerInfo = {
      fullName: "N/A",
      phone: "N/A",
      email: "N/A",
      address: "N/A"
    }

    // Ưu tiên lấy từ thông tin user
    if (userInfo) {
      const firstName = userInfo.first_name || ""
      const lastName = userInfo.last_name || ""
      customerInfo = {
        fullName: `${firstName} ${lastName}`.trim() || userInfo.name || userInfo.email || "N/A",
        phone: userInfo.phone || "N/A",
        email: userInfo.email || "N/A",
        address: userInfo.address || "N/A"
      }
    }

    // Override với thông tin từ shipping_address nếu có
    if (typeof shippingAddress === "string") {
      try {
        const parsed = JSON.parse(shippingAddress)
        if (parsed.fullName || parsed.name) {
          customerInfo.fullName = parsed.fullName || parsed.name
        }
        if (parsed.phone) customerInfo.phone = parsed.phone
        if (parsed.email) customerInfo.email = parsed.email
        if (parsed.address || parsed.street) {
          customerInfo.address = parsed.address || parsed.street
        }
      } catch {
        if (shippingAddress.trim()) customerInfo.address = shippingAddress
      }
    } else if (shippingAddress && typeof shippingAddress === "object") {
      if (shippingAddress.fullName || shippingAddress.name) {
        customerInfo.fullName = shippingAddress.fullName || shippingAddress.name
      }
      if (shippingAddress.phone) customerInfo.phone = shippingAddress.phone
      if (shippingAddress.email) customerInfo.email = shippingAddress.email
      if (shippingAddress.address || shippingAddress.street) {
        customerInfo.address = shippingAddress.address || shippingAddress.street
      }
    }

    let st = (order.status || "").toLowerCase()
    if (st === "delivered") st = "completed"

    return {
      id: order.id,
      status: st,
      total: order.total || 0,
      payment_method: order.payment_method || order.paymentMethod || "cod", // Thêm payment_method
      createdAt: order.created_at,
      items: order.items || [],
      customerInfo,
      userId: order.user_id
    }
  }

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return orders
      .map(normalizeOrder)
      .filter((o) => {
        const matchStatus = statusFilter === "all" || o.status === statusFilter
        const matchSearch =
          !q ||
          o.id?.toString().includes(q) ||
          o.customerInfo.fullName.toLowerCase().includes(q) ||
          o.customerInfo.phone.toLowerCase().includes(q)
        return matchStatus && matchSearch
      })
  }, [orders, searchQuery, statusFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE))

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [totalPages, currentPage])

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredOrders, currentPage])

  // Tính số placeholder cần thiết để duy trì chiều cao cố định
  const placeholderCount = Math.max(0, ITEMS_PER_PAGE - (paginatedOrders?.length || 0))

  const statusOptions = useMemo(() => ([
    {
      value: "all",
      label: "Tất cả",
      count: orders.length
    },
    ...ORDER_STATUS.map(s => ({
      value: s,
      label: STATUS_META[s].label,
      count: orders.filter(o => {
        const st = (o.status || "").toLowerCase()
        return st === s || (s === "completed" && st === "delivered")
      }).length
    }))
  ]), [orders])

  const openDetail = async (order) => {
    try {
      // Fetch chi tiết đầy đủ từ API nếu có getOrderById
      const fullOrder = getOrderById ? await getOrderById(order.id) : null
      if (fullOrder && fullOrder.items) {
        // Normalize lại order với thông tin đầy đủ
        const normalizedOrder = normalizeOrder({ ...fullOrder, items: fullOrder.items })
        setDetailOrder(normalizedOrder)
      } else {
        // Fallback: dùng order hiện tại
        setDetailOrder(order)
      }
      setShowDetailModal(true)
    } catch (error) {
      console.error("Error fetching order details:", error)
      // Fallback: dùng order hiện tại nếu API call thất bại
      setDetailOrder(order)
      setShowDetailModal(true)
    }
  }
  const closeDetail = () => {
    setShowDetailModal(false)
    setDetailOrder(null)
  }

  const renderStatus = (order) => {
    const meta = STATUS_META[order.status] || {
      label: order.status,
      className: DEFAULT_STATUS_CLASS,
      icon: ""
    }

    if (editingStatusOrderId === order.id) {
      return (
        <div className="inline-flex items-center">
          <select
            autoFocus
            disabled={savingStatusId === order.id}
            value={order.status}
            onChange={async (e) => {
              const newStatus = e.target.value
              try {
                setSavingStatusId(order.id)
                await updateOrderStatus(order.id, newStatus)
                if (detailOrder?.id === order.id) {
                  setDetailOrder(prev => ({ ...prev, status: newStatus }))
                }
              } catch (err) {
                console.error("Update status error:", err)
                alert("Cập nhật trạng thái thất bại")
              } finally {
                setSavingStatusId(null)
                setEditingStatusOrderId(null)
              }
            }}
            onBlur={() => {
              if (savingStatusId !== order.id) {
                setEditingStatusOrderId(null)
              }
            }}
            className={`text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 bg-white`}
          >
            {ORDER_STATUS.map(st => (
              <option key={st} value={st}>
                {STATUS_META[st].label}
              </option>
            ))}
          </select>
        </div>
      )
    }

    return (
      <button
        type="button"
        onClick={() => setEditingStatusOrderId(order.id)}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border ${meta.className} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400`}
        title="Nhấn để đổi trạng thái"
      >
        {meta.icon && <span>{meta.icon}</span>}
        {meta.label}
      </button>
    )
  }

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cod: "COD",
      banking: "Chuyển khoản",
      momo: "MoMo",
      zalopay: "ZaloPay",
      vnpay: "VNPay",
      credit_card: "Thẻ tín dụng",
      debit_card: "Thẻ ghi nợ"
    }
    return methods[method?.toLowerCase()] || method || "COD"
  }

  // Loading
  if (loading && !orders.length) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-900 mb-2">Lỗi khi tải đơn hàng</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => fetchOrders()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    )
  }

  // Function để lấy thông tin chi tiết sản phẩm
  const getProductDetails = (productId) => {
    if (!productId || !products.length) return null
    return products.find(p => p.id === productId || p._id === productId)
  }

  return (
    <div className="space-y-3 sm:space-y-4 min-h-[calc(100vh-12rem)]">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Danh sách đơn hàng</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Tổng: {orders.length} | Sau lọc: {filteredOrders.length}
          </p>
        </div>
      </div>

      {/* Bộ lọc - Responsive */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          {/* Search - Full width on mobile */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã đơn, tên khách, SĐT..."
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status filter buttons - Responsive grid */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs font-medium transition-colors ${statusFilter === opt.value
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
              >
                <span className="truncate">{opt.label}</span>
                <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-[10px]">
                  {opt.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Không có dữ liệu */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
          <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">📦</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || statusFilter !== "all" ? "Không tìm thấy đơn hàng" : "Chưa có đơn hàng nào"}
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            {searchQuery || statusFilter !== "all"
              ? "Thử điều chỉnh bộ lọc hoặc từ khóa."
              : "Đơn hàng sẽ xuất hiện ở đây khi khách đặt mua."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop bảng - Hidden on mobile/tablet */}
          <div className="hidden xl:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed min-w-[1200px]">
                <colgroup>
                  <col className="w-[7%]" />
                  <col className="w-[18%]" />
                  <col className="w-[12%]" />
                  <col className="w-[11%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                  <col className="w-[17%]" />
                  <col className="w-[9%]" />
                </colgroup>
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Mã</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Khách hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Điện thoại</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tổng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Thanh toán</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ngày đặt</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50" style={{ height: ROW_HEIGHT }}>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        <Truncate maxWidth="max-w-[70px]">#{order.id}</Truncate>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        <Truncate maxWidth="max-w-[160px]">{order.customerInfo.fullName}</Truncate>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <Truncate maxWidth="max-w-[130px]">{order.customerInfo.phone}</Truncate>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        <Truncate maxWidth="max-w-[110px]">{formatPrice(order.total)}</Truncate>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <Truncate maxWidth="max-w-[120px]">{getPaymentMethodLabel(order.payment_method)}</Truncate>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {renderStatus(order)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        <Truncate maxWidth="max-w-[150px]">{formatDate(order.createdAt)}</Truncate>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <button
                          onClick={() => openDetail(order)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Placeholder rows để duy trì chiều cao cố định */}
                  {Array.from({ length: placeholderCount }).map((_, i) => (
                    <tr key={`empty-${i}`} style={{ height: ROW_HEIGHT }}>
                      <td colSpan={8} className="px-4">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang Desktop - Simple */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <div className="text-sm text-gray-700">
                  Trang {currentPage} / {totalPages} ({filteredOrders.length} đơn hàng)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tablet view - Show on tablet only */}
          <div
            className="hidden lg:block xl:hidden bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            style={{ minHeight: `${ITEMS_PER_PAGE * MOBILE_CARD_HEIGHT + 60}px` }}
          >
            <div className="divide-y divide-gray-200">
              {paginatedOrders.map(order => (
                <div key={order.id} className="p-4 hover:bg-gray-50" style={{ minHeight: `${MOBILE_CARD_HEIGHT}px` }}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        #{order.id}
                      </span>
                      {renderStatus(order)}
                    </div>
                    <button
                      onClick={() => openDetail(order)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Chi tiết
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900 text-sm">
                        {order.customerInfo.fullName}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {order.customerInfo.phone}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {order.customerInfo.email}
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="font-semibold text-green-600 text-sm">
                        {formatPrice(order.total)}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {getPaymentMethodLabel(order.payment_method)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {order.items.length} sản phẩm
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Placeholders */}
              {Array.from({ length: placeholderCount }).map((_, idx) => (
                <div key={`empty-tab-${idx}`} className="p-4 opacity-0 select-none" style={{ minHeight: `${MOBILE_CARD_HEIGHT}px` }}>
                  <div className="h-20" />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <div className="text-sm text-gray-700">
                  Trang {currentPage} / {totalPages} ({filteredOrders.length} đơn hàng)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile list view - Show on mobile/small tablets */}
          <div
            className="lg:hidden space-y-2 sm:space-y-3"
            style={{ minHeight: `${ITEMS_PER_PAGE * MOBILE_CARD_HEIGHT}px` }}
          >
            {paginatedOrders.map(order => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm"
                style={{ minHeight: `${MOBILE_CARD_HEIGHT}px` }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      #{order.id}
                    </span>
                    {renderStatus(order)}
                  </div>
                  <button
                    onClick={() => openDetail(order)}
                    className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm font-medium"
                  >
                    Chi tiết
                  </button>
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {order.customerInfo.fullName}
                  </div>
                  <div className="flex flex-col xs:flex-row xs:justify-between gap-1 text-xs text-gray-600">
                    <span>{order.customerInfo.phone}</span>
                    <span className="font-semibold text-green-600">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                  <div className="flex flex-col xs:flex-row xs:justify-between gap-1 text-xs text-gray-500">
                    <span>{getPaymentMethodLabel(order.payment_method)}</span>
                    <span>{order.items.length} sản phẩm</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
              </div>
            ))}

            {/* Placeholders */}
            {Array.from({ length: placeholderCount }).map((_, idx) => (
              <div
                key={`empty-mob-${idx}`}
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 opacity-0 select-none"
                style={{ minHeight: `${MOBILE_CARD_HEIGHT}px` }}
              >
                <div className="h-16 sm:h-20" />
              </div>
            ))}

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="mt-3 sm:mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm text-gray-700">
                    Trang {currentPage}/{totalPages}
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Chi tiết - Responsive */}
          {showDetailModal && detailOrder && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-base sm:text-lg font-semibold truncate pr-4">
                      Chi tiết đơn hàng #{detailOrder.id}
                    </h3>
                    <button
                      onClick={closeDetail}
                      className="text-gray-500 hover:text-gray-800 text-xl leading-none flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4 sm:space-y-6 text-sm">
                    {/* Status */}
                    <div className="flex items-center flex-wrap gap-3">
                      <span className="font-medium text-gray-700">Trạng thái:</span>
                      <div>
                        {renderStatus(detailOrder)}
                      </div>
                    </div>

                    {/* Thông tin - Responsive grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">
                          Thông tin khách hàng
                        </h4>
                        <div className="space-y-2 text-gray-700 text-sm">
                          <div>
                            <span className="font-medium">Tên: </span>
                            <span className="break-words">{detailOrder.customerInfo.fullName}</span>
                          </div>
                          <div>
                            <span className="font-medium">Điện thoại: </span>
                            <span className="break-all">{detailOrder.customerInfo.phone}</span>
                          </div>
                          <div>
                            <span className="font-medium">Email: </span>
                            <span className="break-all">{detailOrder.customerInfo.email}</span>
                          </div>
                          <div>
                            <span className="font-medium">Địa chỉ: </span>
                            <span className="whitespace-pre-line break-words">
                              {detailOrder.customerInfo.address}
                            </span>
                          </div>
                          <div className="pt-2 border-t text-gray-600 space-y-1">
                            <div>
                              <span className="font-medium">Phương thức thanh toán: </span>
                              <span className="break-words">{getPaymentMethodLabel(detailOrder.payment_method)}</span>
                            </div>
                            <div>
                              <span className="font-medium">Ngày tạo: </span>
                              <span className="break-words">{formatDate(detailOrder.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sản phẩm - Responsive */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">
                          Sản phẩm ({detailOrder.items.length})
                        </h4>
                        <div className="space-y-3 sm:space-y-4">
                          {detailOrder.items.length > 0 ? (
                            detailOrder.items.map((item, idx) => {
                              const productDetails = getProductDetails(item.product_id || item.book_id)
                              return (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 sm:gap-3 bg-gray-50 p-2 sm:p-3 rounded-lg"
                                >
                                  {/* Product Image - Responsive */}
                                  <div className="w-8 h-10 sm:w-12 sm:h-16 flex-shrink-0">
                                    <img
                                      src={productDetails?.image_url || "/api/placeholder/32/40"}
                                      alt={productDetails?.title || "Sản phẩm"}
                                      className="w-full h-full object-cover rounded"
                                      onError={(e) => {
                                        e.target.src = "/api/placeholder/32/40"
                                      }}
                                    />
                                  </div>

                                  {/* Product Details - Responsive */}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2">
                                      {productDetails?.title || `Sản phẩm ID: ${item.product_id || item.book_id || "N/A"}`}
                                    </div>

                                    {productDetails?.author && (
                                      <div className="text-xs text-gray-600 mb-1 truncate">
                                        {productDetails.author}
                                      </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-gray-600">
                                      <span>SL: {item.quantity}</span>
                                      <span>Đơn giá: {formatPrice(item.price)}</span>
                                    </div>

                                    <div className="text-xs text-gray-400 mt-1 truncate">
                                      ID: {item.product_id || item.book_id || "N/A"}
                                    </div>
                                  </div>

                                  {/* Subtotal */}
                                  <div className="text-right flex-shrink-0">
                                    <div className="font-semibold text-xs sm:text-sm text-gray-900">
                                      {formatPrice((item.price || 0) * (item.quantity || 1))}
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <p className="text-gray-500 text-sm">
                              Không có sản phẩm
                            </p>
                          )}

                          {/* Summary */}
                          {detailOrder.items.length > 0 && (
                            <div className="mt-3 sm:mt-4 pt-3 border-t border-gray-200">
                              <div className="flex justify-between text-xs text-gray-600 mb-2">
                                <span>Tổng số lượng:</span>
                                <span className="font-medium">
                                  {detailOrder.items.reduce((total, item) => total + (item.quantity || 0), 0)} sản phẩm
                                </span>
                              </div>
                              <div className="flex justify-between font-semibold text-sm border-t pt-2">
                                <span>Tổng cộng:</span>
                                <span className="text-green-600">
                                  {formatPrice(detailOrder.total)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end pt-4 border-t">
                      <button
                        onClick={closeDetail}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </>
      )}

    </div>
  )
}

export default OrdersTab