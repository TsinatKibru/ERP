import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Order } from '../sales/orders/entities/order.entity';
import { Product } from '../inventory/products/entities/product.entity';
import { Invoice } from '../finance/invoices/entities/invoice.entity';
import { PurchaseOrder } from '../procurement/purchase-orders/entities/purchase-order.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, Product, Invoice, PurchaseOrder])],
    providers: [DashboardService],
    controllers: [DashboardController],
})
export class DashboardModule { }
