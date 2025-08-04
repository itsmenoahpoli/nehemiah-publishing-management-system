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

| Method | Endpoint                | Description           | Auth Required |
| ------ | ----------------------- | --------------------- | ------------- |
| POST   | `/auth/login`           | User login            | No            |
| POST   | `/auth/change-password` | Change user password  | Yes           |
| GET    | `/auth/me`              | Get current user info | Yes           |

### Books (`/books`)

| Method | Endpoint         | Description                   | Auth Required | Role Required |
| ------ | ---------------- | ----------------------------- | ------------- | ------------- |
| GET    | `/books`         | Get all books with pagination | Yes           | Any           |
| GET    | `/books/:id`     | Get specific book             | Yes           | Any           |
| POST   | `/books`         | Create new book               | Yes           | Admin         |
| PUT    | `/books/:id`     | Update book                   | Yes           | Admin         |
| DELETE | `/books/:id`     | Delete book (soft delete)     | Yes           | Admin         |
| GET    | `/books/authors` | Get all authors               | Yes           | Any           |
| POST   | `/books/authors` | Create new author             | Yes           | Admin         |

### Users (`/users`)

| Method | Endpoint | Description     | Auth Required | Role Required |
| ------ | -------- | --------------- | ------------- | ------------- |
| GET    | `/users` | Get all users   | Yes           | Admin         |
| POST   | `/users` | Create new user | Yes           | Admin         |

### Inventory (`/inventory`)

| Method | Endpoint               | Description             | Auth Required | Role Required |
| ------ | ---------------------- | ----------------------- | ------------- | ------------- |
| GET    | `/inventory/warehouse` | Get warehouse inventory | Yes           | Any           |
| GET    | `/inventory/schools`   | Get school inventory    | Yes           | Any           |

### Billing (`/billing`)

| Method | Endpoint   | Description     | Auth Required | Role Required |
| ------ | ---------- | --------------- | ------------- | ------------- |
| GET    | `/billing` | Get all bills   | Yes           | Any           |
| POST   | `/billing` | Create new bill | Yes           | Any           |

### Reports (`/reports`)

| Method | Endpoint             | Description          | Auth Required | Role Required |
| ------ | -------------------- | -------------------- | ------------- | ------------- |
| GET    | `/reports/sales`     | Get sales report     | Yes           | Any           |
| GET    | `/reports/inventory` | Get inventory report | Yes           | Any           |

### Registrations (`/registrations`)

| Method | Endpoint         | Description                | Auth Required | Role Required |
| ------ | ---------------- | -------------------------- | ------------- | ------------- |
| GET    | `/registrations` | Get school registrations   | Yes           | Admin         |
| POST   | `/registrations` | Submit school registration | No            | None          |

### Stock Entries (`/stock-entries`)

| Method | Endpoint         | Description        | Auth Required | Role Required |
| ------ | ---------------- | ------------------ | ------------- | ------------- |
| GET    | `/stock-entries` | Get stock entries  | Yes           | Any           |
| POST   | `/stock-entries` | Create stock entry | Yes           | Admin         |

### Book Requests (`/book-requests`)

| Method | Endpoint         | Description         | Auth Required | Role Required |
| ------ | ---------------- | ------------------- | ------------- | ------------- |
| GET    | `/book-requests` | Get book requests   | Yes           | Any           |
| POST   | `/book-requests` | Create book request | Yes           | Any           |

### Returns (`/returns`)

| Method | Endpoint   | Description          | Auth Required | Role Required |
| ------ | ---------- | -------------------- | ------------- | ------------- |
| GET    | `/returns` | Get returned books   | Yes           | Any           |
| POST   | `/returns` | Create return record | Yes           | Any           |

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
  "updatedAt": "2024-01-01T00:00:00Z"
}
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

## Support

For API support or questions, please contact the development team or refer to the Swagger documentation at `http://localhost:5000/api-docs`.
