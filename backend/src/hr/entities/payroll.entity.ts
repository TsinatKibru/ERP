import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Employee } from './employee.entity';

export enum PayrollStatus {
    DRAFT = 'draft',
    PAID = 'paid',
    CANCELLED = 'cancelled'
}

@Entity('payroll')
export class Payroll {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Employee, (employee) => employee.payrolls)
    employee: Employee;

    @Column()
    period: string; // e.g., "2026-01"

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    baseSalary: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    bonuses: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    deductions: number;

    @Column({ type: 'int', default: 0 })
    absentDays: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    attendanceDeduction: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    netSalary: number;

    @Column({
        type: 'enum',
        enum: PayrollStatus,
        default: PayrollStatus.DRAFT
    })
    status: PayrollStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
