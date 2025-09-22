FROM node:20-alpine

RUN apk add --no-cache openssl mysql-client

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x wait-for-db.sh start.sh

RUN npx prisma generate

EXPOSE 5000

# Create an entrypoint script that will be available even with volume mounts
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'echo "Starting Nehemiah Publishing Management System..."' >> /entrypoint.sh && \
    echo 'echo "Installing dependencies..."' >> /entrypoint.sh && \
    echo 'npm install' >> /entrypoint.sh && \
    echo 'echo "Waiting for database to be ready..."' >> /entrypoint.sh && \
    echo 'sleep 10' >> /entrypoint.sh && \
    echo 'echo "Testing database connection..."' >> /entrypoint.sh && \
    echo 'until mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --skip-ssl -e "SELECT 1" >/dev/null 2>&1; do' >> /entrypoint.sh && \
    echo '  echo "Database is unavailable - sleeping"' >> /entrypoint.sh && \
    echo '  sleep 5' >> /entrypoint.sh && \
    echo 'done' >> /entrypoint.sh && \
    echo 'echo "Database is ready!"' >> /entrypoint.sh && \
    echo 'echo "Generating Prisma client..."' >> /entrypoint.sh && \
    echo 'npx prisma generate' >> /entrypoint.sh && \
    echo 'echo "Running Prisma migrations..."' >> /entrypoint.sh && \
    echo 'npx prisma migrate deploy' >> /entrypoint.sh && \
    echo 'if [ $? -eq 0 ]; then' >> /entrypoint.sh && \
    echo '  echo "Migrations completed successfully!"' >> /entrypoint.sh && \
    echo '  echo "Running database seeders..."' >> /entrypoint.sh && \
    echo '  npm run seed' >> /entrypoint.sh && \
    echo '  if [ $? -eq 0 ]; then' >> /entrypoint.sh && \
    echo '    echo "Database seeding completed successfully!"' >> /entrypoint.sh && \
    echo '  else' >> /entrypoint.sh && \
    echo '    echo "Seeding failed, but continuing with application startup..."' >> /entrypoint.sh && \
    echo '  fi' >> /entrypoint.sh && \
    echo 'else' >> /entrypoint.sh && \
    echo '  echo "Migration failed, but continuing with application startup..."' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo 'echo "Starting application in development mode..."' >> /entrypoint.sh && \
    echo 'npm run dev' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
