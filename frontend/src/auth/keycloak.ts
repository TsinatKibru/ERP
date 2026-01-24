import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: 'http://localhost:8080',
    realm: 'erp-realm',
    clientId: 'erp-frontend',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
