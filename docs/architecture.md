# Architecture Documentation

## Overview
This ERP system is designed as a **Modular Monolith** with **Domain-Driven Design (DDD)** principles. This approach allows us to maintain a clean separation of concerns while keeping the deployment simple initially. It is structured to allow selective extraction into microservices if needed in the future.

## Key Principles
- **Modular Monolith**: Each business domain (e.g., Auth, Users) is a self-contained module within the same NestJS application.
- **User Management**: Decentralized profile storage linked to Keycloak identities.
- **DDD Boundaries**: Clear boundaries between domains to prevent tightly coupled code.
- **Event-Driven**: Internal communication between modules is handled via events (RabbitMQ), preparing the system for microservices.
- **RBAC (Role-Based Access Control)**: Centralized authorization via Keycloak.

## Technology Stack
- **Backend**: NestJS (Node.js framework)
- **Frontend**: React + TypeScript + Ant Design
- **Database**: PostgreSQL
- **Caching**: Redis
- **Messaging**: RabbitMQ
- **Identity Provider**: Keycloak
