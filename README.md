# Nehemiah Publishing Management System

A comprehensive web-based publishing management system built with React.js, Express.js, and MySQL. The system provides role-based access control for administrators and school clerks to manage book inventory, sales, requests, and reporting.

## 🚀 Features

### Authentication & Authorization

- **JWT-based authentication** with role-based access control
- **Admin and Clerk roles** with different dashboard views
- **Secure password management** with change password functionality
- **Protected routes** with middleware validation

### Admin Features

- **User Management**: CRUD operations for users with role assignment
- **Book Management**: Complete book catalog with author management
- **School Management**: School profile and inventory tracking
- **Inventory Control**: Warehouse and school stock management
- **Stock Entry**: Add book quantities to warehouse/school locations
- **Book Requests**: Approve/decline school book requests
- **Billing & Payment**: Generate and track bills with payment status
- **Returns Management**: Process book return requests
- **Reports**: Sales, inventory, and transaction history reports
- **Registration Approvals**: Manage new school registrations

### Clerk Features

- **Inventory View**: View school inventory and request book entries
- **Book Requests**: Submit and track book requests to admin
- **Sales Management**: Add/edit/delete book sales with receipt generation
- **Customer Transactions**: Track customer purchase history
- **Reports**: Order history and request status tracking

## 🛠 Tech Stack

### Frontend

- **React.js** - UI framework
- **TypeScript** - Type safety
- **TailwindCSS** - Responsive styling
- **Lucide React** - Icon library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **React Table** - Data tables with export

### Backend

- **Express.js** - Server framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **MySQL** - Database
- **JWT** - Authentication
- **Express Validator** - Input validation

## 📁 Project Structure

```
nehemiah-publishing-management-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── DataTables/
│   │   │   ├── ModalForms/
│   │   │   └── Toast/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Maintenance/
│   │   │   ├── Inventory/
│   │   │   ├── StockEntries/
│   │   │   ├── BookRequests/
│   │   │   ├── BillingPayment/
│   │   │   ├── ReturnedBooks/
│   │   │   ├── Reports/
│   │   │   ├── RegistrationApprovals/
│   │   │   └── OrderHistory/
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── utils/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── prisma/
│   │       └── schema.prisma
│   └── package.json
└── README.md
```

## 🗄 Database Schema

The system uses 17 interconnected tables:

### Core Entities

- **UserAccounts** - User authentication and roles
- **SchoolProfile** - School information
- **Books** - Book catalog
- **Author** - Author information
- **Customer** - Customer records

### Inventory Management

- **WarehouseStock** - Warehouse inventory
- **SchoolStock** - School inventory
- **SchoolInventory** - School inventory details
- **Stocks** - Stock tracking
- **StockEntries** - Stock entry records

### Sales & Billing

- **Bill** - Bill records
- **BillDetails** - Bill line items
- **SchoolSalesTransaction** - Sales transactions
- **SchoolSalesTransactionDetail** - Transaction details

### Book Management

- **BookDetail** - Book details
- **BookAuthors** - Book-author relationships (M:N)

### Returns & Requests

- **ReturnedBook** - Return records
- **ReturnedBookDetails** - Return details
- **BookRequests** - Book request tracking

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nehemiah-publishing-management-system
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install

   # Configure environment variables
   cp .env.example .env
   # Edit .env with your database credentials

   # Database setup
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed

   # Start development server
   npm run dev
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install

   # Configure environment variables
   cp .env.example .env
   # Edit .env with your API URL

   # Start development server
   npm start
   ```

### Environment Variables

**Backend (.env)**

```
DATABASE_URL="mysql://user:password@localhost:3306/nehemiah_db"
JWT_SECRET="your-jwt-secret"
PORT=5000
```

**Frontend (.env)**

```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🔐 Authentication

### Login Flow

1. User enters credentials on `/login`
2. Backend validates and returns JWT token
3. Frontend stores token and redirects based on role:
   - **Admin**: `/dashboard` with full access
   - **Clerk**: `/dashboard` with limited access

### Role-based Access

- **Admin**: Full system access including user management
- **Clerk**: Limited to school-specific operations

## 📊 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password

### User Management

- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Book Management

- `GET /api/books` - Get all books
- `POST /api/books` - Create book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Inventory

- `GET /api/inventory` - Get inventory data
- `GET /api/inventory/warehouse` - Warehouse stocks
- `GET /api/inventory/school/:id` - School stocks

### Stock Management

- `POST /api/stock-entries` - Add stock entry
- `GET /api/stock-entries` - Get stock entries

### Book Requests

- `GET /api/book-requests` - Get requests
- `POST /api/book-requests` - Create request
- `PUT /api/book-requests/:id` - Update request status

### Billing

- `GET /api/billing` - Get bills
- `POST /api/billing` - Create bill
- `PUT /api/billing/:id` - Update bill

### Returns

- `GET /api/returns` - Get returns
- `POST /api/returns` - Create return
- `PUT /api/returns/:id` - Update return status

### Reports

- `GET /api/reports/sales` - Sales reports
- `GET /api/reports/inventory` - Inventory reports
- `GET /api/reports/history` - Transaction history

### Registrations

- `GET /api/registrations` - Get pending registrations
- `PUT /api/registrations/:id` - Approve/decline registration

## 🎨 UI Components

### Core Components

- **Sidebar**: Navigation menu with role-based items
- **Navbar**: Header with user info and logout
- **DataTables**: Reusable table component with sorting/filtering
- **ModalForms**: Reusable modal forms for CRUD operations
- **Toast**: Success/error notifications

### Icons

All UI elements use **Lucide React** icons for consistency:

- Navigation icons
- Action buttons
- Status indicators
- Menu items

## 📱 Responsive Design

The application is fully responsive using TailwindCSS:

- **Mobile-first** approach
- **Breakpoint system**: sm, md, lg, xl, 2xl
- **Flexible layouts** for all screen sizes
- **Touch-friendly** interface elements

## 🔒 Security Features

### Authentication

- **JWT tokens** with expiration
- **Secure password** hashing
- **Role-based** route protection

### Validation

- **Input sanitization** on all forms
- **Express validator** middleware
- **TypeScript** type checking

### Error Handling

- **Centralized** error handling
- **User-friendly** error messages
- **Logging** for debugging

## 📈 Reporting Features

### Available Reports

- **Sales Reports**: Daily, monthly, annual sales
- **Inventory Reports**: Stock levels and movements
- **Transaction History**: Complete audit trail
- **Order History**: School-specific order tracking

### Export Options

- **CSV export** for data analysis
- **PDF generation** for reports
- **Print-friendly** layouts

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
```

### Environment Setup

- Configure production database
- Set environment variables
- Configure reverse proxy (nginx)
- Set up SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Nehemiah Publishing Management System** - Streamlining book publishing operations with modern web technology.
