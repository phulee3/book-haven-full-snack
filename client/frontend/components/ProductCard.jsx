"use client"

import { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom"; // NEW

const ProductCard = ({ product, showAddToCart = true }) => {
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { currentUser, quickAddToCart } = useAppContext();
  const navigate = useNavigate() // NEW

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(Number(price) || 0) + "đ";

  const discountPercent =
    (typeof product.discount === "number" && product.discount > 0
      ? product.discount
      : 20);
  const price = Number(product.price) || 0;
  const oldPrice =
    price > 0 ? Math.round(price / (1 - discountPercent / 100)) : null;

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }

    setQuantity(1); // Reset quantity
    setShowModal(true); // Mở modal ngay
  }

  const handleConfirmAdd = async () => {
    try {
      const ok = await quickAddToCart(product, quantity);
      if (ok) {
        alert("Đã thêm vào giỏ hàng!");
        setShowModal(false);
      } else {
        alert("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert(error?.message || "Có lỗi xảy ra!");
    }
  }

  return (
    <>
      {/* Product Card */}
      <div className="overflow-hidden">
        <div
          className="relative cursor-pointer"
          onClick={() => navigate(`/product/${product.id}`)} // NEW
        >
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.title}
            className="w-full h-40 sm:h-48 object-cover transition-transform hover:scale-[1.03]"
          />
        </div>

        <div className="p-4">
          {/* Title */}
          <h3
            className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 h-10 cursor-pointer hover:text-red-600"
            onClick={() => navigate(`/product/${product.id}`)} // NEW
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Giá căn trái */}
          <div className="mb-3">
            <div className="flex items-center gap-2 h-7 select-none">
              {oldPrice && (
                <span className="text-[11px] text-gray-500 line-through leading-none font-mono">
                  {formatPrice(oldPrice)}
                </span>
              )}
              <span className="text-sm  font-bold text-green-600 leading-none font-mono">
                {formatPrice(price)}
              </span>
              <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded leading-none tracking-wide">
                -{discountPercent}%
              </span>
            </div>
          </div>

          {showAddToCart && (
            <button
              type="button"
              onClick={handleAddToCartClick}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Thêm giỏ hàng
            </button>
          )}
        </div>
      </div>

      {/* Simple Add to Cart Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Thêm vào giỏ hàng</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Product Info */}
              <div className="flex gap-3">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm line-clamp-2">
                    {product.title}
                  </h4>
                  <p className="text-red-600 font-semibold">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Số lượng:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold">Tổng:</span>
                <span className="font-bold text-red-600">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 p-4 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border rounded hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAdd}
                className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProductCard