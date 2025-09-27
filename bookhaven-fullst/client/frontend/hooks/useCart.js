"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import api from "../lib/axiosClient"

const API_BASE = import.meta.env.VITE_API_BASE_URL
const CART_API = `${API_BASE}/cart`

const getUserFromStorage = () => {
  try { return JSON.parse(localStorage.getItem("currentUser")) } catch { return null }
}

const normalizeId = (val) => (val === null || val === undefined) ? null : String(val)

const resolveUserId = (user) => {
  if (!user) return null
  return normalizeId(user.id ?? user._id ?? user.user_id)
}

const resolveProductId = (product) =>
  normalizeId(product?.id ?? product?._id ?? product?.product_id ?? product?.book_id)

const normalizeCartItem = (raw) => {
  const cartItemId = normalizeId(raw.id || raw._id)
  const productId = normalizeId(raw.product_id || raw.book_id || raw.productId)
  const title = raw.title || raw.product_title || ""
  const price = Number(raw.price) || 0
  const image_url = raw.image_url || raw.imageUrl || raw.product_image || null
  const quantity = Number(raw.quantity) || 1
  return {
    id: productId,           // dùng productId làm key logic
    cartItemId,
    product: { id: productId, title, price, image_url },
    title,
    price,
    image_url,
    quantity,
    selected: false,         // sẽ merge lại sau
    _raw: raw,
  }
}

