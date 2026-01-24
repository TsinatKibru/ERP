import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Attendance } from './entities/attendance.entity';
import { Payroll } from './entities/payroll.entity';
import { EmployeesService } from './employees/employees.service';
import { EmployeesController } from './employees/employees.controller';
import { AttendanceService } from './attendance/attendance.service';
import { AttendanceController } from './attendance/attendance.controller';
import { PayrollService } from './payroll/payroll.service';
import { PayrollController } from './payroll/payroll.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Employee, Attendance, Payroll])],
    providers: [EmployeesService, AttendanceService, PayrollService],
    controllers: [EmployeesController, AttendanceController, PayrollController],
    exports: [EmployeesService, AttendanceService, PayrollService],
})
export class HRModule { }
