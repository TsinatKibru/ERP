# Procurement Module

The Procurement module manages the "Buy" side of the ERP system, handling suppliers and the replenishment of inventory.

## Features
- **Supplier Management**: CRUD operations for business suppliers (contact details, address).
- **Purchase Orders (PO)**: Formal requests for stock from suppliers.
- **Inventory Integration**: Automatic stock level increment when a PO is marked as "Received".
- **Expandable Details**: Expandable rows in the PO table to view specific item breakdowns.

## Entities
- **Supplier**: Company name, contact person, email, phone, address.
- **PurchaseOrder**: PO Number, status (Pending, Received, Cancelled), total amount.
- **PurchaseOrderItem**: Link between PO and Product, quantity, unit price.

## Business Logic
1. Create a PO with multiple items (Products).
2. Status is initially `PENDING`.
3. When marked as `RECEIVED`:
    - The system iterates through all items.
    - Increments the `stockLevel` of each product by the ordered quantity.
    - Status changes to `RECEIVED` and cannot be reverted to prevent duplicate stock entry.