export const useCart = (authContext) => {
  const [cart, setCart] = useState([])
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  const isFetchingRef = useRef(false)
  const lastFetchedUserRef = useRef(null)              // NEW: lưu userId đã fetch
  const selectionMapRef = useRef(new Map())            // NEW: lưu map selected ổn định

  const getToken = () => {
    try {
      return localStorage.getItem("token")
    } catch (err) {
      console.error("Không đọc được token:", err)
      return null
    }
  }


  // Cập nhật selectionMapRef mỗi khi cart thay đổi
  useEffect(() => {
    selectionMapRef.current = new Map(cart.map(i => [i.id, i.selected]))
  }, [cart])

  // Sử dụng ref để merge selection thay vì đóng over 'cart'
  const mergeWithSelection = (newItems) => {
    if (!Array.isArray(newItems) || newItems.length === 0) return newItems
    return newItems.map(i => ({
      ...i,
      selected: selectionMapRef.current.get(i.id) || false
    }))
  }

  // Bỏ 'cart' khỏi dependency để không tạo lại hàm gây fetch lại sau toggle
  const fetchCart = useCallback(async (userIdParam) => {
    const user = userIdParam
      ? { id: userIdParam }
      : authContext?.currentUser || getUserFromStorage()

    const userId = resolveUserId(user)
    if (!userId) {
      setCart([])
      lastFetchedUserRef.current = null
      return []
    }

    const token = getToken()
    if (!token || !authContext?.isTokenValid?.()) {
      setCart([])
      lastFetchedUserRef.current = null
      return []
    }

    // Chặn fetch chồng hoặc fetch lại cùng user không cần thiết
    if (isFetchingRef.current) return cart
    if (lastFetchedUserRef.current === userId && cart.length > 0) {
      return cart
    }

    isFetchingRef.current = true
    setLoading(true)

    try {
      const headers = { Authorization: `Bearer ${token}` }
      const res = await api.get(`${CART_API}/${userId}`, { headers })
      const rawItems = Array.isArray(res.data)
        ? res.data
        : (res.data.items || res.data.cart || [])
      const normalized = rawItems.map(normalizeCartItem)
      const merged = mergeWithSelection(normalized)
      setCart(merged)
      lastFetchedUserRef.current = userId
      return merged
    } catch (err) {
      console.error("fetchCart error:", err)
      return cart
    } finally {
      isFetchingRef.current = false
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authContext]) // intentionally NOT depending on cart

  const forceRefreshCart = useCallback(() => {
    const u = authContext?.currentUser || getUserFromStorage()
    const id = resolveUserId(u)
    if (id) {
      lastFetchedUserRef.current = null  // ép lần tới fetch lại
      fetchCart(id)
    }
  }, [authContext, fetchCart])

  // Thay thế effect cũ (vốn fetch lại mỗi lần currentUser object thay đổi)
  useEffect(() => {
    const uid = resolveUserId(authContext?.currentUser)
    if (!uid) {
      setCart([])
      lastFetchedUserRef.current = null
      return
    }
    if (uid !== lastFetchedUserRef.current) {
      fetchCart(uid)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authContext?.currentUser?.id])

  // Event refresh (sau checkout)
  useEffect(() => {
    const onRefresh = () => forceRefreshCart()
    window.addEventListener("cart:refresh", onRefresh)
    return () => window.removeEventListener("cart:refresh", onRefresh)
  }, [forceRefreshCart])

  // Local storage cho guest
  useEffect(() => {
    const user = getUserFromStorage()
    if (!user) {
      if (cart.length > 0) localStorage.setItem("cart", JSON.stringify(cart))
      else localStorage.removeItem("cart")
    }
  }, [cart])

  // storage event đa tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "currentUser") {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null
        if (newUser && (newUser.id || newUser._id) && authContext?.isTokenValid?.()) {
          fetchCart(resolveUserId(newUser))
        } else {
          setCart([])
        }
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [authContext, fetchCart])

  // ----------------- Helpers chung -----------------

  const upsertLocalItem = (productId, updater) => {
    setCart(prev => prev.map(i => i.id === productId ? updater(i) : i))
  }

  const addLocalItem = (item) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === item.id)
      if (idx >= 0) {
        const clone = [...prev]
        clone[idx] = { ...item, selected: prev[idx].selected } // giữ selected cũ nếu có
        return clone
      }
      return [...prev, item]
    })
  }

  // ----------------- Actions -----------------

  const addToCart = (product, currentUser, setShowLoginModal) => {
    if (!currentUser) {
      setShowLoginModal?.(true)
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng")
      return
    }
    setSelectedProduct(product)
    setSelectedQuantity(1)
    setShowAddToCartModal(true)
  }

  const confirmAddToCart = async () => {
    if (!selectedProduct) return false
    const user = authContext?.currentUser || getUserFromStorage()
    const loggedIn = !!user
    const productId = resolveProductId(selectedProduct)

    if (!loggedIn) {
      addLocalItem({
        id: productId,
        cartItemId: null,
        product: {
          id: productId,
          title: selectedProduct.title,
          price: selectedProduct.price,
          image_url: selectedProduct.image_url,
        },
        title: selectedProduct.title,
        price: selectedProduct.price,
        image_url: selectedProduct.image_url,
        quantity: selectedQuantity,
        selected: false,
        _raw: selectedProduct
      })
      setShowAddToCartModal(false)
      setSelectedProduct(null)
      setSelectedQuantity(1)

      return true
    }

    setLoading(true)
    try {
      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const payload = {
        user_id: resolveUserId(user),
        product_id: productId,
        quantity: selectedQuantity
      }
      const res = await api.post(CART_API, payload, { headers })

      let nextItems = []
      if (Array.isArray(res.data)) {
        nextItems = res.data.map(normalizeCartItem)
      } else if (res.data.items) {
        nextItems = res.data.items.map(normalizeCartItem)
      } else if (res.data.item) {
        nextItems = [...cart]
        const newItem = normalizeCartItem(res.data.item)
        const idx = nextItems.findIndex(i => i.id === newItem.id)
        if (idx >= 0) {
          // giữ selected cũ
          newItem.selected = nextItems[idx].selected
          nextItems[idx] = newItem
        } else {
          nextItems.push(newItem)
        }
      } else {
        // fallback fetch
        await forceRefreshCart()
        return true
      }

      // merge selection
      const merged = mergeWithSelection(nextItems)
      setCart(merged)

      return true
    } catch (err) {
      console.error("confirmAddToCart error:", err)
      if (!(err?.response?.status === 401 || err?.response?.status === 403)) {
        alert(err?.response?.data?.message || "Thêm vào giỏ thất bại")
      }
      return false
    } finally {
      setShowAddToCartModal(false)
      setSelectedProduct(null)
      setSelectedQuantity(1)
      setLoading(false)
    }
  }

  const quickAddToCart = async (product, quantity = 1, currentUser, setShowLoginModal) => {
    const productId = resolveProductId(product)
    if (!currentUser) {
      setCart(prev => {
        const idx = prev.findIndex(i => i.id === productId)
        if (idx >= 0) {
          return prev.map(i => i.id === productId ? { ...i, quantity: i.quantity + quantity } : i)
        }
        return [...prev, {
          id: productId,
          cartItemId: null,
          product: { id: productId, title: product.title, price: product.price, image_url: product.image_url },
          title: product.title,
          price: product.price,
          image_url: product.image_url,
          quantity,
          selected: false,
          _raw: product
        }]
      })

      return true
    }

    setLoading(true)
    try {
      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const payload = {
        user_id: resolveUserId(currentUser),
        product_id: productId,
        quantity
      }
      const res = await api.post(CART_API, payload, { headers })

      let nextItems = []
      if (Array.isArray(res.data)) {
        nextItems = res.data.map(normalizeCartItem)
      } else if (res.data.items) {
        nextItems = res.data.items.map(normalizeCartItem)
      } else if (res.data.item) {
        const newItem = normalizeCartItem(res.data.item)
        nextItems = [...cart]
        const idx = nextItems.findIndex(i => i.id === newItem.id)
        if (idx >= 0) newItem.selected = nextItems[idx].selected
        if (idx >= 0) nextItems[idx] = newItem
        else nextItems.push(newItem)
      } else {
        await forceRefreshCart()
        return true
      }
      const merged = mergeWithSelection(nextItems)
      setCart(merged)
      return true
    } catch (err) {
      console.error("quickAddToCart error:", err)
      if (!(err?.response?.status === 401 || err?.response?.status === 403)) {
        alert(err?.response?.data?.message || "Thêm vào giỏ thất bại")
      }
      return false
    } finally {
      setLoading(false)
    }
  }

  const toggleItemSelection = (productId) => {
    const pid = normalizeId(productId)
    setCart(prev =>
      prev.map(i => i.id === pid ? { ...i, selected: !i.selected } : i)
    )
  }

  const selectAllItems = (selected = true) => {
    setCart(prev => prev.map(i => ({ ...i, selected })))
  }

  const removeFromCart = async (productId) => {
    const pid = normalizeId(productId)
    const item = cart.find(i => i.id === pid)
    const backendId = item?.cartItemId || item?._raw?._id || item?._raw?.id
    if (!backendId) {
      setCart(prev => prev.filter(i => i.id !== pid))
      return
    }
    setLoading(true)
    try {
      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      await api.delete(`${CART_API}/${backendId}`, { headers })
      setCart(prev => prev.filter(i => i.id !== pid))
    } catch (err) {
      console.error("removeFromCart error:", err)
      if (!(err?.response?.status === 401 || err?.response?.status === 403)) {
        alert(err?.response?.data?.message || "Xóa sản phẩm thất bại")
      }
    } finally {
      setLoading(false)
    }
  }

  const removeSelectedFromCart = async () => {
    const selectedItems = cart.filter(i => i.selected)
    if (!selectedItems.length) {
      alert("Vui lòng chọn sản phẩm để xóa")
      return
    }
    setLoading(true)
    try {
      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      await Promise.all(selectedItems.map(async it => {
        const bid = it.cartItemId || it._raw?._id || it._raw?.id
        if (bid) {
          await api.delete(`${CART_API}/${bid}`, { headers })
        }
      }))
      const user = authContext?.currentUser || getUserFromStorage()
      if (user) await forceRefreshCart()
      else setCart(prev => prev.filter(i => !i.selected))
    } catch (err) {
      console.error("removeSelectedFromCart error:", err)
      if (!(err?.response?.status === 401 || err?.response?.status === 403)) {
        alert("Xóa sản phẩm thất bại")
      }
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId, newQuantity) => {
    const pid = normalizeId(productId)
    if (newQuantity < 1) {
      await removeFromCart(pid)
      return
    }
    const item = cart.find(i => i.id === pid)
    const backendId = item?.cartItemId || item?._raw?._id || item?._raw?.id
    if (!backendId) {
      setCart(prev => prev.map(i => i.id === pid ? { ...i, quantity: newQuantity } : i))
      return
    }
    setLoading(true)
    try {
      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      await api.put(`${CART_API}/${backendId}`, { quantity: Number(newQuantity) }, { headers })
      setCart(prev => prev.map(i => i.id === pid ? { ...i, quantity: newQuantity } : i))
    } catch (err) {
      console.error("updateQuantity error:", err)
      if (!(err?.response?.status === 401 || err?.response?.status === 403)) {
        alert("Cập nhật số lượng thất bại")
      }
    } finally {
      setLoading(false)
    }
  }

  const getSelectedItems = () => cart.filter(i => i.selected)
  const hasSelectedItems = () => cart.some(i => i.selected)
  const getSelectedItemsTotal = () =>
    cart.filter(i => i.selected)
      .reduce((t, i) => t + (Number(i.price) || 0) * (i.quantity || 1), 0)

  const getSelectedItemsCount = () =>
    cart.filter(i => i.selected)
      .reduce((t, i) => t + (i.quantity || 0), 0)

  const getTotalPrice = () =>
    cart.reduce((t, i) => t + (Number(i.price) || 0) * (i.quantity || 1), 0)

  const getCartCount = () =>
    cart.reduce((t, i) => t + (i.quantity || 0), 0)

  const getSelectedCount = () => cart.filter(i => i.selected).length

  const clearCart = async () => {
    const user = authContext?.currentUser || getUserFromStorage()
    // Guest → chỉ xóa local
    if (!user) {
      setCart([])
      localStorage.removeItem("cart")
      return
    }

    const token = getToken()
    // Không có token hợp lệ → coi như logout, xóa local
    if (!token || !authContext?.isTokenValid?.()) {
      setCart([])
      localStorage.removeItem("cart")
      return
    }

    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      // Endpoint có thể chưa tồn tại → nếu 404 vẫn coi là thành công
      await api.delete(`${CART_API}/clear/${resolveUserId(user)}`, { headers })
      setCart([])
    } catch (err) {
      const status = err?.response?.status
      console.debug("clearCart warning:", status, err?.response?.data)
      // 404: backend chưa hỗ trợ /clear/:userId → vẫn xem là clear thành công
      if (status === 404) {
        setCart([])
      } else if (!(status === 401 || status === 403)) {
        // Các lỗi khác mới báo
        // (Không dùng toast.success ở đây để tránh spam khi logout)
        // toast.error("Xóa giỏ hàng thất bại")  // bỏ thông báo theo yêu cầu tránh gây khó chịu
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    cart,
    setCart,
    loading,
    showAddToCartModal,
    setShowAddToCartModal,
    selectedProduct,
    setSelectedProduct,
    selectedQuantity,
    setSelectedQuantity,
    addToCart,
    confirmAddToCart,
    quickAddToCart,
    removeFromCart,
    removeSelectedFromCart,
    updateQuantity,
    toggleItemSelection,
    selectAllItems,
    getSelectedItems,
    getSelectedItemsTotal,
    getCartCount,
    getSelectedCount,
    getSelectedItemsCount,
    getTotalPrice,
    hasSelectedItems,
    clearCart,
    fetchCart,
    forceRefreshCart
  }
}