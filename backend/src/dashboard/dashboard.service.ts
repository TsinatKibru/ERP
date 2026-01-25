import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../sales/orders/entities/order.entity';
import { Product } from '../inventory/products/entities/product.entity';
import { Invoice, InvoiceStatus } from '../finance/invoices/entities/invoice.entity';
import { PurchaseOrder } from '../procurement/purchase-orders/entities/purchase-order.entity';
import { Expense } from '../finance/expenses/entities/expense.entity';
import { Payroll } from '../hr/entities/payroll.entity';

export interface TrendMonth {
    month: string;
    year: number;
    revenue: number;
    orders: number;
}

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
        @InjectRepository(Expense)
        private expenseRepository: Repository<Expense>,
        @InjectRepository(Payroll)
        private payrollRepository: Repository<Payroll>,
    ) { }

    async getStats() {
        const orders = await this.ordersRepository.find();
        const products = await this.productsRepository.find({ relations: ['category'] });
        const invoices = await this.invoicesRepository.find();
        const purchaseOrders = await this.poRepository.find();
        const expenses = await this.expenseRepository.find();
        const payrolls = await this.payrollRepository.find();

        const totalRevenue = orders
            .filter(o => o.status === OrderStatus.COMPLETED)
            .reduce((sum, o) => sum + Number(o.totalAmount), 0);

        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const totalPayroll = payrolls
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + Number(p.netSalary), 0);

        const netProfit = totalRevenue - (totalExpenses + totalPayroll);

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

        // Sales Trend (last 6 months)
        const salesTrend = this.calculateSalesTrend(orders);

        // Category Distribution
        const categoryDistribution = this.calculateCategoryDistribution(products);

        return {
            totalRevenue,
            totalExpenses,
            totalPayroll,
            netProfit,
            accountsReceivable,
            accountsPayable,
            ordersCount: {
                total: orders.length,
                pending: pendingOrders,
                completed: completedOrders,
            },
            lowStockAlerts: lowStockProducts,
            inventoryValue: products.reduce((sum, p) => sum + (Number(p.price) * p.stockLevel), 0),
            salesTrend,
            categoryDistribution
        };
    }

    private calculateSalesTrend(orders: Order[]): TrendMonth[] {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const last6Months: TrendMonth[] = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            last6Months.push({
                month: months[d.getMonth()],
                year: d.getFullYear(),
                revenue: 0,
                orders: 0
            });
        }

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const trendMonth = last6Months.find(m =>
                m.month === months[orderDate.getMonth()] &&
                m.year === orderDate.getFullYear()
            );

            if (trendMonth) {
                trendMonth.orders++;
                if (order.status === OrderStatus.COMPLETED) {
                    trendMonth.revenue += Number(order.totalAmount);
                }
            }
        });

        return last6Months;
    }

    private calculateCategoryDistribution(products: Product[]) {
        const distribution: Record<string, { name: string; value: number; count: number }> = {};

        products.forEach(p => {
            const catName = p.category?.name || 'Uncategorized';
            if (!distribution[catName]) {
                distribution[catName] = { name: catName, value: 0, count: 0 };
            }
            distribution[catName].count++;
            distribution[catName].value += Number(p.price) * p.stockLevel;
        });

        return Object.values(distribution);
    }
}
