import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../sales/orders/entities/order.entity';
import { PurchaseOrder } from '../../procurement/purchase-orders/entities/purchase-order.entity';
import { StockAdjustment } from '../adjustments/entities/stock-adjustment.entity';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Order, PurchaseOrder, StockAdjustment])],
    providers: [LedgerService],
    controllers: [LedgerController],
    exports: [LedgerService]
})
export class LedgerModule { }
