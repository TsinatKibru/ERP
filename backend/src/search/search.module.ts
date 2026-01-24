import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../inventory/products/entities/product.entity';
import { Customer } from '../sales/customers/entities/customer.entity';
import { Order } from '../sales/orders/entities/order.entity';
import { Employee } from '../hr/entities/employee.entity';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Product, Customer, Order, Employee])],
    providers: [SearchService],
    controllers: [SearchController],
    exports: [SearchService]
})
export class SearchModule { }
