const db = require('../config/db');

const Category = {
    // Lấy tất cả category đang active
    async getAll() {
        const [rows] = await db.query(
            `SELECT * FROM category WHERE is_active = 1`
        );
        return rows;
    },

    // Lấy category theo id (chỉ khi is_active=1)
    async getById(id) {
        const [rows] = await db.query(
            `SELECT * FROM category WHERE id = ? AND is_active = 1`,
            [id]
        );
        return rows[0];
    },

    // Tạo mới (luôn set active = 1)
    async create({ name, description }) {
        const [result] = await db.query(
            `INSERT INTO category (name, description, is_active) VALUES (?, ?, 1)`,
            [name, description]
        );
        return { id: result.insertId, name, description, is_active: 1 };
    },

    // Cập nhật chỉ khi đang active
    async update(id, data) {
        const [result] = await db.query(
            `UPDATE category 
       SET name = ?, description = ? 
       WHERE id = ? AND is_active = 1`,
            [data.name, data.description, id]
        );
        return result.affectedRows > 0;
    },

    // Xóa mềm → set is_active = 0
    async deactivate(id) {
        const [result] = await db.query(
            `UPDATE category SET is_active = 0 WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Category;
