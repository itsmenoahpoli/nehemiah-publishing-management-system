# Docker Setup for Nehemiah Publishing Management System

This Docker setup provides a complete development and production environment for the Nehemiah Publishing Management System with a persistent MySQL database.

## Services

- **Frontend**: React/Vite application served by Nginx (Port 8000)
- **Backend**: Node.js/Express API with Prisma ORM (Port 7001)
- **Database**: MySQL 8.0 with persistent storage (Port 7306)

## Quick Start

1. **Clone and navigate to the project directory**

   ```bash
   cd nehemiah-publishing-management-system
   ```

2. **Start all services**

   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:7001
   - Database: localhost:7306

## Database Configuration

The MySQL database is configured with:

- **Database**: `nehemiah_publishing`
- **User**: `nehemiah_user`
- **Password**: `nehemiah_password`
- **Root Password**: `rootpassword`

Data is persisted in a Docker volume named `mysql_data`.

## Environment Variables

The backend uses the following environment variables (configured in docker-compose.yml):

- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Backend server port (5000)
- `NODE_ENV`: Environment mode (production)

## Development Commands

### Start services

```bash
docker-compose up -d
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Stop services

```bash
docker-compose down
```

### Stop and remove volumes (⚠️ This will delete all data)

```bash
docker-compose down -v
```

### Rebuild services

```bash
docker-compose up --build -d
```

### Use docker-compose.dev.yml (development)

```bash
# Start with the dev compose file
docker-compose -f docker-compose.dev.yml up -d

# Rebuild and start with the dev compose file
docker-compose -f docker-compose.dev.yml up --build -d

# View logs with the dev compose file
docker-compose -f docker-compose.dev.yml logs -f

# Stop and remove with the dev compose file
docker-compose -f docker-compose.dev.yml down
```

### Access database directly

```bash
docker-compose exec database mysql -u nehemiah_user -p nehemiah_publishing
```

### Run Prisma commands

```bash
# Generate Prisma client
docker-compose exec backend npx prisma generate

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Open Prisma Studio
docker-compose exec backend npx prisma studio
```

## Production Considerations

1. **Security**: Change default passwords and JWT secret in production
2. **SSL**: Configure SSL certificates for HTTPS
3. **Backup**: Set up regular database backups
4. **Monitoring**: Add health checks and monitoring
5. **Scaling**: Consider using Docker Swarm or Kubernetes for scaling

## Troubleshooting

### Database connection issues

- Ensure the database service is fully started before the backend
- Check if the database credentials match the environment variables

### Frontend not loading

- Verify the nginx configuration
- Check if the backend API is accessible

### Prisma migration issues

- Ensure the database is running and accessible
- Check the DATABASE_URL format

### Port conflicts

- Make sure ports 8000, 7001, and 7306 are not in use by other services
- Modify the port mappings in docker-compose.yml if needed

## File Structure

```
├── docker-compose.yml          # Main Docker Compose configuration
├── init.sql                    # Database initialization script
├── docker.env                  # Environment variables for Docker
├── backend/
│   ├── Dockerfile             # Backend container configuration
│   └── .dockerignore          # Files to ignore in backend build
├── frontend/
│   ├── Dockerfile             # Frontend container configuration
│   ├── nginx.conf             # Nginx configuration for frontend
│   └── .dockerignore          # Files to ignore in frontend build
└── DOCKER_README.md           # This file
```
