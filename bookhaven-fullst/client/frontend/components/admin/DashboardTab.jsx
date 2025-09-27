"use client"

import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAppContext } from "../../contexts/AppContext"

const DashboardTab = () => {
    const { orders, users, categories, products } = useAppContext()
    const navigate = useNavigate()

    const stats = useMemo(() => {
        const totalOrders = orders?.length || 0
        const totalUsers = users?.length || 0
        const totalCategories = categories?.length || 0
        const totalProducts = products?.length || 0

        // Cập nhật logic tính doanh thu - chỉ tính các đơn hàng "completed"
        const totalRevenue = orders?.reduce((sum, order) => {
            const status = (order.status || "").toLowerCase()
            return (status === "completed" || status === "delivered")
                ? sum + (Number(order.total) || 0)
                : sum
        }, 0) || 0

        // Cập nhật thống kê trạng thái đơn hàng
        const pendingOrders = orders?.filter(order => {
            const status = (order.status || "").toLowerCase()
            return status === "pending"
        }).length || 0

        const processingOrders = orders?.filter(order => {
            const status = (order.status || "").toLowerCase()
            return status === "processing"
        }).length || 0

        const shippedOrders = orders?.filter(order => {
            const status = (order.status || "").toLowerCase()
            return status === "shipped"
        }).length || 0

        const completedOrders = orders?.filter(order => {
            const status = (order.status || "").toLowerCase()
            return status === "completed" || status === "delivered"
        }).length || 0

        const cancelledOrders = orders?.filter(order => {
            const status = (order.status || "").toLowerCase()
            return status === "cancelled"
        }).length || 0

        // Recent orders (last 5)
        const recentOrders = orders?.slice(0, 5) || []

        return {
            totalOrders,
            totalUsers,
            totalCategories,
            totalProducts,
            totalRevenue,
            pendingOrders,
            processingOrders,
            shippedOrders,
            completedOrders,
            cancelledOrders,
            recentOrders
        }
    }, [orders, users, categories, products])

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ"
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN")
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-800"
            case "Processing":
                return "bg-blue-100 text-blue-800"
            case "Completed":
                return "bg-green-100 text-green-800"
            case "Cancelled":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const statCards = [
        {
            title: "Tổng đơn hàng",
            value: stats.totalOrders,
            icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
            color: "bg-blue-500",
            bgColor: "bg-blue-50"
        },
        {
            title: "Doanh thu",
            value: formatPrice(stats.totalRevenue),
            icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1",
            color: "bg-green-500",
            bgColor: "bg-green-50"
        },
        {
            title: "Người dùng",
            value: stats.totalUsers,
            icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
            color: "bg-purple-500",
            bgColor: "bg-purple-50"
        },
        {
            title: "Sản phẩm",
            value: stats.totalProducts,
            icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
            color: "bg-indigo-500",
            bgColor: "bg-indigo-50"
        }
    ]

    const quickActions = [
        {
            title: "Thêm đơn hàng",
            path: "/admin/orders",
            icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
            color: "bg-blue-50 hover:bg-blue-100",
            textColor: "text-blue-700"
        },
        {
            title: "Thêm người dùng",
            path: "/admin/users",
            icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
            color: "bg-green-50 hover:bg-green-100",
            textColor: "text-green-700"
        },
        {
            title: "Thêm sản phẩm",
            path: "/admin/products",
            icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
            color: "bg-purple-50 hover:bg-purple-100",
            textColor: "text-purple-700"
        },
        {
            title: "Thêm danh mục",
            path: "/admin/categories",
            icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
            color: "bg-orange-50 hover:bg-orange-100",
            textColor: "text-orange-700"
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Tổng quan</h2>
                    <p className="text-gray-600 mt-1">
                        Thống kê tổng quan về hệ thống
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {statCards.map((card, index) => (
                    <div key={index} className={`${card.bgColor} rounded-lg p-6 border border-gray-100`}>
                        <div className="flex items-center">
                            <div className={`${card.color} p-3 rounded-lg`}>
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Status Overview - Cập nhật với 5 cột */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Trạng thái đơn hàng
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
                        <div className="text-sm text-yellow-700">Chờ xử lý</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.processingOrders}</div>
                        <div className="text-sm text-blue-700">Đang xử lý</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{stats.shippedOrders}</div>
                        <div className="text-sm text-purple-700">Đang giao</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
                        <div className="text-sm text-green-700">Hoàn thành</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{stats.cancelledOrders}</div>
                        <div className="text-sm text-red-700">Đã hủy</div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Đơn hàng gần đây
                    </h3>
                    <button
                        onClick={() => navigate("/admin/orders")}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        Xem tất cả
                    </button>
                </div>

                {stats.recentOrders.length > 0 ? (
                    <div className="space-y-4">
                        {stats.recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm font-medium text-gray-900">
                                            #{order.id}
                                        </div>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {order.customerInfo?.fullName} • {formatDate(order.createdAt)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                        {formatPrice(order.total)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-2">📋</div>
                        <p className="text-gray-500">Chưa có đơn hàng nào</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Thao tác nhanh
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(action.path)}
                            className={`flex items-center p-4 text-left ${action.color} rounded-lg transition-colors`}
                        >
                            <svg className={`w-6 h-6 ${action.textColor.replace('text-', 'text-').replace('-700', '-600')} mr-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                            </svg>
                            <span className={`text-sm font-medium ${action.textColor}`}>{action.title}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default DashboardTab