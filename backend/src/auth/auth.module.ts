import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
    KeycloakConnectModule,
    ResourceGuard,
    RoleGuard,
    AuthGuard,
} from 'nest-keycloak-connect';
import { KeycloakConfigService } from './keycloak-config.service';

@Module({
    imports: [
        KeycloakConnectModule.registerAsync({
            useClass: KeycloakConfigService,
        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RoleGuard,
        },
    ],
})
export class AuthModule { }
