import { Module } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../finance/invoices/entities/invoice.entity';
import { PurchaseOrder } from '../procurement/purchase-orders/entities/purchase-order.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Invoice, PurchaseOrder]),
    ],
    providers: [ReportingService],
    exports: [ReportingService],
})
export class ReportingModule { }
