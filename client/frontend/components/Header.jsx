"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import LoginModal from "./LoginModal";

const Header = ({ cartCount, handleSearch }) => {
  const [searchInput, setSearchInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // State local cho modal

  const navigate = useNavigate();
  const location = useLocation();

  // Lấy context data
  const {
    currentUser,
    handleLogin,
    handleLogout,
    showRegister,
    setShowRegister,
    handleRegister,
  } = useAppContext();

  // Reset states when location changes
  useEffect(() => {
    setShowMenu(false);
    setShowMobileSearch(false);
  }, [location.pathname]);

  // Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.account-dropdown')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (searchInput.trim()) {
      handleSearch(searchInput.trim());
      setShowMobileSearch(false);
      setTimeout(() => {
        navigate("/categories", { replace: false });
      }, 0);
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTimeout(() => {
      navigate("/", { replace: false });
    }, 0);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentUser) {
      setTimeout(() => {
        navigate("/cart", { replace: false });
      }, 0);
    } else {
      setShowLoginModal(true); // Mở modal login
    }
  };

  const handleCategoriesClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (handleSearch) {
      handleSearch("");
    }
    setTimeout(() => {
      navigate("/categories", { replace: false });
    }, 0);
  };

  const handleOrderTrackingClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentUser) {
      setTimeout(() => {
        navigate("/orders", { replace: false });
      }, 0);
    } else {
      setShowLoginModal(true); // Mở modal login
    }
  };

  const handleAccountClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    setShowLoginModal(true); // Mở modal login trực tiếp
  };

  const handleAccountPageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    const targetPage = currentUser?.role === "admin" ? "/admin" : "/account";
    setTimeout(() => {
      navigate(targetPage, { replace: false });
    }, 0);
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    if (handleLogout) {
      handleLogout();
    }
    setTimeout(() => {
      navigate("/", { replace: false });
    }, 0);
  };

  // Handle login form submit
  const onLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    const success = handleLogin(email, password);

    if (success) {
      setShowLoginModal(false); // Đóng modal
      // Redirect based on user role
      setTimeout(() => {
        navigate(currentUser?.role === "admin" ? "/admin" : "/");
      }, 100);
    } else {
      alert("Thông tin đăng nhập không chính xác");
    }
  };

  // Handle register form submit
  const onRegister = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      province: formData.get("province"),
      district: formData.get("district"),
      ward: formData.get("ward"),
      address: formData.get("address"),
    };

    const result = handleRegister(payload);
    if (result.success) {
      alert("Đăng ký thành công!");
      setShowRegister(false);
      setShowLoginModal(false);
    } else {
      alert(result.message || "Có lỗi xảy ra khi đăng ký");
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm">
        {/* Main header */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-7 py-0 sm:py-0">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <div
              className="flex items-center cursor-pointer shrink-0"
              onClick={handleLogoClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleLogoClick(e)}
            >
              {/* Fixed-size logo container */}
              <div className="relative h-20 lg:h-26 w-[150px] lg:w-[180px] overflow-hidden">
                <img
                  src="/BookHaven (1).png"
                  alt="BookHaven"
                  className="absolute inset-0 w-full h-full object-contain scale-[1.25] lg:scale-[1.45] origin-left"
                  draggable="false"
                />
              </div>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-3xl mx-4">
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="flex h-10 rounded-md overflow-hidden border border-red-600 bg-white">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                      🔍
                    </span>
                    <input
                      type="text"
                      placeholder="Tìm kiếm sách, tác giả..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full h-full pl-10 pr-4 border-0 focus:outline-none focus:ring-0 text-sm placeholder-gray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </form>
            </div>

            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 text-gray-700 hover:text-red-600"
            >
              <span className="text-xl">🔍</span>
            </button>

            {/* Right menu */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
              {/* Order tracking */}
              <button
                type="button"
                className="flex flex-col items-center text-gray-700 hover:text-red-600"
                onClick={handleOrderTrackingClick}
              >
                <span className="text-xl lg:text-2xl">📞</span>
                <div className="text-xs lg:text-sm leading-tight text-center hidden sm:block">
                  <div className="font-medium">Tra cứu đơn hàng</div>
                </div>
              </button>

              {/* Cart */}
              <button
                type="button"
                onClick={handleCartClick}
                className="flex flex-col items-center text-gray-700 hover:text-red-600 relative"
              >
                <span className="text-xl lg:text-2xl">🛒</span>
                <div className="text-xs lg:text-sm leading-tight text-center hidden sm:block">
                  <div className="font-medium">Giỏ hàng</div>
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] lg:text-[11px] rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* Account */}
              <div className="relative account-dropdown">
                <button
                  type="button"
                  onClick={handleAccountClick}
                  className="flex flex-col items-center text-gray-700 hover:text-red-600 relative"
                >
                  <span className="text-xl lg:text-2xl">👤</span>
                  <div className="text-xs lg:text-sm leading-tight text-center hidden sm:block">
                    <div className="font-medium truncate max-w-20">
                      {currentUser ? currentUser.name : "Tài khoản"}
                    </div>
                  </div>
                </button>

                {/* User dropdown menu */}
                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      {!currentUser && (
                        <button
                          onClick={handleLoginClick}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          type="button"
                        >
                          Đăng nhập
                        </button>
                      )}
                      {currentUser && (
                        <>
                          <button
                            onClick={handleAccountPageClick}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            type="button"
                          >
                            {currentUser.role === "admin" ? "Quản trị" : "Tài khoản"}
                          </button>
                          <button
                            onClick={handleLogoutClick}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            type="button"
                          >
                            Đăng xuất
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showMobileSearch && (
            <div className="md:hidden mt-3 pb-2">
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="flex h-10 rounded-md overflow-hidden border border-red-600 bg-white">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                      🔍
                    </span>
                    <input
                      type="text"
                      placeholder="Tìm kiếm sách, tác giả..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full h-full pl-10 pr-4 border-0 focus:outline-none focus:ring-0 text-sm placeholder-gray-400"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Tìm
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Top bar */}
        <div className="bg-rose-50 py-2">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-7">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 place-items-center text-gray-700 text-[11px] sm:text-[13px]">
              <button
                type="button"
                className="flex items-center gap-1 sm:gap-2 hover:text-red-600 px-2 py-1"
                onClick={handleCategoriesClick}
              >
                <span className="text-red-600">≡</span>
                <span className="font-medium whitespace-nowrap">DANH MỤC SÁCH</span>
              </button>

              <div className="flex items-center gap-1 sm:gap-2 px-2 py-1">
                <span className="text-red-600">👁️</span>
                <span className="whitespace-nowrap">Sản phẩm đã xem</span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 px-2 py-1">
                <span className="text-red-600">🚚</span>
                <span className="whitespace-nowrap text-center">Ship COD Toàn Quốc</span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 px-2 py-1">
                <span className="text-red-600">🎁</span>
                <span className="whitespace-nowrap">Free Ship Trên 500k</span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 px-2 py-1">
                <span className="text-red-600">📞</span>
                <span className="font-medium">0934872369</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default Header;