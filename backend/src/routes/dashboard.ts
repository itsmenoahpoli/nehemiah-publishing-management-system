import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /dashboard/overview:
 *   get:
 *     summary: Get dashboard overview statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardOverview'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/overview", async (req, res) => {
  try {
    const [
      totalBooks,
      totalSchools,
      totalCustomers,
      totalUsers,
      pendingRegistrations,
      totalBills,
      totalTransactions,
      totalReturns,
      totalWarehouseStock,
      totalSchoolStock
    ] = await Promise.all([
      prisma.books.count({ where: { isActive: true } }),
      prisma.schoolProfile.count(),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.userAccounts.count({ where: { isActive: true } }),
      prisma.schoolProfile.count({ where: { isApproved: false } }),
      prisma.bill.count(),
      prisma.schoolSalesTransaction.count(),
      prisma.returnedBook.count(),
      prisma.warehouseStock.aggregate({
        _sum: { quantity: true },
        where: { isActive: true }
      }),
      prisma.schoolStock.aggregate({
        _sum: { quantity: true },
        where: { isActive: true }
      })
    ]);

    const [
      pendingBills,
      paidBills,
      cancelledBills,
      pendingTransactions,
      completedTransactions,
      cancelledTransactions,
      pendingReturns,
      approvedReturns,
      rejectedReturns
    ] = await Promise.all([
      prisma.bill.count({ where: { status: "PENDING" } }),
      prisma.bill.count({ where: { status: "PAID" } }),
      prisma.bill.count({ where: { status: "CANCELLED" } }),
      prisma.schoolSalesTransaction.count({ where: { status: "PENDING" } }),
      prisma.schoolSalesTransaction.count({ where: { status: "COMPLETED" } }),
      prisma.schoolSalesTransaction.count({ where: { status: "CANCELLED" } }),
      prisma.returnedBook.count({ where: { status: "PENDING" } }),
      prisma.returnedBook.count({ where: { status: "APPROVED" } }),
      prisma.returnedBook.count({ where: { status: "REJECTED" } })
    ]);

    const totalRevenue = await prisma.bill.aggregate({
      _sum: { totalAmount: true },
      where: { status: "PAID" }
    });

    const totalSchoolRevenue = await prisma.schoolSalesTransaction.aggregate({
      _sum: { totalAmount: true },
      where: { status: "COMPLETED" }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalBooks,
          totalSchools,
          totalCustomers,
          totalUsers,
          pendingRegistrations,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          totalSchoolRevenue: totalSchoolRevenue._sum.totalAmount || 0,
          totalWarehouseStock: totalWarehouseStock._sum.quantity || 0,
          totalSchoolStock: totalSchoolStock._sum.quantity || 0
        },
        statusCounts: {
          bills: {
            total: totalBills,
            pending: pendingBills,
            paid: paidBills,
            cancelled: cancelledBills
          },
          transactions: {
            total: totalTransactions,
            pending: pendingTransactions,
            completed: completedTransactions,
            cancelled: cancelledTransactions
          },
          returns: {
            total: totalReturns,
            pending: pendingReturns,
            approved: approvedReturns,
            rejected: rejectedReturns
          }
        }
      }
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard overview" });
  }
});

