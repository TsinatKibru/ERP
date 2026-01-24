# Advanced Analytics (Dashboard 2.0)

The Dashboard has been evolved into a comprehensive analytics center with data visualizations to support business decision-making.

## Features
- **Sales Revenue Trends**: An area chart showing the last 6 months of revenue and order volume.
- **Inventory Distribution**: A pie chart showing the monetary value and product count distribution across categories.
- **KPI Indicators**: Enhanced stats cards for Revenue, AR/AP, and Inventory Value.

## Technical Implementation
- **Charting Engine**: [Recharts](https://recharts.org/)
- **Backend Data Source**: `DashboardService.getStats()`
    - Aggregates data from `Order`, `Product`, and `Invoice` entities.
    - Normalizes dates and groupings for consistent time-series data.
- **Frontend Components**:
    - `SalesTrendChart.tsx`: Uses `AreaChart` for revenue visualization.
    - `CategoryPieChart.tsx`: Uses `PieChart` for inventory breakdown.

## Data Points
| Metric | Description |
| --- | --- |
| **Revenue** | Total amount from 'Completed' sales orders. |
| **Sales Trend** | Month-over-month revenue for the rolling last 6 months. |
| **Inventory Value** | Sum of `(Product.Price * Product.StockLevel)`. |
| **Category Distribution** | Breakdown of inventory value per Category. |
