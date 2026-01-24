import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payroll, PayrollStatus } from '../entities/payroll.entity';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class PayrollService {
    constructor(
        @InjectRepository(Payroll)
        private payrollRepository: Repository<Payroll>,
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
    ) { }

    async findAll(period?: string): Promise<Payroll[]> {
        const where: any = {};
        if (period) {
            where.period = period;
        }
        return this.payrollRepository.find({
            where,
            relations: ['employee'],
            order: { period: 'DESC' },
        });
    }

    async generate(data: { employeeId: string; period: string; bonuses?: number; deductions?: number }): Promise<Payroll> {
        const employee = await this.employeesRepository.findOne({ where: { id: data.employeeId } });
        if (!employee) throw new NotFoundException('Employee not found');

        let payroll = await this.payrollRepository.findOne({
            where: {
                employee: { id: data.employeeId },
                period: data.period,
            },
        });

        if (!payroll) {
            payroll = new Payroll();
            payroll.employee = employee;
            payroll.period = data.period;
        }

        payroll.baseSalary = Number(employee.salary) / 12;
        payroll.bonuses = data.bonuses || 0;
        payroll.deductions = data.deductions || 0;
        payroll.netSalary = payroll.baseSalary + payroll.bonuses - payroll.deductions;
        payroll.status = PayrollStatus.DRAFT;

        return this.payrollRepository.save(payroll);
    }

    async updateStatus(id: string, status: PayrollStatus): Promise<Payroll> {
        const payroll = await this.payrollRepository.findOne({ where: { id }, relations: ['employee'] });
        if (!payroll) throw new NotFoundException('Payroll record not found');

        payroll.status = status;
        return this.payrollRepository.save(payroll);
    }

    async bulkGenerate(period: string): Promise<{ count: number }> {
        const activeEmployees = await this.employeesRepository.find({ where: { status: 'active' as any } });
        for (const employee of activeEmployees) {
            await this.generate({
                employeeId: employee.id,
                period,
            });
        }
        return { count: activeEmployees.length };
    }
}
