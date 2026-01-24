import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Order } from '../sales/orders/entities/order.entity';
import { Product } from '../inventory/products/entities/product.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, Product])],
    providers: [DashboardService],
    controllers: [DashboardController],
})
export class DashboardModule { }
