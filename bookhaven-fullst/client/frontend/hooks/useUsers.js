"use client";

import { useState, useEffect } from "react";
import api from "../lib/axiosClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [usersError, setUsersError] = useState(null);
    const token = localStorage.getItem("token") || null;
    const fetchUsers = async () => {
        setLoadingUsers(true);
        setUsersError(null);
        try {
            const { data } = await api.get(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setUsers(list);
            return list;
        } catch (err) {
            const message = err?.message ?? "Error fetching users";
            setUsersError(message);
            console.error("Error fetching users:", err);
            throw err;
        } finally {
            setLoadingUsers(false);
        }
    };

    const getUserById = async (userId) => {
        setUsersError(null);
        setLoadingUsers(true);
        try {
            const { data } = await api.get(`${API_BASE_URL}/users/${userId} `, { headers: { Authorization: `Bearer ${token}` } });
            const user = data ?? data?.data ?? null;
            return user;
        } catch (err) {
            const message = err?.message ?? "Error fetching user";
            setUsersError(message);
            console.error("Error fetching user by id:", err);
            throw err;
        } finally {
            setLoadingUsers(false);
        }
    };

    const registerUser = async (userData) => {
        setUsersError(null);
        try {
            const { data } = await api.post(`${API_BASE_URL}/users/register `, userData);
            const created = data ?? data?.data ?? data;
            setUsers((prev) => [...prev, created]);
            return created;
        } catch (err) {
            const message = err?.message ?? "Error registering user";
            setUsersError(message);
            console.error("Error registering user:", err);
            throw err;
        }
    };

    const updateUser = async (userId, userData) => {
        setUsersError(null);
        try {
            const { data } = await api.put(`${API_BASE_URL}/users/${userId}`, userData, { headers: { Authorization: `Bearer ${token}` } });
            const updated = data ?? data?.data ?? data;
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
            return updated;
        } catch (err) {
            const message = err?.message ?? "Error updating user";
            setUsersError(message);
            console.error("Error updating user:", err);
            throw err;
        }
    };

    const deleteUser = async (userId) => {
        setUsersError(null);
        try {
            await api.delete(`${API_BASE_URL}/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            return true;
        } catch (err) {
            const message = err?.message ?? "Error deleting user";
            setUsersError(message);
            console.error("Error deleting user:", err);
            throw err;
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        setUsersError(null)
        try {
            const { data } = await api.post(
                `${API_BASE_URL}/auth/change-password`,
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            return { success: true, data }
        } catch (err) {
            const message = err.response?.data?.error || "Error changing password"
            setUsersError(message)
            console.error("Error changing password:", err)
            return { success: false, error: message }
        }
    }

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (user?.role === "admin") {
            fetchUsers().catch(() => { });
        }
    }, []);


    return {
        users,
        setUsers,
        loadingUsers,
        usersError,
        fetchUsers,
        getUserById,
        registerUser,
        updateUser,
        deleteUser,
        changePassword
    };
};