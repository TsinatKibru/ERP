# Business Dashboard

The Dashboard provides a high-level overview of the company's operational and financial health.

## Key Metrics (KPIs)
- **Total Revenue**: Sum of all completed sales orders.
- **Accounts Receivable (AR)**: Total value of all 'Unpaid' invoices.
- **Accounts Payable (AP)**: Total value of all pending/received purchase orders (liabilities).
- **Inventory Value**: Monetary value of current stock (`Price * StockLevel`).
- **Advanced Analytics**: Interactive charts for sales trends and inventory distribution (See [Analytics Documentation](./analytics.md)).

## Technical Implementation
- **Backend**: `DashboardService` aggregates data from multiple repositories and generates time-series trends.
- **Frontend**: Utilizes Ant Design `Card`/`Statistic` components alongside **Recharts** for visualizations.
- **Refreshing**: Data is automatically refreshed via React Query.
