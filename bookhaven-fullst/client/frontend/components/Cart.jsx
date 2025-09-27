"use client"

const Cart = ({ cart, removeFromCart, updateQuantity, toggleItemSelection, getTotalPrice }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ"
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Giỏ hàng của bạn đang trống</h3>
        <p className="text-gray-600">Hãy thêm một số sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {cart.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={item.selected || false}
              onChange={() => toggleItemSelection(item.id)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />

            <img
              src={item.image_url || "/placeholder.svg"}
              alt={item.title}
              className="w-20 h-24 object-cover rounded"
            />

            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
              <div className="flex items-center space-x-2 mb-2">
                {item.oldPrice && (
                  <span className="text-sm text-gray-500 line-through">{formatPrice(item.oldPrice)}</span>
                )}
                <span className="text-lg font-bold text-red-600">{formatPrice(item.price)}</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 border-x border-gray-300">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Xóa
                </button>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Cart
