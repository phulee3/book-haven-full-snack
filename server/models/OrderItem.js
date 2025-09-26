const db = require('../config/db');

const OrderItem = {
    // Lấy tất cả sản phẩm trong một đơn hàng
    async getByOrderId(orderId) {
        const [rows] = await db.query(
            `SELECT oi.*, p.title, p.image_url
             FROM orderitems oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [orderId]
        );
        return rows;
    },

    // Thêm sản phẩm vào đơn hàng
    async create(item) {
        const { order_id, product_id, quantity, price } = item;
        const [result] = await db.query(
            `INSERT INTO orderitems (order_id, product_id, quantity, price)
             VALUES (?, ?, ?, ?)`,
            [order_id, product_id, quantity, price]
        );
        return { id: result.insertId, ...item };
    },

    // Cập nhật sản phẩm trong đơn hàng
    async update(id, item) {
        const { quantity, price } = item;
        const [result] = await db.query(
            `UPDATE orderitems
             SET quantity = ?, price = ?
             WHERE id = ?`,
            [quantity, price, id]
        );
        return result.affectedRows > 0 ? { id, ...item } : null;
    },

    // Xóa sản phẩm khỏi đơn hàng
    async remove(id) {
        const [result] = await db.query(
            `DELETE FROM orderitems WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = OrderItem;
