import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../../inventory/products/entities/product.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemsRepository: Repository<OrderItem>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async findAll(): Promise<Order[]> {
        return this.ordersRepository.find({
            relations: ['customer', 'items'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Order> {
        const order = await this.ordersRepository.findOne({
            where: { id },
            relations: ['customer', 'items'],
        });
        if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
        return order;
    }

    async create(data: { customerId: string; items: { productId: string; quantity: number }[] }): Promise<Order> {
        const order = new Order();
        order.orderNumber = `ORD-${Date.now()}`;
        order.status = OrderStatus.PENDING;
        order.customer = { id: data.customerId } as any;

        const savedOrder = await this.ordersRepository.save(order);

        let total = 0;
        const orderItems: OrderItem[] = [];

        for (const item of data.items) {
            const product = await this.productsRepository.findOne({ where: { id: item.productId } });
            if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

            if (product.stockLevel < item.quantity) {
                throw new BadRequestException(`Insufficient stock for product ${product.name}. Available: ${product.stockLevel}`);
            }

            const orderItem = new OrderItem();
            orderItem.order = savedOrder;
            orderItem.product = product;
            orderItem.quantity = item.quantity;
            orderItem.unitPrice = product.price; // Snapshot price

            total += Number(product.price) * item.quantity;
            orderItems.push(orderItem);

            // Deduct stock
            product.stockLevel -= item.quantity;
            await this.productsRepository.save(product);
        }

        await this.orderItemsRepository.save(orderItems);

        savedOrder.totalAmount = total;
        return this.ordersRepository.save(savedOrder);
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        await this.ordersRepository.update(id, { status });
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const order = await this.findOne(id);

        // Replenish stock if order is not already cancelled
        if (order.status !== OrderStatus.CANCELLED) {
            for (const item of order.items) {
                const product = await this.productsRepository.findOne({ where: { id: item.product.id } });
                if (product) {
                    product.stockLevel += item.quantity;
                    await this.productsRepository.save(product);
                }
            }
        }

        await this.ordersRepository.delete(id);
    }
}
