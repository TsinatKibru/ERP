# Enterprise Resource Planning (ERP) System

## 🚀 Overview
A comprehensive, full-stack ERP solution designed for modern business operations. Built with a scalable **NestJS** backend and a responsive **React (Vite)** frontend, secured by **Keycloak** identity management. This system handles everything from Inventory and Sales to detailed HR Payroll and Financial Auditing.

![Dashboard Preview](https://placehold.co/800x400?text=ERP+Dashboard+Preview)

## 🛠 Tech Stack
- **Backend:** NestJS, TypeORM, Postgres, Redis
- **Frontend:** React, TypeScript, Vite, Ant Design, Recharts, TanStack Query
- **Authentication:** Keycloak (OIDC/OAuth2) with Role-Based Access Control (RBAC)
- **Infrastructure:** Docker Compose

## ✨ Key Features
### 🔐 Advanced Security (RBAC)
- **Three-Tier Access:**
  - **Admin:** Full system control, audit logs, and settings.
  - **Manager:** Operational access (Sales, Inventory, Finance) but no config rights.
  - **Employee:** Secure "Self-Service" portal for viewing personal payslips and attendance only.
- **Data Isolation:** Employees can only access their own data via dedicated `/me` endpoints.

### 📦 Operational Modules
- **Inventory:** Product management, categories, stock adjustments, and full ledger history.
- **Sales:** Customer CRM, order processing, and invoice generation.
- **Procurement:** Supplier management and purchase order (PO) workflows.

### 💰 Finance & HR
- **Payroll Engine:** Automated monthly payroll generation with **PDF Payslips**, bonus/deduction handling, and attendance integration.
- **Expenses:** Expense tracking with categorization and reference linking.
- **Profit & Loss:** Real-time financial dashboard calculating Net Profit (`Revenue - Expenses - Payroll`).

### 📊 Analytics & Utilities
- **Interactive Dashboards:** Visual trends for Sales, Stock Levels, and Financial Ratios.
- **Global Search:** Instant cross-module search for products, customers, and orders.
- **Audit Trail:** Comprehensive logging of all critical system actions.

## 🚦 Getting Started

### Prerequisites
- **Docker & Docker Compose** (Required for Database & Keycloak)
- **Node.js v18+** (For local development)

### Quick Start
1. **Launch Infrastructure**
   Start Postgres, Redis, and Keycloak services.
   ```bash
   docker-compose up -d
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```
   *Server runs on `http://localhost:3000`*

3. **Start Frontend Application**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *App runs on `http://localhost:5173`*

## 🔑 Default Configuration
| Service | URL | Username | Password |
|---------|-----|----------|----------|
| **Keycloak Admin** | `http://localhost:8080` | `admin` | `admin` |
| **Database** | `localhost:5436` | `erp_user` | `erp_password` |
| **API Docs** | `http://localhost:3000/api` | - | - |

> **Note:** You will need to create your initial users (Admin/Manager/Employee) inside Keycloak after launching.

## 📂 Project Structure
```
ERP/
├── backend/            # NestJS API Application
│   ├── src/
│   │   ├── audit/      # Audit Logging System
│   │   ├── auth/       # Keycloak Guards & Decorators
│   │   ├── finance/    # Invoices, Expenses, Payments
│   │   ├── hr/         # Employees, Payroll, Attendance
│   │   ├── inventory/  # Products, categories, Ledger
│   │   └── sales/      # Orders, Customers
│   └── test/
├── frontend/           # React + Vite Application
│   ├── src/
│   │   ├── components/ # Reusable UI (Sidebar, Notifications)
│   │   ├── pages/      # Module Pages (Sales, HR, etc.)
│   │   └── auth/       # Frontend Auth Logic
└── docker-compose.yml  # Infrastructure Definition
```

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
