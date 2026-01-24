import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { Roles } from 'nest-keycloak-connect';
import { Department } from '../entities/department.entity';

@Controller('hr/departments')
@Roles({ roles: ['realm:admin'] })
export class DepartmentsController {
    constructor(private readonly departmentsService: DepartmentsService) { }

    @Get()
    async findAll(): Promise<Department[]> {
        return this.departmentsService.findAll();
    }

    @Post()
    async create(@Body() data: Partial<Department>): Promise<Department> {
        return this.departmentsService.create(data);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: Partial<Department>): Promise<Department> {
        return this.departmentsService.update(id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.departmentsService.remove(id);
    }
}
