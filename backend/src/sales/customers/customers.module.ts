import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer } from './entities/customer.entity';
import { FinanceModule } from '../../finance/finance.module';
import { ReportingModule } from '../../reporting/reporting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    FinanceModule,
    ReportingModule,
  ],
  providers: [CustomersService],
  controllers: [CustomersController],
  exports: [CustomersService],
})
export class CustomersModule { }
