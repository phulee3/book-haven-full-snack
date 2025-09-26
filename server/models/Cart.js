const db = require('../config/db');

const Cart = {
  // Lấy giỏ hàng theo user
  async getByUserId(userId) {
    const [rows] = await db.query(
      `SELECT c.id, c.user_id, c.product_id, c.quantity, p.title, p.price, p.image_url
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );
    return rows;
  },

  // Thêm sản phẩm vào giỏ
  async addItem(userId, productId, quantity) {
    const [result] = await db.query(
      `INSERT INTO cart (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [userId, productId, quantity]
    );
    return result.insertId;
  },

  // Lấy 1 mục trong giỏ theo user và product
  async getItemByUserAndProduct(userId, productId) {
    const [rows] = await db.query(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );
    return rows[0]; // hoặc null nếu không có
  },

  // Cập nhật số lượng sản phẩm trong giỏ (khi sản phẩm đã có trong giỏ hàng)
  async updateQuantity(userId, productId, quantity) {
    const [result] = await db.query(
      `UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?`,
      [quantity, userId, productId]
    );

    // Trả về true nếu update thành công, false nếu không tìm thấy
    return result.affectedRows > 0;
  },

  // Capa nhật số lượng sản phẩm bằng id
  async updateItem(id, quantity) {
    const [result] = await db.query(
      `UPDATE cart SET quantity = ?  WHERE id = ?`,
      [quantity, id]
    );

    // Trả về true nếu update thành công, false nếu không tìm thấy
    return result.affectedRows > 0;
  },



  // Xóa 1 sản phẩm khỏi giỏ
  async removeItem(id) {
    const [result] = await db.query(
      `DELETE FROM cart WHERE id=?`,
      [id]
    );
    return result.affectedRows > 0;
  },

  // xoa san pham khi tao don hang
  async removeItemsByOrder(order_id, user_id) {
    const [result] = await db.query(
      `DELETE c
     FROM cart c
     JOIN orderitems oi
       ON c.product_id = oi.product_id
     WHERE oi.order_id = ? AND c.user_id = ?`,
      [order_id, user_id]
    );
    return result.affectedRows > 0;
  },



  // Xóa toàn bộ giỏ
  async clear(userId) {
    const [result] = await db.query(
      `DELETE FROM cart WHERE user_id = ?`,
      [userId]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Cart;
