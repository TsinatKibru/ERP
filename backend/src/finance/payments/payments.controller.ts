import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Roles } from 'nest-keycloak-connect';

@Controller('finance/payments')
@Roles({ roles: ['realm:admin', 'realm:manager'] })
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Get()
    async findAll() {
        return this.paymentsService.findAll();
    }

    @Post('invoice/:id')
    async recordInvoicePayment(@Param('id') id: string, @Body() data: { amount: number, method: string, reference?: string }) {
        return this.paymentsService.recordInvoicePayment(id, data);
    }

    @Post('purchase-order/:id')
    async recordPOPayment(@Param('id') id: string, @Body() data: { amount: number, method: string, reference?: string }) {
        return this.paymentsService.recordPOPayment(id, data);
    }
}
