import { Controller, Get, Post, Patch, Delete, Param, Body, Res } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { InvoicesService } from '../../finance/invoices/invoices.service';
import { ReportingService } from '../../reporting/reporting.service';
import { Roles } from 'nest-keycloak-connect';
import { Customer } from './entities/customer.entity';
import { Response } from 'express';

@Controller('customers')
@Roles({ roles: ['realm:admin'] })
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
        private readonly invoicesService: InvoicesService,
        private readonly reportingService: ReportingService,
    ) { }

    @Get()
    async findAll(): Promise<Customer[]> {
        return this.customersService.findAll();
    }

    @Get(':id/statement')
    async getStatement(@Param('id') id: string, @Res() res: Response) {
        const customer = await this.customersService.findOne(id);
        const allInvoices = await this.invoicesService.findAll();
        const customerInvoices = allInvoices.filter(i => i.order.customer.id === id);

        const buffer = await this.reportingService.generateCustomerStatementPDF(customer, customerInvoices);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=statement-${customer.name.replace(/\s+/g, '_')}.pdf`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Customer> {
        return this.customersService.findOne(id);
    }

    @Post()
    async create(@Body() data: Partial<Customer>): Promise<Customer> {
        return this.customersService.create(data);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: Partial<Customer>): Promise<Customer> {
        return this.customersService.update(id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.customersService.remove(id);
    }
}
