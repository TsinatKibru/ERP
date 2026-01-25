import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Roles } from 'nest-keycloak-connect';
import { Category } from './entities/category.entity';

@Controller('inventory/categories')
@Roles({ roles: ['realm:admin', 'realm:manager'] })
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    async findAll(): Promise<Category[]> {
        return this.categoriesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Category> {
        return this.categoriesService.findOne(id);
    }

    @Post()
    async create(@Body() data: Partial<Category>): Promise<Category> {
        return this.categoriesService.create(data);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: Partial<Category>): Promise<Category> {
        return this.categoriesService.update(id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.categoriesService.remove(id);
    }
}