/**
 * @swagger
 * /dashboard/charts/revenue:
 *   get:
 *     summary: Get revenue data for charts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *           default: month
 *         description: Time period for revenue data
 *     responses:
 *       200:
 *         description: Revenue chart data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 billRevenue:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChartData'
 *                 schoolRevenue:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChartData'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/charts/revenue", async (req, res) => {
  try {
    const { period = "month" } = req.query;

    let dateFilter: any = {};
    const now = new Date();

    if (period === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: weekAgo };
    } else if (period === "month") {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      dateFilter = { gte: monthAgo };
    } else if (period === "year") {
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      dateFilter = { gte: yearAgo };
    }

    const billRevenue = await prisma.bill.groupBy({
      by: ['createdAt'],
      _sum: { totalAmount: true },
      where: {
        status: "PAID",
        createdAt: dateFilter
      },
      orderBy: { createdAt: 'asc' }
    });

    const schoolRevenue = await prisma.schoolSalesTransaction.groupBy({
      by: ['createdAt'],
      _sum: { totalAmount: true },
      where: {
        status: "COMPLETED",
        createdAt: dateFilter
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      billRevenue: billRevenue.map(item => ({
        date: item.createdAt,
        amount: item._sum.totalAmount || 0
      })),
      schoolRevenue: schoolRevenue.map(item => ({
        date: item.createdAt,
        amount: item._sum.totalAmount || 0
      }))
    });
  } catch (error) {
    console.error("Revenue chart error:", error);
    res.status(500).json({ message: "Failed to fetch revenue data" });
  }
});

/**
 * @swagger
 * /dashboard/charts/books:
 *   get:
 *     summary: Get books data for charts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Books chart data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topSellingBooks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TopSellingBook'
 *                 booksByPublisher:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       publisher:
 *                         type: string
 *                       count:
 *                         type: integer
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/charts/books", async (req, res) => {
  try {
    const topSellingBooks = await prisma.billDetails.groupBy({
      by: ['bookId'],
      _sum: { quantity: true },
      _count: { bookId: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    });

    const bookDetails = await Promise.all(
      topSellingBooks.map(async (book) => {
        const bookInfo = await prisma.books.findUnique({
          where: { id: book.bookId },
          select: { title: true, price: true }
        });
        return {
          bookId: book.bookId,
          title: bookInfo?.title || 'Unknown',
          totalSold: book._sum.quantity || 0,
          orderCount: book._count.bookId || 0,
          revenue: Number(book._sum.quantity || 0) * Number(bookInfo?.price || 0)
        };
      })
    );

    const booksByPublisher = await prisma.books.groupBy({
      by: ['publisher'],
      _count: { id: true },
      where: { isActive: true },
      orderBy: { _count: { id: 'desc' } }
    });

    res.json({
      success: true,
      data: {
        topSellingBooks: bookDetails,
        booksByPublisher: booksByPublisher.map(publisher => ({
          publisher: publisher.publisher,
          count: publisher._count.id
        }))
      }
    });
  } catch (error) {
    console.error("Books chart error:", error);
    res.status(500).json({ message: "Failed to fetch books data" });
  }
});

/**
 * @swagger
 * /dashboard/charts/inventory:
 *   get:
 *     summary: Get inventory data for charts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory chart data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 warehouseStock:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bookId:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       publisher:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                 schoolStock:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       schoolId:
 *                         type: integer
 *                       schoolName:
 *                         type: string
 *                       totalStock:
 *                         type: integer
 *                 inventoryStatus:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                       count:
 *                         type: integer
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/charts/inventory", async (req, res) => {
  try {
    const warehouseStock = await prisma.warehouseStock.findMany({
      where: { isActive: true },
      include: {
        book: {
          select: { title: true, publisher: true }
        }
      },
      orderBy: { quantity: 'desc' },
      take: 10
    });

    const schoolStock = await prisma.schoolStock.groupBy({
      by: ['schoolId'],
      _sum: { quantity: true },
      where: { isActive: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    });

    const schoolStockDetails = await Promise.all(
      schoolStock.map(async (stock) => {
        const school = await prisma.schoolProfile.findUnique({
          where: { id: stock.schoolId },
          select: { schoolName: true }
        });
        return {
          schoolId: stock.schoolId,
          schoolName: school?.schoolName || 'Unknown',
          totalStock: stock._sum.quantity || 0
        };
      })
    );

    const inventoryStatus = await prisma.schoolInventory.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    res.json({
      warehouseStock: warehouseStock.map(stock => ({
        bookId: stock.bookId,
        title: stock.book.title,
        publisher: stock.book.publisher,
        quantity: stock.quantity
      })),
      schoolStock: schoolStockDetails,
      inventoryStatus: inventoryStatus.map(status => ({
        status: status.status,
        count: status._count.id
      }))
    });
  } catch (error) {
    console.error("Inventory chart error:", error);
    res.status(500).json({ message: "Failed to fetch inventory data" });
  }
});

/**
 * @swagger
 * /dashboard/charts/sales:
 *   get:
 *     summary: Get sales data for charts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *           default: month
 *         description: Time period for sales data
 *     responses:
 *       200:
 *         description: Sales chart data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 salesByDay:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChartData'
 *                 schoolSalesByDay:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChartData'
 *                 salesByPaymentMethod:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       method:
 *                         type: string
 *                       count:
 *                         type: integer
 *                       amount:
 *                         type: number
 *                 schoolSalesByPaymentMethod:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       method:
 *                         type: string
 *                       count:
 *                         type: integer
 *                       amount:
 *                         type: number
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/charts/sales", async (req, res) => {
  try {
    const { period = "month" } = req.query;

    let dateFilter: any = {};
    const now = new Date();

    if (period === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: weekAgo };
    } else if (period === "month") {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      dateFilter = { gte: monthAgo };
    } else if (period === "year") {
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      dateFilter = { gte: yearAgo };
    }

    const salesByDay = await prisma.bill.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      _sum: { totalAmount: true },
      where: {
        status: "PAID",
        createdAt: dateFilter
      },
      orderBy: { createdAt: 'asc' }
    });

    const schoolSalesByDay = await prisma.schoolSalesTransaction.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      _sum: { totalAmount: true },
      where: {
        status: "COMPLETED",
        createdAt: dateFilter
      },
      orderBy: { createdAt: 'asc' }
    });

    const salesByPaymentMethod = await prisma.bill.groupBy({
      by: ['paymentMethod'],
      _count: { id: true },
      _sum: { totalAmount: true },
      where: {
        status: "PAID",
        createdAt: dateFilter
      }
    });

    const schoolSalesByPaymentMethod = await prisma.schoolSalesTransaction.groupBy({
      by: ['paymentMethod'],
      _count: { id: true },
      _sum: { totalAmount: true },
      where: {
        status: "COMPLETED",
        createdAt: dateFilter
      }
    });

    res.json({
      salesByDay: salesByDay.map(day => ({
        date: day.createdAt,
        count: day._count.id,
        amount: day._sum.totalAmount || 0
      })),
      schoolSalesByDay: schoolSalesByDay.map(day => ({
        date: day.createdAt,
        count: day._count.id,
        amount: day._sum.totalAmount || 0
      })),
      salesByPaymentMethod: salesByPaymentMethod.map(method => ({
        method: method.paymentMethod || 'Unknown',
        count: method._count.id,
        amount: method._sum.totalAmount || 0
      })),
      schoolSalesByPaymentMethod: schoolSalesByPaymentMethod.map(method => ({
        method: method.paymentMethod || 'Unknown',
        count: method._count.id,
        amount: method._sum.totalAmount || 0
      }))
    });
  } catch (error) {
    console.error("Sales chart error:", error);
    res.status(500).json({ message: "Failed to fetch sales data" });
  }
});

/**
 * @swagger
 * /dashboard/charts/schools:
 *   get:
 *     summary: Get schools data for charts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Schools chart data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schoolsByStatus:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 schoolsByStock:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       schoolId:
 *                         type: integer
 *                       schoolName:
 *                         type: string
 *                       totalStock:
 *                         type: integer
 *                       bookCount:
 *                         type: integer
 *                       isApproved:
 *                         type: boolean
 *                 recentRegistrations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       schoolName:
 *                         type: string
 *                       isApproved:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/charts/schools", async (req, res) => {
  try {
    const schoolsByStatus = await prisma.schoolProfile.groupBy({
      by: ['isApproved'],
      _count: { id: true }
    });

    const schoolsByStock = await prisma.schoolStock.groupBy({
      by: ['schoolId'],
      _sum: { quantity: true },
      _count: { bookId: true },
      where: { isActive: true },
      orderBy: { _sum: { quantity: 'desc' } }
    });

    const schoolsWithDetails = await Promise.all(
      schoolsByStock.map(async (school) => {
        const schoolInfo = await prisma.schoolProfile.findUnique({
          where: { id: school.schoolId },
          select: { schoolName: true, isApproved: true }
        });
        return {
          schoolId: school.schoolId,
          schoolName: schoolInfo?.schoolName || 'Unknown',
          totalStock: school._sum.quantity || 0,
          bookCount: school._count.bookId || 0,
          isApproved: schoolInfo?.isApproved || false
        };
      })
    );

    const recentRegistrations = await prisma.schoolProfile.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        schoolName: true,
        isApproved: true,
        createdAt: true
      }
    });

    res.json({
      schoolsByStatus: schoolsByStatus.map(status => ({
        status: status.isApproved ? 'Approved' : 'Pending',
        count: status._count.id
      })),
      schoolsByStock: schoolsWithDetails,
      recentRegistrations
    });
  } catch (error) {
    console.error("Schools chart error:", error);
    res.status(500).json({ message: "Failed to fetch schools data" });
  }
});

/**
 * @swagger
 * /dashboard/recent-activity:
 *   get:
 *     summary: Get recent activity data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecentActivity'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/recent-activity", async (req, res) => {
  try {
    const [
      recentBills,
      recentTransactions,
      recentReturns,
      recentRegistrations
    ] = await Promise.all([
      prisma.bill.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: {
            select: { name: true }
          }
        }
      }),
      prisma.schoolSalesTransaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          schoolSalesTransactionDetail: {
            include: {
              book: {
                select: { title: true }
              }
            }
          }
        }
      }),
      prisma.returnedBook.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          returnedBookDetails: {
            include: {
              book: {
                select: { title: true }
              }
            }
          }
        }
      }),
      prisma.schoolProfile.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          schoolName: true,
          isApproved: true,
          createdAt: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        recentBills: recentBills.map(bill => ({
          id: bill.id,
          billNumber: bill.billNumber,
          customerName: bill.customer.name,
          totalAmount: bill.totalAmount,
          status: bill.status,
          createdAt: bill.createdAt
        })),
        recentTransactions: recentTransactions.map(transaction => ({
          id: transaction.id,
          transactionNumber: transaction.transactionNumber,
          totalAmount: transaction.totalAmount,
          status: transaction.status,
          bookCount: transaction.schoolSalesTransactionDetail.length,
          createdAt: transaction.createdAt
        })),
        recentReturns: recentReturns.map(returned => ({
          id: returned.id,
          returnNumber: returned.returnNumber,
          totalAmount: returned.totalAmount,
          status: returned.status,
          bookCount: returned.returnedBookDetails.length,
          createdAt: returned.createdAt
        })),
        recentRegistrations
      }
    });
  } catch (error) {
    console.error("Recent activity error:", error);
    res.status(500).json({ message: "Failed to fetch recent activity" });
  }
});

export default router;
