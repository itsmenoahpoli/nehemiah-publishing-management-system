import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import {
  authenticateToken,
  requireAdmin,
  requireAnyRole,
} from "../middlewares/auth";

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /schools:
 *   get:
 *     summary: Get all schools with pagination and search
 *     tags: [Schools]
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
 *         description: Search term for school name, contact person, or email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [approved, pending]
 *         description: Filter by approval status
 *     responses:
 *       200:
 *         description: List of schools
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
      const { page = 1, limit = 10, search = "", status = "" } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        ...(search
          ? {
              OR: [
                { schoolName: { contains: search as string } },
                { contactPerson: { contains: search as string } },
                { email: { contains: search as string } },
              ],
            }
          : {}),
        ...(status
          ? { isApproved: status === "approved" }
          : {}),
      };

      const [schools, total] = await Promise.all([
        prisma.schoolProfile.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: "desc" },
        }),
        prisma.schoolProfile.count({ where }),
      ]);

      res.json({
        success: true,
        data: schools,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Get schools error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /schools/{id}:
 *   get:
 *     summary: Get a specific school by ID
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: School ID
 *     responses:
 *       200:
 *         description: School details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/School'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: School not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authenticateToken,
  requireAnyRole,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const school = await prisma.schoolProfile.findUnique({
        where: { id: Number(id) },
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
      });

      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }

      res.json({
        success: true,
        data: school,
      });
    } catch (error) {
      console.error("Get school error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /schools:
 *   post:
 *     summary: Create a new school
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schoolName
 *               - address
 *               - contactPerson
 *               - phone
 *               - email
 *             properties:
 *               schoolName:
 *                 type: string
 *               address:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               isApproved:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: School created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/School'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or school already exists
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
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  [
    body("schoolName").notEmpty().withMessage("School name is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("contactPerson").notEmpty().withMessage("Contact person is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("email").isEmail().withMessage("Valid email is required"),
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

      const { schoolName, address, contactPerson, phone, email, isApproved = false } = req.body;

      const existingSchool = await prisma.schoolProfile.findFirst({
        where: {
          OR: [{ schoolName }, { email }],
        },
      });

      if (existingSchool) {
        return res
          .status(400)
          .json({ message: "School with this name or email already exists" });
      }

      const school = await prisma.schoolProfile.create({
        data: {
          schoolName,
          address,
          contactPerson,
          phone,
          email,
          isApproved,
        },
      });

      res.status(201).json({
        success: true,
        data: school,
        message: "School created successfully",
      });
    } catch (error) {
      console.error("Create school error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /schools/{id}:
 *   put:
 *     summary: Update a school
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: School ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schoolName
 *               - address
 *               - contactPerson
 *               - phone
 *               - email
 *             properties:
 *               schoolName:
 *                 type: string
 *               address:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               isApproved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: School updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/School'
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
 *         description: School not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  [
    body("schoolName").notEmpty().withMessage("School name is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("contactPerson").notEmpty().withMessage("Contact person is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("email").isEmail().withMessage("Valid email is required"),
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
      const { schoolName, address, contactPerson, phone, email, isApproved } = req.body;

      const school = await prisma.schoolProfile.update({
        where: { id: Number(id) },
        data: {
          schoolName,
          address,
          contactPerson,
          phone,
          email,
          isApproved,
        },
      });

      res.json({
        success: true,
        data: school,
        message: "School updated successfully",
      });
    } catch (error) {
      console.error("Update school error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /schools/{id}/approve:
 *   post:
 *     summary: Approve a school registration
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: School ID
 *     responses:
 *       200:
 *         description: School approved successfully
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
 *       404:
 *         description: School not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:id/approve",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.schoolProfile.update({
        where: { id: Number(id) },
        data: { isApproved: true },
      });

      res.json({
        success: true,
        message: "School approved successfully",
      });
    } catch (error) {
      console.error("Approve school error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /schools/{id}:
 *   delete:
 *     summary: Delete a school
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: School ID
 *     responses:
 *       200:
 *         description: School deleted successfully
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

      await prisma.schoolProfile.delete({
        where: { id: Number(id) },
      });

      res.json({
        success: true,
        message: "School deleted successfully",
      });
    } catch (error) {
      console.error("Delete school error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
