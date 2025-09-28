import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nehemiah Publishing Management System API",
      version: "1.0.0",
      description:
        "API documentation for the Nehemiah Publishing Management System",
      contact: {
        name: "API Support",
        email: "support@nehemiah-publishing.com",
      },
    },
    servers: [
      {
        url: "http://localhost:7001/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            username: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["ADMIN", "CLERK"] },
            firstName: { type: "string" },
            lastName: { type: "string" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Book: {
          type: "object",
          properties: {
            id: { type: "integer" },
            isbn: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            publisher: { type: "string" },
            publishedDate: { type: "string", format: "date-time" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        BookDetail: {
          type: "object",
          properties: {
            id: { type: "integer" },
            bookId: { type: "integer" },
            edition: { type: "string" },
            format: { type: "string" },
            pages: { type: "integer" },
            language: { type: "string" },
            isActive: { type: "boolean" },
          },
        },
        Author: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            biography: { type: "string" },
            isActive: { type: "boolean" },
          },
        },
        Stock: {
          type: "object",
          properties: {
            id: { type: "integer" },
            bookId: { type: "integer" },
            quantity: { type: "integer" },
            location: { type: "string" },
            isActive: { type: "boolean" },
          },
        },
        Customer: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            address: { type: "string" },
            isActive: { type: "boolean" },
          },
        },
        Bill: {
          type: "object",
          properties: {
            id: { type: "integer" },
            customerId: { type: "integer" },
            billNumber: { type: "string" },
            totalAmount: { type: "number" },
            status: { type: "string", enum: ["PENDING", "PAID", "CANCELLED"] },
            paymentMethod: {
              type: "string",
              enum: ["CASH", "CARD", "BANK_TRANSFER"],
            },
            paidAmount: { type: "number" },
            paidAt: { type: "string", format: "date-time" },
          },
        },
        SchoolProfile: {
          type: "object",
          properties: {
            id: { type: "integer" },
            schoolName: { type: "string" },
            address: { type: "string" },
            contactPerson: { type: "string" },
            phone: { type: "string" },
            email: { type: "string" },
            isApproved: { type: "boolean" },
          },
        },
        ReturnedBook: {
          type: "object",
          properties: {
            id: { type: "integer" },
            returnNumber: { type: "string" },
            schoolId: { type: "integer" },
            totalAmount: { type: "number" },
            status: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED"],
            },
            approvedBy: { type: "integer" },
            approvedAt: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            returnedBookDetails: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  bookId: { type: "integer" },
                  quantity: { type: "integer" },
                  unitPrice: { type: "number" },
                  totalPrice: { type: "number" },
                  reason: { type: "string" },
                  book: { $ref: "#/components/schemas/Book" },
                },
              },
            },
          },
        },
        BookRequest: {
          type: "object",
          properties: {
            id: { type: "integer" },
            schoolId: { type: "integer" },
            bookId: { type: "integer" },
            quantity: { type: "integer" },
            status: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED"],
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            school: { $ref: "#/components/schemas/SchoolProfile" },
            book: { $ref: "#/components/schemas/Book" },
          },
        },
        StockEntry: {
          type: "object",
          properties: {
            id: { type: "integer" },
            bookId: { type: "integer" },
            quantity: { type: "integer" },
            location: { type: "string" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            book: { $ref: "#/components/schemas/Book" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                token: { type: "string" },
                user: { $ref: "#/components/schemas/User" },
              },
            },
            message: { type: "string" },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string" },
            newPassword: { type: "string", minLength: 6 },
          },
        },
        PaginationResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: { type: "array" },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer" },
                limit: { type: "integer" },
                total: { type: "integer" },
                totalPages: { type: "integer" },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            errors: { type: "array" },
          },
        },
        DashboardOverview: {
          type: "object",
          properties: {
            overview: {
              type: "object",
              properties: {
                totalBooks: { type: "integer" },
                totalSchools: { type: "integer" },
                totalCustomers: { type: "integer" },
                totalUsers: { type: "integer" },
                pendingRegistrations: { type: "integer" },
                totalRevenue: { type: "number" },
                totalSchoolRevenue: { type: "number" },
                totalWarehouseStock: { type: "integer" },
                totalSchoolStock: { type: "integer" },
              },
            },
            statusCounts: {
              type: "object",
              properties: {
                bills: {
                  type: "object",
                  properties: {
                    total: { type: "integer" },
                    pending: { type: "integer" },
                    paid: { type: "integer" },
                    cancelled: { type: "integer" },
                  },
                },
                transactions: {
                  type: "object",
                  properties: {
                    total: { type: "integer" },
                    pending: { type: "integer" },
                    completed: { type: "integer" },
                    cancelled: { type: "integer" },
                  },
                },
                returns: {
                  type: "object",
                  properties: {
                    total: { type: "integer" },
                    pending: { type: "integer" },
                    approved: { type: "integer" },
                    rejected: { type: "integer" },
                  },
                },
              },
            },
          },
        },
        ChartData: {
          type: "object",
          properties: {
            date: { type: "string", format: "date-time" },
            amount: { type: "number" },
            count: { type: "integer" },
          },
        },
        TopSellingBook: {
          type: "object",
          properties: {
            bookId: { type: "integer" },
            title: { type: "string" },
            totalSold: { type: "integer" },
            orderCount: { type: "integer" },
            revenue: { type: "number" },
          },
        },
        RecentActivity: {
          type: "object",
          properties: {
            recentBills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  billNumber: { type: "string" },
                  customerName: { type: "string" },
                  totalAmount: { type: "number" },
                  status: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
            recentTransactions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  transactionNumber: { type: "string" },
                  totalAmount: { type: "number" },
                  status: { type: "string" },
                  bookCount: { type: "integer" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
            recentReturns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  returnNumber: { type: "string" },
                  totalAmount: { type: "number" },
                  status: { type: "string" },
                  bookCount: { type: "integer" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
            recentRegistrations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  schoolName: { type: "string" },
                  isApproved: { type: "boolean" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const specs = swaggerJsdoc(options);
