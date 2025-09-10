#!/bin/sh

echo "Starting Nehemiah Publishing Management System..."

echo "Installing dependencies..."
npm install

echo "Waiting for database to be ready..."
sleep 10

echo "Testing database connection..."
until mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --skip-ssl -e "SELECT 1" >/dev/null 2>&1; do
  echo "Database is unavailable - sleeping"
  sleep 5
done

echo "Database is ready!"

echo "Generating Prisma client..."
npx prisma generate

echo "Running Prisma migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "Migrations completed successfully!"
  
  echo "Running database seeders..."
  npm run seed
  
  if [ $? -eq 0 ]; then
    echo "Database seeding completed successfully!"
  else
    echo "Seeding failed, but continuing with application startup..."
  fi
else
  echo "Migration failed, but continuing with application startup..."
fi

echo "Starting application in development mode..."
npm run dev
