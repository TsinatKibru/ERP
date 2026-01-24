import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
    constructor(
        @InjectRepository(Supplier)
        private suppliersRepository: Repository<Supplier>,
    ) { }

    async findAll(): Promise<Supplier[]> {
        return this.suppliersRepository.find();
    }

    async findOne(id: string): Promise<Supplier> {
        const supplier = await this.suppliersRepository.findOne({ where: { id } });
        if (!supplier) throw new NotFoundException(`Supplier with ID ${id} not found`);
        return supplier;
    }

    async create(data: Partial<Supplier>): Promise<Supplier> {
        const supplier = this.suppliersRepository.create(data);
        return this.suppliersRepository.save(supplier);
    }

    async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
        await this.suppliersRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.suppliersRepository.delete(id);
    }
}
