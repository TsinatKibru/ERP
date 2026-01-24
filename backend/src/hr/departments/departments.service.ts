import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';

@Injectable()
export class DepartmentsService {
    constructor(
        @InjectRepository(Department)
        private departmentsRepository: Repository<Department>,
    ) { }

    async findAll(): Promise<Department[]> {
        return this.departmentsRepository.find({
            order: { name: 'ASC' },
        });
    }

    async create(data: Partial<Department>): Promise<Department> {
        const department = this.departmentsRepository.create(data);
        return this.departmentsRepository.save(department);
    }

    async update(id: string, data: Partial<Department>): Promise<Department> {
        await this.departmentsRepository.update(id, data);
        return this.findOne(id);
    }

    async findOne(id: string): Promise<Department> {
        const dept = await this.departmentsRepository.findOne({ where: { id } });
        if (!dept) throw new NotFoundException('Department not found');
        return dept;
    }

    async remove(id: string): Promise<void> {
        await this.departmentsRepository.delete(id);
    }
}
