# RabbitMQ Messaging

RabbitMQ is integrated into the ERP system to facilitate asynchronous, event-driven communication between modules, preparing the architecture for a future transition to microservices.

## Current Usage
- **Health Monitoring**: The `HealthController` uses the RabbitMQ client to verify connectivity to the message broker.
- **Microservice Client**: A `ClientsModule` is registered in `AppModule` with the name `ERP_INTERNAL_SERVICE`, configured to use the `RMQ` transport.

## Configuration
- **Broker URL**: Managed via `RABBITMQ_URL` environment variable (Default: `amqp://guest:guest@localhost:5672`).
- **Queue**: `erp_internal_queue`.
- **Durable**: The queue is configured as durable to prevent message loss during broker restarts.

## Future Implementation
The system is designed to use RabbitMQ for:
- **Async Side-Effects**: E.g., sending emails or generating complex reports without blocking the main request cycle.
- **Inter-Module Events**: Allowing modules to remain decoupled (e.g., the `Sales` module emitting an `OrderCreated` event that the `Inventory` or `Finance` modules can subscribe to).
- **Microservice Extraction**: Providing the backbone for moving modules out of the monolith into independent services.
