"use client"

import { useState, useMemo, useEffect } from "react"
import { useLocation } from "react-router-dom"
import ProductCard from "../components/ProductCard"
import { useAppContext } from "../contexts/AppContext"

function CategoriesPage() {
  const {
    products,
    categories,
    addToCart,

    handleSearch,
    searchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useAppContext()

  const location = useLocation()

  const [sortBy, setSortBy] = useState("newest")
  const [page, setPage] = useState(1)
  const [showSidebar, setShowSidebar] = useState(false)
  const [typeFilter, setTypeFilter] = useState("all") // NEW: all | combo | single
  const itemsPerPage = 8

  // Đọc query ?type=combo | single
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const t = (params.get("type") || "").toLowerCase()
    if (t === "combo") setTypeFilter("combo")
    else if (t === "single") setTypeFilter("single")
  }, [location.search])

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products || []

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = (products || []).filter((product) => {
        const title = (product.title || "").toLowerCase()
        const author = (product.author || "").toLowerCase()
        if (!q) return true
        if (title.includes(q) || author.includes(q)) return true
        const words = q.split(" ").filter(Boolean)
        return words.some(w => title.includes(w) || author.includes(w))
      })
    }

    // Filter by category (chuẩn hóa so sánh string)
    if (selectedCategory != null && selectedCategory !== "") {
      const sel = String(selectedCategory)
      filtered = filtered.filter(product => {
        const prodCat =
          product.category_id ??
          product.categoryId ??
          product.category?.id ??
          product.category?._id ??
          product.category
        return prodCat != null && String(prodCat) === sel
      })
    }

    // Lọc theo loại (combo / single)
    if (typeFilter === "combo") {
      filtered = filtered.filter(p =>
        typeof p.title === "string" && /^combo\b/i.test(p.title.trim())
      )
    } else if (typeFilter === "single") {
      filtered = filtered.filter(p =>
        !(typeof p.title === "string" && /^combo\b/i.test(p.title.trim()))
      )
    }

    // Sort products
    switch (sortBy) {
      case "newest":
        return [...filtered].sort(
          (a, b) =>
            new Date(b.created_at || b.createdAt || 0) -
            new Date(a.created_at || a.createdAt || 0)
        )
      case "priceDesc":
        return [...filtered].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
      case "priceAsc":
        return [...filtered].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
      default:
        return filtered
    }
  }, [products, searchQuery, selectedCategory, sortBy, typeFilter])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedCategory, sortBy, typeFilter])

  // Scroll to top when changing page, searching, or filtering
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    } catch (_) {
      window.scrollTo(0, 0)
    }
  }, [page, searchQuery, selectedCategory])

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProducts.length / itemsPerPage))
  const paginated = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return filteredAndSortedProducts.slice(start, start + itemsPerPage)
  }, [filteredAndSortedProducts, page])

  const getPageTitle = () => {
    if (searchQuery) {
      return `Kết quả tìm kiếm: "${searchQuery}"`
    }
    if (selectedCategory) {
      const category = categories?.find(cat => cat.id === selectedCategory)
      return category ? category.name : "Danh mục sách"
    }
    return "Tất cả sách"
  }

  const handleCategorySelect = (categoryId) => {
    // Nhấn lại cùng danh mục để bỏ chọn
    setSelectedCategory(prev =>
      String(prev) === String(categoryId) ? null : categoryId
    )
    setShowSidebar(false)
  }

  const categoryButtons = useMemo(() => {
    const buttons = [{ key: null, name: "Tất cả sách" }]
    if (Array.isArray(categories)) {
      categories.forEach(cat => {
        const cid = cat.id ?? cat._id
        buttons.push({ key: cid != null ? String(cid) : null, name: cat.name || cat.title || "Danh mục" })
      })
    }
    return buttons
  }, [categories])

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            Lọc danh mục
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className={`lg:w-1/4 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:sticky lg:top-4">
              {/* Mobile close button */}
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h3 className="text-lg font-semibold">Danh mục sách</h3>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <h3 className="text-lg font-semibold mb-4 hidden lg:block">Danh mục sách</h3>

              <div className="space-y-2">
                {categoryButtons.map((category) => {
                  const isActive =
                    (selectedCategory == null && category.key == null) ||
                    (selectedCategory != null && category.key != null && String(selectedCategory) === String(category.key))
                  return (
                    <button
                      key={category.key === null ? 'all' : category.key}
                      onClick={() => handleCategorySelect(category.key)}
                      className={`w-full text-left px-3 py-2.5 sm:py-2 rounded-md transition-colors text-sm sm:text-base ${isActive && !searchQuery
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      {category.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 lg:w-3/4">
            {/* Header with title and sorting */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  {getPageTitle()}
                </h2>
                <p className="text-sm text-gray-600">
                  {filteredAndSortedProducts.length} sản phẩm
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 whitespace-nowrap">Sắp xếp:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="priceDesc">Giá giảm dần</option>
                    <option value="priceAsc">Giá tăng dần</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 whitespace-nowrap">Loại:</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">Tất cả</option>
                    <option value="combo">Combo</option>
                    <option value="single">Sách đơn</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products grid */}
            {filteredAndSortedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {paginated.map((product) => (
                    <ProductCard key={product.id} product={product} addToCart={addToCart} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600 order-2 sm:order-1">
                        Trang {page} / {totalPages} ({filteredAndSortedProducts.length} sản phẩm)
                      </div>

                      <div className="flex items-center space-x-2 order-1 sm:order-2">
                        <button
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                        >
                          ← Trước
                        </button>

                        {/* Page numbers for larger screens */}
                        <div className="hidden sm:flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum
                            if (totalPages <= 5) {
                              pageNum = i + 1
                            } else if (page <= 3) {
                              pageNum = i + 1
                            } else if (page >= totalPages - 2) {
                              pageNum = totalPages - 4 + i
                            } else {
                              pageNum = page - 2 + i
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${page === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-300 hover:bg-gray-100"
                                  }`}
                              >
                                {pageNum}
                              </button>
                            )
                          })}
                        </div>

                        <button
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages}
                          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                        >
                          Sau →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="text-gray-400 text-4xl sm:text-6xl mb-4">📚</div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-600 mb-2">
                  Không tìm thấy sách phù hợp
                </h3>
                <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                  {searchQuery
                    ? `Không có kết quả cho "${searchQuery}". Thử tìm kiếm với từ khóa khác.`
                    : "Danh mục này chưa có sách nào. Vui lòng chọn danh mục khác."
                  }
                </p>
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={() => {
                      handleSearch("")
                      setSelectedCategory(null)
                    }}
                    className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    Xem tất cả sách
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoriesPage