import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Roles } from 'nest-keycloak-connect';
import { Setting } from './entities/setting.entity';

@Controller('settings')
@Roles({ roles: ['realm:admin', 'realm:manager'] })
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    async findAll(@Query('category') category?: string): Promise<Setting[]> {
        if (category) {
            return this.settingsService.findByCategory(category);
        }
        return this.settingsService.findAll();
    }

    @Get(':key')
    async findOne(@Param('key') key: string): Promise<Setting> {
        return this.settingsService.findOne(key);
    }

    @Post()
    @Roles({ roles: ['realm:admin'] })
    async setSetting(@Body() data: { key: string; value: string; category?: string; description?: string }): Promise<Setting> {
        return this.settingsService.setVal(data.key, data.value, data.category, data.description);
    }

    @Post('bulk')
    @Roles({ roles: ['realm:admin'] })
    async setBulk(@Body() settings: { key: string; value: string; category?: string }[]): Promise<{ success: true }> {
        await this.settingsService.setBulk(settings);
        return { success: true };
    }
}
