import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Product } from '../../inventory/products/entities/product.entity';
import { ReportingModule } from '../../reporting/reporting.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderItem, Product]),
        ReportingModule,
    ],
    providers: [PurchaseOrdersService],
    controllers: [PurchaseOrdersController],
    exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule { }
