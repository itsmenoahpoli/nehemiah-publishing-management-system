# Nehemiah Publishing Management System API Documentation

## Overview

This document provides comprehensive API documentation for the Nehemiah Publishing Management System backend. The API is built with Express.js, TypeScript, and Prisma ORM, and uses JWT authentication for secure access.

## API Base URL

- **Development**: `http://localhost:5000/api`
- **Swagger Documentation**: `http://localhost:5000/api-docs`

## Authentication

The API uses JWT (JSON Web Token) authentication. Most endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles

- **ADMIN**: Full access to all endpoints
- **CLERK**: Limited access to certain endpoints

## API Endpoints

### Authentication (`/auth`)

| Method | Endpoint                | Description           | Auth Required | Role Required |
| ------ | ----------------------- | --------------------- | ------------- | ------------- |
| POST   | `/auth/login`           | User login            | No            | None          |
| POST   | `/auth/change-password` | Change user password  | Yes           | Any           |
| GET    | `/auth/me`              | Get current user info | Yes           | Any           |

### Books Management (`/books`)

| Method | Endpoint         | Description                   | Auth Required | Role Required |
| ------ | ---------------- | ----------------------------- | ------------- | ------------- |
| GET    | `/books`         | Get all books with pagination | Yes           | Any           |
| GET    | `/books/:id`     | Get specific book             | Yes           | Any           |
| POST   | `/books`         | Create new book               | Yes           | Admin         |
| PUT    | `/books/:id`     | Update book                   | Yes           | Admin         |
| DELETE | `/books/:id`     | Delete book (soft delete)     | Yes           | Admin         |
| GET    | `/books/authors` | Get all authors               | Yes           | Any           |
| POST   | `/books/authors` | Create new author             | Yes           | Admin         |
| PUT    | `/books/authors/:id` | Update author             | Yes           | Admin         |
| DELETE | `/books/authors/:id` | Delete author             | Yes           | Admin         |

### User Management (`/users`)

| Method | Endpoint | Description     | Auth Required | Role Required |
| ------ | -------- | --------------- | ------------- | ------------- |
| GET    | `/users` | Get all users   | Yes           | Admin         |
| GET    | `/users/:id` | Get specific user | Yes       | Admin         |
| POST   | `/users` | Create new user | Yes           | Admin         |
| PUT    | `/users/:id` | Update user | Yes           | Admin         |
| DELETE | `/users/:id` | Delete user | Yes           | Admin         |

### Inventory Management (`/inventory`)

| Method | Endpoint               | Description             | Auth Required | Role Required |
| ------ | ---------------------- | ----------------------- | ------------- | ------------- |
| GET    | `/inventory/warehouse` | Get warehouse inventory | Yes           | Any           |
| GET    | `/inventory/schools`   | Get school inventory    | Yes           | Any           |

### Billing & Payment (`/billing`)

| Method | Endpoint   | Description     | Auth Required | Role Required |
| ------ | ---------- | --------------- | ------------- | ------------- |
| GET    | `/billing` | Get all bills   | Yes           | Any           |
| GET    | `/billing/:id` | Get specific bill | Yes       | Any           |
| POST   | `/billing` | Create new bill | Yes           | Any           |
| PUT    | `/billing/:id` | Update bill | Yes           | Any           |
| PUT    | `/billing/:id/pay` | Process payment | Yes       | Any           |
| DELETE | `/billing/:id` | Delete bill | Yes           | Any           |

### Stock Entries (`/stock-entries`)

| Method | Endpoint         | Description        | Auth Required | Role Required |
| ------ | ---------------- | ------------------ | ------------- | ------------- |
| GET    | `/stock-entries` | Get stock entries  | Yes           | Admin         |
| GET    | `/stock-entries/:id` | Get specific entry | Yes       | Admin         |
| POST   | `/stock-entries` | Create stock entry | Yes           | Admin         |
| PUT    | `/stock-entries/:id` | Update stock entry | Yes       | Admin         |
| DELETE | `/stock-entries/:id` | Delete stock entry | Yes       | Admin         |

### Book Requests (`/book-requests`)

