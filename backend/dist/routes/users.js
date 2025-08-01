"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users with pagination and search
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for username, email, first name, or last name
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get("/", auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = search
            ? {
                OR: [
                    { username: { contains: search } },
                    { email: { contains: search } },
                    { firstName: { contains: search } },
                    { lastName: { contains: search } },
                ],
            }
            : {};
        const [users, total] = await Promise.all([
            prisma.userAccounts.findMany({
                where,
                skip,
                take: Number(limit),
                select: {
                    id: true,
                    username: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.userAccounts.count({ where }),
        ]);
        res.json({
            success: true,
            data: users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, CLERK]
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post("/", auth_1.authenticateToken, auth_1.requireAdmin, [
    (0, express_validator_1.body)("username").notEmpty().withMessage("Username is required"),
    (0, express_validator_1.body)("email").isEmail().withMessage("Valid email is required"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    (0, express_validator_1.body)("firstName").notEmpty().withMessage("First name is required"),
    (0, express_validator_1.body)("lastName").notEmpty().withMessage("Last name is required"),
    (0, express_validator_1.body)("role")
        .isIn(["ADMIN", "CLERK"])
        .withMessage("Role must be ADMIN or CLERK"),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array(),
            });
        }
        const { username, email, password, firstName, lastName, role } = req.body;
        const existingUser = await prisma.userAccounts.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: "Username or email already exists" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma.userAccounts.create({
            data: {
                username,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role,
            },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        res.status(201).json({
            success: true,
            data: user,
            message: "User created successfully",
        });
    }
    catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/:id", auth_1.authenticateToken, auth_1.requireAdmin, [
    (0, express_validator_1.body)("firstName").notEmpty().withMessage("First name is required"),
    (0, express_validator_1.body)("lastName").notEmpty().withMessage("Last name is required"),
    (0, express_validator_1.body)("role")
        .isIn(["ADMIN", "CLERK"])
        .withMessage("Role must be ADMIN or CLERK"),
    (0, express_validator_1.body)("isActive").isBoolean().withMessage("isActive must be a boolean"),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array(),
            });
        }
        const { id } = req.params;
        const { firstName, lastName, role, isActive } = req.body;
        const user = await prisma.userAccounts.update({
            where: { id: Number(id) },
            data: {
                firstName,
                lastName,
                role: role,
                isActive,
            },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });
        res.json({
            success: true,
            data: user,
            message: "User updated successfully",
        });
    }
    catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.delete("/:id", auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        if (currentUser?.id === Number(id)) {
            return res
                .status(400)
                .json({ message: "Cannot delete your own account" });
        }
        await prisma.userAccounts.delete({
            where: { id: Number(id) },
        });
        res.json({
            success: true,
            message: "User deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map