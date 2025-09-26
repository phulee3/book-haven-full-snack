const db = require('../config/db');

const Discount = {
    // Lấy tất cả discount
    async getAll() {
        const [rows] = await db.query(
            `SELECT d.*, p.title 
       FROM discounts d
       JOIN products p ON d.product_id = p.id
       ORDER BY d.created_at DESC`
        );
        return rows;
    },

    // Lấy discount theo ID
    async getById(id) {
        const [rows] = await db.query(
            `SELECT * FROM discounts WHERE id = ?`,
            [id]
        );
        return rows[0];
    },

    // Lấy discount theo sản phẩm (chỉ lấy discount còn hiệu lực)
    async getByProduct(productId) {
        const [rows] = await db.query(
            `SELECT * FROM discounts 
       WHERE product_id = ? 
       AND start_date <= CURDATE() AND end_date >= CURDATE()
       ORDER BY created_at DESC`,
            [productId]
        );
        return rows[0]; // 1 sản phẩm thường chỉ có 1 discount active
    },

    // Tạo discount mới
    async create(discount) {
        const { product_id, discount_percent, start_date, end_date } = discount;
        const [result] = await db.query(
            `INSERT INTO discounts (product_id, discount_percent, start_date, end_date)
       VALUES (?, ?, ?, ?)`,
            [product_id, discount_percent, start_date, end_date]
        );
        return { id: result.insertId, ...discount };
    },

    // Cập nhật discount
    async update(id, discount) {
        const { product_id, discount_percent, start_date, end_date } = discount;
        const [result] = await db.query(
            `UPDATE discounts 
       SET product_id = ?, discount_percent = ?, start_date = ?, end_date = ?
       WHERE id = ?`,
            [product_id, discount_percent, start_date, end_date, id]
        );
        return result.affectedRows > 0 ? { id, ...discount } : null;
    },

    // Xóa discount
    async remove(id) {
        const [result] = await db.query(
            `DELETE FROM discounts WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Discount;
