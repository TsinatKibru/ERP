import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { PurchaseOrderItem } from '../../../procurement/purchase-orders/entities/purchase-order-item.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    sku: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'int', default: 0 })
    stockLevel: number;

    @ManyToOne(() => Category, (category) => category.products, { onDelete: 'CASCADE' })
    category: Category;

    @OneToMany(() => PurchaseOrderItem, (item) => item.product)
    purchaseHistory: PurchaseOrderItem[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
