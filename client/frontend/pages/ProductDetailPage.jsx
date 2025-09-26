"use client"

import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAppContext } from "../contexts/AppContext"

const ProductDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { products, currentUser, quickAddToCart } = useAppContext()

    // Tìm sản phẩm
    const product = useMemo(
        () => (products || []).find(p => String(p.id) === String(id)),
        [products, id]
    )
    const [qty, setQty] = useState(1)

    if (!product) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-20 text-center">
                <p className="text-gray-600 mb-4">Không tìm thấy sản phẩm.</p>
                <button
                    onClick={() => navigate("/categories")}
                    className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                    Quay lại danh mục
                </button>
            </div>
        )
    }

    const discountPercent =
        (typeof product.discount === "number" && product.discount > 0)
            ? product.discount
            : 20
    const price = Number(product.price) || 0
    const oldPrice = price > 0 ? Math.round(price / (1 - discountPercent / 100)) : null
    const fmt = v => new Intl.NumberFormat("vi-VN").format(Number(v) || 0) + "đ"

    const handleAdd = async (goToCart = false) => {
        if (!currentUser) {
            alert("Vui lòng đăng nhập trước")
            return
        }
        const ok = await quickAddToCart(product, qty, currentUser)
        if (ok) {
            alert("Đã thêm vào giỏ hàng")
            if (goToCart) navigate("/cart")
        }
    }

    return (
        <div className="bg-gray-50 py-6 md:py-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
                    {/* Header / breadcrumb (đơn giản) */}
                    <div className="text-xs text-gray-500 mb-4">
                        <button onClick={() => navigate("/")} className="hover:underline">Trang chủ</button>
                        <span className="mx-1">/</span>
                        <button onClick={() => navigate("/categories")} className="hover:underline">Danh mục</button>
                        <span className="mx-1">/</span>
                        <span className="text-gray-700">{product.title}</span>
                    </div>

                    {/* Main grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Image */}
                        <div className="lg:col-span-5">
                            <div className="bg-white flex items-center justify-center">
                                <img
                                    src={product.image_url || product.imageUrl || "/placeholder.svg"}
                                    alt={product.title}
                                    className="max-h-[480px] object-contain mx-auto"
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="lg:col-span-7">
                            <h1 className="text-2xl font-semibold text-gray-900 leading-snug mb-3">
                                {product.title}
                            </h1>

                            <div className="text-sm text-gray-600 space-y-1 mb-5">
                                {product.code && <p><span className="font-medium">Mã sản phẩm:</span> {product.code}</p>}
                                {product.author && <p><span className="font-medium">Tác giả:</span> {product.author}</p>}
                                {product.translator && <p><span className="font-medium">Dịch giả:</span> {product.translator}</p>}
                                {product.publisher && <p><span className="font-medium">NXB:</span> {product.publisher}</p>}
                                {product.size && <p><span className="font-medium">Kích thước:</span> {product.size}</p>}
                                {product.publish_year && <p><span className="font-medium">Năm xuất bản:</span> {product.publish_year}</p>}
                                {product.pages && <p><span className="font-medium">Số trang:</span> {product.pages}</p>}
                                {product.weight && <p><span className="font-medium">Khối lượng:</span> {product.weight}</p>}
                                {product.cover && <p><span className="font-medium">Bìa:</span> {product.cover}</p>}
                            </div>

                            {/* Price block */}
                            <div className="mb-6">
                                <div className="flex items-end gap-4">
                                    <span className="text-3xl font-bold text-green-700">{fmt(price)}</span>
                                    {oldPrice && (
                                        <span className="text-gray-400 line-through text-lg">{fmt(oldPrice)}</span>
                                    )}
                                </div>
                                <div className="mt-2 text-sm text-red-600 font-medium">
                                    Giảm {discountPercent}%
                                </div>
                            </div>

                            {/* Quantity & Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-start gap-8 mb-10">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Số lượng</p>
                                    <div className="flex items-center border border-gray-300 rounded">
                                        <button
                                            onClick={() => setQty(q => Math.max(1, q - 1))}
                                            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                                            disabled={qty <= 1}
                                        >−</button>
                                        <span className="w-12 text-center text-sm">{qty}</span>
                                        <button
                                            onClick={() => setQty(q => q + 1)}
                                            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                        >+</button>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
                                    <button
                                        onClick={() => handleAdd(false)}
                                        className="flex-1 bg-red-600 text-white py-3 rounded-full font-semibold text-sm hover:bg-red-700 transition shadow-sm"
                                    >
                                        THÊM VÀO GIỎ
                                    </button>
                                    <button
                                        onClick={() => handleAdd(true)}
                                        className="flex-1 bg-green-700 text-white py-3 rounded-full font-semibold text-sm hover:bg-green-800 transition shadow-sm"
                                    >
                                        MUA NGAY
                                    </button>
                                </div>
                            </div>

                            {/* Services & Promotions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                                <div className="space-y-4 text-sm text-gray-700">
                                    <p className="font-semibold text-gray-900 mb-2">Dịch vụ của chúng tôi</p>
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">🚚</span>
                                        <p>Giao tận nhà trong 3 - 7 ngày làm việc.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">⭐</span>
                                        <p>Miễn phí giao hàng Toàn Quốc cho đơn hàng trên 300k.</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-700 space-y-2">
                                    <p className="font-semibold text-gray-900 mb-2">Dịch vụ & Khuyến mãi</p>
                                    <ul className="space-y-2">
                                        <li className="flex gap-2"><span>✅</span><span>Tặng kèm bookmark cho sách kỹ năng / thiếu nhi.</span></li>
                                        <li className="flex gap-2"><span>✅</span><span>FREESHIP cho đơn từ 300k.</span></li>
                                        <li className="flex gap-2"><span>✅</span><span>Đóng gói chống sốc, bọc chống ẩm.</span></li>
                                    </ul>
                                </div>
                            </div>

                            {product.description && (
                                <div className="pt-6 border-t">
                                    <h2 className="text-lg font-semibold mb-3">Mô tả</h2>
                                    <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                                        {product.description}
                                    </p>
                                </div>
                            )}


                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetailPage
