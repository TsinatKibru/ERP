import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    action: string; // e.g. POST /products

    @Column()
    entity: string; // e.g. product

    @Column({ nullable: true })
    user: string;

    @Column({ type: 'jsonb', nullable: true })
    details: any;

    @CreateDateColumn()
    createdAt: Date;
}
