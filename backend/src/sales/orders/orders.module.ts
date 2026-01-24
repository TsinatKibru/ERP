import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../../inventory/products/entities/product.entity';
import { ProductsModule } from '../../inventory/products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product]),
    ProductsModule,
  ],
  providers: [OrdersService],
  controllers: [OrdersController]
})
export class OrdersModule { }
