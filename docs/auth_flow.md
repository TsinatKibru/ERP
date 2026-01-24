# Authentication Flow

## Identity Provider
We use **Keycloak** (v23.0.0) as the central Identity and Access Management (IAM) solution.

## Backend Integration
- **Library**: `nest-keycloak-connect`
- **Global Guards**:
  - `AuthGuard`: Ensures all endpoints (except those marked `@Public()`) require a valid JWT.
  - `RoleGuard`: Handles `@Roles()` decorators for fine-grained access control.
  - `ResourceGuard`: Handles policy enforcement.

### Backend Code Examples

#### 1. Global Guard Registration (`auth.module.ts`)
```typescript
@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      useClass: KeycloakConfigService,
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ResourceGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class AuthModule {}
```

#### 2. Protecting Routes (`users.controller.ts`)
```typescript
@Controller('users')
export class UsersController {
  @Get()
  @Roles({ roles: ['admin'] }) // Only admins can access this
  async findAll() {
    return this.usersService.findAll();
  }
}
```

#### 3. Public Routes (`health.controller.ts`)
```typescript
@Controller('health')
export class HealthController {
  @Public() // Allow unauthenticated access
  @Get()
  async check() {
    return { status: 'OK' };
  }
}
```

## Frontend Integration
- **Library**: `keycloak-js`
- **Logic**: The application is wrapped in an initialization check that redirects to the Keycloak login page if no valid session is found.

### Frontend Code Example (`auth/keycloak.ts`)
```typescript
import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8080',
  realm: 'erp-realm',
  clientId: 'erp-frontend',
};

const keycloak = new Keycloak(keycloakConfig);
export default keycloak;
```

## Realm Configuration
The initialization is automated via `keycloak-realm.json`, which sets up:
- **Realm**: `erp-realm`
- **Clients**: `erp-backend` (Confidential), `erp-frontend` (Public)
- **Roles**:
  - **Realm Roles**: `admin`, `user`
  - **Client Roles**: `admin`, `user` (Added to both clients for robust mapping)

> [!NOTE]
> The backend `RoleGuard` is configured to check for the `admin` role. For maximum compatibility, we assign both Realm and Client-level roles to administrative users.

## Accessing the Admin UI
The Keycloak management console is available at `http://localhost:8080` with credentials:
- **User**: `admin`
- **Password**: `admin`
