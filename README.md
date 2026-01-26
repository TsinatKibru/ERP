# Enterprise Resource Planning (ERP) System

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Frontend](https://img.shields.io/badge/frontend-React%20%7C%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/backend-NestJS-E0234E)

## � Table of Contents
- [What the Project Does](#-what-the-project-does)
- [Why it is Useful](#-why-it-is-useful)
- [How to Get Started](#-how-to-get-started)
- [Documentation](#-documentation)
- [Support](#-support)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 What the Project Does
This project is a modern, full-stack **Enterprise Resource Planning (ERP)** system designed to streamline business operations for SMBs. It consolidates Inventory, Sales, Procurement, HR, and Finance into a single, unified platform secured by **Keycloak** authentication.

Unlike legacy ERPs, this solution is built on a modern stack (**NestJS + React**) with a focus on real-time data, responsive design, and auditable financial integrity.

## ✨ Why it is Useful
*   **Unified Data:** No more silos. Sales orders automatically update inventory levels and accounts receivable.
*   **Role-Based Security:** Strict data isolation ensures Employees see only what they need, while Managers run the business and Admins configure it.
*   **Financial Integrity:** Real-time Profit & Loss generation (`Revenue - Expenses - Payroll`) gives instant business health visibility.
*   **Self-Service HR:** Employees can access their own payslips (PDF) and attendance records without bothering HR.
*   **Audit Ready:** Every critical action is logged, and financial documents (Payslips, Invoices) are generated as immutable PDFs.

## � How to Get Started

### Prerequisites
- [Docker Engine](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js](https://nodejs.org/) v18+ (for local development)

### Installation

**Option 1: Docker (Recommended)**
```bash
git clone https://github.com/TsinatKibru/ERP.git
cd ERP
docker-compose up -d
```
That's it! The entire stack (Frontend + Backend + Database + Auth) will be running:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`
- **Keycloak**: `http://localhost:8080`

**Option 2: Local Development**
If you prefer running services individually:

1. **Start Infrastructure**
   ```bash
   docker-compose up -d postgres redis keycloak
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Standard Credentials
| Service | URL | Username | Password |
|---------|-----|----------|----------|
| **Keycloak** | `http://localhost:8080` | `admin` | `admin` |
| **Postgres** | `localhost:5436` | `erp_user` | `erp_password` |

*Note: You must create your initial Realm and Users in Keycloak after the first launch.*

## � Documentation
For detailed architectural guides, please see the `docs/` directory:

- [**Authentication Flow**](docs/auth_flow.md) - How Keycloak integrates with guards.
- [**Architecture Overview**](docs/architecture.md) - System design and patterns.
- [**User Management**](docs/user_management.md) - Roles and Permissions (RBAC).
- [**Inventory System**](docs/inventory_intelligence.md) - Stock tracking and ledgers.
- [**Finance Module**](docs/finance.md) - Invoices, expenses, and payments.
- [**HR & Payroll**](docs/hr_and_payroll.md) - Payslip generation logic.

## 🆘 Support
If you encounter issues or have questions:
- **Issues:** Please check the [Issues](https://github.com/TsinatKibru/ERP/issues) page to see if your problem has already been reported.
- **Discussions:** specific questions can be asked in the [Discussions](https://github.com/TsinatKibru/ERP/discussions) tab.
- **Docs:** Read the specific [docs](docs/) for the module you are having trouble with.

## 🤝 Contributing
We welcome contributions! Please read our [Contribution Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 👤 Maintainers
- **Tsinat Kibru** - *Initial work* - [Profile](https://github.com/TsinatKibru)

## � License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
