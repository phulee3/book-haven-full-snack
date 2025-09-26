const db = require('../config/db');

const Order = {
    async getAll() {
        const [rows] = await db.query(
            `SELECT o.*, u.first_name, u.last_name, u.email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
        );
        return rows;
    },


    async getByUserId(userId) {
        const [orders] = await db.query(
            `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
            [userId]
        );

        for (const order of orders) {
            const [items] = await db.query(
                `SELECT * FROM orderitems WHERE order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        return orders;
    },

    async getById(id) {
        const [rows] = await db.query(
            `SELECT * FROM orders WHERE id = ?`,
            [id]
        );
        return rows[0];
    },

    async getByUser(userId) {
        const [rows] = await db.query(
            `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
            [userId]
        );
        return rows;
    },

    async create(order) {
        const { user_id, total_amount, status, payment_method, shipping_address } = order;
        const [result] = await db.query(
            `INSERT INTO orders (user_id, total_amount, status, payment_method, shipping_address)
       VALUES (?, ?, ?, ?, ?)`,
            [user_id, total_amount, status, payment_method, shipping_address]
        );

        return { id: result.insertId, ...order };
    },

    async updateStatus(id, status) {
        const [result] = await db.query(
            `UPDATE orders SET status = ? WHERE id = ?`,
            [status, id]
        );
        return result.affectedRows > 0;
    },

    async findByIdAndUpdate(id) {
        const [result] = await db.query(
            `UPDATE orders SET status = "processing", 
            payment_status = "paid", 
            payment_time = NOW()
         WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
    ,
    async remove(id) {
        const [result] = await db.query(
            `DELETE FROM orders WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Order;
