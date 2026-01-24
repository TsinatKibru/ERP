# User Management

## Purpose
While Keycloak manages authentication, the local `users` table in PostgreSQL stores application-specific profile data and provides local IDs for database relationships.

## Synchronization Logic
We implement a **Sync-on-Login** pattern:
1. When a user logs in via the frontend, the app calls `GET /profile/me`.
2. The `ProfileController` extracts the Keycloak UUID (`sub` claim) from the token.
3. The `UsersService` checks if a user with that `keycloakId` exists in Postgres.
4. If not, a new local user record is created with data from the token (email, name).

## Roles & Permissions
- **Admin**: Can view and manage all users via the `UsersPage` (`GET /users`).
- **User**: Can only access their own profile data.

## Database Schema
The `users` entity includes:
- `id`: Internal UUID (used for FKs).
- `keycloakId`: Unique identifier from Keycloak.
- `email`: User email.
- `firstName` / `lastName`: Profile names.
- `role`: application-level role.
