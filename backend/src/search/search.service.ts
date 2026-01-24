import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../inventory/products/entities/product.entity';
import { Customer } from '../sales/customers/entities/customer.entity';
import { Order } from '../sales/orders/entities/order.entity';
import { Employee } from '../hr/entities/employee.entity';

export interface SearchResult {
    id: string;
    type: 'PRODUCT' | 'CUSTOMER' | 'ORDER' | 'EMPLOYEE';
    title: string;
    subtitle: string;
    link: string;
}

@Injectable()
export class SearchService {
    constructor(
        @InjectRepository(Product) private productRepo: Repository<Product>,
        @InjectRepository(Customer) private customerRepo: Repository<Customer>,
        @InjectRepository(Order) private orderRepo: Repository<Order>,
        @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    ) { }

    async globalSearch(query: string): Promise<SearchResult[]> {
        if (!query || query.length < 2) return [];

        const searchPattern = `%${query}%`;

        const [products, customers, orders, employees] = await Promise.all([
            this.productRepo.find({ where: { name: Like(searchPattern) }, take: 5 }),
            this.customerRepo.find({ where: { name: Like(searchPattern) }, take: 5 }),
            this.orderRepo.find({ where: { orderNumber: Like(searchPattern) }, take: 5 }),
            this.employeeRepo.find({ where: { name: Like(searchPattern) }, take: 5 }),
        ]);

        const results: SearchResult[] = [];

        products.forEach(p => results.push({
            id: p.id,
            type: 'PRODUCT',
            title: p.name,
            subtitle: `SKU: ${p.sku || 'N/A'} - Stock: ${p.stockLevel}`,
            link: '/products'
        }));

        customers.forEach(c => results.push({
            id: c.id,
            type: 'CUSTOMER',
            title: c.name,
            subtitle: c.email || 'No Email',
            link: '/customers'
        }));

        orders.forEach(o => results.push({
            id: o.id,
            type: 'ORDER',
            title: o.orderNumber,
            subtitle: `Status: ${o.status.toUpperCase()} - Total: $${o.totalAmount}`,
            link: '/orders'
        }));

        employees.forEach(e => results.push({
            id: e.id,
            type: 'EMPLOYEE',
            title: e.name,
            subtitle: `${e.jobTitle || 'Staff'} - ${e.email || ''}`,
            link: '/hr/employees'
        }));

        return results;
    }
}
