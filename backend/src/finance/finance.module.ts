import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './invoices/entities/invoice.entity';
import { Payment } from './payments/entities/payment.entity';
import { InvoicesService } from './invoices/invoices.service';
import { PaymentsService } from './payments/payments.service';
import { InvoicesController } from './invoices/invoices.controller';
import { PaymentsController } from './payments/payments.controller';
import { PurchaseOrder } from '../procurement/purchase-orders/entities/purchase-order.entity';
import { ReportingModule } from '../reporting/reporting.module';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Invoice, Payment, PurchaseOrder]),
        ReportingModule,
        ExpensesModule,
    ],
    providers: [InvoicesService, PaymentsService],
    controllers: [InvoicesController, PaymentsController],
    exports: [InvoicesService, PaymentsService, ExpensesModule],
})
export class FinanceModule { }
