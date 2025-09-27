const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Đăng ký
const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone, city, district, ward, address } = req.body;

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.getByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            phone,
            city,
            district,
            ward,
            address,
        });

        // Xóa password khỏi response
        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            message: "Register success",
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Đăng nhập
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm user theo email
        const user = await User.getByEmail(email);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Kiểm tra password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid password" });

        // Tạo token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Xóa password khỏi response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: "Login success",
            token,
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Đăng xuất
const logout = async (req, res) => {
    try {
        // Với JWT thì logout chỉ cần client xóa token
        res.json({ message: "Logout success" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        const user = await User.getByIdPassword(userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await User.updatePassword(userId, hashedNewPassword);
        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { register, login, logout, changePassword };
