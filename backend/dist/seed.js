"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const adminPassword = await bcryptjs_1.default.hash("Admin@123", 12);
    const clerkPassword = await bcryptjs_1.default.hash("Clerk@123", 12);
    const admin = await prisma.userAccounts.upsert({
        where: { username: "admin" },
        update: {},
        create: {
            username: "admin",
            email: "admin@example.com",
            password: adminPassword,
            firstName: "System",
            lastName: "Administrator",
            role: client_1.Role.ADMIN,
        },
    });
    const clerk = await prisma.userAccounts.upsert({
        where: { username: "clerk" },
        update: {},
        create: {
            username: "clerk",
            email: "clerk@example.com",
            password: clerkPassword,
            firstName: "Default",
            lastName: "Clerk",
            role: client_1.Role.CLERK,
        },
    });
    const school = await prisma.schoolProfile.upsert({
        where: { id: 1 },
        update: {},
        create: {
            schoolName: "Springfield High School",
            address: "742 Evergreen Terrace",
            contactPerson: "Seymour Skinner",
            phone: "555-1234",
            email: "contact@springfieldhigh.edu",
            isApproved: true,
        },
    });
    const author = await prisma.author.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: "John Doe",
            biography: "Prolific author of educational materials.",
        },
    });
    const book = await prisma.books.upsert({
        where: { id: 1 },
        update: {},
        create: {
            isbn: "9780000000001",
            title: "Algebra I",
            description: "Foundations of Algebra for high school.",
            price: 499.99,
            publisher: "Nehemiah Publishing",
            publishedDate: new Date("2023-08-01"),
            isActive: true,
        },
    });
    await prisma.bookAuthors.upsert({
        where: { bookId_authorId: { bookId: book.id, authorId: author.id } },
        update: {},
        create: { bookId: book.id, authorId: author.id },
    });
    await prisma.bookDetail.upsert({
        where: { id: 1 },
        update: {},
        create: {
            bookId: book.id,
            edition: "1st",
            format: "Paperback",
            pages: 320,
            language: "English",
            isActive: true,
        },
    });
    await prisma.stocks.upsert({
        where: { id: 1 },
        update: {},
        create: {
            bookId: book.id,
            quantity: 150,
            location: "Warehouse A",
        },
    });
    await prisma.warehouseStock.upsert({
        where: { id: 1 },
        update: {},
        create: {
            bookId: book.id,
            quantity: 500,
        },
    });
    await prisma.schoolStock.upsert({
        where: { schoolId_bookId: { schoolId: school.id, bookId: book.id } },
        update: {},
        create: {
            schoolId: school.id,
            bookId: book.id,
            quantity: 40,
        },
    });
    await prisma.schoolInventory.upsert({
        where: { id: 1 },
        update: {},
        create: {
            schoolId: school.id,
            bookId: book.id,
            quantity: 40,
            status: client_1.InventoryStatus.APPROVED,
        },
    });
    const customer = await prisma.customer.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: "Shelbyville Elementary",
            email: "admin@shelbyville.edu",
            phone: "555-5678",
            address: "123 Elm St",
        },
    });
    const bill = await prisma.bill.upsert({
        where: { id: 1 },
        update: {},
        create: {
            customerId: customer.id,
            billNumber: "BILL-0001",
            totalAmount: 999.98,
            status: client_1.BillStatus.PAID,
            paymentMethod: client_1.PaymentMethod.CASH,
            paidAmount: 999.98,
            paidAt: new Date(),
        },
    });
    await prisma.billDetails.upsert({
        where: { id: 1 },
        update: {},
        create: {
            billId: bill.id,
            bookId: book.id,
            quantity: 2,
            unitPrice: 499.99,
            totalPrice: 999.98,
        },
    });
    const sale = await prisma.schoolSalesTransaction.upsert({
        where: { id: 1 },
        update: {},
        create: {
            schoolId: school.id,
            transactionNumber: "TXN-0001",
            totalAmount: 499.99,
            status: client_1.TransactionStatus.COMPLETED,
            paymentMethod: client_1.PaymentMethod.CASH,
            paidAmount: 499.99,
            paidAt: new Date(),
        },
    });
    await prisma.schoolSalesTransactionDetail.upsert({
        where: { id: 1 },
        update: {},
        create: {
            transactionId: sale.id,
            bookId: book.id,
            quantity: 1,
            unitPrice: 499.99,
            totalPrice: 499.99,
        },
    });
    const ret = await prisma.returnedBook.upsert({
        where: { id: 1 },
        update: {},
        create: {
            returnNumber: "RET-0001",
            schoolId: school.id,
            totalAmount: 499.99,
            status: client_1.ReturnStatus.APPROVED,
            approvedBy: admin.id,
            approvedAt: new Date(),
        },
    });
    await prisma.returnedBookDetails.upsert({
        where: { id: 1 },
        update: {},
        create: {
            returnId: ret.id,
            bookId: book.id,
            quantity: 1,
            unitPrice: 499.99,
            totalPrice: 499.99,
            reason: "Damaged",
        },
    });
    console.log("Seed complete: admin & clerk users, sample data created.");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map