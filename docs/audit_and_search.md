# Global Search & Audit Trail

Ensuring system-wide visibility, rapid navigation, and administrative accountability.

## Global Search (Omni-Search)
The header contains a real-time search tool that scans across independent business domains.

### Indexed Entities
- **Products**: Searchable by name. Shows SKU and stock status.
- **Customers**: Searchable by name. Shows email.
- **Orders**: Searchable by order number. Shows status and total.
- **Employees**: Searchable by name. Shows job title/department.

### Technical Detail
- **Frontend**: `GlobalSearch.tsx` uses a dropdown with debounced querying.
- **Backend**: `SearchService` runs concurrent queries across 4 repositories using `Like` patterns.

## Audit Trail
The system automatically logs every data mutation to ensure security and traceability.

### Implementation
- **AuditInterceptor**: A global NestJS interceptor that captures all `POST`, `PATCH`, `PUT`, and `DELETE` requests.
- **Log Data**:
    - **Action**: The HTTP method and URL.
    - **Entity**: The affected domain (extracted from URL segments).
    - **User**: The Keycloak-authenticated user who performed the action.
    - **Details**: The request payload (sanitized to exclude passwords/secrets).

### Audit Viewer
Admins can review logs at `/audit`, providing a high-level history of what changed in the system and who did it.