| Method | Endpoint         | Description         | Auth Required | Role Required |
| ------ | ---------------- | ------------------- | ------------- | ------------- |
| GET    | `/book-requests` | Get book requests   | Yes           | Any           |
| GET    | `/book-requests/:id` | Get specific request | Yes       | Any           |
| POST   | `/book-requests` | Create book request | Yes           | Any           |
| PUT    | `/book-requests/:id/approve` | Approve request | Yes | Any           |
| PUT    | `/book-requests/:id/reject` | Reject request | Yes   | Any           |

### Returns Management (`/returns`)

| Method | Endpoint   | Description          | Auth Required | Role Required |
| ------ | ---------- | -------------------- | ------------- | ------------- |
| GET    | `/returns` | Get returned books   | Yes           | Any           |
| GET    | `/returns/:id` | Get specific return | Yes       | Any           |
| POST   | `/returns` | Create return record | Yes           | Any           |
| PUT    | `/returns/:id/approve` | Approve return | Yes       | Any           |
| PUT    | `/returns/:id/reject` | Reject return | Yes         | Any           |
| PUT    | `/returns/:id` | Update return | Yes           | Any           |
| DELETE | `/returns/:id` | Delete return | Yes           | Any           |

### School Registrations (`/registrations`)

| Method | Endpoint         | Description                | Auth Required | Role Required |
| ------ | ---------------- | -------------------------- | ------------- | ------------- |
| GET    | `/registrations` | Get school registrations   | Yes           | Admin         |
| GET    | `/registrations/:id` | Get specific registration | Yes       | Admin         |
| POST   | `/registrations` | Submit school registration | No            | None          |
| PUT    | `/registrations/:id/approve` | Approve registration | Yes | Admin         |
| PUT    | `/registrations/:id/reject` | Reject registration | Yes   | Admin         |

### Reports (`/reports`)

| Method | Endpoint             | Description          | Auth Required | Role Required |
| ------ | -------------------- | -------------------- | ------------- | ------------- |
| GET    | `/reports/sales`     | Get sales report     | Yes           | Any           |
| GET    | `/reports/inventory` | Get inventory report | Yes           | Any           |
| GET    | `/reports/transactions` | Get transaction report | Yes       | Any           |
| GET    | `/reports/schools`   | Get school report    | Yes           | Any           |

## Data Models

### User

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "ADMIN",
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Book

