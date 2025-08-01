import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, requireAnyRole } from "../middlewares/auth";

const router = Router();
const prisma = new PrismaClient();

router.get(
  "/warehouse",
  authenticateToken,
  requireAnyRole,
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
        prisma.warehouseStock.findMany({
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
        prisma.warehouseStock.count({ where }),
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
      console.error("Get warehouse stocks error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get(
  "/schools",
  authenticateToken,
  requireAnyRole,
  async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, search = "", status = "" } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        isActive: true,
        ...(status ? { status: status as any } : {}),
        school: {
          ...(search
            ? {
                schoolName: { contains: search as string },
              }
            : {}),
        },
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
      console.error("Get school inventories error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get(
  "/schools/:schoolId",
  authenticateToken,
  requireAnyRole,
  async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [stocks, total] = await Promise.all([
        prisma.schoolStock.findMany({
          where: {
            schoolId: Number(schoolId),
            isActive: true,
          },
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
        prisma.schoolStock.count({
          where: {
            schoolId: Number(schoolId),
            isActive: true,
          },
        }),
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
      console.error("Get school stocks error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
