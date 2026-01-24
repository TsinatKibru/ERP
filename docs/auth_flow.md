# Authentication Flow

## Identity Provider
We use **Keycloak** (v23.0.0) as the central Identity and Access Management (IAM) solution.

## Backend Integration
- **Library**: `nest-keycloak-connect`
- **Global Guards**:
  - `AuthGuard`: Ensures all endpoints (except those marked `@Public()`) require a valid JWT.
  - `RoleGuard`: Handles `@Roles()` decorators for fine-grained access control.
  - `ResourceGuard`: Handles policy enforcement.

## Frontend Integration
- **Library**: `keycloak-js`
- **Logic**: The application is wrapped in an initialization check that redirects to the Keycloak login page if no valid session is found.

## Realm Configuration
The initialization is automated via `keycloak-realm.json`, which sets up:
- **Realm**: `erp-realm`
- **Clients**: `erp-backend` (Confidential), `erp-frontend` (Public)
- **Roles**: `admin`, `user`

## Accessing the Admin UI
The Keycloak management console is available at `http://localhost:8080` with credentials:
- **User**: `admin`
- **Password**: `admin`
