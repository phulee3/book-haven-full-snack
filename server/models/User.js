const db = require('../config/db');

const User = {
    // Lấy tất cả user (ẩn password) chỉ lấy active
    async getAll() {
        const [rows] = await db.query(
            `SELECT id, first_name, last_name, email, phone, city, district, ward, address, created_at
       FROM users 
       WHERE is_active = 1
       ORDER BY created_at DESC`
        );
        return rows;
    },

    // Lấy user theo ID (chỉ active)
    async getById(id) {
        const [rows] = await db.query(
            `SELECT id, first_name, last_name, email, phone, city, district, ward, address, created_at
       FROM users 
       WHERE id = ? AND is_active = 1`,
            [id]
        );
        return rows[0];
    },
    async getByIdPassword(id) {
        const [rows] = await db.query(
            `SELECT id, email, password FROM users 
       WHERE id = ? AND is_active = 1`,
            [id]
        );
        return rows[0];
    },

    // Lấy user theo email (login) — thường vẫn cần user active
    async getByEmail(email) {
        const [rows] = await db.query(
            `SELECT * FROM users WHERE email = ? AND is_active = 1`,
            [email]
        );
        return rows[0];
    },

    // Tạo user mới (mặc định active = 1)
    async create(user) {
        const { first_name, last_name, email, password, phone, city, district, ward, address } = user;
        const [result] = await db.query(
            `INSERT INTO users (first_name, last_name, email, password, phone, city, district, ward, address, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [first_name, last_name, email, password, phone, city, district, ward, address]
        );
        return { id: result.insertId, ...user, is_active: 1 };
    },

    // Cập nhật user (chỉ active mới update)
    async update(id, user) {
        const { first_name, last_name, phone, city, district, ward, address } = user;
        const [result] = await db.query(
            `UPDATE users 
       SET first_name = ?, last_name = ?, phone = ?, city = ?, district = ?, ward = ?, address = ?
       WHERE id = ? AND is_active = 1`,
            [first_name, last_name, phone, city, district, ward, address, id]
        );
        return result.affectedRows > 0 ? { id, ...user } : null;
    },

    async updatePassword(id, hashedPassword) {
        const [result] = await db.query(
            `UPDATE users SET password = ? WHERE id = ?`,
            [hashedPassword, id]
        );
        return result.affectedRows > 0;
    },

    // Xóa mềm user → set is_active = 0
    async deactivate(id) {
        const [result] = await db.query(
            `UPDATE users SET is_active = 0 WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = User;
