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
 * /books:
 *   get:
 *     summary: Get all books with pagination and search
 *     tags: [Books]
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
 *         description: Search term for title, ISBN, or publisher
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author name
 *     responses:
 *       200:
 *         description: List of books
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
        const { page = 1, limit = 10, search = "", author = "" } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            isActive: true,
            ...(search
                ? {
                    OR: [
                        { title: { contains: search } },
                        { isbn: { contains: search } },
                        { publisher: { contains: search } },
                    ],
                }
                : {}),
            ...(author
                ? {
                    bookAuthors: {
                        some: {
                            author: {
                                name: { contains: author },
                            },
                        },
                    },
                }
                : {}),
        };
        const [books, total] = await Promise.all([
            prisma.books.findMany({
                where,
                skip,
                take: Number(limit),
                include: {
                    bookAuthors: {
                        include: {
                            author: true,
                        },
                    },
                    bookDetails: true,
                    warehouseStock: true,
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.books.count({ where }),
        ]);
        res.json({
            success: true,
            data: books,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Get books error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get a specific book by ID
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", auth_1.authenticateToken, auth_1.requireAnyRole, async (req, res) => {
    try {
        const { id } = req.params;
        const book = await prisma.books.findUnique({
            where: { id: Number(id) },
            include: {
                bookAuthors: {
                    include: {
                        author: true,
                    },
                },
                bookDetails: true,
                warehouseStock: true,
                stocks: true,
            },
        });
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.json({
            success: true,
            data: book,
        });
    }
    catch (error) {
        console.error("Get book error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isbn
 *               - title
 *               - price
 *               - publisher
 *               - publishedDate
 *               - authors
 *               - edition
 *               - format
 *               - pages
 *               - language
 *             properties:
 *               isbn:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               publisher:
 *                 type: string
 *               publishedDate:
 *                 type: string
 *                 format: date
 *               authors:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 *               edition:
 *                 type: string
 *               format:
 *                 type: string
 *               pages:
 *                 type: integer
 *                 minimum: 1
 *               language:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or ISBN already exists
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
router.post("/", auth_1.authenticateToken, auth_1.requireAdmin, [
    (0, express_validator_1.body)("isbn").notEmpty().withMessage("ISBN is required"),
    (0, express_validator_1.body)("title").notEmpty().withMessage("Title is required"),
    (0, express_validator_1.body)("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    (0, express_validator_1.body)("publisher").notEmpty().withMessage("Publisher is required"),
    (0, express_validator_1.body)("publishedDate")
        .isISO8601()
        .withMessage("Published date must be a valid date"),
    (0, express_validator_1.body)("authors")
        .isArray({ min: 1 })
        .withMessage("At least one author is required"),
    (0, express_validator_1.body)("edition").notEmpty().withMessage("Edition is required"),
    (0, express_validator_1.body)("format").notEmpty().withMessage("Format is required"),
    (0, express_validator_1.body)("pages")
        .isInt({ min: 1 })
        .withMessage("Pages must be a positive integer"),
    (0, express_validator_1.body)("language").notEmpty().withMessage("Language is required"),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array(),
            });
        }
        const { isbn, title, description, price, publisher, publishedDate, authors, edition, format, pages, language, } = req.body;
        const existingBook = await prisma.books.findUnique({
            where: { isbn },
        });
        if (existingBook) {
            return res
                .status(400)
                .json({ message: "Book with this ISBN already exists" });
        }
        const book = await prisma.books.create({
            data: {
                isbn,
                title,
                description,
                price,
                publisher,
                publishedDate: new Date(publishedDate),
                bookDetails: {
                    create: {
                        edition,
                        format,
                        pages,
                        language,
                    },
                },
                bookAuthors: {
                    create: authors.map((authorId) => ({
                        authorId,
                    })),
                },
            },
            include: {
                bookAuthors: {
                    include: {
                        author: true,
                    },
                },
                bookDetails: true,
            },
        });
        res.status(201).json({
            success: true,
            data: book,
            message: "Book created successfully",
        });
    }
    catch (error) {
        console.error("Create book error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - publisher
 *               - publishedDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               publisher:
 *                 type: string
 *               publishedDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Book'
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
router.put("/:id", auth_1.authenticateToken, auth_1.requireAdmin, [
    (0, express_validator_1.body)("title").notEmpty().withMessage("Title is required"),
    (0, express_validator_1.body)("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    (0, express_validator_1.body)("publisher").notEmpty().withMessage("Publisher is required"),
    (0, express_validator_1.body)("publishedDate")
        .isISO8601()
        .withMessage("Published date must be a valid date"),
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
        const { title, description, price, publisher, publishedDate } = req.body;
        const book = await prisma.books.update({
            where: { id: Number(id) },
            data: {
                title,
                description,
                price,
                publisher,
                publishedDate: new Date(publishedDate),
            },
            include: {
                bookAuthors: {
                    include: {
                        author: true,
                    },
                },
                bookDetails: true,
            },
        });
        res.json({
            success: true,
            data: book,
            message: "Book updated successfully",
        });
    }
    catch (error) {
        console.error("Update book error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book (soft delete)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
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
router.delete("/:id", auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.books.update({
            where: { id: Number(id) },
            data: { isActive: false },
        });
        res.json({
            success: true,
            message: "Book deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete book error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @swagger
 * /books/authors:
 *   get:
 *     summary: Get all authors with pagination and search
 *     tags: [Books]
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
 *         description: Search term for author name
 *     responses:
 *       200:
 *         description: List of authors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/authors", auth_1.authenticateToken, auth_1.requireAnyRole, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            isActive: true,
            ...(search
                ? {
                    name: { contains: search },
                }
                : {}),
        };
        const [authors, total] = await Promise.all([
            prisma.author.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { name: "asc" },
            }),
            prisma.author.count({ where }),
        ]);
        res.json({
            success: true,
            data: authors,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Get authors error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @swagger
 * /books/authors:
 *   post:
 *     summary: Create a new author
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               biography:
 *                 type: string
 *     responses:
 *       201:
 *         description: Author created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Author'
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
router.post("/authors", auth_1.authenticateToken, auth_1.requireAdmin, [(0, express_validator_1.body)("name").notEmpty().withMessage("Author name is required")], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array(),
            });
        }
        const { name, biography } = req.body;
        const author = await prisma.author.create({
            data: { name, biography },
        });
        res.status(201).json({
            success: true,
            data: author,
            message: "Author created successfully",
        });
    }
    catch (error) {
        console.error("Create author error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=books.js.map