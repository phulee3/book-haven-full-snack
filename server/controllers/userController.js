const User = require('../models/User');

//
// Lấy danh sách tất cả user
//
const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (err) {
        console.error("Error fetching all users:", err);
        res.status(500).json({ error: 'Server error while fetching users' });
    }
};

//
// Lấy thông tin user theo ID
//
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.getById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error("Error fetching user by ID:", err);
        res.status(500).json({ error: 'Server error while fetching user' });
    }
};

//
// Đăng ký user mới
//
const registerUser = async (req, res) => {
    try {
        const newUser = req.body;
        const created = await User.create(newUser);
        res.status(201).json(created);
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ error: 'Server error while registering user' });
    }
};

//
// Cập nhật thông tin user
//
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = await User.update(id, req.body);

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found to update' });
        }

        res.json(updatedUser);
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: 'Server error while updating user' });
    }
};

//
// Xóa user
//
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await User.deactivate(id);

        if (!success) {
            return res.status(404).json({ error: 'User not found to delete' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: 'Server error while deleting user' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    registerUser,
    updateUser,
    deleteUser,
};
