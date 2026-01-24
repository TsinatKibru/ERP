import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Roles } from 'nest-keycloak-connect';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';

@Controller('invoices')
@Roles({ roles: ['realm:admin'] })
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Get()
    async findAll(): Promise<Invoice[]> {
        return this.invoicesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Invoice> {
        return this.invoicesService.findOne(id);
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: InvoiceStatus): Promise<Invoice> {
        return this.invoicesService.updateStatus(id, status);
    }
}
