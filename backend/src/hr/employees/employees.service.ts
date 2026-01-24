import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { Department } from '../entities/department.entity';

@Injectable()
export class EmployeesService {
    constructor(
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
        @InjectRepository(Department)
        private departmentsRepository: Repository<Department>,
    ) { }

    async findAll(): Promise<Employee[]> {
        return this.employeesRepository.find({
            order: { name: 'ASC' },
            relations: ['department']
        });
    }

    async findOne(id: string): Promise<Employee> {
        const employee = await this.employeesRepository.findOne({
            where: { id },
            relations: ['department']
        });
        if (!employee) throw new NotFoundException(`Employee with ID ${id} not found`);
        return employee;
    }

    async create(data: Partial<Employee>): Promise<Employee> {
        const employee = this.employeesRepository.create(data);
        return this.employeesRepository.save(employee);
    }

    async update(id: string, data: any): Promise<Employee> {
        const employee = await this.findOne(id);

        if (data.departmentId) {
            const dept = await this.departmentsRepository.findOne({ where: { id: data.departmentId } });
            if (dept) employee.department = dept;
            delete data.departmentId;
        }

        Object.assign(employee, data);
        return this.employeesRepository.save(employee);
    }

    async remove(id: string): Promise<void> {
        await this.employeesRepository.delete(id);
    }
}
