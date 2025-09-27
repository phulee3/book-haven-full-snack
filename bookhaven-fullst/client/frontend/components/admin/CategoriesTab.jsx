"use client"

import { useAppContext } from "@/frontend/contexts/AppContext"
import { useMemo, useState, useEffect } from "react"
import Pagination from "../common/Pagination"

const ITEMS_PER_PAGE = 7
const ROW_HEIGHT = 64 // px

const CategoriesTab = () => {
  const { categories = [], addCategory, updateCategory, deleteCategory } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: "", description: "" })
  const [searchQuery, setSearchQuery] = useState("") // Thêm tìm kiếm
  const [sortBy, setSortBy] = useState("name") // Thêm sắp xếp

  const [currentPage, setCurrentPage] = useState(1)

  // Filter and sort categories
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories || []

    // Filter by search query
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      filtered = filtered.filter((category) => {
        const name = (category.name || "").toLowerCase()
        const description = (category.description || "").toLowerCase()

        return name.includes(q) || description.includes(q)
      })
    }

    // Sort categories
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "")
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "")
        case "newest":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [categories, searchQuery, sortBy])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy])

  const totalPages = Math.max(1, Math.ceil((filteredAndSortedCategories?.length || 0) / ITEMS_PER_PAGE))

  const paginate = (items = []) => {
    if (!Array.isArray(items)) return []
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return items.slice(startIndex, endIndex)
  }

  const paginatedCategories = useMemo(() => paginate(filteredAndSortedCategories), [filteredAndSortedCategories, currentPage])
  const placeholderCount = Math.max(0, ITEMS_PER_PAGE - (paginatedCategories?.length || 0))

  useEffect(() => {
    const newTotal = Math.max(1, Math.ceil((filteredAndSortedCategories?.length || 0) / ITEMS_PER_PAGE))
    if (currentPage > newTotal) setCurrentPage(newTotal)
  }, [filteredAndSortedCategories?.length, currentPage])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await updateCategory(editing.id, form)
        alert("Cập nhật danh mục thành công!")
      } else {
        await addCategory(form)
        alert("Thêm danh mục mới thành công!")
        const newTotal = Math.ceil(((categories?.length || 0) + 1) / ITEMS_PER_PAGE)
        setCurrentPage(newTotal)
      }
      setShowForm(false)
      setEditing(null)
      setForm({ name: "", description: "" })
    } catch (err) {
      alert(`Lỗi: ${err.message}`)
    }
  }

  const handleDelete = async (categoryId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return
    try {
      await deleteCategory(categoryId)
      alert("Xóa danh mục thành công!")
      const newTotal = Math.max(1, Math.ceil(((categories?.length || 0) - 1) / ITEMS_PER_PAGE))
      if (currentPage > newTotal) setCurrentPage(newTotal)
    } catch (err) {
      alert(`Lỗi khi xóa danh mục: ${err.message}`)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh sách danh mục</h2>
          <p className="text-gray-600 mt-1">
            Tổng: {categories?.length || 0} | Sau lọc: {filteredAndSortedCategories?.length || 0} danh mục
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Thêm danh mục
        </button>
      </div>

      {/* Search and Sort */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Box */}
          <div className="flex-1">
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
                placeholder="Tìm kiếm theo tên danh mục..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort Filter */}
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="name">Tên (A-Z)</option>
              <option value="name-desc">Tên (Z-A)</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* No data state */}
      {filteredAndSortedCategories.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📂</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? "Không tìm thấy danh mục" : "Chưa có danh mục nào"}
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? "Thử thay đổi từ khóa tìm kiếm"
              : "Danh mục sẽ xuất hiện ở đây khi được thêm vào hệ thống"
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">ID</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[280px]">Tên danh mục</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Mô tả</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50" style={{ height: ROW_HEIGHT }}>
                    <td className="px-3 sm:px-6 align-middle text-sm font-medium text-gray-900">
                      <div className="truncate whitespace-nowrap" title={String(category.id)}>{category.id}</div>
                    </td>
                    <td className="px-3 sm:px-6 align-middle text-sm font-medium text-gray-900">
                      <div className="max-w-[240px] truncate whitespace-nowrap" title={category.name}>
                        {category.name}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 align-middle text-sm text-gray-500 hidden md:table-cell">
                      <div className="max-w-[480px] truncate whitespace-nowrap" title={category.description || "-"}>
                        {category.description || "-"}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 align-middle text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditing(category)
                            setForm({ name: category.name, description: category.description || "" })
                            setShowForm(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Placeholder rows to keep constant height */}
                {Array.from({ length: placeholderCount }).map((_, i) => (
                  <tr key={`empty-${i}`} style={{ height: ROW_HEIGHT }}>
                    <td colSpan={4} className="px-3 sm:px-6">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAndSortedCategories?.length || 0}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-[1px]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{editing ? "Sửa danh mục" : "Thêm danh mục"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  placeholder="Tên danh mục"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  placeholder="Mô tả danh mục"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                    setForm({ name: "", description: "" })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editing ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriesTab