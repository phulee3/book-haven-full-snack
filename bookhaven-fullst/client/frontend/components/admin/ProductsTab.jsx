"use client"

import { useEffect, useState, useMemo } from "react"
import { useAppContext } from "../../contexts/AppContext"
import Pagination from "../common/Pagination"

const ITEMS_PER_PAGE = 7
const ROW_HEIGHT = 64 // px
const TABLET_CARD_HEIGHT = 128
const MOBILE_CARD_HEIGHT = 168

const ProductsTab = () => {
  const {
    products,
    categories,
    loading,
    error,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    updateProductDiscount,
    fetchProducts,
  } = useAppContext()

  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("") // Thêm tìm kiếm
  const [categoryFilter, setCategoryFilter] = useState("all") // Thêm lọc theo danh mục
  const [sortBy, setSortBy] = useState("name") // Thêm sắp xếp
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailProduct, setDetailProduct] = useState(null)

  const [form, setForm] = useState({
    title: "",
    author: "",
    translator: "",
    publisher: "",
    pages: 0,
    dimensions: "",
    weight: "",
    publish_year: new Date().getFullYear(),
    image_url: "",
    price: 0,
    stock: 0,
    description: "",
    category_id: categories.length > 0 ? categories[0].id : 1,
  })

  useEffect(() => {
    if (categories.length > 0 && !form.category_id) {
      setForm((prev) => ({ ...prev, category_id: categories[0].id }))
    }
  }, [categories])

  // Filter, search and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products || []

    // Filter by search query
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      filtered = filtered.filter((product) => {
        const title = (product.title || "").toLowerCase()
        const author = (product.author || "").toLowerCase()
        const description = (product.description || "").toLowerCase()

        return title.includes(q) ||
          author.includes(q) ||
          description.includes(q)
      })
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(product =>
        product.category_id === Number(categoryFilter)
      )
    }

    // Sort products
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.title || "").localeCompare(b.title || "")
        case "author":
          return (a.author || "").localeCompare(b.author || "")
        case "price-asc":
          return (a.price || 0) - (b.price || 0)
        case "price-desc":
          return (b.price || 0) - (a.price || 0)
        case "stock":
          return (b.stock || 0) - (a.stock || 0)
        case "newest":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [products, searchQuery, categoryFilter, sortBy])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, sortBy])

  const paginate = (items = []) => {
    if (!Array.isArray(items)) return []
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return items.slice(startIndex, endIndex)
  }

  const totalPages = Math.max(1, Math.ceil((filteredAndSortedProducts?.length || 0) / ITEMS_PER_PAGE))
  const paginatedProducts = useMemo(() => paginate(filteredAndSortedProducts), [filteredAndSortedProducts, currentPage])
  const placeholderCount = Math.max(0, ITEMS_PER_PAGE - (paginatedProducts?.length || 0))

  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil((filteredAndSortedProducts?.length || 0) / ITEMS_PER_PAGE))
    if (currentPage > newTotalPages) setCurrentPage(newTotalPages)
  }, [filteredAndSortedProducts?.length, currentPage])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const formatPrice = (price) => {
    const numPrice = Number(price) || 0
    return new Intl.NumberFormat("vi-VN").format(numPrice) + "đ"
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      if (editing) {
        await handleUpdateProduct(editing.id, form, imageFile)
        // Refresh products list sau khi update thành công
        await fetchProducts()
        alert("Cập nhật sách thành công!")
      } else {
        await handleAddProduct(form, imageFile)
        // Refresh products list sau khi add thành công
        await fetchProducts()
        alert("Thêm sách mới thành công!")
        const newTotal = Math.ceil(((products?.length || 0) + 1) / ITEMS_PER_PAGE)
        setCurrentPage(newTotal)
      }
      resetForm()
    } catch (err) {
      alert(`Lỗi: ${err.message}`)
    } finally {
      setFormLoading(false)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditing(null)
    setImageFile(null)
    setImagePreview("")
    setForm({
      title: "",
      author: "",
      translator: "",
      publisher: "",
      pages: 0,
      dimensions: "",
      weight: "",
      publish_year: new Date().getFullYear(),
      image_url: "",
      price: 0,
      stock: 0,
      description: "",
      category_id: categories.length > 0 ? categories[0].id : 1,
    })
  }

  const handleDelete = async (productId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sách này?")) return
    try {
      setDeletingId(productId)
      await handleDeleteProduct(productId)
      const newTotal = Math.max(1, Math.ceil(((products?.length || 1) - 1) / ITEMS_PER_PAGE))
      if (currentPage > newTotal) setCurrentPage(newTotal)
    } catch (err) {
      alert(`Lỗi khi xóa sản phẩm: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const openDetail = (product) => {
    setDetailProduct(product)
    setShowDetailModal(true)
  }

  const getCategoryName = (product) => {
    const categoryId = product?.category_id
    if (!categoryId) return "Không có danh mục"

    const category = categories.find((c) => c.id === categoryId)
    return category ? category.name : "Không có danh mục"
  }

  const handleEdit = (product) => {
    setEditing(product)
    setForm({
      title: product.title || "",
      author: product.author || "",
      translator: product.translator || "",
      publisher: product.publisher || "",
      pages: product.pages || 0,
      dimensions: product.dimensions || "",
      weight: product.weight || "",
      publish_year: product.publish_year || new Date().getFullYear(),
      image_url: product.image_url || "",
      price: product.price || 0,
      stock: product.stock || 0,
      description: product.description || "",
      // Sử dụng category_id thống nhất
      category_id: product.category_id || (categories.length > 0 ? categories[0].id : 1),
    })
    setImagePreview(product.image_url || "")
    setShowForm(true)
  }

  // Category options for filter
  const categoryOptions = useMemo(() => [
    {
      value: "all",
      label: "Tất cả danh mục",
      count: products?.length || 0
    },
    ...categories.map(cat => ({
      value: cat.id.toString(),
      label: cat.name,
      count: products?.filter(p => p.category_id === cat.id).length || 0
    }))
  ], [products, categories])

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">Lỗi: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh sách sản phẩm</h2>
          <p className="text-gray-600 mt-1">
            Tổng: {products?.length || 0} | Sau lọc: {filteredAndSortedProducts?.length || 0} sản phẩm
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Thêm sản phẩm
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Box - 50% width */}
          <div className="flex-1 sm:flex-[2]">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên sách, tác giả..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter - 25% width */}
          <div className="flex-1">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.count})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter - 25% width */}
          <div className="flex-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="name">Tên sách (A-Z)</option>
              <option value="author">Tác giả (A-Z)</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="stock">Tồn kho nhiều nhất</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* No data state */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || categoryFilter !== "all" ? "Không tìm thấy sản phẩm" : "Chưa có sản phẩm nào"}
          </h3>
          <p className="text-gray-600">
            {searchQuery || categoryFilter !== "all"
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              : "Sản phẩm sẽ xuất hiện ở đây khi được thêm vào hệ thống"
            }
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Tên sách</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Tác giả</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Danh mục</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Giá bán</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Tồn kho</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50" style={{ height: ROW_HEIGHT }}>
                      <td className="px-3 align-middle text-sm font-medium text-gray-900 w-16">
                        <div className="truncate whitespace-nowrap max-w-[60px]" title={String(product.id)}>{product.id}</div>
                      </td>
                      <td className="px-3 align-middle w-48">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded object-cover"
                              src={product.image_url || "/api/placeholder/40/40"}
                              alt={product.title}
                              onError={(e) => { e.target.src = "/api/placeholder/40/40" }}
                            />
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate whitespace-nowrap max-w-[160px]" title={product.title}>
                              {product.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 align-middle text-sm text-gray-500 w-32">
                        <div className="truncate whitespace-nowrap max-w-[100px]" title={product.author || ""}>{product.author || "-"}</div>
                      </td>
                      <td className="px-3 align-middle text-sm text-gray-500 w-28">
                        <div className="truncate whitespace-nowrap max-w-[90px]" title={getCategoryName(product)}>{getCategoryName(product)}</div>
                      </td>
                      <td className="px-3 align-middle text-sm font-medium text-green-600 w-24">
                        <div className="truncate whitespace-nowrap max-w-[80px]" title={formatPrice(product.price)}>{formatPrice(product.price)}</div>
                      </td>
                      <td className="px-3 align-middle text-sm text-gray-500 w-20">
                        <div className="truncate whitespace-nowrap max-w-[60px]" title={String(product.stock || 0)}>{product.stock || 0}</div>
                      </td>
                      <td className="px-3 align-middle text-sm font-medium w-32">
                        <div className="flex flex-col xl:flex-row xl:space-x-2 space-y-1 xl:space-y-0">
                          <button onClick={() => openDetail(product)} className="text-blue-600 hover:text-blue-900 text-xs xl:text-sm">Chi tiết</button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900 text-xs xl:text-sm"
                            disabled={deletingId === product.id}
                          >
                            {deletingId === product.id ? "Xóa..." : "Xóa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Placeholder rows */}
                  {Array.from({ length: placeholderCount }).map((_, i) => (
                    <tr key={`empty-${i}`} style={{ height: ROW_HEIGHT }}>
                      <td colSpan={7} className="px-3">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="bg-gray-50 px-4 py-3">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredAndSortedProducts?.length || 0}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </div>

          {/* Tablet view (fixed minHeight via placeholders) */}
          <div
            className="hidden sm:block lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            style={{ minHeight: `${ITEMS_PER_PAGE * TABLET_CARD_HEIGHT + 60}px` }}
          >
            <div className="divide-y divide-gray-200">
              {paginatedProducts.map((product) => (
                <div key={product.id} className="p-4 hover:bg-gray-50" style={{ minHeight: `${TABLET_CARD_HEIGHT}px` }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <img
                          className="h-12 w-12 rounded object-cover"
                          src={product.image_url || "/api/placeholder/48/48"}
                          alt={product.title}
                          onError={(e) => {
                            e.target.src = "/api/placeholder/48/48"
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate max-w-[150px]" title={product.title}>
                            {product.title}
                          </div>
                          <div className="text-xs text-gray-500">#{product.id}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        <div className="truncate max-w-[200px]" title={product.author}>
                          <span className="font-medium">Tác giả:</span> {product.author || "Chưa rõ"}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        <div className="truncate max-w-[200px]" title={getCategoryName(product)}>
                          <span className="font-medium">Danh mục:</span> {getCategoryName(product)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Giá bán:</span>
                          <div className="font-medium text-green-600 truncate" title={formatPrice(product.price)}>
                            {formatPrice(product.price)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Tồn kho:</span>
                          <div className="font-medium">{product.stock || 0}</div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3 pt-2">
                        <button onClick={() => openDetail(product)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                          disabled={deletingId === product.id}
                        >
                          {deletingId === product.id ? "Đang xóa..." : "Xóa"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Placeholders to keep height */}
              {Array.from({ length: placeholderCount }).map((_, idx) => (
                <div key={`empty-tab-${idx}`} className="p-4 opacity-0 select-none" style={{ minHeight: `${TABLET_CARD_HEIGHT}px` }}>
                  <div className="h-24" />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredAndSortedProducts?.length || 0}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </div>

          {/* Mobile list view (fixed minHeight via placeholders) */}
          <div className="sm:hidden space-y-3" style={{ minHeight: `${ITEMS_PER_PAGE * MOBILE_CARD_HEIGHT + 60}px` }}>
            {paginatedProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm" style={{ minHeight: `${MOBILE_CARD_HEIGHT}px` }}>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <img
                      className="h-16 w-16 rounded object-cover flex-shrink-0"
                      src={product.image_url || "/api/placeholder/64/64"}
                      alt={product.title}
                      onError={(e) => {
                        e.target.src = "/api/placeholder/64/64"
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{product.id}</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 truncate max-w-[200px]" title={product.title}>
                        {product.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        <div className="truncate max-w-[200px]" title={product.author}>
                          <span className="font-medium">Tác giả:</span> {product.author || "Chưa rõ"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Danh mục:</span>
                      <div className="font-medium truncate" title={getCategoryName(product)}>
                        {getCategoryName(product)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Tồn kho:</span>
                      <div className="font-medium">{product.stock || 0}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Giá bán:</span>
                      <div className="font-medium text-green-600">{formatPrice(product.price)}</div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button onClick={() => openDetail(product)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                      disabled={deletingId === product.id}
                    >
                      {deletingId === product.id ? "Đang xóa..." : "Xóa"}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Placeholders to keep list height */}
            {Array.from({ length: placeholderCount }).map((_, idx) => (
              <div
                key={`empty-mob-${idx}`}
                className="bg-white border border-gray-200 rounded-lg p-3 opacity-0 select-none"
                style={{ minHeight: `${MOBILE_CARD_HEIGHT}px` }}
              >
                <div className="h-32" />
              </div>
            ))}

            {totalPages > 1 && (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">Trang {currentPage} / {totalPages}</div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header - Fixed */}
            <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editing ? "Sửa sách" : "Thêm sách"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-3 sm:mb-4">Thông tin cơ bản</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên sách *</label>
                      <input
                        type="text"
                        placeholder="Tên sách"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả *</label>
                      <input
                        type="text"
                        placeholder="Tác giả"
                        value={form.author}
                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Người dịch</label>
                      <input
                        type="text"
                        placeholder="Người dịch"
                        value={form.translator}
                        onChange={(e) => setForm({ ...form, translator: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nhà xuất bản *</label>
                      <input
                        type="text"
                        placeholder="Nhà xuất bản"
                        value={form.publisher}
                        onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Năm xuất bản *</label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={form.publish_year}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            publish_year: Number(e.target.value) || new Date().getFullYear(),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Physical Details */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-3 sm:mb-4">Chi tiết vật lý</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số trang *</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Số trang"
                        value={form.pages}
                        onChange={(e) => setForm({ ...form, pages: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kích thước</label>
                      <input
                        type="text"
                        placeholder="VD: 20.5 x 13 cm"
                        value={form.dimensions}
                        onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trọng lượng</label>
                      <input
                        type="text"
                        placeholder="VD: 300g"
                        value={form.weight}
                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    rows="3"
                    placeholder="Mô tả sách"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm file:mr-3 file:py-1 file:px-3 file:border-0 file:bg-gray-100 file:text-gray-700 file:rounded"
                  />
                  {(imagePreview || form.image_url) && (
                    <div className="mt-3 flex justify-center">
                      <img
                        src={imagePreview || form.image_url}
                        alt="Preview"
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded border shadow-sm"
                        onError={(e) => {
                          e.target.src = "/api/placeholder/96/96"
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Category and Pricing */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-3 sm:mb-4">Danh mục & Giá bán</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                      <select
                        value={form.category_id || ''}
                        onChange={(e) => {
                          setForm({ ...form, category_id: Number(e.target.value) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        required
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán *</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="VNĐ"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho *</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Số lượng"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer - Fixed */}
            <div className="p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
                  disabled={formLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
                  disabled={formLoading}
                >
                  {formLoading ? "Đang xử lý..." : editing ? "Cập nhật sách" : "Thêm sách mới"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {showDetailModal && detailProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Chi tiết sản phẩm</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-center mb-4">
                <img
                  className="h-32 w-32 rounded object-cover"
                  src={detailProduct.image_url || "/api/placeholder/128/128"}
                  alt={detailProduct.title}
                  onError={(e) => {
                    e.target.src = "/api/placeholder/128/128"
                  }}
                />
              </div>

              <div><span className="font-medium">ID:</span> {detailProduct.id}</div>
              <div><span className="font-medium">Tên sách:</span> {detailProduct.title}</div>
              <div><span className="font-medium">Tác giả:</span> {detailProduct.author || "—"}</div>
              <div><span className="font-medium">Người dịch:</span> {detailProduct.translator || "—"}</div>
              <div><span className="font-medium">Nhà xuất bản:</span> {detailProduct.publisher || "—"}</div>
              <div><span className="font-medium">Năm xuất bản:</span> {detailProduct.publish_year || "—"}</div>
              <div><span className="font-medium">Số trang:</span> {detailProduct.pages || "—"}</div>
              <div><span className="font-medium">Kích thước:</span> {detailProduct.dimensions || "—"}</div>
              <div><span className="font-medium">Trọng lượng:</span> {detailProduct.weight || "—"}</div>
              <div><span className="font-medium">Danh mục:</span> {getCategoryName(detailProduct)}</div>
              <div><span className="font-medium">Giá bán:</span> <span className="text-green-600 font-semibold">{formatPrice(detailProduct.price)}</span></div>
              <div><span className="font-medium">Tồn kho:</span> {detailProduct.stock || 0}</div>

              {detailProduct.description && (
                <div>
                  <span className="font-medium">Mô tả:</span>
                  <div className="mt-1 text-gray-600">{detailProduct.description}</div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  handleEdit(detailProduct)
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                Sửa thông tin
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsTab