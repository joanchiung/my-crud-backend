import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Permission } from '../auth/permission.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  findById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  create(email: string, password: string) {
    const user = this.userRepository.create({ email, password });
    return this.userRepository.save(user);
  }

  updatePassword(id: number, password: string) {
    return this.userRepository.update(id, { password });
  }

  touchLastLogin(id: number) {
    return this.userRepository.update(id, { lastLoginAt: new Date() });
  }

  async updatePermissions(id: number, permissions: Permission[]) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('user 不存在');
    }
    user.permissions = permissions;
    return this.userRepository.save(user);
  }
}
