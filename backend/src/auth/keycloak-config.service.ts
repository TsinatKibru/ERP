import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    KeycloakConnectOptions,
    KeycloakConnectOptionsFactory,
    PolicyEnforcementMode,
    TokenValidation,
} from 'nest-keycloak-connect';

@Injectable()
export class KeycloakConfigService implements KeycloakConnectOptionsFactory {
    constructor(private configService: ConfigService) { }

    createKeycloakConnectOptions(): KeycloakConnectOptions {
        return {
            authServerUrl: this.configService.get<string>('KEYCLOAK_AUTH_SERVER_URL', 'http://localhost:8080'),
            realm: this.configService.get<string>('KEYCLOAK_REALM', 'erp-realm'),
            clientId: this.configService.get<string>('KEYCLOAK_CLIENT_ID', 'erp-backend'),
            secret: this.configService.get<string>('KEYCLOAK_SECRET', 'your-client-secret'),
            policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
            tokenValidation: TokenValidation.ONLINE,
        };
    }
}
