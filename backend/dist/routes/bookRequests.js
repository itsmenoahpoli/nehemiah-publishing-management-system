"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get("/", auth_1.authenticateToken, auth_1.requireAnyRole, async (req, res) => {
    try {
        const { page = 1, limit = 10, status = "" } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            isActive: true,
            ...(status ? { status: status } : {}),
        };
        const [inventories, total] = await Promise.all([
            prisma.schoolInventory.findMany({
                where,
                skip,
                take: Number(limit),
                include: {
                    school: true,
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
                orderBy: { createdAt: "desc" },
            }),
            prisma.schoolInventory.count({ where }),
        ]);
        res.json({
            success: true,
            data: inventories,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Get book requests error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.post("/", auth_1.authenticateToken, auth_1.requireAnyRole, [
    (0, express_validator_1.body)("schoolId")
        .isInt({ min: 1 })
        .withMessage("Valid school ID is required"),
    (0, express_validator_1.body)("bookId").isInt({ min: 1 }).withMessage("Valid book ID is required"),
    (0, express_validator_1.body)("quantity")
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
        const { schoolId, bookId, quantity } = req.body;
        const existingRequest = await prisma.schoolInventory.findFirst({
            where: {
                schoolId,
                bookId,
                status: "PENDING",
            },
        });
        if (existingRequest) {
            return res
                .status(400)
                .json({ message: "Request already exists for this book" });
        }
        const request = await prisma.schoolInventory.create({
            data: {
                schoolId,
                bookId,
                quantity,
                status: "PENDING",
            },
            include: {
                school: true,
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
        });
        res.status(201).json({
            success: true,
            data: request,
            message: "Book request created successfully",
        });
    }
    catch (error) {
        console.error("Create book request error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/:id/approve", auth_1.authenticateToken, auth_1.requireAnyRole, async (req, res) => {
    try {
        const { id } = req.params;
        const request = await prisma.schoolInventory.findUnique({
            where: { id: Number(id) },
            include: { book: true },
        });
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }
        if (request.status !== "PENDING") {
            return res.status(400).json({ message: "Request is not pending" });
        }
        const warehouseStock = await prisma.warehouseStock.findFirst({
            where: { bookId: request.bookId },
        });
        if (!warehouseStock || warehouseStock.quantity < request.quantity) {
            return res
                .status(400)
                .json({ message: "Insufficient stock in warehouse" });
        }
        await prisma.$transaction(async (tx) => {
            await tx.schoolInventory.update({
                where: { id: Number(id) },
                data: { status: "APPROVED" },
            });
            await tx.warehouseStock.update({
                where: { id: warehouseStock.id },
                data: { quantity: warehouseStock.quantity - request.quantity },
            });
            const existingStock = await tx.schoolStock.findFirst({
                where: {
                    schoolId: request.schoolId,
                    bookId: request.bookId,
                },
            });
            if (existingStock) {
                await tx.schoolStock.update({
                    where: { id: existingStock.id },
                    data: { quantity: existingStock.quantity + request.quantity },
                });
            }
            else {
                await tx.schoolStock.create({
                    data: {
                        schoolId: request.schoolId,
                        bookId: request.bookId,
                        quantity: request.quantity,
                    },
                });
            }
        });
        res.json({
            success: true,
            message: "Book request approved successfully",
        });
    }
    catch (error) {
        console.error("Approve book request error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/:id/reject", auth_1.authenticateToken, auth_1.requireAnyRole, async (req, res) => {
    try {
        const { id } = req.params;
        const request = await prisma.schoolInventory.findUnique({
            where: { id: Number(id) },
        });
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }
        if (request.status !== "PENDING") {
            return res.status(400).json({ message: "Request is not pending" });
        }
        await prisma.schoolInventory.update({
            where: { id: Number(id) },
            data: { status: "REJECTED" },
        });
        res.json({
            success: true,
            message: "Book request rejected successfully",
        });
    }
    catch (error) {
        console.error("Reject book request error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=bookRequests.js.map