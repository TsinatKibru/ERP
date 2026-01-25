# Real-Time Notifications

The Notification system provides immediate situational awareness for administrators by monitoring system health and financial thresholds.

## Notification Center
- **Location**: Top header bar, accessible via the bell icon.
- **Badging**: Displays a numeric count of unread/active alerts.
- **Categorization**: Uses Ant Design tags and icons to distinguish between different alert types.

## Automatic Alerts

### 1. Inventory Alerts (Low Stock)
- Automatically triggered when products fall below a predefined threshold (default: 10 units).
- Notifies procurement to initiate restocking.

### 2. Financial Alerts (Accounts Receivable)
- Monitors unpaid customer invoices.
- Alerts when the total AR balance exceeds critical thresholds (default: $5,000).

### 3. System Alerts
- General informational messages and audit alerts.

## Implementation Details
- **Frontend**: `Notifications.tsx` component in the header.
- **Backend**: Currently driven by dashboard statistics aggregation, providing a unified view of system "health triggers".
