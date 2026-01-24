import { Controller, Get, Patch, Param, Body, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles, Public, AuthenticatedUser, RoleMatchingMode } from 'nest-keycloak-connect';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles({ roles: ['realm:admin'] })
    async findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get(':id')
    @Roles({ roles: ['admin', 'user'] })
    async findOne(@Param('id') id: string): Promise<User> {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @Roles({ roles: ['admin'] })
    async update(
        @Param('id') id: string,
        @Body() updateData: Partial<User>,
    ): Promise<User> {
        return this.usersService.update(id, updateData);
    }
}
