import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Roles } from 'nest-keycloak-connect';
import { Product } from './entities/product.entity';

@Controller('products')
@Roles({ roles: ['realm:admin', 'realm:manager'] })
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    async findAll(): Promise<Product[]> {
        return this.productsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Product> {
        return this.productsService.findOne(id);
    }

    @Post()
    async create(@Body() data: Partial<Product>): Promise<Product> {
        return this.productsService.create(data);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: Partial<Product>): Promise<Product> {
        return this.productsService.update(id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.productsService.remove(id);
    }
}
