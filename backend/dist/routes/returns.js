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
 * /returns:
 *   get:
 *     summary: Get all returns with pagination and status filter
 *     tags: [Returns]
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
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Filter by return status
 *     responses:
 *       200:
 *         description: List of returns
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", auth_1.authenticateToken, auth_1.requireAnyRole, async (req, res) => {
    try {
        const { page = 1, limit = 10, status = "" } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            ...(status ? { status: status } : {}),
        };
        const [returns, total] = await Promise.all([
            prisma.returnedBook.findMany({
                where,
                skip,
                take: Number(limit),
                include: {
                    returnedBookDetails: {
                        include: {
                            book: {
                                include: {
                                    bookAuthors: {
                                        include: {
                                            author: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.returnedBook.count({ where }),
        ]);
        res.json({
            success: true,
            data: returns,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Get returns error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @swagger
 * /returns:
 *   post:
 *     summary: Create a new return request
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schoolId
 *               - items
 *             properties:
 *               schoolId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the school making the return
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - bookId
 *                     - quantity
 *                   properties:
 *                     bookId:
 *                       type: integer
 *                       minimum: 1
 *                       description: ID of the book being returned
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Number of books being returned
 *                     reason:
 *                       type: string
 *                       description: Reason for return (optional)
 *     responses:
 *       201:
 *         description: Return request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ReturnedBook'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.post("/", auth_1.authenticateToken, auth_1.requireAnyRole, [
    (0, express_validator_1.body)("schoolId")
        .isInt({ min: 1 })
        .withMessage("Valid school ID is required"),
    (0, express_validator_1.body)("items")
        .isArray({ min: 1 })
        .withMessage("At least one item is required"),
    (0, express_validator_1.body)("items.*.bookId")
        .isInt({ min: 1 })
        .withMessage("Valid book ID is required"),
    (0, express_validator_1.body)("items.*.quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be a positive integer"),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array(),
            });
        }
        const { schoolId, items } = req.body;
        const returnNumber = `RET-${Date.now()}`;
        let totalAmount = 0;
        for (const item of items) {
            const book = await prisma.books.findUnique({
                where: { id: item.bookId },
            });
            if (!book) {
                return res
                    .status(404)
                    .json({ message: `Book with ID ${item.bookId} not found` });
            }
            totalAmount += Number(book.price) * item.quantity;
        }
        const returnRecord = await prisma.returnedBook.create({
            data: {
                returnNumber,
                schoolId,
                totalAmount,
                returnedBookDetails: {
                    create: items.map((item) => {
                        const book = items.find((b) => b.bookId === item.bookId);
                        return {
                            bookId: item.bookId,
                            quantity: item.quantity,
                            unitPrice: book.price,
                            totalPrice: Number(book.price) * item.quantity,
                            reason: item.reason,
                        };
                    }),
                },
            },
            include: {
                returnedBookDetails: {
                    include: {
                        book: {
                            include: {
                                bookAuthors: {
                                    include: {
                                        author: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        res.status(201).json({
            success: true,
            data: returnRecord,
            message: "Return request created successfully",
        });
    }
    catch (error) {
        console.error("Create return error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @swagger
 * /returns/{id}/approve:
 *   put:
 *     summary: Approve a return request
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Return request ID
 *     responses:
 *       200:
 *         description: Return request approved successfully
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
 *         description: Return is not pending
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Return record not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id/approve", auth_1.authenticateToken, auth_1.requireAnyRole, async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        const returnRecord = await prisma.returnedBook.findUnique({
            where: { id: Number(id) },
            include: { returnedBookDetails: true },
        });
        if (!returnRecord) {
            return res.status(404).json({ message: "Return record not found" });
        }
        if (returnRecord.status !== "PENDING") {
            return res.status(400).json({ message: "Return is not pending" });
        }
        await prisma.returnedBook.update({
            where: { id: Number(id) },
            data: {
                status: "APPROVED",
                approvedBy: currentUser.id,
                approvedAt: new Date(),
            },
        });
        res.json({
            success: true,
            message: "Return approved successfully",
        });
    }
    catch (error) {
        console.error("Approve return error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @swagger
 * /returns/{id}/reject:
 *   put:
 *     summary: Reject a return request
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Return request ID
 *     responses:
 *       200:
 *         description: Return request rejected successfully
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
 *         description: Return is not pending
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Return record not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id/reject", auth_1.authenticateToken, auth_1.requireAnyRole, async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        const returnRecord = await prisma.returnedBook.findUnique({
            where: { id: Number(id) },
        });
        if (!returnRecord) {
            return res.status(404).json({ message: "Return record not found" });
        }
        if (returnRecord.status !== "PENDING") {
            return res.status(400).json({ message: "Return is not pending" });
        }
        await prisma.returnedBook.update({
            where: { id: Number(id) },
            data: {
                status: "REJECTED",
                approvedBy: currentUser.id,
                approvedAt: new Date(),
            },
        });
        res.json({
            success: true,
            message: "Return rejected successfully",
        });
    }
    catch (error) {
        console.error("Reject return error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=returns.js.map