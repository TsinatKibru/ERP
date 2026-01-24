import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { Roles } from 'nest-keycloak-connect';

@Controller('audit/logs')
@Roles({ roles: ['realm:admin'] })
export class AuditController {
    constructor(
        @InjectRepository(AuditLog)
        private auditRepo: Repository<AuditLog>,
    ) { }

    @Get()
    async getLogs() {
        return this.auditRepo.find({
            order: { createdAt: 'DESC' },
            take: 500
        });
    }
}
