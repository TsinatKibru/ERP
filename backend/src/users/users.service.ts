import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);
        return user;
    }

    async findByKeycloakId(keycloakId: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { keycloakId } });
    }

    async findOrCreateFromToken(tokenData: any): Promise<User> {
        const { sub: keycloakId, email, given_name: firstName, family_name: lastName, realm_access } = tokenData;
        const roles = realm_access?.roles || [];
        const bestRole = roles.includes('admin') ? 'admin' : 'user';

        let user = await this.findByKeycloakId(keycloakId);

        if (!user) {
            user = this.usersRepository.create({
                keycloakId,
                email,
                firstName,
                lastName,
                role: bestRole,
            });
            return this.usersRepository.save(user);
        }

        // Update role if changed in Keycloak
        if (user.role !== bestRole) {
            user.role = bestRole;
            return this.usersRepository.save(user);
        }

        return user;
    }

    async update(id: string, updateData: Partial<User>): Promise<User> {
        await this.usersRepository.update(id, updateData);
        return this.findOne(id);
    }
}
