"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post("/login", [
    (0, express_validator_1.body)("username").notEmpty().withMessage("Username is required"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array(),
            });
        }
        const { username, password } = req.body;
        const user = await prisma.userAccounts.findUnique({
            where: { username },
        });
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            username: user.username,
            role: user.role,
        }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            },
            message: "Login successful",
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/change-password", auth_1.authenticateToken, [
    (0, express_validator_1.body)("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),
    (0, express_validator_1.body)("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters"),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array(),
            });
        }
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        const user = await prisma.userAccounts.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res
                .status(400)
                .json({ message: "Current password is incorrect" });
        }
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma.userAccounts.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        res.json({
            success: true,
            message: "Password changed successfully",
        });
    }
    catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/me", auth_1.authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            data: req.user,
        });
    }
    catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map