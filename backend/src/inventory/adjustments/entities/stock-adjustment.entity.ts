import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export enum AdjustmentType {
    ADDITION = 'addition',
    SUBTRACTION = 'subtraction',
    SET = 'set'
}

@Entity('stock_adjustments')
export class StockAdjustment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Product)
    product: Product;

    @Column({
        type: 'enum',
        enum: AdjustmentType,
        default: AdjustmentType.ADDITION
    })
    type: AdjustmentType;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    changeAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    previousStock: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    newStock: number;

    @Column({ nullable: true })
    reason: string;

    @Column({ nullable: true })
    performedBy: string; // User ID or Name

    @CreateDateColumn()
    createdAt: Date;
}
