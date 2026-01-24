import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedsService } from './seeds.service';
import { SeedsController } from './seeds.controller';
import { Category } from '../inventory/categories/entities/category.entity';
import { Product } from '../inventory/products/entities/product.entity';
import { Supplier } from '../procurement/suppliers/entities/supplier.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Category, Product, Supplier])],
    providers: [SeedsService],
    controllers: [SeedsController],
})
export class SeedsModule { }
