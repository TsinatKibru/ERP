import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../inventory/categories/entities/category.entity';
import { Product } from '../inventory/products/entities/product.entity';
import { Supplier } from '../procurement/suppliers/entities/supplier.entity';
import { Employee } from '../hr/entities/employee.entity';
import { Department } from '../hr/entities/department.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class SeedsService {
    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        @InjectRepository(Supplier)
        private suppliersRepository: Repository<Supplier>,
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
        @InjectRepository(Department)
        private departmentsRepository: Repository<Department>,
        private settingsService: SettingsService,
    ) { }

    async seedInventory() {
        const categoriesData = [
            { name: 'Electronics', description: 'Gadgets and devices' },
            { name: 'Furniture', description: 'Home and office furniture' },
            { name: 'Clothing', description: 'Apparel and accessories' }
        ];

        const savedCategories = [];
        for (const cat of categoriesData) {
            let category = await this.categoriesRepository.findOne({ where: { name: cat.name } });
            if (!category) {
                category = this.categoriesRepository.create(cat);
                category = await this.categoriesRepository.save(category);
            }
            savedCategories.push(category);
        }

        const electronics = savedCategories.find(c => c.name === 'Electronics');
        const furniture = savedCategories.find(c => c.name === 'Furniture');

        const productsData = [
            { name: 'Laptop Pro', sku: 'LAP-001', price: 1200.00, stockLevel: 50, category: electronics },
            { name: 'Smartphone X', sku: 'PHN-002', price: 800.00, stockLevel: 100, category: electronics },
            { name: 'Wireless Headphones', sku: 'WHP-003', price: 150.00, stockLevel: 200, category: electronics },
            { name: 'Office Chair', sku: 'CHR-004', price: 250.00, stockLevel: 30, category: furniture },
            { name: 'Standing Desk', sku: 'DSK-005', price: 450.00, stockLevel: 15, category: furniture },
        ];

        for (const prod of productsData) {
            const existing = await this.productsRepository.findOne({ where: { sku: prod.sku } });
            if (!existing) {
                const product = this.productsRepository.create(prod);
                await this.productsRepository.save(product);
            }
        }

        return { message: 'Inventory seeded successfully' };
    }

    async seedProcurement() {
        const suppliersData = [
            { name: 'Tech Global Ltd', contactPerson: 'John Smith', email: 'john@techglobal.com', phone: '+123456789', address: '123 Tech Park, Silicon Valley' },
            { name: 'Office Depot Inc', contactPerson: 'Sarah Wilson', email: 'sarah@officedepot.com', phone: '+987654321', address: '456 Business Way, New York' }
        ];

        for (const sup of suppliersData) {
            const existing = await this.suppliersRepository.findOne({ where: { email: sup.email } });
            if (!existing) {
                const supplier = this.suppliersRepository.create(sup);
                await this.suppliersRepository.save(supplier);
            }
        }

        return { message: 'Procurement data (suppliers) seeded successfully' };
    }

    async seedSettings() {
        await this.settingsService.setBulk([
            { key: 'company_name', value: 'Antigravity ERP Solutions', category: 'company' },
            { key: 'company_short_name', value: 'ANTIGRAVITY', category: 'company' },
            { key: 'company_address', value: '123 Innovation Drive, Silicon Valley, CA', category: 'company' },
            { key: 'company_email', value: 'contact@antigravity-erp.com', category: 'company' },
            { key: 'company_phone', value: '+1-555-0199', category: 'company' },
            { key: 'currency', value: 'USD', category: 'regional' },
        ]);
        return { message: 'System settings seeded successfully' };
    }

    async seedHR() {
        const departmentsData = [
            { name: 'Engineering', description: 'Software and hardware engineering' },
            { name: 'HR', description: 'Human Resources and recruitment' },
            { name: 'Sales', description: 'Sales and marketing' },
            { name: 'Finance', description: 'Budgeting and accounting' },
        ];

        const savedDepts: Record<string, Department> = {};
        for (const dept of departmentsData) {
            let d = await this.departmentsRepository.findOne({ where: { name: dept.name } });
            if (!d) {
                d = this.departmentsRepository.create(dept);
                d = await this.departmentsRepository.save(d);
            }
            savedDepts[dept.name] = d;
        }

        const employeesData = [
            { name: 'John Doe', email: 'john@antigravity.com', jobTitle: 'Software Engineer', departmentName: 'Engineering', salary: 95000, hireDate: new Date('2024-01-15') },
            { name: 'Jane Smith', email: 'jane@antigravity.com', jobTitle: 'HR Manager', departmentName: 'HR', salary: 85000, hireDate: new Date('2023-11-20') },
            { name: 'Bob Wilson', email: 'bob@antigravity.com', jobTitle: 'Sales Executive', departmentName: 'Sales', salary: 75000, hireDate: new Date('2024-03-10') },
            { name: 'Alice Brown', email: 'alice@antigravity.com', jobTitle: 'Finance Analyst', departmentName: 'Finance', salary: 80000, hireDate: new Date('2024-02-01') },
        ];

        const savedEmployees = [];
        for (const emp of employeesData) {
            let employee = await this.employeesRepository.findOne({ where: { email: emp.email } });
            const { departmentName, ...empProps } = emp;
            const payload = {
                ...empProps,
                department: savedDepts[departmentName],
            };

            if (!employee) {
                const newEmployee = this.employeesRepository.create(payload as any);
                employee = await this.employeesRepository.save(newEmployee) as unknown as Employee;
            } else {
                // Update department if it exists now
                employee.department = savedDepts[departmentName];
                employee = await this.employeesRepository.save(employee) as unknown as Employee;
            }
            if (employee) savedEmployees.push(employee);
        }

        return { message: `HR data (${Object.keys(savedDepts).length} depts, ${savedEmployees.length} employees) seeded successfully` };
    }
}
