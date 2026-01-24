import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedsService } from './seeds.service';
import { SeedsController } from './seeds.controller';
import { Category } from '../inventory/categories/entities/category.entity';
import { Product } from '../inventory/products/entities/product.entity';
import { Supplier } from '../procurement/suppliers/entities/supplier.entity';
import { CategoriesModule } from '../inventory/categories/categories.module';
import { SettingsModule } from '../settings/settings.module';
import { UsersModule } from '../users/users.module'; // Assuming this import is needed for UsersModule
import { SuppliersModule } from '../procurement/suppliers/suppliers.module'; // Assuming this import is needed for SuppliersModule

@Module({
    imports: [
        TypeOrmModule.forFeature([Category, Product, Supplier]),
        UsersModule,
        SuppliersModule,
        CategoriesModule,
        SettingsModule,
    ],
    providers: [SeedsService],
    controllers: [SeedsController],
})
export class SeedsModule { }
