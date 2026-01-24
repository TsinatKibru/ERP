import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from '../../../sales/orders/entities/order.entity';

export enum InvoiceStatus {
    UNPAID = 'unpaid',
    PAID = 'paid',
    OVERDUE = 'overdue',
    CANCELLED = 'cancelled',
}

@Entity('invoices')
export class Invoice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    invoiceNumber: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.UNPAID })
    status: InvoiceStatus;

    @Column({ type: 'timestamp' })
    dueDate: Date;

    @OneToOne(() => Order, { onDelete: 'CASCADE' })
    @JoinColumn()
    order: Order;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
