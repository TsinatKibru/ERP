import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../../inventory/products/entities/product.entity';

@Entity('order_items')
export class OrderItem { // Refreshed export
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    order: Order;

    @ManyToOne(() => Product, { eager: true })
    product: Product;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number; // Snapshot of price at time of sale

    @CreateDateColumn()
    createdAt: Date;
}
