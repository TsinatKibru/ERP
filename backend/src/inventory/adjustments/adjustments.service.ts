import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockAdjustment, AdjustmentType } from './entities/stock-adjustment.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class AdjustmentsService {
    constructor(
        @InjectRepository(StockAdjustment)
        private adjustmentsRepository: Repository<StockAdjustment>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async findAll() {
        return this.adjustmentsRepository.find({
            relations: ['product'],
            order: { createdAt: 'DESC' }
        });
    }

    async create(data: { productId: string; type: AdjustmentType; amount: number; reason: string; userId?: string }) {
        const product = await this.productsRepository.findOne({ where: { id: data.productId } });
        if (!product) throw new NotFoundException('Product not found');

        const previousStock = product.stockLevel;
        let newStock = previousStock;

        if (data.type === AdjustmentType.ADDITION) {
            newStock = Number(previousStock) + Number(data.amount);
        } else if (data.type === AdjustmentType.SUBTRACTION) {
            newStock = Number(previousStock) - Number(data.amount);
        } else if (data.type === AdjustmentType.SET) {
            newStock = Number(data.amount);
        }

        const adjustment = this.adjustmentsRepository.create({
            product,
            type: data.type,
            changeAmount: data.amount,
            previousStock,
            newStock,
            reason: data.reason,
            performedBy: data.userId
        });

        const savedAdjustment = await this.adjustmentsRepository.save(adjustment);

        // Update product stock level
        product.stockLevel = newStock;
        await this.productsRepository.save(product);

        return savedAdjustment;
    }
}
