import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Attendance } from './attendance.entity';
import { Payroll } from './payroll.entity';

export enum EmployeeStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    TERMINATED = 'terminated'
}

@Entity('employees')
export class Employee {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column()
    jobTitle: string;

    @Column()
    department: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    salary: number;

    @Column({ type: 'date' })
    hireDate: Date;

    @Column({
        type: 'enum',
        enum: EmployeeStatus,
        default: EmployeeStatus.ACTIVE
    })
    status: EmployeeStatus;

    @OneToMany(() => Attendance, (attendance) => attendance.employee)
    attendances: Attendance[];

    @OneToMany(() => Payroll, (payroll) => payroll.employee)
    payrolls: Payroll[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
