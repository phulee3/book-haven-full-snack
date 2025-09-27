"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppContext } from "@/frontend/contexts/AppContext";
import Pagination from "../common/Pagination";

const ITEMS_PER_PAGE = 7;
const ROW_HEIGHT = 64; // px
const TABLET_CARD_HEIGHT = 112;
const MOBILE_CARD_HEIGHT = 160;

const Truncated = ({ text = "", className = "", maxWidth = "max-w-[200px]" }) => {
  return (
    <div className={`${maxWidth} ${className} truncate whitespace-nowrap`} title={text}>
      {text}
    </div>
  );
};

const UsersTab = () => {
  const { users = [], registerUser, updateUser, deleteUser } = useAppContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // Thêm state tìm kiếm
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  const emptyForm = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    district: "",
    ward: "",
    address: "",
    role: "user",
  };

  const [userForm, setUserForm] = useState(emptyForm);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) => {
      const firstName = (user.first_name || "").toLowerCase();
      const lastName = (user.last_name || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      const reversedName = `${lastName} ${firstName}`.trim(); // Để tìm theo "Nguyễn Văn" hoặc "Văn Nguyễn"
      const email = (user.email || "").toLowerCase();
      const phone = (user.phone || "").toLowerCase();

      return firstName.includes(q) ||           // Tìm theo họ
        lastName.includes(q) ||            // Tìm theo tên
        fullName.includes(q) ||            // Tìm theo họ + tên
        reversedName.includes(q) ||        // Tìm theo tên + họ
        email.includes(q) ||               // Tìm theo email
        phone.includes(q);                 // Tìm theo số điện thoại
    });
  }, [users, searchQuery]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginate = (items = []) => {
    if (!Array.isArray(items)) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return items.slice(startIndex, endIndex);
  };

  const totalPages = Math.max(1, Math.ceil((filteredUsers?.length || 0) / ITEMS_PER_PAGE));
  const paginatedUsers = useMemo(() => paginate(filteredUsers), [filteredUsers, currentPage]);
  const placeholderCount = Math.max(0, ITEMS_PER_PAGE - (paginatedUsers?.length || 0));

  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil((filteredUsers?.length || 0) / ITEMS_PER_PAGE));
    if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
  }, [filteredUsers?.length, currentPage]);

  const startEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      city: user.city || "",
      district: user.district || "",
      ward: user.ward || "",
      address: user.address || "",
      role: user.role || "user",
    });
    setShowUserForm(true);
    setError(null);
  };

  const sanitizePayload = (payload, isEdit = false) => {
    const p = { ...payload };
    if (isEdit && (p.password === "" || p.password === undefined)) {
      delete p.password;
    }
    Object.keys(p).forEach((k) => {
      if (p[k] === null || p[k] === undefined) delete p[k];
    });
    if (p.first_name === undefined) p.first_name = "";
    if (p.last_name === undefined) p.last_name = "";
    if (p.role === undefined) p.role = "user";
    return p;
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!userForm.first_name?.trim() || !userForm.last_name?.trim() || !userForm.email?.trim()) {
      setError("Vui lòng nhập họ, tên và email.");
      return;
    }
    if (!editingUser && !userForm.password) {
      setError("Vui lòng nhập mật khẩu cho người dùng mới.");
      return;
    }

    const rawPayload = {
      first_name: userForm.first_name.trim(),
      last_name: userForm.last_name.trim(),
      email: userForm.email.trim(),
      password: userForm.password,
      phone: userForm.phone?.trim() || "",
      city: userForm.city?.trim() || "",
      district: userForm.district?.trim() || "",
      ward: userForm.ward?.trim() || "",
      address: userForm.address?.trim() || "",
      role: userForm.role || "user",
    };

    const payload = sanitizePayload(rawPayload, Boolean(editingUser));

    try {
      setFormLoading(true);
      if (editingUser) {
        if (!updateUser) throw new Error("updateUser function is not available");
        await updateUser(editingUser.id, payload);
        alert("Cập nhật người dùng thành công!");
      } else {
        const addFn = registerUser;
        if (!addFn) throw new Error("add/register user function is not available");
        await addFn(payload);
        const newTotal = Math.ceil((users.length + 1) / ITEMS_PER_PAGE);
        setCurrentPage(newTotal);
        alert("Thêm người dùng thành công!");
      }
      setShowUserForm(false);
      setEditingUser(null);
      setUserForm(emptyForm);
    } catch (err) {
      console.error("User submit error:", err);
      setError(err?.message ?? "Đã có lỗi xảy ra");
      alert(err?.message ?? "Đã có lỗi xảy ra");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    setError(null);
    try {
      setDeletingId(id);
      if (!deleteUser) throw new Error("deleteUser function is not available");
      await deleteUser(id);
      const newTotal = Math.max(1, Math.ceil((users.length - 1) / ITEMS_PER_PAGE));
      if (currentPage > newTotal) setCurrentPage(newTotal);
    } catch (err) {
      console.error("Delete user error:", err);
      setError(err?.message ?? "Xóa thất bại");
      alert(err?.message ?? "Xóa thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const openDetail = (user) => {
    setDetailUser(user);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-4 min-h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh sách người dùng</h2>
          <p className="text-gray-600 mt-1">
            Tổng: {users?.length || 0} | Sau lọc: {filteredUsers?.length || 0} người dùng
          </p>
        </div>

        <button
          onClick={() => {
            setShowUserForm(true);
            setEditingUser(null);
            setUserForm(emptyForm);
            setError(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Thêm người dùng
        </button>
      </div>

      {/* Search Box */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
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
            placeholder="Tìm kiếm theo họ tên, email hoặc số điện thoại..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* No data state */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? "Không tìm thấy người dùng" : "Chưa có người dùng nào"}
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? "Thử thay đổi từ khóa tìm kiếm"
              : "Người dùng sẽ xuất hiện ở đây khi được thêm vào hệ thống"
            }
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed divide-y divide-gray-200 min-w-[1000px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Họ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Tên</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Điện thoại</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">Địa chỉ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Vai trò</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50" style={{ height: ROW_HEIGHT }}>
                      <td className="px-4 align-middle text-sm font-medium text-gray-900 w-20">
                        <Truncated text={String(user.id)} />
                      </td>
                      <td className="px-4 align-middle text-sm font-medium text-gray-900 w-32">
                        <Truncated text={user.first_name || ""} />
                      </td>
                      <td className="px-4 align-middle text-sm font-medium text-gray-900 w-32">
                        <Truncated text={user.last_name || ""} />
                      </td>
                      <td className="px-4 align-middle text-sm text-gray-500 w-48">
                        <Truncated text={user.email || ""} />
                      </td>
                      <td className="px-4 align-middle text-sm text-gray-500 w-36">
                        <Truncated text={user.phone || ""} />
                      </td>
                      <td className="px-4 align-middle text-sm text-gray-500 w-64">
                        <div
                          className="truncate whitespace-nowrap"
                          title={`${user.city || ""}${user.city && user.district ? ", " : ""}${user.district || ""}${user.district && user.ward ? ", " : ""}${user.ward || ""}${user.address ? " - " + user.address : ""}`}
                        >
                          {user.city}{user.city && user.district ? ", " : ""}{user.district}{user.district && user.ward ? ", " : ""}{user.ward}{user.address ? ` - ${user.address}` : ""}
                        </div>
                      </td>
                      <td className="px-4 align-middle text-sm text-gray-500 w-24">
                        <Truncated text={user.role || ""} />
                      </td>
                      <td className="px-4 align-middle text-sm font-medium w-32">
                        <div className="flex flex-col space-y-1">
                          <button onClick={() => openDetail(user)} className="text-blue-600 hover:text-blue-900 text-sm">Chi tiết</button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                            disabled={deletingId === user.id}
                          >
                            {deletingId === user.id ? "Xóa..." : "Xóa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Placeholder rows */}
                  {Array.from({ length: placeholderCount }).map((_, index) => (
                    <tr key={`empty-${index}`} style={{ height: ROW_HEIGHT }}>
                      <td colSpan={8} className="px-4">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={users?.length || 0}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>

          {/* Tablet view (fixed list height via placeholders) */}
          <div
            className="hidden sm:block lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            style={{ minHeight: `${ITEMS_PER_PAGE * TABLET_CARD_HEIGHT + 60}px` }}
          >
            <div className="divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-50" style={{ minHeight: `${TABLET_CARD_HEIGHT}px` }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{user.id}</span>
                        <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">{user.role}</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        <Truncated text={`${user.first_name || ""} ${user.last_name || ""}`} maxWidth="max-w-[200px]" />
                      </div>
                      <div className="text-xs text-gray-600">
                        <Truncated text={user.email || ""} maxWidth="max-w-[200px]" />
                      </div>
                      {user.phone && (
                        <div className="text-xs text-gray-600">
                          <Truncated text={user.phone || ""} maxWidth="max-w-[200px]" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {(user.city || user.district || user.ward || user.address) && (
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Địa chỉ:</span>
                          <div className="mt-1 truncate max-w-[200px]" title={`${user.city || ""}${user.city && user.district ? ", " : ""}${user.district || ""}${user.district && user.ward ? ", " : ""}${user.ward || ""}${user.address ? " - " + user.address : ""}`}>
                            {user.city}
                            {user.city && user.district ? ", " : ""}
                            {user.district}
                            {user.district && user.ward ? ", " : ""}
                            {user.ward}
                            {user.address ? ` - ${user.address}` : ""}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end space-x-3 pt-2">
                        <button onClick={() => openDetail(user)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                          disabled={deletingId === user.id}
                        >
                          {deletingId === user.id ? "Đang xóa..." : "Xóa"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Placeholders to keep list height consistent */}
              {Array.from({ length: placeholderCount }).map((_, idx) => (
                <div key={`empty-tab-${idx}`} className="p-4 opacity-0 select-none" style={{ minHeight: `${TABLET_CARD_HEIGHT}px` }}>
                  <div className="h-24" />
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={users?.length || 0}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>

          {/* Mobile list view (fixed list height via placeholders) */}
          <div
            className="sm:hidden space-y-3"
            style={{ minHeight: `${ITEMS_PER_PAGE * MOBILE_CARD_HEIGHT + 60}px` }}
          >
            {paginatedUsers.map((user) => (
              <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm" style={{ minHeight: `${MOBILE_CARD_HEIGHT}px` }}>
                <div className="space-y-2">
                  {/* User info header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{user.id}</span>
                      <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">{user.role}</span>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="text-sm font-semibold text-gray-900">
                    <Truncated text={`${user.first_name || ""} ${user.last_name || ""}`} maxWidth="max-w-[280px]" />
                  </div>

                  {/* Contact info */}
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Email:</span>
                      <Truncated className="mt-0.5" text={user.email || ""} maxWidth="max-w-[280px]" />
                    </div>
                    {user.phone && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">SĐT:</span>
                        <Truncated className="mt-0.5" text={user.phone || ""} maxWidth="max-w-[280px]" />
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  {(user.city || user.district || user.ward || user.address) && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Địa chỉ:</span>
                      <div className="mt-0.5 truncate max-w-[280px]" title={`${user.city || ""}${user.city && user.district ? ", " : ""}${user.district || ""}${user.district && user.ward ? ", " : ""}${user.ward || ""}${user.address ? " - " + user.address : ""}`}>
                        {user.city}
                        {user.city && user.district ? ", " : ""}
                        {user.district}
                        {user.district && user.ward ? ", " : ""}
                        {user.ward}
                        {user.address ? ` - ${user.address}` : ""}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100">
                    <button onClick={() => openDetail(user)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                      disabled={deletingId === user.id}
                    >
                      {deletingId === user.id ? "Đang xóa..." : "Xóa"}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Placeholders to keep list height consistent */}
            {Array.from({ length: placeholderCount }).map((_, idx) => (
              <div key={`empty-mob-${idx}`} className="bg-white border border-gray-200 rounded-lg p-3 opacity-0 select-none" style={{ minHeight: `${MOBILE_CARD_HEIGHT}px` }}>
                <div className="h-32" />
              </div>
            ))}

            {totalPages > 1 && (
              <div className="mt-4 bg-white rounded-lg border border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={users?.length || 0}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Form modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-[1px]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{editingUser ? "Sửa người dùng" : "Thêm người dùng"}</h3>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Họ"
                  value={userForm.first_name}
                  onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Tên"
                  value={userForm.last_name}
                  onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <input
                type="email"
                placeholder="Email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />

              <input
                type="password"
                placeholder={editingUser ? "Mật khẩu mới (bỏ trống nếu không đổi)" : "Mật khẩu"}
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required={!editingUser}
              />

              <input
                type="tel"
                placeholder="Điện thoại"
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />

              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Tỉnh/Thành"
                  value={userForm.city}
                  onChange={(e) => setUserForm({ ...userForm, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  placeholder="Huyện/Quận"
                  value={userForm.district}
                  onChange={(e) => setUserForm({ ...userForm, district: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  placeholder="Xã/Phường"
                  value={userForm.ward}
                  onChange={(e) => setUserForm({ ...userForm, ward: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <input
                type="text"
                placeholder="Địa chỉ cụ thể"
                value={userForm.address}
                onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
                    setUserForm(emptyForm);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={formLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={formLoading}
                >
                  {formLoading ? (editingUser ? "Đang cập nhật..." : "Đang thêm...") : (editingUser ? "Cập nhật" : "Thêm")}
                </button>
              </div>

              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </form>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {showDetailModal && detailUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Chi tiết người dùng</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-800 text-xl leading-none">
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span className="font-medium">ID:</span> {detailUser.id}
              </div>
              <div>
                <span className="font-medium">Vai trò:</span> {detailUser.role}
              </div>
              <div>
                <span className="font-medium">Họ:</span> {detailUser.first_name}
              </div>
              <div>
                <span className="font-medium">Tên:</span> {detailUser.last_name}
              </div>
              <div>
                <span className="font-medium">Email:</span> <span className="break-all">{detailUser.email}</span>
              </div>

              {detailUser.phone && (
                <div>
                  <span className="font-medium">Điện thoại:</span> {detailUser.phone}
                </div>
              )}

              {(detailUser.city || detailUser.district || detailUser.ward || detailUser.address) && (
                <div>
                  <span className="font-medium">Địa chỉ:</span>
                  <div className="mt-1 text-gray-600">
                    {detailUser.city && <div>Tỉnh/Thành: {detailUser.city}</div>}
                    {detailUser.district && <div>Quận/Huyện: {detailUser.district}</div>}
                    {detailUser.ward && <div>Phường/Xã: {detailUser.ward}</div>}
                    {detailUser.address && <div>Địa chỉ cụ thể: {detailUser.address}</div>}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <div>
                  <span className="font-medium">Ngày tạo:</span> {detailUser.created_at || detailUser.createdAt || "—"}
                </div>
                <div className="mt-1">
                  <span className="font-medium">Cập nhật:</span> {detailUser.updated_at || detailUser.updatedAt || "—"}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  startEditUser(detailUser);
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                Sửa thông tin
              </button>
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;