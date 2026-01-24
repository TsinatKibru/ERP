# Inventory Intelligence & Ledger

This module provides an audited history of all stock movements within the ERP.

## Core Components

### 1. Inventory Ledger
A unified, "bank-statement style" transaction log of every stock movement.
- **Data Sources**:
    - **Sales**: Stock OUT on completed Orders.
    - **Purchases**: Stock IN on received Purchase Orders.
    - **Adjustments**: Manual stock corrections (Damage, Audits).
- **Page**: `/inventory/ledger`

### 2. Stock Adjustments
A professional administrative tool for recording manual inventory changes.
- **Audit Logging**: Every adjustment records the user, reason, previous stock, and new stock.
- **Adjustment Types**:
    - **Addition**: Increase stock (e.g., unexpected stock find).
    - **Subtraction**: Decrease stock (e.g., damage, loss).
    - **Set**: Force stock to a specific absolute value.

## Data Model
- `StockAdjustment` Entity:
    - `product`: The affected product.
    - `type`: Enum (addition, subtraction, set).
    - `changeAmount`: The amount changed.
    - `previousStock` / `newStock`: Snapshot of stock levels.
    - `reason`: Mandatory text description.
    - `performedBy`: ID of the admin worker.
