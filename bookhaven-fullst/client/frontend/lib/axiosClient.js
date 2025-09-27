"use client";

import axios from "axios";

const API_BASE_URL =
    import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL || undefined,
});

// Những path của auth để tránh trigger "auth-expired" khi login/register sai
const AUTH_PATHS = ["/auth/login", "/auth/register", "/users/register"];

// Đặt Authorization header tự động (nếu có token)
api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem("token");
        if (token && !config.headers?.Authorization) {
            config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
        }
    } catch { }
    return config;
});

// Bắt 401/403, phát sự kiện "auth-expired"
api.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error?.response?.status;
        const url = error?.config?.url || "";

        const isAuthPath = AUTH_PATHS.some((p) => url.includes(p));
        if ((status === 401 || status === 403) && !isAuthPath) {
            try {
                localStorage.removeItem("token");
                localStorage.removeItem("currentUser");
            } catch { }

            // Phát sự kiện toàn cục để AppContext xử lý theo route hiện tại
            window.dispatchEvent(
                new CustomEvent("auth-expired", {
                    detail: {
                        status,
                        path: window.location?.pathname || "/",
                        source: "axiosClient",
                    },
                })
            );
        }
        return Promise.reject(error);
    }
);

export default api;