import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { ProfileController } from './profile.controller';
import { AuthModule } from './auth/auth.module';
import { redisStore } from 'cache-manager-ioredis-yet';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './inventory/categories/categories.module';
import { ProductsModule } from './inventory/products/products.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'erp_user'),
        password: configService.get<string>('DB_PASSWORD', 'erp_password'),
        database: configService.get<string>('DB_NAME', 'erp_db'),
        autoLoadEntities: true,
        synchronize: true, // Only for development!
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          ttl: 600,
        }),
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([
      {
        name: 'ERP_INTERNAL_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')],
            queue: 'erp_internal_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    UsersModule,
    CategoriesModule,
    ProductsModule,
  ],
  controllers: [AppController, HealthController, ProfileController],
  providers: [AppService],
})
export class AppModule { }
