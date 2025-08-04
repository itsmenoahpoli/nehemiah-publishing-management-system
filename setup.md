# Setup Guide - Nehemiah Publishing Management System

## Quick Start

### 1. Database Setup

1. Create a MySQL database named `nehemiah_publishing`
2. Update the database connection in `backend/.env`

### 2. Backend Setup

```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database credentials
npx prisma migrate dev
npx prisma generate
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Default Admin User

You can create an admin user using Prisma Studio:

```bash
cd backend
npx prisma studio
```

Or create a seed script to add default users.

## Environment Variables

### Backend (.env)

```
DATABASE_URL="mysql://username:password@localhost:3306/nehemiah_publishing"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
```

## Available Scripts

### Backend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open database GUI
- `npx prisma migrate dev` - Run migrations
- `npx prisma generate` - Generate Prisma client

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Troubleshooting

### Database Connection Issues

1. Ensure MySQL is running
2. Check database credentials in `.env`
3. Verify database exists
4. Run `npx prisma migrate dev`

### Frontend Build Issues

1. Clear node_modules and reinstall
2. Check TypeScript errors
3. Verify all dependencies are installed

### API Connection Issues

1. Ensure backend is running on port 5000
2. Check CORS settings
3. Verify JWT token in localStorage
