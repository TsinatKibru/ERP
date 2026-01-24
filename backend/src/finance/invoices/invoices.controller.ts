import { Controller, Get, Param, Patch, Body, Res } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { ReportingService } from '../../reporting/reporting.service';
import { Roles } from 'nest-keycloak-connect';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { Response } from 'express';

@Controller('invoices')
@Roles({ roles: ['realm:admin'] })
export class InvoicesController {
    constructor(
        private readonly invoicesService: InvoicesService,
        private readonly reportingService: ReportingService,
    ) { }

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

    @Get(':id/pdf')
    async getPdf(@Param('id') id: string, @Res() res: Response) {
        const invoice = await this.invoicesService.findOne(id);
        const buffer = await this.reportingService.generateInvoicePDF(invoice);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }
}
