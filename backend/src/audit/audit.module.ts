import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditInterceptor } from './audit.interceptor';
import { AuditController } from './audit.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([AuditLog])],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: AuditInterceptor,
        },
    ],
    controllers: [AuditController],
    exports: [TypeOrmModule]
})
export class AuditModule { }
