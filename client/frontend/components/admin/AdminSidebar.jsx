"use client"

import { NavLink } from "react-router-dom"

const AdminSidebar = ({
    sidebarOpen,
    setSidebarOpen,
    orders,
    users,
    categories,
    products,
    currentTab,
    onLogout
}) => {
    const menuItems = [
        {
            id: "dashboard",
            name: "Tổng quan",
            path: "/admin",
            icon: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z",
            count: null
        },
        {
            id: "orders",
            name: "Quản lý đơn hàng",
            path: "/admin/orders",
            icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
            count: orders?.length || 0
        },
        {
            id: "users",
            name: "Quản lý người dùng",
            path: "/admin/users",
            icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
            count: users?.length || 0
        },
        {
            id: "products",
            name: "Quản lý sản phẩm",
            path: "/admin/products",
            icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
            count: products?.length || 0
        },
        {
            id: "categories",
            name: "Quản lý danh mục",
            path: "/admin/categories",
            icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
            count: categories?.length || 0
        }
    ]

    const handleMenuClick = () => {
        setSidebarOpen(false) // Close sidebar on mobile after selection
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:bg-gray-900 lg:border-r lg:border-gray-700 lg:flex-shrink-0">
                <div className="flex flex-col h-full w-64">
                    <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
                        <div className="text-white text-xl font-semibold">Quản trị</div>
                    </div>


                    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                end={item.id === "dashboard"}
                                onClick={handleMenuClick}
                                className={({ isActive }) =>
                                    `group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                                     ${isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    }`
                                }
                            >
                                <svg
                                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                <span className="flex-1 text-left truncate">{item.name}</span>
                                {item.count !== null && (
                                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300 group-hover:bg-gray-600">
                                        {item.count}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="px-3 py-3 border-t border-gray-800 mt-auto">
                        <button
                            type="button"
                            onClick={onLogout}
                            className="group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
                        >
                            <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="flex-1 text-left">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <aside
                className={`
                    lg:hidden fixed inset-y-0 left-0 z-50 transform
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    w-64 bg-gray-900 border-r border-gray-700 transition-transform duration-200 ease-in-out
                    flex-shrink-0
                `}
                aria-hidden={!sidebarOpen}
            >
                <div className="flex flex-col h-full w-64">
                    <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
                        <div className="text-white text-lg font-semibold">Quản trị</div>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
                            aria-label="Đóng menu"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                end={item.id === "dashboard"}
                                onClick={handleMenuClick}
                                className={({ isActive }) =>
                                    `group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                                     ${isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    }`
                                }
                            >
                                <svg
                                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                <span className="flex-1 text-left truncate">{item.name}</span>
                                {item.count !== null && (
                                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300 group-hover:bg-gray-600">
                                        {item.count}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="px-3 py-3 border-t border-gray-800 mt-auto">
                        <button
                            type="button"
                            onClick={onLogout}
                            className="group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
                        >
                            <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="flex-1 text-left">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile when sidebar open */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}
        </>
    )
}

export default AdminSidebar