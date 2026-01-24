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
        // This adds a global level authentication guard,
        // you can also have it scoped
        // if you like.
        //
        // Will return a 401 unauthorized when it is unable to
        // verify the JWT token or Bearer header is missing.
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        // This adds a global level resource guard, which is configured.
        // It checks the session against the resource being accessed
        // and returns a 403 forbidden when the user doesn't have access
        // to the resource.
        {
            provide: APP_GUARD,
            useClass: ResourceGuard,
        },
        // This adds a global level role guard, which is configured.
        // It checks the session against the roles required by the
        // route and returns a 403 forbidden when the user doesn't
        // have the required roles.
        {
            provide: APP_GUARD,
            useClass: RoleGuard,
        },
    ],
})
export class AuthModule { }
