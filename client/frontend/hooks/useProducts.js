import { useState, useEffect } from "react";
import api from "../lib/axiosClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get(`${API_BASE_URL}/products`);
            const activeProducts = Array.isArray(data)
                ? data.filter((p) => p.is_active === 1)
                : [];
            setProducts(activeProducts);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (productData, imageFile = null) => {
        const formData = new FormData();
        Object.keys(productData).forEach((key) => {
            formData.append(key, productData[key]);
        });
        if (imageFile) formData.append("file", imageFile);

        const { data } = await api.post(`${API_BASE_URL}/products`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        // Refresh toàn bộ danh sách thay vì chỉ thêm vào state
        await fetchProducts();
        return data;
    };

    const updatedProduct = async (productId, productData, imageFile = null) => {
        setLoading(true);
        try {
            let updatedData = { ...productData };

            const formData = new FormData();
            Object.keys(updatedData).forEach((key) => {
                formData.append(key, updatedData[key]);
            });
            if (imageFile) formData.append("file", imageFile);

            const { data: updatedProduct } = await api.put(
                `${API_BASE_URL}/products/${productId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // Refresh toàn bộ danh sách sau khi update thành công
            await fetchProducts();
            return updatedProduct;
        } catch (err) {
            console.error("Error updating product:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (productId) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`${API_BASE_URL}/products/${productId}`);
            setProducts((prev) => prev.filter((p) => p.id !== productId));
            return true;
        } catch (err) {
            setError(err.message);
            console.error("Error deleting product:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const normalizeProduct = (product) => {
        return {
            id: product.id,
            title: product.title,
            author: product.author,
            category_id: product.category_id || product.categoryId,
            price: product.price,
            stock: product.stock,
        };
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return {
        products,
        loading,
        error,
        fetchProducts,
        handleCreateProduct,
        updatedProduct,
        deleteProduct,
    };
};