import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockAdjustment } from './entities/stock-adjustment.entity';
import { Product } from '../products/entities/product.entity';
import { AdjustmentsService } from './adjustments.service';
import { AdjustmentsController } from './adjustments.controller';

@Module({
    imports: [TypeOrmModule.forFeature([StockAdjustment, Product])],
    providers: [AdjustmentsService],
    controllers: [AdjustmentsController],
    exports: [AdjustmentsService]
})
export class AdjustmentsModule { }
