# Nehemiah Publishing Management System

A comprehensive full-stack web application for managing publishing operations, including book inventory, school registrations, billing, and reporting.

## 🚀 Features

### Admin Features

- **User Management**: Create, edit, and manage system users with role-based access
- **Book Management**: Add, edit, and manage books with author information
- **Inventory Management**: Track warehouse and school stock levels
- **Stock Entries**: Add new stock quantities to warehouse
- **Book Requests**: Approve/decline book requests from schools
- **Billing & Payment**: Create bills and process payments
- **Returned Books**: Process book returns from schools
- **Reports**: Generate sales, inventory, and transaction reports
- **Registration Approvals**: Approve/reject school registrations

### Clerk Features

- **Inventory View**: View current stock levels
- **Book Requests**: Submit and track book requests
- **Sales Transactions**: Create and manage sales transactions
- **Order History**: View transaction history
- **Reports**: Access relevant reports

## 🛠️ Technology Stack

### Backend

- **Express.js** with TypeScript
- **Prisma ORM** with MySQL database
- **JWT Authentication** with role-based access control
- **Express Validator** for input validation
- **bcryptjs** for password hashing

### Frontend

- **React** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **React Hook Form** with Yup validation
- **TailwindCSS** for styling
- **Lucide React** for icons
- **Axios** for API communication

## 📁 Project Structure

```
nehemiah-publishing-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── types/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
└── README.md
```

## 🗄️ Database Schema

The system includes 17 database models:

1. **UserAccounts** - System users with roles
2. **SchoolProfile** - School registration information
3. **Books** - Book catalog with details
4. **Author** - Author information
5. **BookAuthors** - Many-to-many relationship
6. **BookDetail** - Additional book information
7. **Stocks** - Stock entries
8. **WarehouseStock** - Warehouse inventory
9. **SchoolStock** - School inventory
10. **SchoolInventory** - School inventory requests
11. **Customer** - Customer information
12. **Bill** - Billing records
13. **BillDetails** - Bill line items
14. **SchoolSalesTransaction** - School sales
15. **SchoolSalesTransactionDetail** - Transaction details
16. **ReturnedBook** - Return records
17. **ReturnedBookDetails** - Return line items

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp env.example .env
```

Edit `.env` with your database credentials and JWT secret.

4. Set up the database:

```bash
npx prisma migrate dev
npx prisma generate
```

5. Start the development server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔐 Authentication

The system uses JWT-based authentication with two user roles:

- **ADMIN**: Full access to all features
- **CLERK**: Limited access to specific features

## 📊 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user

### Users (Admin only)

- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Books

- `GET /api/books` - List books
- `POST /api/books` - Create book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book
- `GET /api/books/authors` - List authors
- `POST /api/books/authors` - Create author

### Inventory

- `GET /api/inventory/warehouse` - Warehouse stock
- `GET /api/inventory/schools` - School inventory
- `GET /api/inventory/schools/:schoolId` - School stock

### Stock Entries (Admin only)

- `GET /api/stock-entries` - List stock entries
- `POST /api/stock-entries` - Create stock entry
- `PUT /api/stock-entries/:id` - Update stock entry
- `DELETE /api/stock-entries/:id` - Delete stock entry

### Book Requests

- `GET /api/book-requests` - List requests
- `POST /api/book-requests` - Create request
- `PUT /api/book-requests/:id/approve` - Approve request
- `PUT /api/book-requests/:id/reject` - Reject request

### Billing

- `GET /api/billing` - List bills
- `POST /api/billing` - Create bill
- `PUT /api/billing/:id/pay` - Process payment

### Returns

- `GET /api/returns` - List returns
- `POST /api/returns` - Create return
- `PUT /api/returns/:id/approve` - Approve return
- `PUT /api/returns/:id/reject` - Reject return

### Reports

- `GET /api/reports/sales` - Sales report
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/transactions` - Transaction report
- `GET /api/reports/schools` - School report

### Registrations (Admin only)

- `GET /api/registrations` - List registrations
- `POST /api/registrations` - Create registration
- `PUT /api/registrations/:id/approve` - Approve registration
- `PUT /api/registrations/:id/reject` - Reject registration

## 🎨 UI Components

The frontend includes reusable components:

- **Layout**: Main layout with sidebar and navbar
- **ProtectedRoute**: Role-based route protection
- **DataTable**: Reusable table component
- **Modals**: Reusable modal components
- **Toast Notifications**: User feedback

## 🔧 Development

### Backend Development

```bash
cd backend
npm run dev
```

### Frontend Development

```bash
cd frontend
npm run dev
```

### Database Management

```bash
cd backend
npx prisma studio  # Open Prisma Studio
npx prisma migrate dev  # Run migrations
npx prisma generate  # Generate Prisma client
```

## 📝 Environment Variables

### Backend (.env)

```
DATABASE_URL="mysql://username:password@localhost:3306/nehemiah_publishing"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
NODE_ENV=development
```

## 🚀 Deployment

### Backend Deployment

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

### Frontend Deployment

1. Build the application:

```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team.
