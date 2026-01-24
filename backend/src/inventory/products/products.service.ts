import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async findAll(): Promise<Product[]> {
        return this.productsRepository.find({ relations: ['category'] });
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ['category'],
        });
        if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
        return product;
    }

    async create(data: Partial<Product>): Promise<Product> {
        const product = this.productsRepository.create(data);
        return this.productsRepository.save(product);
    }

    async update(id: string, data: Partial<Product>): Promise<Product> {
        await this.productsRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.productsRepository.delete(id);
    }
}
