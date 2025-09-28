import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, requireAdmin } from "../middlewares/auth";

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /stock-entries:
 *   get:
 *     summary: Get all stock entries with pagination and search
 *     tags: [Stock Entries]
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
 *         description: Search term for book title or ISBN
 *     responses:
 *       200:
 *         description: List of stock entries
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
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        isActive: true,
        book: {
          isActive: true,
          ...(search
            ? {
                OR: [
                  { title: { contains: search as string } },
                  { isbn: { contains: search as string } },
                ],
              }
            : {}),
        },
      };

      const [stocks, total] = await Promise.all([
        prisma.stocks.findMany({
          where,
          skip,
          take: Number(limit),
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
          orderBy: { createdAt: "desc" },
        }),
        prisma.stocks.count({ where }),
      ]);

      res.json({
        success: true,
        data: stocks,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Get stock entries error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /stock-entries:
 *   post:
 *     summary: Create a new stock entry
 *     tags: [Stock Entries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *               - quantity
 *               - location
 *             properties:
 *               bookId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the book
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of books to add to stock
 *               location:
 *                 type: string
 *                 description: Location where the stock is stored
 *     responses:
 *       201:
 *         description: Stock entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Stock'
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
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  [
    body("bookId").isInt({ min: 1 }).withMessage("Valid book ID is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
    body("location").notEmpty().withMessage("Location is required"),
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

      const { bookId, quantity, location } = req.body;

      const book = await prisma.books.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      const stock = await prisma.stocks.create({
        data: {
          bookId,
          quantity,
          location,
        },
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
      });

      const existingWarehouseStock = await prisma.warehouseStock.findFirst({
        where: { bookId },
      });

      if (existingWarehouseStock) {
        await prisma.warehouseStock.update({
          where: { id: existingWarehouseStock.id },
          data: {
            quantity: existingWarehouseStock.quantity + quantity,
          },
        });
      } else {
        await prisma.warehouseStock.create({
          data: {
            bookId,
            quantity,
          },
        });
      }

      res.status(201).json({
        success: true,
        data: stock,
        message: "Stock entry created successfully",
      });
    } catch (error) {
      console.error("Create stock entry error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /stock-entries/{id}:
 *   put:
 *     summary: Update a stock entry
 *     tags: [Stock Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stock entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - location
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Updated quantity
 *               location:
 *                 type: string
 *                 description: Updated location
 *     responses:
 *       200:
 *         description: Stock entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Stock'
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
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  [
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
    body("location").notEmpty().withMessage("Location is required"),
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

      const { id } = req.params;
      const { quantity, location } = req.body;

      const stock = await prisma.stocks.update({
        where: { id: Number(id) },
        data: {
          quantity,
          location,
        },
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
      });

      res.json({
        success: true,
        data: stock,
        message: "Stock entry updated successfully",
      });
    } catch (error) {
      console.error("Update stock entry error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /stock-entries/{id}:
 *   delete:
 *     summary: Delete a stock entry (soft delete)
 *     tags: [Stock Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stock entry ID
 *     responses:
 *       200:
 *         description: Stock entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.stocks.update({
        where: { id: Number(id) },
        data: { isActive: false },
      });

      res.json({
        success: true,
        message: "Stock entry deleted successfully",
      });
    } catch (error) {
      console.error("Delete stock entry error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
