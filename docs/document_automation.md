# Document Automation & Reporting

The ERP utilizes a centralized `ReportingService` to generate professional, audit-ready PDF documents for various business processes.

## PDF Engine
- **Technology**: Uses `pdfkit` on the backend.
- **Buffer-based**: Documents are generated as buffers in memory and streamed to the client as secure blobs.
- **Branding**: Automatically pulls company name, address, and contact info from the System Settings.

## Automated Documents

### 1. Invoices
- Generated automatically upon order completion.
- Includes line-item breakdown, quantities, unit prices, and status.

### 2. Purchase Orders
- Formalizes procurement requests with suppliers.
- Summarizes estimated costs and item lists.

### 3. Employee Payslips
- Detailed breakdown of Monthly Base Salary.
- Visualizes Bonuses and deductions (including Attendance-based absenteeism).
- Automatically calculates Net Pay.

### 4. Customer Statements
- Aggregated summary of all invoices for a specific customer.
- Shows Total Billed, Total Outstanding, and individual invoice statuses.

## Security
- **Bearer Authentication**: PDF endpoints are protected by Keycloak roles.
- **Secure Downloads**: Frontend uses `axios` with `responseType: 'blob'` to ensure Bearer tokens are passed in headers, avoiding insecure query parameters.
