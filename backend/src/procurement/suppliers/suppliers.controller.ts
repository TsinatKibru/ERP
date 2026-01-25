import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { Roles } from 'nest-keycloak-connect';
import { Supplier } from './entities/supplier.entity';

@Controller('procurement/suppliers')
@Roles({ roles: ['realm:admin', 'realm:manager'] })
export class SuppliersController {
    constructor(private readonly suppliersService: SuppliersService) { }

    @Get()
    async findAll(): Promise<Supplier[]> {
        return this.suppliersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Supplier> {
        return this.suppliersService.findOne(id);
    }

    @Post()
    async create(@Body() data: Partial<Supplier>): Promise<Supplier> {
        return this.suppliersService.create(data);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: Partial<Supplier>): Promise<Supplier> {
        return this.suppliersService.update(id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.suppliersService.remove(id);
    }
}
