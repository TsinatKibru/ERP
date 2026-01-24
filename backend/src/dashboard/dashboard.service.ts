import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../sales/orders/entities/order.entity';
import { Product } from '../inventory/products/entities/product.entity';
import { Invoice, InvoiceStatus } from '../finance/invoices/entities/invoice.entity';
import { PurchaseOrder } from '../procurement/purchase-orders/entities/purchase-order.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        @InjectRepository(Invoice)
        private invoicesRepository: Repository<Invoice>,
        @InjectRepository(PurchaseOrder)
        private poRepository: Repository<PurchaseOrder>,
    ) { }

    async getStats() {
        const orders = await this.ordersRepository.find();
        const products = await this.productsRepository.find({ relations: ['category'] });
        const invoices = await this.invoicesRepository.find();
        const purchaseOrders = await this.poRepository.find();

        const totalRevenue = orders
            .filter(o => o.status === OrderStatus.COMPLETED)
            .reduce((sum, o) => sum + Number(o.totalAmount), 0);

        const accountsReceivable = invoices
            .filter(i => i.status === InvoiceStatus.UNPAID)
            .reduce((sum, i) => sum + Number(i.amount), 0);

        const accountsPayable = purchaseOrders
            .filter(po => po.status !== 'received') // Basic logic: if not received, it's a liability
            .reduce((sum, po) => sum + Number(po.totalAmount), 0);

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
            accountsReceivable,
            accountsPayable,
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
