import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, requireAnyRole } from "../middlewares/auth";

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /book-requests:
 *   get:
 *     summary: Get all book requests with pagination and status filter
 *     tags: [Book Requests]
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
 *         description: Filter by request status
 *     responses:
 *       200:
 *         description: List of book requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authenticateToken,
  requireAnyRole,
  async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, status = "" } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        isActive: true,
        ...(status ? { status: status as any } : {}),
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
    } catch (error) {
      console.error("Get book requests error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /book-requests:
 *   post:
 *     summary: Create a new book request
 *     tags: [Book Requests]
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
 *               - bookId
 *               - quantity
 *             properties:
 *               schoolId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the school making the request
 *               bookId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the book being requested
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of books requested
 *     responses:
 *       201:
 *         description: Book request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     schoolId:
 *                       type: integer
 *                     bookId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [PENDING, APPROVED, REJECTED]
 *                     school:
 *                       $ref: '#/components/schemas/SchoolProfile'
 *                     book:
 *                       $ref: '#/components/schemas/Book'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or request already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticateToken,
  requireAnyRole,
  [
    body("schoolId")
      .isInt({ min: 1 })
      .withMessage("Valid school ID is required"),
    body("bookId").isInt({ min: 1 }).withMessage("Valid book ID is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
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
    } catch (error) {
      console.error("Create book request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /book-requests/{id}/approve:
 *   put:
 *     summary: Approve a book request
 *     tags: [Book Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book request ID
 *     responses:
 *       200:
 *         description: Book request approved successfully
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
 *         description: Request is not pending or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id/approve",
  authenticateToken,
  requireAnyRole,
  async (req: Request, res: Response) => {
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
        } else {
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
    } catch (error) {
      console.error("Approve book request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /book-requests/{id}/reject:
 *   put:
 *     summary: Reject a book request
 *     tags: [Book Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book request ID
 *     responses:
 *       200:
 *         description: Book request rejected successfully
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
 *         description: Request is not pending
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id/reject",
  authenticateToken,
  requireAnyRole,
  async (req: Request, res: Response) => {
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
    } catch (error) {
      console.error("Reject book request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
