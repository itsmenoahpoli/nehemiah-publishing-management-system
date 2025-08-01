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
 * /billing:
 *   get:
 *     summary: Get all bills with pagination and status filter
 *     tags: [Billing]
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
 *           enum: [PENDING, PAID, CANCELLED]
 *         description: Filter by bill status
 *     responses:
 *       200:
 *         description: List of bills
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
        const [bills, total] = await Promise.all([
            prisma.bill.findMany({
                where,
                skip,
                take: Number(limit),
                include: {
                    customer: true,
                    billDetails: {
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
            prisma.bill.count({ where }),
        ]);
        res.json({
            success: true,
            data: bills,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Get bills error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @swagger
 * /billing:
 *   post:
 *     summary: Create a new bill
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - items
 *             properties:
 *               customerId:
 *                 type: integer
 *                 minimum: 1
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
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *               paymentMethod:
 *                 type: string
 *                 enum: [CASH, CARD, BANK_TRANSFER]
 *     responses:
 *       201:
 *         description: Bill created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Bill'
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
 *       500:
 *         description: Internal server error
 */
router.post("/", auth_1.authenticateToken, auth_1.requireAnyRole, [
    (0, express_validator_1.body)("customerId")
        .isInt({ min: 1 })
        .withMessage("Valid customer ID is required"),
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
        const { customerId, items, paymentMethod } = req.body;
        const billNumber = `BILL-${Date.now()}`;
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
        const bill = await prisma.bill.create({
            data: {
                customerId,
                billNumber,
                totalAmount,
                paymentMethod,
                billDetails: {
                    create: items.map((item) => {
                        const book = items.find((b) => b.bookId === item.bookId);
                        return {
                            bookId: item.bookId,
                            quantity: item.quantity,
                            unitPrice: book.price,
                            totalPrice: Number(book.price) * item.quantity,
                        };
                    }),
                },
            },
            include: {
                customer: true,
                billDetails: {
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
            data: bill,
            message: "Bill created successfully",
        });
    }
    catch (error) {
        console.error("Create bill error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/:id/pay", auth_1.authenticateToken, auth_1.requireAnyRole, [
    (0, express_validator_1.body)("paidAmount")
        .isFloat({ min: 0 })
        .withMessage("Paid amount must be a positive number"),
    (0, express_validator_1.body)("paymentMethod").notEmpty().withMessage("Payment method is required"),
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
        const { paidAmount, paymentMethod } = req.body;
        const bill = await prisma.bill.findUnique({
            where: { id: Number(id) },
        });
        if (!bill) {
            return res.status(404).json({ message: "Bill not found" });
        }
        if (bill.status === "PAID") {
            return res.status(400).json({ message: "Bill is already paid" });
        }
        await prisma.bill.update({
            where: { id: Number(id) },
            data: {
                status: "PAID",
                paidAmount,
                paymentMethod,
                paidAt: new Date(),
            },
        });
        res.json({
            success: true,
            message: "Payment processed successfully",
        });
    }
    catch (error) {
        console.error("Process payment error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=billing.js.map