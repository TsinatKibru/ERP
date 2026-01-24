import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Roles } from 'nest-keycloak-connect';
import { Employee } from '../entities/employee.entity';

@Controller('hr/employees')
@Roles({ roles: ['realm:admin'] })
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Get()
    async findAll(): Promise<Employee[]> {
        return this.employeesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Employee> {
        return this.employeesService.findOne(id);
    }

    @Post()
    async create(@Body() data: Partial<Employee>): Promise<Employee> {
        return this.employeesService.create(data);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: Partial<Employee>): Promise<Employee> {
        return this.employeesService.update(id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.employeesService.remove(id);
    }
}
