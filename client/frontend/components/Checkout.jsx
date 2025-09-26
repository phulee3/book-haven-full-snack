"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

const Checkout = ({ cart, getTotalPrice, createOrder, setCurrentPage, currentUser, updateUser }) => {
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    notes: "",
  })

  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [isProcessing, setIsProcessing] = useState(false)
  const [saveAsDefault, setSaveAsDefault] = useState(false)
  const [checkingPayment, setCheckingPayment] = useState(false)
  const navigate = useNavigate()
  const verifiedOnceRef = useRef(false) // tránh chạy 2 lần

  // CHÚ Ý: đảm bảo backend mount đúng route này. Nếu backend dùng router.use('/api/payment/vnpay', router)
  // thì endpoint đúng là /api/payment/vnpay/check-payment-vnpay như đang dùng; nếu không thì chỉnh lại.
  const VERIFY_ENDPOINT = "http://localhost:8081/api/payment/vnpay/check-payment-vnpay"

  useEffect(() => {
    if (currentUser) {
      setCustomerInfo((prev) => ({
        ...prev,
        fullName: (currentUser.first_name && currentUser.last_name)
          ? `${currentUser.first_name} ${currentUser.last_name}`
          : (currentUser.name || ""),
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        city: currentUser.city || currentUser.province || "",
        district: currentUser.district || "",
        ward: currentUser.ward || "",
      }))
    }
  }, [currentUser])

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(price) + "đ"

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCustomerInfo(prev => ({ ...prev, [name]: value }))
  }

  // React ví dụ
  async function createPayment({ orderId, amount, orderInfo }) {
    console.log("[VNPAY][createPayment] orderId:", orderId, "amount:", amount, "orderInfo:", orderInfo)
    const res = await fetch("http://localhost:8081/api/payment/vnpay/create-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        amount,       // bỏ /100 (nếu BE yêu cầu số nhỏ hơn hãy điều chỉnh tại BE để đồng nhất)
        orderInfor: orderInfo // BE hiện dùng field 'orderInfor' → giữ nguyên key cho phù hợp
      })
    })
    if (!res.ok) {
      const txt = await res.text()
      console.error("[VNPAY][createPayment] BE error body:", txt)
      throw new Error("Tạo thanh toán thất bại")
    }
    const data = await res.json()
    console.log("[VNPAY][createPayment] response:", data)
    if (data.payUrl) {
      window.location.href = data.payUrl
    } else {
      throw new Error("Không nhận được link thanh toán")
    }
  }

  // Hàm gọi BE xác minh kết quả VNPAY (sau redirect)
  const verifyVnPayReturn = async () => {
    if (verifiedOnceRef.current) return
    if (typeof window === "undefined") return
    const search = window.location.search
    console.log("[VNPAY][verify] window.location.search =", search)
    const params = new URLSearchParams(search)
    if (!params.has("vnp_TxnRef") || !params.has("vnp_ResponseCode")) {
      console.log("[VNPAY][verify] Không có query VNPAY -> bỏ qua")
      return
    }
    verifiedOnceRef.current = true
    setCheckingPayment(true)
    try {
      const query = params.toString()
      console.log("[VNPAY][verify] Gửi GET:", `${VERIFY_ENDPOINT}?${query}`)
      const res = await fetch(`${VERIFY_ENDPOINT}?${query}`, { method: "GET" })
      let data
      try {
        data = await res.json()
      } catch {
        data = {}
      }
      console.log("[VNPAY][verify] Kết quả:", data)
      if (res.ok && data.success) {
        alert("Thanh toán VNPAY thành công!")
        // Điều hướng sang đơn hàng để user thấy cập nhật
        navigate("/orders", { replace: true })
      } else {
        alert(data.message || "Thanh toán không thành công hoặc bị hủy.")
      }
    } catch (e) {
      console.error("[VNPAY][verify] Lỗi:", e)
      alert("Không xác minh được trạng thái thanh toán.")
    } finally {
      setCheckingPayment(false)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }

  // Tự động kiểm tra ngay khi component mount (trường hợp quay lại trang checkout)
  useEffect(() => {
    verifyVnPayReturn()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.address) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }
    setIsProcessing(true)
    try {
      // 1. Cập nhật user mặc định nếu có chọn
      if (currentUser && saveAsDefault && typeof updateUser === "function") {
        await updateUser(currentUser.id || currentUser._id, {
          name: customerInfo.fullName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          province: customerInfo.city,
          district: customerInfo.district,
          ward: customerInfo.ward,
        })
      }

      // 2. Payload tạo đơn (pending)
      const payload = {
        user_id: currentUser?.id || currentUser?._id || null,
        items: (cart || []).map(it => ({
          product_id: it.id || it._id || it.product_id || it.book_id,
          quantity: Number(it.quantity) || 1,
          price: Number(it.price) || 0,
        })),
        total_amount: Number(getTotalPrice()) || 0,
        payment_method: paymentMethod,
        shipping_address: {
          full_name: customerInfo.fullName,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          district: customerInfo.district,
          ward: customerInfo.ward,
          email: customerInfo.email,
        },
        notes: customerInfo.notes || "",
        status: "pending",
      }

      // 3. Tạo đơn
      const order = await createOrder(payload)
      console.log("Order BE trả về:", order)
      if (!order?.id) {
        throw new Error("Không tạo được đơn hàng")
      }

      // 4. Nếu COD / BANK / MOMO thì giữ flow cũ
      if (paymentMethod !== "vnpay") {
        alert(`Đặt hàng thành công! Mã đơn hàng: ${order.id}`)
        navigate("/orders", { replace: true })
        if (typeof setCurrentPage === "function") setCurrentPage("home")
        return
      }
      console.log("paymentMethod", paymentMethod)
      console.log("payload gửi BE:", payload)
      console.log("order BE trả về:", order)


      // NEW: chuyển sang trang xử lý VNPAY
      await createPayment({
        orderId: order.id,
        amount: order.total || payload.total_amount,
        orderInfo: `Thanh toán đơn hàng ${order.id}`,
      })

    } catch (err) {
      console.error("Checkout error:", err)
      alert(err.message || "Có lỗi khi thanh toán")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hiển thị trạng thái xác minh thanh toán nếu có */}
      {checkingPayment && (
        <div className="p-3 text-sm rounded-md bg-blue-50 text-blue-700 border border-blue-200">
          Đang xác minh kết quả thanh toán VNPAY...
        </div>
      )}
      {/* Thông tin giao hàng */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin giao hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
            <input
              name="fullName"
              value={customerInfo.fullName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none text-sm"
              placeholder="Ví dụ: Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
            <input
              name="phone"
              value={customerInfo.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none text-sm"
              placeholder="09xxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={customerInfo.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh / Thành</label>
            <input
              name="city"
              value={customerInfo.city}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none text-sm"
              placeholder="Hà Nội"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quận / Huyện</label>
            <input
              name="district"
              value={customerInfo.district}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none text-sm"
              placeholder="Cầu Giấy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phường / Xã</label>
            <input
              name="ward"
              value={customerInfo.ward}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none text-sm"
              placeholder="Dịch Vọng"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết *</label>
          <textarea
            name="address"
            value={customerInfo.address}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none"
            placeholder="Số nhà, đường, ngõ..."
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
          <textarea
            name="notes"
            value={customerInfo.notes}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none"
            placeholder="Hướng dẫn giao hàng, thời gian nhận..."
          />
        </div>

        <label className="mt-4 inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={saveAsDefault}
            onChange={(e) => setSaveAsDefault(e.target.checked)}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <span className="text-sm text-gray-700">
            Lưu làm địa chỉ mặc định
          </span>
        </label>
      </div>

      {/* Phương thức thanh toán */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>

        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3"
            />
            <div>
              <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
              <div className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</div>
            </div>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="bank"
              checked={paymentMethod === "bank"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3"
            />
            <div>
              <div className="font-medium">Chuyển khoản ngân hàng</div>
              <div className="text-sm text-gray-600">Chuyển khoản trước khi giao hàng</div>
            </div>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="momo"
              checked={paymentMethod === "momo"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3"
            />
            <div>
              <div className="font-medium">Ví MoMo</div>
              <div className="text-sm text-gray-600">Thanh toán qua ví MoMo</div>
            </div>
          </label>

          {/* NEW: VNPAY */}
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="vnpay"
              checked={paymentMethod === "vnpay"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3"
            />
            <div>
              <div className="font-medium">VNPAY (Sandbox)</div>
              <div className="text-sm text-gray-600">
                Chuyển hướng đến cổng thanh toán VNPAY (test)
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setCurrentPage("cart")}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Quay lại giỏ hàng
        </button>
        <button
          type="submit"
          disabled={isProcessing}
          className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing
            ? "Đang xử lý..."
            : paymentMethod === "vnpay"
              ? `Thanh toán VNPAY - ${formatPrice(getTotalPrice())}`
              : `Đặt hàng - ${formatPrice(getTotalPrice())}`}
        </button>
      </div>
    </form>
  )
}

export default Checkout