const Discount = require('../models/Discount');

// =========================
// Discount Controller
// =========================

// Lấy tất cả discount
exports.getAllDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.getAll();
        res.json(discounts);
    } catch (err) {
        console.error('Error fetching discounts:', err);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách discount' });
    }
};

// Lấy discount theo id
exports.getDiscountById = async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await Discount.getById(id);
        if (!discount) {
            return res.status(404).json({ error: 'Discount không tồn tại' });
        }
        res.json(discount);
    } catch (err) {
        console.error('Error fetching discount:', err);
        res.status(500).json({ error: 'Lỗi khi lấy discount' });
    }
};

// Tạo discount mới
exports.createDiscount = async (req, res) => {
    try {
        const { code, description, discount_percent, start_date, end_date, product_id } = req.body;
        const newDiscount = await Discount.create({ code, description, discount_percent, start_date, end_date, product_id });
        res.status(201).json(newDiscount);
    } catch (err) {
        console.error('Error creating discount:', err);
        res.status(500).json({ error: 'Lỗi khi thêm discount' });
    }
};

// Cập nhật discount
exports.updateDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Discount.update(id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Discount không tồn tại' });
        }
        res.json(updated);
    } catch (err) {
        console.error('Error updating discount:', err);
        res.status(500).json({ error: 'Lỗi khi cập nhật discount' });
    }
};

// Xóa discount
exports.deleteDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Discount.remove(id);
        if (!success) {
            return res.status(404).json({ error: 'Discount không tồn tại' });
        }
        res.json({ message: 'Xóa discount thành công' });
    } catch (err) {
        console.error('Error deleting discount:', err);
        res.status(500).json({ error: 'Lỗi khi xóa discount' });
    }
};
