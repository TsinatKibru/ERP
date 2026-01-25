import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Department } from './entities/department.entity';
import { Attendance } from './entities/attendance.entity';
import { Payroll } from './entities/payroll.entity';
import { EmployeesService } from './employees/employees.service';
import { EmployeesController } from './employees/employees.controller';
import { AttendanceService } from './attendance/attendance.service';
import { AttendanceController } from './attendance/attendance.controller';
import { PayrollService } from './payroll/payroll.service';
import { PayrollController } from './payroll/payroll.controller';
import { DepartmentsService } from './departments/departments.service';
import { DepartmentsController } from './departments/departments.controller';
import { ReportingModule } from '../reporting/reporting.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Employee, Department, Attendance, Payroll]),
        ReportingModule,
    ],
    providers: [EmployeesService, AttendanceService, PayrollService, DepartmentsService],
    controllers: [EmployeesController, AttendanceController, PayrollController, DepartmentsController],
    exports: [EmployeesService, AttendanceService, PayrollService, DepartmentsService],
})
export class HRModule { }
