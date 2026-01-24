import { Controller, Get, Post, Body } from '@nestjs/common';
import { AdjustmentsService } from './adjustments.service';
import { Roles, AuthenticatedUser } from 'nest-keycloak-connect';
import { AdjustmentType } from './entities/stock-adjustment.entity';

@Controller('inventory/adjustments')
@Roles({ roles: ['realm:admin'] })
export class AdjustmentsController {
    constructor(private readonly adjustmentsService: AdjustmentsService) { }

    @Get()
    async findAll() {
        return this.adjustmentsService.findAll();
    }

    @Post()
    async create(
        @Body() body: { productId: string; type: AdjustmentType; amount: number; reason: string },
        @AuthenticatedUser() user: any
    ) {
        return this.adjustmentsService.create({
            ...body,
            userId: user?.preferred_username || user?.sub
        });
    }
}
