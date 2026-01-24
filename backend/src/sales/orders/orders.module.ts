import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../../inventory/products/entities/product.entity';
import { ProductsModule } from '../../inventory/products/products.module';
import { FinanceModule } from '../../finance/finance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Customer, Product]),
    ProductsModule,
    FinanceModule,
  ],
  providers: [OrdersService],
  controllers: [OrdersController]
})
export class OrdersModule { }
