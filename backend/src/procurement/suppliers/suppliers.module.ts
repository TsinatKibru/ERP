import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { Supplier } from './entities/supplier.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Supplier])],
    providers: [SuppliersService],
    controllers: [SuppliersController],
    exports: [SuppliersService],
})
export class SuppliersModule { }
