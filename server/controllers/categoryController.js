const Category = require('../models/Category');

// =========================
// Category Controller
// =========================

// Lấy tất cả category
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách category' });
    }
};

// Lấy category theo id
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.getById(id);
        if (!category) {
            return res.status(404).json({ error: 'Category không tồn tại' });
        }
        res.json(category);
    } catch (err) {
        console.error('Error fetching category:', err);
        res.status(500).json({ error: 'Lỗi khi lấy category' });
    }
};

// Tạo category mới
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newCategory = await Category.create({ name, description });
        res.status(201).json(newCategory);
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ error: 'Lỗi khi thêm category' });
    }
};

// Cập nhật category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Category.update(id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Category không tồn tại' });
        }
        res.json(updated);
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({ error: 'Lỗi khi cập nhật category' });
    }
};

// Xóa category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Category.deactivate(id);
        if (!success) {
            return res.status(404).json({ error: 'Category không tồn tại' });
        }
        res.json({ message: 'Xóa category thành công' });
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ error: 'Lỗi khi xóa category' });
    }
};
