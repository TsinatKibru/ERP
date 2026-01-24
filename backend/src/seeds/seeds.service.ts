import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../inventory/categories/entities/category.entity';
import { Product } from '../inventory/products/entities/product.entity';
import { Supplier } from '../procurement/suppliers/entities/supplier.entity';

@Injectable()
export class SeedsService {
    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        @InjectRepository(Supplier)
        private suppliersRepository: Repository<Supplier>,
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
}
