import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Roles } from 'nest-keycloak-connect';
import { Attendance, AttendanceStatus } from '../entities/attendance.entity';

@Controller('hr/attendance')
@Roles({ roles: ['realm:admin'] })
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Get()
    async findAll(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ): Promise<Attendance[]> {
        return this.attendanceService.findAll(startDate, endDate);
    }

    @Get('employee/:id')
    async findByEmployee(@Param('id') id: string): Promise<Attendance[]> {
        return this.attendanceService.findByEmployee(id);
    }

    @Post()
    async record(@Body() data: { employeeId: string; date: string; checkIn?: string; checkOut?: string; status?: AttendanceStatus; note?: string }): Promise<Attendance> {
        return this.attendanceService.record(data);
    }

    @Post('bulk')
    async bulkRecord(@Body() data: { date: string; checkIn: string; checkOut: string }): Promise<{ count: number }> {
        return this.attendanceService.bulkRecord(data);
    }
}
