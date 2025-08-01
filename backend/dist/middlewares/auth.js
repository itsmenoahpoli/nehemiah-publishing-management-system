"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAnyRole = exports.requireClerk = exports.requireAdmin = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access token required" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await prisma.userAccounts.findUnique({
            where: { id: decoded.userId },
        });
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Invalid or inactive user" });
        }
        req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        };
        next();
    }
    catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)([client_1.Role.ADMIN]);
exports.requireClerk = (0, exports.requireRole)([client_1.Role.CLERK]);
exports.requireAnyRole = (0, exports.requireRole)([client_1.Role.ADMIN, client_1.Role.CLERK]);
//# sourceMappingURL=auth.js.map