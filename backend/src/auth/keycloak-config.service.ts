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
        const options = {
            authServerUrl: this.configService.get<string>('KEYCLOAK_AUTH_SERVER_URL', 'http://localhost:8080'),
            realm: this.configService.get<string>('KEYCLOAK_REALM', 'erp-realm'),
            clientId: this.configService.get<string>('KEYCLOAK_CLIENT_ID', 'erp-backend'),
            secret: this.configService.get<string>('KEYCLOAK_SECRET', 'your-client-secret'),
            policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
            // Use OFFLINE validation to avoid simple issuer mismatch if public key can be fetched
            tokenValidation: TokenValidation.OFFLINE,
            tokenExtractor: (request: any) => {
                const authHeader = request.headers.authorization;
                if (authHeader) {
                    return authHeader.split(' ')[1];
                }
                return request.query.access_token;
            },
        };
        return options;
    }
}
