import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../user/entities/user.entity';
import { CreateAdminDto } from '../auth/dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async setupAdmin(
    createAdminDto: CreateAdminDto,
  ): Promise<{ message: string }> {
    try {
      // Check if any admin exists
      const adminExists = await this.userRepository.findOne({
        where: { roles: 'admin', deletedAt: IsNull() },
      });
      if (adminExists) {
        throw new BadRequestException('An admin user already exists');
      }

      // Reuse createAdmin logic
      return await this.createAdmin(createAdminDto);
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to set up admin user');
    }
  }

  async createAdmin(
    createAdminDto: CreateAdminDto,
  ): Promise<{ message: string }> {
    try {
      const { email, password } = createAdminDto;

      // Check if email already exists
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new admin user
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        roles: 'admin',
        accountStatus: 'verified',
      });

      await this.userRepository.save(user);
      return { message: `Admin user created with email ${email}` };
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create admin user');
    }
  }

  async setUserRoles(
    userId: number,
    roles: 'admin' | 'user',
  ): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, deletedAt: IsNull() },
        select: ['id', 'roles'],
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      user.roles = roles;
      await this.userRepository.save(user);
      return { message: `User roles updated to ${roles}` };
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to set user roles');
    }
  }
}
