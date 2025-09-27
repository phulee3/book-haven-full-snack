const db = require('../config/db');

const Product = {
  // Lấy tất cả sản phẩm (chỉ active)
  async getAllList() {
    const [rows] = await db.query(
      `SELECT * 
       FROM products 
       WHERE is_active = 1
       ORDER BY created_at DESC`
    );
    return rows;
  },

  // Lấy chi tiết sản phẩm theo ID (chỉ active)
  async getById(id) {
    const [rows] = await db.query(
      `SELECT * FROM products WHERE id = ? AND is_active = 1`,
      [id]
    );
    return rows[0];
  },

  // Lấy sản phẩm theo category (chỉ active)
  async getByCategory(categoryId) {
    const [rows] = await db.query(
      `SELECT id, title, price, image_url 
       FROM products 
       WHERE category_id = ? AND is_active = 1
       ORDER BY created_at DESC`,
      [categoryId]
    );
    return rows;
  },

  // Tìm kiếm theo tiêu đề (chỉ active)
  async search(q) {
    const [rows] = await db.query(
      `SELECT id, title, price, image_url 
       FROM products 
       WHERE LOWER(title) LIKE ? AND is_active = 1
       ORDER BY created_at DESC`,
      [`%${q.toLowerCase().trim()}%`]
    );
    return rows;
  },

  // Thêm sản phẩm mới (mặc định active = 1)
  async create(product) {
    const {
      title, author, translator, publisher, pages, dimensions, weight,
      publish_year, price, stock, category_id, description, image_url
    } = product;

    const [result] = await db.query(
      `INSERT INTO products 
        (title, author, translator, publisher, pages, dimensions, weight, 
         publish_year, price, stock, category_id, description, image_url, created_at, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)`,
      [
        title, author, translator, publisher, pages, dimensions, weight,
        publish_year, price, stock, category_id, description, image_url
      ]
    );

    return { id: result.insertId, ...product, is_active: 1 };
  },

  // Cập nhật sản phẩm (chỉ active)
  async update(id, product) {
    const {
      title, author, translator, publisher, pages, dimensions, weight,
      publish_year, price, stock, category_id, description, image_url
    } = product;

    const [result] = await db.query(
      `UPDATE products SET 
        title = ?, author = ?, translator = ?, publisher = ?, pages = ?, 
        dimensions = ?, weight = ?, publish_year = ?, price = ?, 
        stock = ?, category_id = ?, description = ?, image_url = ? 
       WHERE id = ? AND is_active = 1`,
      [
        title, author, translator, publisher, pages, dimensions, weight,
        publish_year, price, stock, category_id, description, image_url, id
      ]
    );

    return result.affectedRows > 0 ? { id, ...product } : null;
  },

  // Xóa mềm sản phẩm → set is_active = 0
  async deactivate(id) {
    const [result] = await db.query(
      `UPDATE products SET is_active = 0 WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Product;
