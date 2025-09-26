import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || null
  );
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const getToken = () =>
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setCurrentUser(data.user);
      setShowLoginModal(false);
      return true;
    } catch (err) {
      alert(err.response?.data?.message || "Sai thông tin đăng nhập");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/register`,
        userData
      );
      setShowRegister(false);
      return { success: true, user: data.user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Đăng ký thất bại",
      };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    localStorage.clear();
    setCurrentUser(null);
    navigate("/", { replace: true });
    alert("Đăng xuất thành công.");
  };

  const isTokenValid = () => {
    const token = getToken();
    if (!token) return false;
    try {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      return exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  };

  return {
    currentUser,
    setCurrentUser,
    showLoginModal,
    setShowLoginModal,
    showRegister,
    setShowRegister,
    loading,
    handleLogin,
    handleRegister,
    handleLogout,
    getToken,
    isTokenValid,
  };
}
