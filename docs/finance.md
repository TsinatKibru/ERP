# Finance & Invoicing Module

The Finance module handles the monetary aspects of the ERP, linking physical goods movement to accounts receivable and payable.

## Features
- **Automated Invoicing**: Generates an invoice automatically when a Sales Order is completed.
- **Accounts Receivable (AR)**: Tracking unpaid customer invoices.
- **Accounts Payable (AP)**: Tracking liabilities from purchase orders.
- **Payment Recording**: Logging inbound (customer) and outbound (supplier) payments.
- **Expense Management**: Tracking operational costs (rent, utilities, etc.) for accurate expenditure analysis.

## Entities
- **Invoice**: Link to Sales Order, invoice number, amount, status (Unpaid, Paid, Overdue, Cancelled), due date.
- **Payment**: Payment type (Inbound/Outbound), method (Cash, Bank, Credit), amount, reference, linked invoice or PO.
- **Expense**: Categorized operational costs (Rent, Marketing, Taxes) with reference/receipt tracking.

## Business Logic
- **Invoice Generation**: Hooked into `OrdersService`. When status becomes `COMPLETED`, `InvoicesService` is triggered to create a new record.
- **Profit & Loss (P&L)**: Dashboard calculates **Net Profit** in real-time: `Total Revenue - (Operational Expenses + Paid PayrollCosts)`.
- **Payment Impact**: Recording a payment for an invoice updates its status to `PAID`. Unpaid invoices contribute to the AR metric.
