import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import bookRoutes from "./routes/books";
import inventoryRoutes from "./routes/inventory";
import stockEntryRoutes from "./routes/stockEntries";
import bookRequestRoutes from "./routes/bookRequests";
import billingRoutes from "./routes/billing";
import returnRoutes from "./routes/returns";
import reportRoutes from "./routes/reports";
import registrationRoutes from "./routes/registrations";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/stock-entries", stockEntryRoutes);
app.use("/api/book-requests", bookRequestRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/registrations", registrationRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Nehemiah Publishing API is running" });
});

app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  }
);

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
