"use client";

import { useState, useEffect } from "react";
import api from "../lib/axiosClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [categoriesError, setCategoriesError] = useState(null);

    const fetchCategories = async () => {
        setLoadingCategories(true);
        setCategoriesError(null);
        try {
            const { data } = await api.get(`${API_BASE_URL}/category`);
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setCategories(list);
            return list;
        } catch (err) {
            const message = err?.message ?? "Error fetching categories";
            setCategoriesError(message);
            console.error("Error fetching categories:", err);
            throw err;
        } finally {
            setLoadingCategories(false);
        }
    };

    const addCategory = async (categoryData) => {
        setCategoriesError(null);
        try {
            const payload = { ...categoryData };
            if (!payload.key && payload.name) {
                payload.key = payload.name.toLowerCase().trim().replace(/\s+/g, "-");
            }
            const { data } = await api.post(`${API_BASE_URL}/category`, payload);
            const created = Array.isArray(data) ? data[0] : data?.data ?? data;
            setCategories((prev) => [...prev, created]);
            return created;
        } catch (err) {
            const message = err?.message ?? "Error creating category";
            setCategoriesError(message);
            console.error("Error creating category:", err);
            throw err;
        }
    };

    const updateCategory = async (categoryId, categoryData) => {
        setCategoriesError(null);
        try {
            const payload = { ...categoryData };
            if (payload.name && !payload.key) {
                payload.key = payload.name.toLowerCase().trim().replace(/\s+/g, "-");
            }
            const { data } = await api.put(`${API_BASE_URL}/category/${categoryId}`, payload);
            const updated = Array.isArray(data) ? data[0] : data?.data ?? data;
            setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, ...updated } : c)));
            return updated;
        } catch (err) {
            const message = err?.message ?? "Error updating category";
            setCategoriesError(message);
            console.error("Error updating category:", err);
            throw err;
        }
    };

    const deleteCategory = async (categoryId) => {
        setCategoriesError(null);
        try {
            await api.delete(`${API_BASE_URL}/category/${categoryId}`);
            setCategories((prev) => prev.filter((c) => c.id !== categoryId));
            return true;
        } catch (err) {
            const message = err?.message ?? "Error deleting category";
            setCategoriesError(message);
            console.error("Error deleting category:", err);
            throw err;
        }
    };

    const getCategoryByKey = (key) => categories.find((c) => c.key === key);
    const getCategoryById = (id) => categories.find((c) => c.id === id);

    useEffect(() => {
        fetchCategories().catch(() => { });
    }, []);

    return {
        categories,
        setCategories,
        loadingCategories,
        categoriesError,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryByKey,
        getCategoryById,
    };
};