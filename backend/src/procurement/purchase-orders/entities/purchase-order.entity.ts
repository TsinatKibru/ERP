import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export enum PurchaseOrderStatus {
    PENDING = 'pending',
    RECEIVED = 'received',
    CANCELLED = 'cancelled',
}

@Entity('purchase_orders')
export class PurchaseOrder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    poNumber: string;

    @Column({ type: 'enum', enum: PurchaseOrderStatus, default: PurchaseOrderStatus.PENDING })
    status: PurchaseOrderStatus;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    totalAmount: number;

    @ManyToOne(() => Supplier, { onDelete: 'SET NULL', nullable: true })
    supplier: Supplier;

    @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, { cascade: true })
    items: PurchaseOrderItem[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
