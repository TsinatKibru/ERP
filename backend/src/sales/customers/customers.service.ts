import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
    ) { }

    async findAll(): Promise<Customer[]> {
        return this.customersRepository.find();
    }

    async findOne(id: string): Promise<Customer> {
        const customer = await this.customersRepository.findOne({ where: { id } });
        if (!customer) throw new NotFoundException(`Customer with ID ${id} not found`);
        return customer;
    }

    async create(data: Partial<Customer>): Promise<Customer> {
        const customer = this.customersRepository.create(data);
        return this.customersRepository.save(customer);
    }

    async update(id: string, data: Partial<Customer>): Promise<Customer> {
        await this.customersRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.customersRepository.delete(id);
    }
}
