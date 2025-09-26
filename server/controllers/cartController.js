const Cart = require('../models/Cart');

//
// Lấy giỏ hàng của 1 user
//
const getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.getByUserId(userId);
    res.json(cart);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: 'Server error while fetching cart' });
  }
};

//
// Thêm sản phẩm vào giỏ
//
const addToCart = async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    const existingItem = await Cart.getItemByUserAndProduct(user_id, product_id);

    if (existingItem) {
      const updated = await Cart.updateQuantity(user_id, product_id, existingItem.quantity + quantity);
      if (updated) {
        return res.json({ message: "Cart updated successfully" }); // thông báo đơn giản
      } else {
        return res.status(404).json({ message: "Item not found in cart" });
      }
    }

    await Cart.addItem(user_id, product_id, quantity);
    res.status(201).json({ message: "Item added to cart successfully" });

  } catch (err) {
    console.error("Error adding item to cart:", err);
    res.status(500).json({ error: 'Server error while adding item to cart' });
  }
};


//
// Cập nhật số lượng sản phẩm trong giỏ
//
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const updated = await Cart.updateItem(id, quantity);

    if (!updated) {
      return res.status(404).json({ error: 'Cart item not found to update' });
    }

    res.json({ message: "update quantity successful!", id, quantity });
  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({ error: 'Server error while updating cart item' });
  }
};

module.exports = {
  updateCartItem,
};

//
// Xóa sản phẩm khỏi giỏ
//
const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params; // cart item id
    const success = await Cart.removeItem(id);

    if (!success) {
      return res.status(404).json({ error: 'Cart item not found to delete' });
    }

    res.json({ message: 'Cart item deleted successfully' });
  } catch (err) {
    console.error("Error deleting cart item:", err);
    res.status(500).json({ error: 'Server error while deleting cart item' });
  }
};

//
// Xóa toàn bộ giỏ hàng của user
//
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const success = await Cart.clear(userId);

    if (!success) {
      return res.status(404).json({ error: 'Cart not found or already empty' });
    }

    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ error: 'Server error while clearing cart' });
  }
};

module.exports = {
  getCartByUser,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
