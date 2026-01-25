import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { Roles } from 'nest-keycloak-connect';
import { Expense } from './entities/expense.entity';

@Controller('finance/expenses')
@Roles({ roles: ['realm:admin'] })
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Get()
    async findAll() {
        return this.expensesService.findAll();
    }

    @Post()
    async create(@Body() data: Partial<Expense>) {
        return this.expensesService.create(data);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: Partial<Expense>) {
        return this.expensesService.update(id, data);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.expensesService.delete(id);
    }
}
