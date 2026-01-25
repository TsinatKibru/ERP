import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ExpenseCategory {
    RENT = 'rent',
    UTILITIES = 'utilities',
    MARKETING = 'marketing',
    OFFICE_SUPPLIES = 'office_supplies',
    TRAVEL = 'travel',
    SALARIES = 'salaries',
    TAXES = 'taxes',
    OTHER = 'other'
}

@Entity('expenses')
export class Expense {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'date' })
    date: Date;

    @Column()
    description: string;

    @Column({
        type: 'enum',
        enum: ExpenseCategory,
        default: ExpenseCategory.OTHER
    })
    category: ExpenseCategory;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({ nullable: true })
    reference: string;

    @CreateDateColumn()
    createdAt: Date;
}
