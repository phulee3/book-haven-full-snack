const Product = require('../models/Product');
const { uploadToCloudinary } = require("../middleware/uploadFile");
const cloudinary = require("../config/cloudinary"); // hoặc đường dẫn config của bạn



//
// Lấy tất cả sản phẩm (dùng cho hiển thị danh sách)
//
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAllList();
    res.json(products);
  } catch (err) {
    console.error("Error fetching all products:", err);
    res.status(500).json({ error: 'Server error while fetching products' });
  }
};
//
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    res.status(500).json({ error: 'Server error while fetching product detail' });
  }
};

//
// Tìm sản phẩm theo từ khóa (title)
//
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    console.log("Search query:", q || 'ok'
    );
    const products = await Product.search(q || '');

    res.json(products);
  } catch (err) {
    console.error("Error searching products:", err);
    res.status(500).json({ error: 'Server error while searching products' });
  }
};

//
// Thêm sản phẩm mới
//
const createProduct = async (req, res) => {
  try {
    const newProduct = req.body;

    // Upload ảnh nếu có
    if (req.file) {
      const result = await uploadToCloudinary(req.file, "products");
      newProduct.image_url = result.secure_url;
      newProduct.public_id = result.public_id;
    }

    const created = await Product.create(newProduct);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while creating product" });
  }
};



//
// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let product = await Product.getById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Nếu có file mới, upload lên Cloudinary
    if (req.file) {
      if (product.public_id) {
        await cloudinary.uploader.destroy(product.public_id);
      }
      const result = await uploadToCloudinary(req.file, "products");
      req.body.image_url = result.secure_url;
      req.body.public_id = result.public_id;
    } else {
      // Nếu không có file mới, giữ nguyên ảnh cũ
      req.body.image_url = product.image_url;
      req.body.public_id = product.public_id;
    }

    // Cập nhật product
    product = await Product.update(id, req.body);
    res.json(product);

  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Server error while updating product" });
  }
};

//
// Xóa sản phẩm
//
// Controller
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Xóa ảnh trên Cloudinary nếu muốn
    if (product.public_id) {
      await cloudinary.uploader.destroy(product.public_id);
    }

    // Chỉ đánh dấu inactive
    await Product.deactivate(id);

    res.json({ message: "Product marked as inactive" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Server error while deleting product" });
  }
};



module.exports = {
  getAllProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
