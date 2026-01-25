import { Controller, Get, Post, Patch, Body, Param, Query, Res } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { ReportingService } from '../../reporting/reporting.service';
import { UsersService } from '../../users/users.service';
import { Roles, AuthenticatedUser } from 'nest-keycloak-connect';
import { Payroll, PayrollStatus } from '../entities/payroll.entity';
import { Response } from 'express';

@Controller('hr/payroll')
export class PayrollController {
    constructor(
        private readonly payrollService: PayrollService,
        private readonly reportingService: ReportingService,
        private readonly usersService: UsersService,
    ) { }

    @Get('me')
    @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:employee'] })
    async findMyPayroll(@AuthenticatedUser() userToken: any, @Query('period') period?: string): Promise<Payroll[]> {
        const user = await this.usersService.findOrCreateFromToken(userToken);
        if (!user.employee) return [];
        return this.payrollService.findAllForEmployee(user.employee.id, period);
    }

    @Get()
    @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:employee'] })
    async findAll(@AuthenticatedUser() userToken: any, @Query('period') period?: string): Promise<Payroll[]> {
        const user = await this.usersService.findOrCreateFromToken(userToken);
        if (user.role === 'admin' || user.role === 'manager') {
            return this.payrollService.findAll(period);
        }
        if (user.employee) {
            return this.payrollService.findAllForEmployee(user.employee.id, period);
        }
        return [];
    }

    @Get(':id')
    @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:employee'] })
    async findOne(@AuthenticatedUser() userToken: any, @Param('id') id: string): Promise<Payroll> {
        const user = await this.usersService.findOrCreateFromToken(userToken);
        const payroll = await this.payrollService.findOne(id);

        if (user.role === 'admin' || user.role === 'manager') return payroll;

        if (user.employee && payroll.employee.id === user.employee.id) {
            return payroll;
        }

        throw new Error('Forbidden'); // Or a proper Nest exception
    }

    @Get(':id/pdf')
    @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:employee'] })
    async getPdf(@AuthenticatedUser() userToken: any, @Param('id') id: string, @Res() res: Response) {
        const user = await this.usersService.findOrCreateFromToken(userToken);
        const payroll = await this.payrollService.findOne(id);

        const isAllowed = user.role === 'admin' || user.role === 'manager' || (user.employee && payroll.employee.id === user.employee.id);
        if (!isAllowed) throw new Error('Forbidden');

        const buffer = await this.reportingService.generatePayslipPDF(payroll);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=payslip-${payroll.employee.name.replace(/\s+/g, '_')}-${payroll.period}.pdf`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @Patch('bulk/status')
    async bulkUpdateStatus(@Body() data: { period: string; status: PayrollStatus }): Promise<{ count: number }> {
        return this.payrollService.bulkUpdateStatus(data.period, data.status);
    }

    @Post()
    async generate(@Body() data: { employeeId: string; period: string; bonuses?: number; deductions?: number; skipAttendanceDeduction?: boolean }): Promise<Payroll> {
        return this.payrollService.generate(data);
    }

    @Post('bulk')
    async bulkGenerate(@Body('period') period: string): Promise<{ count: number }> {
        return this.payrollService.bulkGenerate(period);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: { bonuses?: number; deductions?: number; status?: PayrollStatus; skipAttendanceDeduction?: boolean }): Promise<Payroll> {
        return this.payrollService.update(id, data);
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: PayrollStatus): Promise<Payroll> {
        return this.payrollService.updateStatus(id, status);
    }
}
