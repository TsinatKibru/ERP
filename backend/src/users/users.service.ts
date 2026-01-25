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
        return this.usersRepository.findOne({
            where: { keycloakId },
            relations: ['employee']
        });
    }

    async findOrCreateFromToken(tokenData: any): Promise<User> {
        const { sub: keycloakId, email, given_name: firstName, family_name: lastName, realm_access } = tokenData;
        const roles = realm_access?.roles || [];
        const bestRole = roles.includes('admin') ? 'admin' : (roles.includes('manager') ? 'manager' : 'employee');

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

        // Continuous Sync: Update identity data if changed in Keycloak
        let hasChanged = false;
        if (user.email !== email) { user.email = email; hasChanged = true; }
        if (user.firstName !== firstName) { user.firstName = firstName; hasChanged = true; }
        if (user.lastName !== lastName) { user.lastName = lastName; hasChanged = true; }
        if (user.role !== bestRole) { user.role = bestRole; hasChanged = true; }

        if (hasChanged) {
            return this.usersRepository.save(user);
        }

        return user;
    }

    async setEmployee(userId: string, employeeId: string | null): Promise<User> {
        const user = await this.findOne(userId);
        if (employeeId) {
            user.employee = { id: employeeId } as any;
        } else {
            user.employee = null as any;
        }
        return this.usersRepository.save(user);
    }

    async update(id: string, updateData: Partial<User>): Promise<User> {
        await this.usersRepository.update(id, updateData);
        return this.findOne(id);
    }
}
