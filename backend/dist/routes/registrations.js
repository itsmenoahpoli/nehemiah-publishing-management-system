"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * @swagger
 * /registrations:
 *   get:
 *     summary: Get school registrations with pagination and status filter
 *     tags: [Registrations]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [approved, pending]
 *         description: Filter by approval status
 *     responses:
 *       200:
 *         description: List of school registrations
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
        const { page = 1, limit = 10, status = "" } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            ...(status ? { isApproved: status === "approved" } : {}),
        };
        const [schools, total] = await Promise.all([
            prisma.schoolProfile.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: "desc" },
            }),
            prisma.schoolProfile.count({ where }),
        ]);
        res.json({
            success: true,
            data: schools,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Get school registrations error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @swagger
 * /registrations:
 *   post:
 *     summary: Submit a new school registration
 *     tags: [Registrations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schoolName
 *               - address
 *               - contactPerson
 *               - phone
 *               - email
 *             properties:
 *               schoolName:
 *                 type: string
 *               address:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: School registration submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SchoolProfile'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or school already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post("/", [
    (0, express_validator_1.body)("schoolName").notEmpty().withMessage("School name is required"),
    (0, express_validator_1.body)("address").notEmpty().withMessage("Address is required"),
    (0, express_validator_1.body)("contactPerson").notEmpty().withMessage("Contact person is required"),
    (0, express_validator_1.body)("phone").notEmpty().withMessage("Phone is required"),
    (0, express_validator_1.body)("email").isEmail().withMessage("Valid email is required"),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array(),
            });
        }
        const { schoolName, address, contactPerson, phone, email } = req.body;
        const existingSchool = await prisma.schoolProfile.findFirst({
            where: {
                OR: [{ schoolName }, { email }],
            },
        });
        if (existingSchool) {
            return res
                .status(400)
                .json({ message: "School with this name or email already exists" });
        }
        const school = await prisma.schoolProfile.create({
            data: {
                schoolName,
                address,
                contactPerson,
                phone,
                email,
            },
        });
        res.status(201).json({
            success: true,
            data: school,
            message: "School registration submitted successfully",
        });
    }
    catch (error) {
        console.error("Create school registration error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/:id/approve", auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const school = await prisma.schoolProfile.findUnique({
            where: { id: Number(id) },
        });
        if (!school) {
            return res.status(404).json({ message: "School not found" });
        }
        if (school.isApproved) {
            return res.status(400).json({ message: "School is already approved" });
        }
        await prisma.schoolProfile.update({
            where: { id: Number(id) },
            data: { isApproved: true },
        });
        res.json({
            success: true,
            message: "School approved successfully",
        });
    }
    catch (error) {
        console.error("Approve school error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/:id/reject", auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const school = await prisma.schoolProfile.findUnique({
            where: { id: Number(id) },
        });
        if (!school) {
            return res.status(404).json({ message: "School not found" });
        }
        if (school.isApproved) {
            return res.status(400).json({ message: "School is already approved" });
        }
        await prisma.schoolProfile.delete({
            where: { id: Number(id) },
        });
        res.json({
            success: true,
            message: "School registration rejected and deleted",
        });
    }
    catch (error) {
        console.error("Reject school error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=registrations.js.map