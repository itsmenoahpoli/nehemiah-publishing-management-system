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
      const { page = 1, limit = 10, status = "" } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        ...(status ? { isApproved: status === "approved" } : {}),
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
      console.error("Get school registrations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post(
  "/",
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

      const { schoolName, address, contactPerson, phone, email } = req.body;

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
        },
      });

      res.status(201).json({
        success: true,
        data: school,
        message: "School registration submitted successfully",
      });
    } catch (error) {
      console.error("Create school registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.put(
  "/:id/approve",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const school = await prisma.schoolProfile.findUnique({
        where: { id: Number(id) },
      });

      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }

      if (school.isApproved) {
        return res.status(400).json({ message: "School is already approved" });
      }

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

router.put(
  "/:id/reject",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const school = await prisma.schoolProfile.findUnique({
        where: { id: Number(id) },
      });

      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }

      if (school.isApproved) {
        return res.status(400).json({ message: "School is already approved" });
      }

      await prisma.schoolProfile.delete({
        where: { id: Number(id) },
      });

      res.json({
        success: true,
        message: "School registration rejected and deleted",
      });
    } catch (error) {
      console.error("Reject school error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
