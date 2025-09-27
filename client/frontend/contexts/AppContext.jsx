import { createContext, useContext, useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useCart } from "../hooks/useCart"
import { useCategories } from "../hooks/useCategories"
import { useOrders } from "../hooks/useOrders"
import { useProducts } from "../hooks/useProducts"
import { useUsers } from "../hooks/useUsers"
import toast from "react-hot-toast"

export const AppContext = createContext()

export const AppProvider = ({ children }) => {
    const navigate = useNavigate()
    const location = useLocation()

    const authHook = useAuth()
    const cartHook = useCart(authHook)
    const categoriesHook = useCategories()
    const ordersHook = useOrders()
    const productsHook = useProducts()
    const usersHook = useUsers()

    const [currentPage, setCurrentPage] = useState("home")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    const authExpiredShownRef = useRef(false)
    const checkingRef = useRef(false)

    // Initial fetch
    useEffect(() => {
        productsHook.fetchProducts?.()
        categoriesHook.fetchCategories?.()

        if (authHook.currentUser) {
            if (authHook.currentUser.role === "admin") {
                usersHook.fetchUsers?.()      // Chỉ admin mới fetch users
                ordersHook.fetchOrdersAdmin?.()
            } else {
                ordersHook.fetchMyOrders?.()
            }
        }
    }, [authHook.currentUser])


    // Listen for auth-expired (ONLY once)
    useEffect(() => {
        const onAuthExpired = () => {
            if (authExpiredShownRef.current) return
            authExpiredShownRef.current = true
            authHook.setCurrentUser?.(null)
            cartHook.setCart?.([])
            localStorage.clear()
            navigate("/", { replace: true })
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
            authHook.setShowLoginModal?.(true)
            setTimeout(() => { authExpiredShownRef.current = false }, 4000)
        }
        window.addEventListener("auth-expired", onAuthExpired)
        return () => window.removeEventListener("auth-expired", onAuthExpired)
    }, [navigate, authHook, cartHook])

    // Periodic token check
    useEffect(() => {
        const checkTokenValidity = () => {
            if (checkingRef.current || isLoggingIn) return
            if (authHook.currentUser && !authHook.isTokenValid?.()) {
                checkingRef.current = true
                authHook.setCurrentUser?.(null)
                cartHook.setCart?.([])
                localStorage.clear()
                navigate("/", { replace: true })
                setTimeout(() => { checkingRef.current = false }, 2000)
            }
        }

        const initialTimeout = setTimeout(checkTokenValidity, 5000)
        const interval = setInterval(checkTokenValidity, 30000)

        return () => {
            clearTimeout(initialTimeout)
            clearInterval(interval)
        }
    }, [authHook.currentUser, authHook.isTokenValid, navigate, isLoggingIn])

    const handleLogin = async (email, password) => {
        setIsLoggingIn(true)
        const success = await authHook.handleLogin(email, password)
        if (success) {
            const user = JSON.parse(localStorage.getItem("currentUser"))
            if (user && authHook.isTokenValid?.()) {
                cartHook.forceRefreshCart?.()
                if (user.role === "admin") {
                    ordersHook.fetchOrdersAdmin?.()
                } else {
                    ordersHook.fetchMyOrders?.()
                }
            }
        }
        setIsLoggingIn(false)
        return success
    }

    const handleRegister = async (userData) => {
        const res = await authHook.handleRegister(userData)
        const user = JSON.parse(localStorage.getItem("currentUser"))
        if (user && authHook.isTokenValid?.()) {
            cartHook.fetchCart?.(user._id || user.id)
            if (user.role === "admin") ordersHook.fetchOrdersAdmin?.()
            else ordersHook.fetchMyOrders?.()
        }
        return res
    }

    const handleLogout = () => {
        // Tránh gọi endpoint clear cart (đang 404). Reset local thôi.
        cartHook.setCart?.([])
        localStorage.removeItem("cart")
        authHook.handleLogout()
    }
    const handleChangePassword = async (currentPassword, newPassword) => {
        const result = await usersHook.changePassword(currentPassword, newPassword)
        if (result.success) {
            alert("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.")
            handleLogout() // logout ngay lập tức
            return { ok: true }
        } else {
            alert(result.error || "Có lỗi xảy ra khi đổi mật khẩu")
            return { ok: false }
        }
    }


    const handleUpdateUser = async (userId, userData) => {
        const updatedUser = await usersHook.updateUser(userId, userData)
        if (authHook.currentUser?.id === userId) {
            const merged = { ...authHook.currentUser, ...userData }
            localStorage.setItem("currentUser", JSON.stringify(merged))
            authHook.setCurrentUser?.(merged)
        }
        return updatedUser
    }

    const addToCart = (product) => {
        cartHook.addToCart(product, authHook.currentUser, authHook.setShowLoginModal)
    }
    const quickAddToCart = (product, quantity = 1) => {
        return cartHook.quickAddToCart(
            product,
            quantity,
            authHook.currentUser,
            authHook.setShowLoginModal
        )
    }

    const getSelectedItemsForCheckout = () =>
        cartHook.getSelectedItems().map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image_url,
            total: item.price * item.quantity
        }))

    const handleAddProduct = (data, imageFile) =>
        productsHook.handleCreateProduct(data, imageFile)

    const handleUpdateProduct = (id, data, imageFile) =>
        productsHook.updatedProduct(id, data, imageFile)

    const handleDeleteProduct = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            await productsHook.deleteProduct(id)
            return true
        }
        return false
    }

    const navigateToCategory = (cat) => {
        setSelectedCategory(cat)
        setCurrentPage("categories")
    }

    const handleSearch = (query) => {
        setSearchQuery(query)
        setCurrentPage("categories")
    }

    const getFilteredProducts = () => {
        let filtered = productsHook.products
        if (selectedCategory) {
            filtered = productsHook.getProductsByCategory?.(selectedCategory.id) ?? filtered
        }
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }
        return filtered
    }

    const contextValue = {
        ...authHook,
        handleLogin,
        handleLogout,
        handleRegister,
        handleChangePassword,
        ...cartHook,
        cart: cartHook.cart,
        setCart: cartHook.setCart,
        addToCart,
        quickAddToCart,
        getSelectedItemsForCheckout,
        ...categoriesHook,
        getCategoryById: categoriesHook.getCategoryById,
        ...ordersHook, // đã gồm fetchOrdersAdmin, fetchMyOrders, cancelOrder
        ...productsHook,
        ...usersHook,
        updateUser: handleUpdateUser,
        handleAddProduct,
        handleUpdateProduct,
        handleDeleteProduct,
        getFilteredProducts,
        currentPage,
        setCurrentPage,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        navigateToCategory,
        handleSearch,
        navigate
    }

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    const context = useContext(AppContext)
    if (!context) throw new Error("useAppContext must be used within AppProvider")
    return context
}