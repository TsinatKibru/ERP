import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Setting])],
    providers: [SettingsService],
    controllers: [SettingsController],
    exports: [SettingsService],
})
export class SettingsModule { }
