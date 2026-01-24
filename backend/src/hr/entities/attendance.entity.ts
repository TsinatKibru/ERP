import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Employee } from './employee.entity';

export enum AttendanceStatus {
    PRESENT = 'present',
    ABSENT = 'absent',
    LATE = 'late',
    LEAVE = 'leave'
}

@Entity('attendance')
export class Attendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Employee, (employee) => employee.attendances)
    employee: Employee;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'time', nullable: true })
    checkIn: string;

    @Column({ type: 'time', nullable: true })
    checkOut: string;

    @Column({
        type: 'enum',
        enum: AttendanceStatus,
        default: AttendanceStatus.PRESENT
    })
    status: AttendanceStatus;

    @Column({ type: 'text', nullable: true })
    note: string;

    @CreateDateColumn()
    createdAt: Date;
}
