import { Controller, Get, Post, Patch, Delete, Param, Body, Res } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { ReportingService } from '../../reporting/reporting.service';
import { Roles } from 'nest-keycloak-connect';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { Response } from 'express';

@Controller('procurement/purchase-orders')
@Roles({ roles: ['realm:admin', 'realm:manager'] })
export class PurchaseOrdersController {
    constructor(
        private readonly poService: PurchaseOrdersService,
        private readonly reportingService: ReportingService,
    ) { }

    @Get()
    async findAll(): Promise<PurchaseOrder[]> {
        return this.poService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<PurchaseOrder> {
        return this.poService.findOne(id);
    }

    @Post()
    async create(@Body() data: { supplierId: string; items: { productId: string; quantity: number; unitPrice: number }[] }): Promise<PurchaseOrder> {
        return this.poService.create(data);
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: PurchaseOrderStatus): Promise<PurchaseOrder> {
        return this.poService.updateStatus(id, status);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.poService.remove(id);
    }

    @Get(':id/pdf')
    async getPdf(@Param('id') id: string, @Res() res: Response) {
        const po = await this.poService.findOne(id);
        const buffer = await this.reportingService.generatePOPDF(po);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=purchase-order-${po.poNumber}.pdf`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }
}
