import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { useAppContext } from "./contexts/AppContext";
import DashboardTab from "./components/admin/DashboardTab";
import ProductsTab from "./components/admin/ProductsTab";
import OrdersTab from "./components/admin/OrdersTab";
import UsersTab from "./components/admin/UsersTab";
import CategoriesTab from "./components/admin/CategoriesTab";
import OrderPage from "./pages/OrderPage";
import ScrollToTop from "./components/common/ScrollToTop";
import ProductDetailPage from "./pages/ProductDetailPage";

function App() {
  const location = useLocation();
  const { cartCount, handleSearch } = useAppContext();

  // Định nghĩa các trang có Header và Footer
  const pagesWithLayout = ["/", "/categories", "/cart", "/account", "/checkout", "/orders", "/product/:id"];

  // Kiểm tra trang hiện tại có cần Header/Footer không
  const showLayout = pagesWithLayout.some((route) => {
    if (route.includes(":id")) {
      // route dynamic, kiểm tra pathname bắt đầu bằng base
      const base = route.split("/:id")[0];
      return location.pathname.startsWith(base);
    }
    return route === location.pathname;
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - chỉ hiện ở các trang được chỉ định */}
      {showLayout && (
        <Header
          cartCount={cartCount}
          handleSearch={handleSearch}
        />
      )}
      <ScrollToTop />
      {/* Main content */}
      <main className={showLayout ? "flex-1" : "min-h-screen"}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          {/* Protected user route */}
          <Route
            path="/account"
            element={<ProtectedRoute><AccountPage /></ProtectedRoute>}
          />

          {/* Protected admin route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardTab />} />
            <Route path="products" element={<ProductsTab />} />
            <Route path="orders" element={<OrdersTab />} />
            <Route path="users" element={<UsersTab />} />
            <Route path="categories" element={<CategoriesTab />} />
          </Route>

        </Routes>
      </main>

      {/* Footer - chỉ hiện ở các trang được chỉ định */}
      {showLayout && <Footer />}
    </div>
  );
}

export default App;