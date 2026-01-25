# HR & Payroll Management

The HR module handles the lifecycle of employees, departments, and payroll calculations.

## Employee Management
- CRUD for employees with personal details, job titles, and salaries.
- Employees are linked to **Departments**.

## Payroll System
The payroll system uses "Periods" to manage current and historical salary disbursements.

### Payroll Periods
- **Dynamic Periods**: The system generates a rolling window of ±12 months for selections.
- **Filtering**: Payroll records are filtered by period (e.g., `2026-01`) to view historical data.
- **Scaling**: The period generator is based on the current system date, ensuring automatic scaling (e.g., to 2027 and beyond).

### Generation Workflow
1. **Bulk Generate**: Select a target period to automatically create 'Draft' payroll records for all active employees.
2. **Attendance Link**: The system automatically counts "Absent" days for the period from the Attendance module and applies a pro-rata deduction based on the base salary.
3. **Review/Edit**: Adjust specific bonuses or deductions for individuals. Records remain editable even after being marked as paid.
4. **Bulk Management**: "Mark All as Paid" allows finalizing entire periods with one action.
5. **PDF Payslips**: Securely generated PDF documents available for individual download.

## Data Model
- `Employee`: Personal data + relation to `Department`.
- `Department`: Grouping for employees.
- `Payroll`: Snapshot of base salary, bonuses, deductions (attendance and manual), and net pay for a specific month.
- `Attendance`: Record of daily presence used to calculate payroll absenteeism.
