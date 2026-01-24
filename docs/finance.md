# Finance & Invoicing Module

The Finance module handles the monetary aspects of the ERP, linking physical goods movement to accounts receivable and payable.

## Features
- **Automated Invoicing**: Generates an invoice automatically when a Sales Order is completed.
- **Accounts Receivable (AR)**: Tracking unpaid customer invoices.
- **Accounts Payable (AP)**: Tracking liabilities from purchase orders.
- **Payment Recording**: Logging inbound (customer) and outbound (supplier) payments.

## Entities
- **Invoice**: Link to Sales Order, invoice number, amount, status (Unpaid, Paid, Overdue, Cancelled), due date.
- **Payment**: Payment type (Inbound/Outbound), method (Cash, Bank, Credit), amount, reference, linked invoice or PO.

## Business Logic
- **Invoice Generation**: Hooked into `OrdersService`. When status becomes `COMPLETED`, `InvoicesService` is triggered to create a new record.
- **Payment Impact**: Recording a payment for an invoice updates its status to `PAID` (if the amount matches). Unpaid invoices contribute to the AR metric on the Dashboard.
