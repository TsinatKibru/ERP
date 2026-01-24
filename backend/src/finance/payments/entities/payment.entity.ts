import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { PurchaseOrder } from '../../../procurement/purchase-orders/entities/purchase-order.entity';

export enum PaymentType {
    INBOUND = 'inbound',
    OUTBOUND = 'outbound',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: PaymentType })
    paymentType: PaymentType;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column()
    method: string; // e.g., 'Cash', 'Bank Transfer', 'Credit Card'

    @Column({ nullable: true })
    reference: string;

    @ManyToOne(() => Invoice, { nullable: true, onDelete: 'SET NULL' })
    invoice: Invoice;

    @ManyToOne(() => PurchaseOrder, { nullable: true, onDelete: 'SET NULL' })
    purchaseOrder: PurchaseOrder;

    @CreateDateColumn()
    createdAt: Date;
}
