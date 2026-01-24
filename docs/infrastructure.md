# Infrastructure Setup

## Docker Compose
All core infrastructure services are containerized using Docker Compose.

### Services:
- **Postgres**: Enterprise database.
  - **Port**: 5436 (Host mapping to avoid conflicts with default 5432).
  - **Internal Port**: 5432.
- **Redis**: In-memory data store for caching and sessions.
  - **Port**: 6379.
- **RabbitMQ**: Message broker for event-driven internal communication.
  - **Port**: 5672 (AMQP), 15672 (Management Console).
- **Keycloak**: Open-source Identity and Access Management.
  - **Port**: 8080.
  - **Admin UI**: `http://localhost:8080` (admin/admin).

## Database Configuration
- **User**: `erp_user`
- **Password**: `erp_password`
- **Database**: `erp_db`

## Environment Variables
The backend uses a `.env` file for configuration. Ensure the `DB_PORT` is set to `5436` to match the Docker mapping.
