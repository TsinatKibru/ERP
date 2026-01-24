# Business Dashboard

The Dashboard provides a high-level overview of the company's operational and financial health.

## Key Metrics (KPIs)
- **Total Revenue**: Sum of all completed sales orders.
* **Accounts Receivable (AR)**: Total value of all 'Unpaid' invoices.
* **Accounts Payable (AP)**: Total value of all pending/cancelled purchase orders (liabilities).
* **Inventory Value**: Monetary value of current stock (`Price * StockLevel`).
- **Low Stock Alerts**: Real-time list of products with stock levels below 10 units.

## Technical Implementation
- **Backend**: `DashboardService` aggregates data from `Order`, `Product`, `Invoice`, and `PurchaseOrder` repositories.
- **Frontend**: Utilizes `Statistic` components from Ant Design and custom tables for alerts.
- **Refreshing**: Data is automatically refreshed via React Query when mutations (like receiving stock or completing orders) occur.
