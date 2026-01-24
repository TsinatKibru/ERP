import { Controller, Get, Req } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { AuthenticatedUser, Public } from 'nest-keycloak-connect';

@Controller('profile')
export class ProfileController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getMe(@AuthenticatedUser() user: any) {
        // This will sync the user from Keycloak token to our local DB if they don't exist
        return this.usersService.findOrCreateFromToken(user);
    }
}
