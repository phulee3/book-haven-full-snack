"use client"
import Header from "../components/Header"
import Cart from "../components/Cart"
import Footer from "../components/Footer"
import { useAppContext } from "../contexts/AppContext"
import { useEffect } from "react"

const CartPage = () => {
  const {
    navigate,
    cart,
    removeFromCart,
    removeSelectedFromCart,
    updateQuantity,
    toggleItemSelection,
    selectAllItems,
    getCartCount,
    getSelectedCount,
    hasSelectedItems,
    getSelectedItems,
    getSelectedItemsTotal,
    currentUser,
    forceRefreshCart
  } = useAppContext()

  useEffect(() => {
    // Chỉ fetch nếu có user đăng nhập (giỏ server)
    if (currentUser) {
      forceRefreshCart?.()
    }
  }, [currentUser, forceRefreshCart])

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(price) + "đ"

  const handleCheckout = () => {
    const selectedItems = getSelectedItems()
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán")
      return
    }
    localStorage.setItem("checkoutItems", JSON.stringify(selectedItems))
    navigate("/checkout")
  }

  const handleSelectAll = () => {
    const allSelected = cart.every((item) => item.selected)
    selectAllItems(!allSelected)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Giỏ hàng của bạn
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {cart.length > 0
                ? `${getCartCount()} sản phẩm trong giỏ hàng`
                : "Không có sản phẩm nào"}
            </p>
          </div>

          {cart.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <button
                onClick={handleSelectAll}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {cart.every((item) => item.selected)
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </button>

              {hasSelectedItems() && (
                <>
                  <span className="text-sm text-gray-600">
                    Đã chọn {getSelectedCount()} sản phẩm
                  </span>
                  <button
                    onClick={removeSelectedFromCart}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Xóa ({getSelectedCount()})
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Có sản phẩm */}
        {cart.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            <div className="xl:col-span-2">
              <Cart
                cart={cart}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
                toggleItemSelection={toggleItemSelection}
              />
            </div>

            {/* Tóm tắt đơn hàng */}
            <div className="xl:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3 mb-6 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số lượng:</span>
                  <span className="font-medium">
                    {hasSelectedItems() ? getSelectedCount() : 0} sản phẩm
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium">
                    {formatPrice(
                      hasSelectedItems() ? getSelectedItemsTotal() : 0
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600">
                    {formatPrice(
                      hasSelectedItems() ? getSelectedItemsTotal() : 0
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={!hasSelectedItems()}
                  className={`w-full py-3 px-4 rounded-lg text-sm font-medium ${hasSelectedItems()
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  {hasSelectedItems()
                    ? `Thanh toán (${getSelectedCount()} sản phẩm)`
                    : "Chọn sản phẩm để thanh toán"}
                </button>

                <button
                  onClick={() => navigate("/categories")}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Giỏ hàng trống
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 text-6xl mb-6">🛒</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Giỏ hàng trống
              </h2>
              <p className="text-gray-600 mb-8 text-sm">
                Hãy thêm sản phẩm vào giỏ hàng của bạn
              </p>
              <button
                onClick={() => navigate("/categories")}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Khám phá sản phẩm
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CartPage
