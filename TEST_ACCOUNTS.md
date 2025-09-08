### Backend Test Accounts

- Admin

  - Username: admin
  - Password: Admin@123

- Clerk
  - Username: clerk
  - Password: Clerk@123

### Seeded Sample Data

- Users: admin (ADMIN), clerk (CLERK)
- School: Springfield High School (approved)
- Author: John Doe
- Book: Algebra I (ISBN: 9780000000001), details, stock and warehouse stock
- Customer: Shelbyville Elementary
- Bill: BILL-0001 with one line item
- Sales Transaction: TXN-0001 with one detail
- Returned Book: RET-0001 approved by admin

### How to re-seed

1. Ensure dev stack is running: `docker compose -f docker-compose.dev.yml up -d`
2. Push schema (if needed): `docker exec nehemiah-publishing-management-system-backend-1 npx prisma db push`
3. Seed: `docker exec nehemiah-publishing-management-system-backend-1 npm run seed`

The backend login endpoint is available at `/auth/login` on port 7001.
