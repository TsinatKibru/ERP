import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { Roles } from 'nest-keycloak-connect';
import { Payroll, PayrollStatus } from '../entities/payroll.entity';

@Controller('hr/payroll')
@Roles({ roles: ['realm:admin'] })
export class PayrollController {
    constructor(private readonly payrollService: PayrollService) { }

    @Get()
    async findAll(@Query('period') period?: string): Promise<Payroll[]> {
        return this.payrollService.findAll(period);
    }

    @Post()
    async generate(@Body() data: { employeeId: string; period: string; bonuses?: number; deductions?: number }): Promise<Payroll> {
        return this.payrollService.generate(data);
    }

    @Post('bulk')
    async bulkGenerate(@Body('period') period: string): Promise<{ count: number }> {
        return this.payrollService.bulkGenerate(period);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: { bonuses?: number; deductions?: number; status?: PayrollStatus }): Promise<Payroll> {
        return this.payrollService.update(id, data);
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: PayrollStatus): Promise<Payroll> {
        return this.payrollService.updateStatus(id, status);
    }
}
