"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./swagger");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const books_1 = __importDefault(require("./routes/books"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const stockEntries_1 = __importDefault(require("./routes/stockEntries"));
const bookRequests_1 = __importDefault(require("./routes/bookRequests"));
const billing_1 = __importDefault(require("./routes/billing"));
const returns_1 = __importDefault(require("./routes/returns"));
const reports_1 = __importDefault(require("./routes/reports"));
const registrations_1 = __importDefault(require("./routes/registrations"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.specs));
app.use("/api/auth", auth_1.default);
app.use("/api/users", users_1.default);
app.use("/api/books", books_1.default);
app.use("/api/inventory", inventory_1.default);
app.use("/api/stock-entries", stockEntries_1.default);
app.use("/api/book-requests", bookRequests_1.default);
app.use("/api/billing", billing_1.default);
app.use("/api/returns", returns_1.default);
app.use("/api/reports", reports_1.default);
app.use("/api/registrations", registrations_1.default);
app.use("/api/dashboard", dashboard_1.default);
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Nehemiah Publishing API is running" });
});
app.use("*", (req, res) => {
    res.status(404).json({ message: "Route not found" });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});
async function startServer() {
    try {
        await prisma.$connect();
        console.log("Database connected successfully");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
startServer();
process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});
//# sourceMappingURL=index.js.map