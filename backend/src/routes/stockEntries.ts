import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, requireAdmin } from "../middlewares/auth";

const router = Router();
const prisma = new PrismaClient();

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
