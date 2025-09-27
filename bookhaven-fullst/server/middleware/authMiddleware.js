const jwt = require("jsonwebtoken");

// Helper: lấy token từ header Authorization
function getTokenFromHeader(req) {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader) return null;

    // Hỗ trợ cả "Bearer <token>" và chỉ "<token>"
    if (authHeader.startsWith("Bearer ")) {
        return authHeader.slice(7).trim();
    }
    return authHeader.trim();
}

// Chuẩn hoá user từ payload token
function normalizeUser(decoded) {
    const id = decoded.id ?? decoded.user_id ?? decoded._id;
    const rawRole = decoded.role ?? decoded.type ?? "user";
    const role = String(rawRole).toLowerCase();
    return { ...decoded, id, role };
}

// Middleware: yêu cầu đăng nhập
function requireAuth(req, res, next) {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ error: "Chưa đăng nhập" });

    try {
        const secret = process.env.JWT_SECRET || "your-secret";
        const decoded = jwt.verify(token, secret);
        const user = normalizeUser(decoded);

        if (!user.id) {
            return res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
        }

        req.user = user; // gắn user info chuẩn hoá vào request
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
    }
}

// Middleware: yêu cầu quyền admin
function requireAdmin(req, res, next) {
    if (!req.user) return res.status(401).json({ error: "Chưa đăng nhập" });
    if ((req.user.role || "").toLowerCase() !== "admin") {
        return res.status(403).json({ error: "Không có quyền truy cập" });
    }
    next();
}

// Giữ tương thích cách import cũ: module.exports = authMiddleware
// và đồng thời cung cấp named export cho requireAdmin
module.exports = requireAuth;
module.exports.requireAuth = requireAuth;
module.exports.requireAdmin = requireAdmin;