```json
{
  "id": 1,
  "isbn": "978-0-123456-47-2",
  "title": "Sample Book",
  "description": "A sample book description",
  "price": 29.99,
  "publisher": "Sample Publisher",
  "publishedDate": "2024-01-01T00:00:00Z",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Author

```json
{
  "id": 1,
  "name": "John Author",
  "biography": "Author biography",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Bill

```json
{
  "id": 1,
  "customerId": 1,
  "billNumber": "BILL-1704067200000",
  "totalAmount": 59.98,
  "status": "PAID",
  "paymentMethod": "CASH",
  "paidAmount": 59.98,
  "paidAt": "2024-01-01T00:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "customer": {
    "id": 1,
    "name": "Customer Name",
    "email": "customer@example.com",
    "phone": "+1234567890"
  },
  "billDetails": [
    {
      "id": 1,
      "bookId": 1,
      "quantity": 2,
      "unitPrice": 29.99,
      "totalPrice": 59.98,
      "book": {
        "id": 1,
        "title": "Sample Book",
        "isbn": "978-0-123456-47-2"
      }
    }
  ]
}
```

### Book Request

```json
{
  "id": 1,
  "schoolId": 1,
  "bookId": 1,
  "quantity": 10,
  "status": "PENDING",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "school": {
    "id": 1,
    "schoolName": "Sample School",
    "email": "school@example.com",
    "phone": "+1234567890"
  },
  "book": {
    "id": 1,
    "title": "Sample Book",
    "isbn": "978-0-123456-47-2",
    "price": 29.99
  }
}
```

### Returned Book

```json
{
  "id": 1,
  "returnNumber": "RET-1704067200000",
  "schoolId": 1,
  "totalAmount": 299.90,
  "status": "PENDING",
  "approvedBy": null,
  "approvedAt": null,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "returnedBookDetails": [
    {
      "id": 1,
      "bookId": 1,
      "quantity": 10,
      "unitPrice": 29.99,
      "totalPrice": 299.90,
      "reason": "Damaged books",
      "book": {
        "id": 1,
        "title": "Sample Book",
        "isbn": "978-0-123456-47-2"
      }
    }
  ]
}
```

### School Registration

```json
{
  "id": 1,
  "schoolName": "Sample School",
  "address": "123 School Street, City, State",
  "contactPerson": "John Principal",
  "phone": "+1234567890",
  "email": "principal@school.com",
  "isApproved": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Stock Entry

```json
{
  "id": 1,
  "bookId": 1,
  "quantity": 100,
  "location": "Warehouse A",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "book": {
    "id": 1,
    "title": "Sample Book",
    "isbn": "978-0-123456-47-2"
  }
}
```

## Query Parameters

### Pagination

All list endpoints support pagination:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Filtering

Many endpoints support filtering:

- `search`: Search term for text fields
- `status`: Filter by status (PENDING, APPROVED, REJECTED, PAID, etc.)
- `startDate`: Start date for date range filters
- `endDate`: End date for date range filters

### Example Requests

```bash
# Get books with pagination and search
GET /api/books?page=1&limit=20&search=science

# Get pending book requests
GET /api/book-requests?status=PENDING

# Get sales report for date range
GET /api/reports/sales?startDate=2024-01-01&endDate=2024-01-31
```

## Common Response Format

### Success Response

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "username",
      "message": "Username is required"
    }
  ]
}
```

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (Validation error)
- **401**: Unauthorized (Authentication required)
- **403**: Forbidden (Insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set up Environment Variables**

   ```bash
   cp env.example .env
   # Edit .env with your database and JWT configuration
   ```

3. **Run Database Migrations**

   ```bash
   npm run prisma:migrate
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

5. **Access Swagger Documentation**
   - Open your browser and navigate to `http://localhost:5000/api-docs`
   - Explore the interactive API documentation
   - Test endpoints directly from the Swagger UI

## Authentication Flow

1. **Login** to get a JWT token:

   ```bash
   POST /api/auth/login
   {
     "username": "admin",
     "password": "password123"
   }
   ```

2. **Use the token** in subsequent requests:
   ```bash
   Authorization: Bearer <your-jwt-token>
   ```

## Testing the API

### Using Swagger UI

1. Navigate to `http://localhost:5000/api-docs`
2. Click "Authorize" and enter your JWT token
3. Test endpoints directly from the interface

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'

# Use the token
curl -X GET http://localhost:5000/api/books \
  -H "Authorization: Bearer <your-token>"
```

### Using Postman

1. Import the API collection
2. Set up environment variables for the base URL
3. Use the login endpoint to get a token
4. Set the Authorization header for subsequent requests

## Business Logic

### Book Request Workflow

1. **Create Request**: School submits book request
2. **Review**: Admin reviews the request
3. **Approve/Reject**: Admin approves or rejects the request
4. **Stock Update**: Approved requests update warehouse and school stock

### Return Workflow

1. **Create Return**: School submits return request
2. **Review**: Admin reviews the return
3. **Approve/Reject**: Admin approves or rejects the return
4. **Stock Update**: Approved returns update stock levels

### Billing Workflow

1. **Create Bill**: Create bill with items
2. **Process Payment**: Process payment for the bill
3. **Update Status**: Bill status updated to PAID

## Error Handling

The API returns consistent error responses with appropriate HTTP status codes. Common error scenarios:

- **Validation Errors**: 400 status with field-specific error messages
- **Authentication Errors**: 401 status when JWT is missing or invalid
- **Authorization Errors**: 403 status when user lacks required permissions
- **Not Found**: 404 status when resources don't exist
- **Server Errors**: 500 status for unexpected errors

## Rate Limiting

Currently, the API does not implement rate limiting. Consider implementing rate limiting for production use.

## Security Considerations

- All sensitive endpoints require JWT authentication
- Passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- Input validation is implemented using express-validator
- SQL injection is prevented through Prisma ORM
- Role-based access control implemented

## API Versioning

The current API is version 1.0. Future versions will be available at `/api/v2/`, etc.

## Support

For API support or questions, please contact the development team or refer to the Swagger documentation at `http://localhost:5000/api-docs`.

## Changelog

### Version 1.0.0
- Initial API release
- Complete CRUD operations for all modules
- JWT authentication
- Swagger documentation
- Role-based access control
- Comprehensive error handling