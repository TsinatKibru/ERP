import { Controller, Get } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { Roles } from 'nest-keycloak-connect';

@Controller('inventory/ledger')
@Roles({ roles: ['realm:admin'] })
export class LedgerController {
    constructor(private readonly ledgerService: LedgerService) { }

    @Get()
    async getLedger() {
        return this.ledgerService.getFullLedger();
    }
}
