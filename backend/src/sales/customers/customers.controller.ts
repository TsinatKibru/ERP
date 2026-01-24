import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Roles } from 'nest-keycloak-connect';
import { Customer } from './entities/customer.entity';

@Controller('customers')
@Roles({ roles: ['realm:admin'] })
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    async findAll(): Promise<Customer[]> {
        return this.customersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Customer> {
        return this.customersService.findOne(id);
    }

    @Post()
    async create(@Body() data: Partial<Customer>): Promise<Customer> {
        return this.customersService.create(data);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: Partial<Customer>): Promise<Customer> {
        return this.customersService.update(id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.customersService.remove(id);
    }
}
