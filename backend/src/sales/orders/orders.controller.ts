import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from 'nest-keycloak-connect';
import { Order, OrderStatus } from './entities/order.entity';

@Controller('sales/orders')
@Roles({ roles: ['realm:admin', 'realm:manager'] })
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get()
    async findAll(): Promise<Order[]> {
        return this.ordersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Order> {
        return this.ordersService.findOne(id);
    }

    @Post()
    async create(@Body() data: { customerId: string; items: { productId: string; quantity: number }[] }): Promise<Order> {
        return this.ordersService.create(data);
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus): Promise<Order> {
        return this.ordersService.updateStatus(id, status);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.ordersService.remove(id);
    }
}
