import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance, AttendanceStatus } from '../entities/attendance.entity';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(Attendance)
        private attendanceRepository: Repository<Attendance>,
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
    ) { }

    async findAll(startDate?: string, endDate?: string): Promise<Attendance[]> {
        const where: any = {};
        if (startDate && endDate) {
            where.date = Between(startDate, endDate);
        }
        return this.attendanceRepository.find({
            where,
            relations: ['employee'],
            order: { date: 'DESC', createdAt: 'DESC' },
        });
    }

    async findByEmployee(employeeId: string, startDate?: string, endDate?: string): Promise<Attendance[]> {
        const where: any = { employee: { id: employeeId } };
        if (startDate && endDate) {
            where.date = Between(startDate, endDate);
        }
        return this.attendanceRepository.find({
            where,
            relations: ['employee'],
            order: { date: 'DESC' },
        });
    }

    async record(data: { employeeId: string; date: string; checkIn?: string; checkOut?: string; status?: AttendanceStatus; note?: string }): Promise<Attendance> {
        let attendance = await this.attendanceRepository.findOne({
            where: {
                employee: { id: data.employeeId },
                date: data.date as any,
            },
        });

        if (!attendance) {
            attendance = new Attendance();
            attendance.employee = { id: data.employeeId } as any;
            attendance.date = data.date as any;
        }

        if (data.checkIn) attendance.checkIn = data.checkIn;
        if (data.checkOut) attendance.checkOut = data.checkOut;
        if (data.status) attendance.status = data.status;
        if (data.note) attendance.note = data.note;

        return this.attendanceRepository.save(attendance);
    }

    async bulkRecord(data: { date: string; checkIn: string; checkOut: string }): Promise<{ count: number }> {
        const activeEmployees = await this.employeesRepository.find({ where: { status: 'active' as any } });
        for (const employee of activeEmployees) {
            await this.record({
                employeeId: employee.id,
                date: data.date,
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                status: AttendanceStatus.PRESENT,
            });
        }
        return { count: activeEmployees.length };
    }
}
