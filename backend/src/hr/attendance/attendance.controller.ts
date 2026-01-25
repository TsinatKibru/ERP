import { Controller, Get, Post, Body, Query, Param, ForbiddenException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Roles, AuthenticatedUser } from 'nest-keycloak-connect';
import { Attendance, AttendanceStatus } from '../entities/attendance.entity';
import { UsersService } from '../../users/users.service';

@Controller('hr/attendance')
export class AttendanceController {
    constructor(
        private readonly attendanceService: AttendanceService,
        private readonly usersService: UsersService,
    ) { }

    @Get()
    @Roles({ roles: ['admin', 'manager', 'employee'] })
    async findAll(
        @AuthenticatedUser() userToken: any,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ): Promise<Attendance[]> {
        const user = await this.usersService.findOrCreateFromToken(userToken);
        if (user.role === 'admin' || user.role === 'manager') {
            return this.attendanceService.findAll(startDate, endDate);
        }
        if (user.employee) {
            return this.attendanceService.findByEmployee(user.employee.id, startDate, endDate);
        }
        return [];
    }

    @Get('employee/:id')
    @Roles({ roles: ['admin', 'manager'] })
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
