import {
  PrismaClient,
  Role,
  InventoryStatus,
  BillStatus,
  TransactionStatus,
  ReturnStatus,
  PaymentMethod,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const clerkPassword = await bcrypt.hash("Clerk@123", 12);

  const admin = await prisma.userAccounts.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@example.com",
      password: adminPassword,
      firstName: "System",
      lastName: "Administrator",
      role: Role.ADMIN,
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
      role: Role.CLERK,
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
      price: 499.99 as any,
      publisher: "Nehemiah Publishing",
      publishedDate: new Date("2023-08-01"),
      isActive: true,
    },
  });

  await prisma.books.createMany({
    data: [
      {
        isbn: "9780000000002",
        title: "Geometry Essentials",
        description: "Core concepts of Euclidean geometry.",
        price: 459.99 as any,
        publisher: "Nehemiah Publishing",
        publishedDate: new Date("2023-09-15"),
        isActive: true,
      },
      {
        isbn: "9780000000003",
        title: "Biology Basics",
        description: "Introduction to cellular and organismal biology.",
        price: 529.99 as any,
        publisher: "Nehemiah Publishing",
        publishedDate: new Date("2023-07-10"),
        isActive: true,
      },
      {
        isbn: "9780000000004",
        title: "Chemistry Fundamentals",
        description: "Atoms, molecules, and chemical reactions.",
        price: 549.99 as any,
        publisher: "Nehemiah Publishing",
        publishedDate: new Date("2023-06-20"),
        isActive: true,
      },
      {
        isbn: "9780000000005",
        title: "Physics Principles",
        description: "Mechanics, thermodynamics, and waves.",
        price: 579.99 as any,
        publisher: "Nehemiah Publishing",
        publishedDate: new Date("2023-05-05"),
        isActive: true,
      },
      {
        isbn: "9780000000006",
        title: "World History I",
        description: "Ancient civilizations through the medieval era.",
        price: 399.99 as any,
        publisher: "Nehemiah Publishing",
        publishedDate: new Date("2022-11-11"),
        isActive: true,
      },
      {
        isbn: "9780000000007",
        title: "World History II",
        description: "Renaissance to modern world events.",
        price: 419.99 as any,
        publisher: "Nehemiah Publishing",
        publishedDate: new Date("2023-01-20"),
        isActive: true,
      },
      {
        isbn: "9780000000008",
        title: "English Literature",
        description: "Selected readings and literary analysis.",
        price: 469.99 as any,
        publisher: "Nehemiah Publishing",
        publishedDate: new Date("2023-03-12"),
        isActive: true,
      },
      {
        isbn: "9780000000009",
        title: "Computer Science Intro",
        description: "Programming fundamentals and problem solving.",
        price: 599.99 as any,
        publisher: "Nehemiah Publishing",
        publishedDate: new Date("2024-02-01"),
        isActive: true,
      },
      {
        isbn: "9780000000010",
        title: "Economics 101",
        description: "Micro and macroeconomic principles.",
        price: 489.99 as any,
        publisher: "Nehemiah Publishing",
        publishedDate: new Date("2022-09-30"),
        isActive: true,
      },
      {
        isbn: "9780000000011",
        title: "Civics and Government",
        description: "Structures and functions of government.",
        price: 379.99 as any,
        publisher: "Nehemiah Publishing",
        publishedDate: new Date("2022-08-18"),
        isActive: true,
      },
    ],
    skipDuplicates: true,
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
      status: InventoryStatus.APPROVED,
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
      totalAmount: 999.98 as any,
      status: BillStatus.PAID,
      paymentMethod: PaymentMethod.CASH,
      paidAmount: 999.98 as any,
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
      unitPrice: 499.99 as any,
      totalPrice: 999.98 as any,
    },
  });

  const sale = await prisma.schoolSalesTransaction.upsert({
    where: { id: 1 },
    update: {},
    create: {
      schoolId: school.id,
      transactionNumber: "TXN-0001",
      totalAmount: 499.99 as any,
      status: TransactionStatus.COMPLETED,
      paymentMethod: PaymentMethod.CASH,
      paidAmount: 499.99 as any,
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
      unitPrice: 499.99 as any,
      totalPrice: 499.99 as any,
    },
  });

  const ret = await prisma.returnedBook.upsert({
    where: { id: 1 },
    update: {},
    create: {
      returnNumber: "RET-0001",
      schoolId: school.id,
      totalAmount: 499.99 as any,
      status: ReturnStatus.APPROVED,
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
      unitPrice: 499.99 as any,
      totalPrice: 499.99 as any,
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
