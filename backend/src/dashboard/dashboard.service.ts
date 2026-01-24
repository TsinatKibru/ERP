import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../sales/orders/entities/order.entity';
import { Product } from '../inventory/products/entities/product.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async getStats() {
        const orders = await this.ordersRepository.find();
        const products = await this.productsRepository.find({ relations: ['category'] });

        const totalRevenue = orders
            .filter(o => o.status === OrderStatus.COMPLETED)
            .reduce((sum, o) => sum + Number(o.totalAmount), 0);

        const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
        const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED).length;

        const lowStockProducts = products
            .filter(p => p.stockLevel < 10)
            .map(p => ({
                id: p.id,
                name: p.name,
                stockLevel: p.stockLevel,
                category: p.category?.name
            }));

        // Simple top selling products (by count in completed orders)
        // This is a basic implementation; in a real app, you'd use a query builder for efficiency
        return {
            totalRevenue,
            ordersCount: {
                total: orders.length,
                pending: pendingOrders,
                completed: completedOrders,
            },
            lowStockAlerts: lowStockProducts,
            inventoryValue: products.reduce((sum, p) => sum + (Number(p.price) * p.stockLevel), 0)
        };
    }
}
