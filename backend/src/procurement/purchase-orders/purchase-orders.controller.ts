import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { Roles } from 'nest-keycloak-connect';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';

@Controller('purchase-orders')
@Roles({ roles: ['realm:admin'] })
export class PurchaseOrdersController {
    constructor(private readonly poService: PurchaseOrdersService) { }

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
}
