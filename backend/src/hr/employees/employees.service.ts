import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class EmployeesService {
    constructor(
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
    ) { }

    async findAll(): Promise<Employee[]> {
        return this.employeesRepository.find({
            order: { name: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Employee> {
        const employee = await this.employeesRepository.findOne({ where: { id } });
        if (!employee) throw new NotFoundException(`Employee with ID ${id} not found`);
        return employee;
    }

    async create(data: Partial<Employee>): Promise<Employee> {
        const employee = this.employeesRepository.create(data);
        return this.employeesRepository.save(employee);
    }

    async update(id: string, data: Partial<Employee>): Promise<Employee> {
        await this.employeesRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.employeesRepository.delete(id);
    }
}
