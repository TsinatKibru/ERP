import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Product } from '../../../inventory/products/entities/product.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => PurchaseOrder, (po) => po.items, { onDelete: 'CASCADE' })
    purchaseOrder: PurchaseOrder;

    @ManyToOne(() => Product, { eager: true })
    product: Product;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;

    @CreateDateColumn()
    createdAt: Date;
}
