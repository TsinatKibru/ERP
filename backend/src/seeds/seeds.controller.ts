import { Controller, Post } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { Public } from 'nest-keycloak-connect';

@Controller('seeds')
export class SeedsController {
    constructor(private readonly seedsService: SeedsService) { }

    @Public()
    @Post('inventory')
    async seedInventory() {
        return this.seedsService.seedInventory();
    }

    @Public()
    @Post('settings')
    async seedSettings() {
        return this.seedsService.seedSettings();
    }
}
