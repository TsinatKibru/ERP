import { Controller, Get, Post, Patch, Body, Param, Query, Res } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { ReportingService } from '../../reporting/reporting.service';
import { Roles } from 'nest-keycloak-connect';
import { Payroll, PayrollStatus } from '../entities/payroll.entity';
import { Response } from 'express';

@Controller('hr/payroll')
@Roles({ roles: ['realm:admin'] })
export class PayrollController {
    constructor(
        private readonly payrollService: PayrollService,
        private readonly reportingService: ReportingService,
    ) { }

    @Get()
    async findAll(@Query('period') period?: string): Promise<Payroll[]> {
        return this.payrollService.findAll(period);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Payroll> {
        return this.payrollService.findOne(id);
    }

    @Get(':id/pdf')
    async getPdf(@Param('id') id: string, @Res() res: Response) {
        const payroll = await this.payrollService.findOne(id);
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
