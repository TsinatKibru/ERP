import { Controller, Get } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from 'nest-keycloak-connect';

@Controller('health')
export class HealthController {
    constructor(
        @InjectConnection() private connection: Connection,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @Inject('ERP_INTERNAL_SERVICE') private client: ClientProxy,
    ) { }

    @Public()
    @Get()
    async check() {
        const dbStatus = this.connection.isConnected ? 'OK' : 'DOWN';

        let redisStatus = 'OK';
        try {
            await this.cacheManager.set('health-check', 'OK', 10);
            const val = await this.cacheManager.get('health-check');
            if (val !== 'OK') redisStatus = 'DOWN';
        } catch (e) {
            redisStatus = 'DOWN';
        }

        let rabbitStatus = 'OK';
        try {
            await this.client.connect();
        } catch (e) {
            rabbitStatus = 'DOWN';
        }

        return {
            status: 'OK',
            database: dbStatus,
            redis: redisStatus,
            rabbitmq: rabbitStatus,
        };
    }
}
