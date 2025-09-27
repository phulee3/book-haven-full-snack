"use client"

import { useState } from "react"
import api from "../lib/axiosClient"
import toast from "react-hot-toast"

const API_BASE = import.meta.env.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""
const ORDERS_API = `${API_BASE}/orders`

const getToken = () => {
    try {
        return localStorage.getItem("token") || ""
    } catch {
        return ""
    }
}

const normalizeOrder = (raw) => {
    if (!raw || typeof raw !== "object") return raw
    const status = (raw.status || "pending").toLowerCase()
    return {
        id: raw.id || raw._id,
        user_id: raw.user_id || raw.userId || raw.user?.id || null,
        status,
        total: Number(raw.total_amount ?? raw.total) || 0,
        payment_method: raw.payment_method || raw.paymentMethod || "cod",
        payment_status: raw.payment_status || raw.paymentStatus || (status === "completed" ? "paid" : "unpaid"),
        shipping_address: (() => {
            const s = raw.shipping_address || raw.shippingAddress
            if (!s) return null
            try { return typeof s === "string" ? JSON.parse(s) : s } catch { return s }
        })(),
        notes: raw.notes || "",
        items: raw.items || raw.order_items || raw.orderItems || [],
        created_at: raw.created_at || raw.createdAt || null,
        updated_at: raw.updated_at || raw.updatedAt || null,
        _raw: raw
    }
}

export const useOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const authHeaders = () => {
        const token = getToken()
        return token ? { Authorization: `Bearer ${token}` } : {}
    }

    const baseFetch = async (endpoint) => {
        setLoading(true); setError(null)
        try {
            const res = await api.get(endpoint, { headers: authHeaders() })
            const list = Array.isArray(res.data) ? res.data : (res.data?.orders || [])
            setOrders(list.map(normalizeOrder))
        } catch (err) {
            console.error("orders fetch error:", err)
            const status = err?.response?.status
            const msg = err?.response?.data?.message || err?.response?.data?.error || "Không thể tải đơn hàng"
            setError(msg)

            // Chỉ toast nếu không phải 401 (token hết hạn) – vì 401 có thể đã được interceptor xử lý
            if (status !== 401) {
                toast.error(msg)
            }
        } finally {
            setLoading(false)
        }
    }

    const fetchOrdersAdmin = () => baseFetch(ORDERS_API)
    const fetchMyOrders = () => baseFetch(`${ORDERS_API}/my-orders`)

    // (Optional) wrapper nếu muốn dùng chung:
    const fetchOrders = (isAdmin) => {
        return isAdmin ? fetchOrdersAdmin() : fetchMyOrders()
    }

    const getOrderById = async (orderId) => {
        if (!orderId) return null
        try {
            const res = await api.get(`${ORDERS_API}/${orderId}`, { headers: authHeaders() })
            const data = res.data
            if (data?.order || data?.items) {
                const base = data.order ? normalizeOrder(data.order) : normalizeOrder(data)
                const items = data.items || base.items || []
                return {
                    ...base, items: items.map(i => ({
                        ...i,
                        product_id: i.product_id || i.book_id,
                        quantity: Number(i.quantity) || 1,
                        price: Number(i.price) || 0
                    }))
                }
            }
            const norm = normalizeOrder(data)
            return {
                ...norm,
                items: (norm.items || []).map(i => ({
                    ...i,
                    product_id: i.product_id || i.book_id,
                    quantity: Number(i.quantity) || 1,
                    price: Number(i.price) || 0
                }))
            }
        } catch (err) {
            console.error("getOrderById error:", err)
            const status = err?.response?.status
            if (status !== 401) {
                toast.error("Không thể tải chi tiết đơn hàng")
            }
            return null
        }
    }

    const createOrder = async (orderData) => {
        setLoading(true); setError(null)
        try {
            const payload = {
                user_id: orderData.user_id,
                total_amount: Number(orderData.total_amount ?? orderData.total) || 0,
                status: "pending",
                payment_method: orderData.payment_method || "cod",
                shipping_address: typeof orderData.shipping_address === "string"
                    ? orderData.shipping_address
                    : JSON.stringify(orderData.shipping_address || {}),
                notes: orderData.notes || "",
                items: (orderData.items || []).map(i => ({
                    product_id: i.product_id ?? i.id ?? i._id ?? i.book_id,
                    quantity: Number(i.quantity) || 1,
                    price: Number(i.price) || 0
                }))
            }

            const res = await api.post(ORDERS_API, payload, {
                headers: { "Content-Type": "application/json", ...authHeaders() }
            })

            const createdId = res.data?.order_id
            let created = null
            if (createdId) {
                created = await getOrderById(createdId)
            } else {
                created = normalizeOrder(res.data?.order || res.data)
            }
            if (created) {
                setOrders(prev => [created, ...prev])
            }

            return created
        } catch (err) {
            console.error("createOrder error:", err)
            const status = err?.response?.status
            const msg = err?.response?.data?.message || err?.response?.data?.error || "Tạo đơn hàng thất bại"
            setError(msg)
            if (status !== 401) toast.error(msg)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId, status) => {
        if (!orderId) return
        try {
            await api.put(`${ORDERS_API}/${orderId}/status`, { status }, {
                headers: { "Content-Type": "application/json", ...authHeaders() }
            })
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o))
            const map = {
                pending: "Chuyển về chờ xử lý",
                processing: "Đơn hàng đang xử lý",
                shipped: "Đơn hàng đang vận chuyển",
                completed: "Đơn hàng đã hoàn thành",
                cancelled: "Đơn hàng đã hủy"
            }
            if (map[status]) toast.success(map[status])
        } catch (err) {
            console.error("updateOrderStatus error:", err)
            const statusCode = err?.response?.status
            if (statusCode !== 401) {
                toast.error(err?.response?.data?.message || err?.response?.data?.error || "Cập nhật trạng thái thất bại")
            }
        }
    }

    const cancelOrder = async (orderId) => {
        if (!orderId) return false
        try {
            await api.patch(`${ORDERS_API}/${orderId}/cancel`, {}, { headers: authHeaders() })
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "cancelled", updated_at: new Date().toISOString() } : o))
            alert(`Đã hủy đơn hàng: ${orderId}`)
            return true
        } catch (err) {
            console.error("cancelOrder error:", err)
            const statusCode = err?.response?.status
            if (statusCode !== 401) {
                toast.error(err?.response?.data?.message || err?.response?.data?.error || "Hủy đơn hàng thất bại")
            }
            return false
        }
    }

    return {
        orders,
        setOrders,
        loading,
        error,
        fetchOrders,        // optional generic
        fetchOrdersAdmin,
        fetchMyOrders,
        getOrderById,
        createOrder,
        updateOrderStatus,
        cancelOrder
    }
}