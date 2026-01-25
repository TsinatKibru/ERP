import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payroll, PayrollStatus } from '../entities/payroll.entity';
import { Employee } from '../entities/employee.entity';
import { Attendance } from '../entities/attendance.entity';

@Injectable()
export class PayrollService {
    constructor(
        @InjectRepository(Payroll)
        private payrollRepository: Repository<Payroll>,
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
        @InjectRepository(Attendance)
        private attendanceRepository: Repository<Attendance>,
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

    async generate(data: { employeeId: string; period: string; bonuses?: number; deductions?: number; skipAttendanceDeduction?: boolean }): Promise<Payroll> {
        const employee = await this.employeesRepository.findOne({ where: { id: data.employeeId } });
        if (!employee) throw new NotFoundException('Employee not found');

        // Calculate period start and end
        const [year, month] = data.period.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // Fetch attendance for the period
        const attendances = await this.attendanceRepository.find({
            where: {
                employee: { id: data.employeeId },
                date: Between(startDate, endDate)
            }
        });

        const absentDays = attendances.filter(a => a.status === 'absent').length;
        const dailyRate = (Number(employee.salary) / 12) / 22; // Assuming 22 working days per month
        const attendanceDeduction = absentDays * dailyRate;

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
        payroll.absentDays = absentDays;

        // Preserve skip flag if it exists (for bulk refresh)
        payroll.skipAttendanceDeduction = data.skipAttendanceDeduction ?? payroll.skipAttendanceDeduction ?? false;

        payroll.attendanceDeduction = payroll.skipAttendanceDeduction ? 0 : attendanceDeduction;
        payroll.netSalary = payroll.baseSalary + payroll.bonuses - (payroll.deductions + payroll.attendanceDeduction);
        payroll.status = PayrollStatus.DRAFT;

        return this.payrollRepository.save(payroll);
    }

    async update(id: string, data: { bonuses?: number; deductions?: number; status?: PayrollStatus; skipAttendanceDeduction?: boolean }): Promise<Payroll> {
        const payroll = await this.payrollRepository.findOne({ where: { id }, relations: ['employee'] });
        if (!payroll) throw new NotFoundException('Payroll record not found');

        if (data.bonuses !== undefined) payroll.bonuses = data.bonuses;
        if (data.deductions !== undefined) payroll.deductions = data.deductions;
        if (data.status !== undefined) payroll.status = data.status;

        if (data.skipAttendanceDeduction !== undefined) {
            payroll.skipAttendanceDeduction = data.skipAttendanceDeduction;
            if (payroll.skipAttendanceDeduction) {
                payroll.attendanceDeduction = 0;
            } else {
                // Recalculate original deduction if unskipped
                const employee = payroll.employee;
                const dailyRate = (Number(employee.salary) / 12) / 22;
                payroll.attendanceDeduction = payroll.absentDays * dailyRate;
            }
        }

        payroll.netSalary = Number(payroll.baseSalary) + Number(payroll.bonuses) - (Number(payroll.deductions) + Number(payroll.attendanceDeduction));

        return this.payrollRepository.save(payroll);
    }

    async updateStatus(id: string, status: PayrollStatus): Promise<Payroll> {
        return this.update(id, { status });
    }

    async findOne(id: string): Promise<Payroll> {
        const payroll = await this.payrollRepository.findOne({ where: { id }, relations: ['employee'] });
        if (!payroll) throw new NotFoundException('Payroll record not found');
        return payroll;
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

    async bulkUpdateStatus(period: string, status: PayrollStatus): Promise<{ count: number }> {
        const result = await this.payrollRepository.update({ period }, { status });

        // After updating status, we might need to recalculate net salary?
        // Actually, status update doesn't change net salary.

        return { count: result.affected || 0 };
    }
}
