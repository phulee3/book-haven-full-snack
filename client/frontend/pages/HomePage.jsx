import Header from "../components/Header"
import Banner from "../components/Banner"
import Footer from "../components/Footer"
import ProductCard from "../components/ProductCard"
import { useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAppContext } from "../contexts/AppContext"

const HomePage = () => {
  const {
    products,
    addToCart,
    navigateToCategory,
    categories
  } = useAppContext()

  const navigate = useNavigate()
  const comboBestRef = useRef(null)
  const comboProducts = products?.filter((p) => /combo/i.test(p.title)) || []

  const lifeSkillCategoryIds = useMemo(() => {
    return (categories || [])
      .filter(c => /kỹ năng|self/.test((c.name || "").toLowerCase()))
      .map(c => String(c.id ?? c._id))
  }, [categories])

  const childrenCategoryIds = useMemo(() => {
    return (categories || [])
      .filter(c => /thiếu nhi|children|kid/.test((c.name || "").toLowerCase()))
      .map(c => String(c.id ?? c._id))
  }, [categories])

  const lifeSkillProducts = useMemo(
    () => (products || []).filter(p =>
      lifeSkillCategoryIds.includes(
        String(p.category_id ?? p.categoryId ?? p.category?.id ?? p.category?._id)
      )
    ).slice(0, 4),
    [products, lifeSkillCategoryIds]
  )

  const childrenProducts = useMemo(
    () => (products || []).filter(p =>
      childrenCategoryIds.includes(
        String(p.category_id ?? p.categoryId ?? p.category?.id ?? p.category?._id)
      )
    ).slice(0, 4),
    [products, childrenCategoryIds]
  )

  const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(Number(v) || 0) + "đ"

  return (
    <div className="min-h-screen bg-white">
      <Banner />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left column: New Arrivals list */}
          <div className="rounded-lg px-3 sm:px-4">
            <div className="relative">
              <div className="relative mb-4">
                <div className="absolute inset-0 h-8 bg-red-700"></div>
                <h2 className="relative z-10 text-white uppercase text-sm sm:text-base h-8 flex items-center px-3">
                  🆕 SÁCH MỚI LÊN KỆ
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {(products || []).slice(0, 3).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    addToCart={addToCart}
                    showAddToCart={false}
                  />
                ))}
              </div>
              <div className="mb-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/categories")}
                  className="text-red-700 hover:underline text-sm"
                >
                  Xem thêm
                </button>
              </div>
            </div>

            {/* Combo bán chạy */}
            <div className="rounded-lg p-3 sm:p-4">
              <div className="relative mb-4">
                <div className="absolute inset-0 h-8 bg-red-700"></div>
                <h2 className="relative z-10 text-white uppercase text-sm sm:text-base h-8 flex items-center px-3">
                  🔥 COMBO BÁN CHẠY
                </h2>
              </div>
              <div
                ref={comboBestRef}
                className="max-h-96 overflow-y-auto pr-1 space-y-4"
              >
                {comboProducts.map((p) => {
                  const base = Number(p.price) || 0;
                  const discountPercent = 20;

                  const oldPrice = Math.round(base / (1 - discountPercent / 100)); // giá thực bán
                  const newPrice = base; // giá thực bán
                  return (
                    <div key={p.id} className="flex items-center space-x-3">
                      <img
                        src={p.image_url || p.imageUrl || "/placeholder.svg"}
                        alt={p.title}
                        className="w-14 h-18 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {p.title}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-green-600">
                            {formatPrice(newPrice)}
                          </span>
                          {/* Đưa badge giảm giá lên trước giá cũ */}
                          <span className="inline-block bg-red-600 text-white text-[10px] px-2 py-0.5 rounded">
                            -{discountPercent}%
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(oldPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 flex justify-center">
                {/* Điều hướng sang trang Categories với filter combo */}
                <button
                  type="button"
                  onClick={() => navigate("/categories?type=combo")}
                  className="text-red-700 hover:underline text-sm"
                >
                  Xem thêm
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Ads row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <a
                href="https://www.facebook.com/phulee.9.10/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative w-full pt-[100%]">
                  <img
                    src="/1.png"
                    alt="Quảng cáo 1"
                    className="absolute inset-0 w-full h-full object-cover object-left rounded-md hover:opacity-90 transition"
                  />
                </div>
              </a>
              <a
                href="https://www.facebook.com/phulee.9.10/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative w-full pt-[100%]">
                  <img
                    src="/2.png"
                    alt="Quảng cáo 2"
                    className="absolute inset-0 w-full h-full object-cover rounded-md hover:opacity-90 transition"
                  />
                </div>
              </a>
              <a
                href="https://www.facebook.com/phulee.9.10/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative w-full pt-[100%]">
                  <img
                    src="/3.png"
                    alt="Quảng cáo 3"
                    className="absolute inset-0 w-full h-full object-cover object-right rounded-md hover:opacity-90 transition"
                  />
                </div>
              </a>
            </div>

            {/* Best Sellers */}
            <div className="rounded-lg p-3 sm:p-4">
              <div className="relative mb-4">
                <div className="absolute inset-0 h-8 bg-red-700"></div>
                <h2 className="relative z-10 text-white uppercase text-sm sm:text-base h-8 flex items-center px-3">
                  📚 TOP SÁCH BÁN CHẠY
                </h2>
                <button
                  type="button"
                  onClick={() => navigateToCategory && navigateToCategory(null)}
                  className="absolute right-3 top-1.5 z-10 text-white/90 hover:text-white text-xs sm:text-sm underline"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(products || []).slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} addToCart={addToCart} />
                ))}
              </div>
            </div>

            {/* Life Skills */}
            <div className="rounded-lg p-3 sm:p-4">
              <div className="relative mb-4">
                <div className="absolute inset-0 h-8 bg-red-700"></div>
                <h2 className="relative z-10 text-white uppercase text-sm sm:text-base h-8 flex items-center px-3">
                  💡 SÁCH KỸ NĂNG SỐNG
                </h2>
                <button
                  type="button"
                  onClick={() => navigateToCategory("self-help")}
                  className="absolute right-3 top-1.5 z-10 text-white/90 hover:text-white text-xs sm:text-sm underline"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {lifeSkillProducts.map(p => (
                  <ProductCard key={p.id} product={p} addToCart={addToCart} />
                ))}
              </div>
            </div>

            {/* Children */}
            <div className="rounded-lg p-3 sm:p-4">
              <div className="relative mb-4">
                <div className="absolute inset-0 h-8 bg-red-700"></div>
                <h2 className="relative z-10 text-white uppercase text-sm sm:text-base h-8 flex items-center px-3">
                  🧒 SÁCH THIẾU NHI
                </h2>
                <button
                  type="button"
                  onClick={() => navigateToCategory("children")}
                  className="absolute right-3 top-1.5 z-10 text-white/90 hover:text-white text-xs sm:text-sm underline"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {childrenProducts.map(p => (
                  <ProductCard key={p.id} product={p} addToCart={addToCart} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}

export default HomePage