import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) { }

    async findAll(): Promise<Category[]> {
        return this.categoriesRepository.find({ relations: ['products'] });
    }

    async findOne(id: string): Promise<Category> {
        const category = await this.categoriesRepository.findOne({
            where: { id },
            relations: ['products'],
        });
        if (!category) throw new NotFoundException(`Category with ID ${id} not found`);
        return category;
    }

    async create(data: Partial<Category>): Promise<Category> {
        const category = this.categoriesRepository.create(data);
        return this.categoriesRepository.save(category);
    }

    async update(id: string, data: Partial<Category>): Promise<Category> {
        await this.categoriesRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.categoriesRepository.delete(id);
    }
}
