const db = require('../config/db');

const Review = {
    // Lấy tất cả review của 1 sản phẩm
    async getByProduct(productId) {
        const [rows] = await db.query(
            `SELECT r.*, u.first_name, u.last_name 
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ?
             ORDER BY r.created_at DESC`,
            [productId]
        );
        return rows;
    },

    // Lấy review theo ID
    async getById(id) {
        const [rows] = await db.query(
            `SELECT * FROM reviews WHERE id = ?`,
            [id]
        );
        return rows[0];
    },

    // Lấy review theo orderitem_id (kiểm tra đã đánh giá chưa)
    async getByOrderItem(orderitemId) {
        const [rows] = await db.query(
            `SELECT * FROM reviews WHERE orderitem_id = ?`,
            [orderitemId]
        );
        return rows[0];
    },

    // Tạo review mới
    async create(review) {
        const { product_id, user_id, orderitem_id, rating, comment } = review;

        // Kiểm tra đã có review cho orderitem này chưa
        const existing = await this.getByOrderItem(orderitem_id);
        if (existing) {
            throw new Error('Sản phẩm này đã được đánh giá cho đơn hàng này');
        }

        const [result] = await db.query(
            `INSERT INTO reviews (product_id, user_id, orderitem_id, rating, comment)
             VALUES (?, ?, ?, ?, ?)`,
            [product_id, user_id, orderitem_id, rating, comment]
        );

        return { id: result.insertId, ...review };
    },

    // Cập nhật review
    async update(id, review) {
        const { rating, comment } = review;
        const [result] = await db.query(
            `UPDATE reviews SET rating = ?, comment = ? WHERE id = ?`,
            [rating, comment, id]
        );
        return result.affectedRows > 0 ? { id, ...review } : null;
    },

    // Xóa review
    async remove(id) {
        const [result] = await db.query(
            `DELETE FROM reviews WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Review;
