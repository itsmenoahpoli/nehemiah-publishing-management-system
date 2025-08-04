import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, requireAnyRole } from "../middlewares/auth";

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /reports/sales:
 *   get:
 *     summary: Get sales report with date range filter
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for sales report (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for sales report (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Sales report data
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
 *                     bills:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Bill'
 *                     totalRevenue:
 *                       type: number
 *                     totalOrders:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/sales",
  authenticateToken,
  requireAnyRole,
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      const where = {
        status: "PAID" as any,
        ...(startDate && endDate
          ? {
              paidAt: {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string),
              },
            }
          : {}),
      };

      const [bills, totalRevenue] = await Promise.all([
        prisma.bill.findMany({
          where,
          include: {
            customer: true,
            billDetails: {
              include: {
                book: true,
              },
            },
          },
          orderBy: { paidAt: "desc" },
        }),
        prisma.bill.aggregate({
          where,
          _sum: {
            paidAmount: true,
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          bills,
          totalRevenue: totalRevenue._sum?.paidAmount || 0,
          totalOrders: bills.length,
        },
      });
    } catch (error) {
      console.error("Get sales report error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /reports/inventory:
 *   get:
 *     summary: Get inventory report with stock levels
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory report data
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
 *                     warehouseStocks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Stock'
 *                     schoolStocks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           schoolId:
 *                             type: integer
 *                           bookId:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           school:
 *                             $ref: '#/components/schemas/SchoolProfile'
 *                           book:
 *                             $ref: '#/components/schemas/Book'
 *                     lowStockBooks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Book'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/inventory",
  authenticateToken,
  requireAnyRole,
  async (req: Request, res: Response) => {
    try {
      const [warehouseStocks, schoolStocks, lowStockBooks] = await Promise.all([
        prisma.warehouseStock.findMany({
          where: { isActive: true },
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
          orderBy: { quantity: "asc" },
        }),
        prisma.schoolStock.findMany({
          where: { isActive: true },
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
          orderBy: { quantity: "asc" },
        }),
        prisma.warehouseStock.findMany({
          where: {
            isActive: true,
            quantity: { lte: 10 },
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
        }),
      ]);

      const totalWarehouseBooks = warehouseStocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0
      );
      const totalSchoolBooks = schoolStocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0
      );

      res.json({
        success: true,
        data: {
          warehouseStocks,
          schoolStocks,
          lowStockBooks,
          summary: {
            totalWarehouseBooks,
            totalSchoolBooks,
            lowStockCount: lowStockBooks.length,
          },
        },
      });
    } catch (error) {
      console.error("Get inventory report error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get(
  "/transactions",
  authenticateToken,
  requireAnyRole,
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, type = "all" } = req.query;

      const dateFilter =
        startDate && endDate
          ? {
              createdAt: {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string),
              },
            }
          : {};

      let transactions = [];

      if (type === "all" || type === "bills") {
        const bills = await prisma.bill.findMany({
          where: dateFilter,
          include: {
            customer: true,
            billDetails: {
              include: {
                book: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        transactions.push(...bills.map((bill) => ({ ...bill, type: "bill" })));
      }

      if (type === "all" || type === "school") {
        const schoolTransactions = await prisma.schoolSalesTransaction.findMany(
          {
            where: dateFilter,
            include: {
              schoolSalesTransactionDetail: {
                include: {
                  book: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          }
        );
        transactions.push(
          ...schoolTransactions.map((trans) => ({ ...trans, type: "school" }))
        );
      }

      if (type === "all" || type === "returns") {
        const returns = await prisma.returnedBook.findMany({
          where: dateFilter,
          include: {
            returnedBookDetails: {
              include: {
                book: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        transactions.push(
          ...returns.map((ret) => ({ ...ret, type: "return" }))
        );
      }

      transactions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      console.error("Get transactions report error:", error);
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
      const [schools, pendingRequests] = await Promise.all([
        prisma.schoolProfile.findMany({
          where: { isApproved: true },
          include: {
            schoolStock: {
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
          orderBy: { schoolName: "asc" },
        }),
        prisma.schoolInventory.findMany({
          where: { status: "PENDING" },
          include: {
            school: true,
            book: true,
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          schools,
          pendingRequests,
          summary: {
            totalSchools: schools.length,
            pendingRequests: pendingRequests.length,
          },
        },
      });
    } catch (error) {
      console.error("Get schools report error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
