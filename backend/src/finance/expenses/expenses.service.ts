import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expense)
        private expenseRepo: Repository<Expense>,
    ) { }

    async findAll(): Promise<Expense[]> {
        return this.expenseRepo.find({
            order: { date: 'DESC' }
        });
    }

    async create(data: Partial<Expense>): Promise<Expense> {
        const expense = this.expenseRepo.create(data);
        return this.expenseRepo.save(expense);
    }

    async update(id: string, data: Partial<Expense>): Promise<Expense> {
        await this.expenseRepo.update(id, data);
        return this.findOne(id);
    }

    async findOne(id: string): Promise<Expense> {
        const expense = await this.expenseRepo.findOne({ where: { id } });
        if (!expense) throw new NotFoundException('Expense not found');
        return expense;
    }

    async delete(id: string): Promise<void> {
        await this.expenseRepo.delete(id);
    }
}
