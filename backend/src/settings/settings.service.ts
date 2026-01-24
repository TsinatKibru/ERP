import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(Setting)
        private settingsRepository: Repository<Setting>,
    ) { }

    async findAll(): Promise<Setting[]> {
        return this.settingsRepository.find();
    }

    async findByCategory(category: string): Promise<Setting[]> {
        return this.settingsRepository.find({ where: { category } });
    }

    async findOne(key: string): Promise<Setting> {
        const setting = await this.settingsRepository.findOne({ where: { key } });
        if (!setting) throw new NotFoundException(`Setting with key ${key} not found`);
        return setting;
    }

    async getVal(key: string, defaultValue: string = ''): Promise<string> {
        try {
            const setting = await this.findOne(key);
            return setting.value;
        } catch (e) {
            return defaultValue;
        }
    }

    async setVal(key: string, value: string, category: string = 'general', description?: string): Promise<Setting> {
        let setting = await this.settingsRepository.findOne({ where: { key } });
        if (!setting) {
            setting = this.settingsRepository.create({ key, value, category, description });
        } else {
            setting.value = value;
            if (category) setting.category = category;
            if (description) setting.description = description;
        }
        return this.settingsRepository.save(setting);
    }

    async setBulk(settings: { key: string; value: string; category?: string }[]): Promise<void> {
        for (const s of settings) {
            await this.setVal(s.key, s.value, s.category);
        }
    }
}
