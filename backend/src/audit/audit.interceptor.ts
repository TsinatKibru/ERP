import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(AuditLog)
        private auditRepo: Repository<AuditLog>,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, user } = request;

        // Only log data-modifying requests
        if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(method)) {
            return next.handle().pipe(
                tap(() => {
                    this.auditRepo.save({
                        action: method,
                        entity: url.split('/')[1] || 'system',
                        user: user?.preferred_username || user?.sub || 'anonymous',
                        details: {
                            url,
                            body: this.sanitizeBody(body)
                        }
                    }).catch(err => console.error('Audit Log failed', err));
                }),
            );
        }

        return next.handle();
    }

    private sanitizeBody(body: any) {
        if (!body) return null;
        const sanitized = { ...body };
        // Remove sensitive fields if any
        delete sanitized.password;
        return sanitized;
    }
}
