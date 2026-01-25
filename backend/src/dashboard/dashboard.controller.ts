import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles } from 'nest-keycloak-connect';

@Controller('dashboard')
@Roles({ roles: ['realm:admin', 'realm:manager'] })
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    async getStats() {
        return this.dashboardService.getStats();
    }
}
