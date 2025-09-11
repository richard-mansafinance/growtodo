import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import { OtpService } from '../otp/otp.service';
import { OTPType } from '../otp/types/otpType';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  //   create user
  async register(dto: UserDto): Promise<void> {
    const { email, password } = dto;

    // check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const now = new Date();

    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      createdAt: now,
    });

    await this.userRepository.save(newUser);
    return this.emailVerification(newUser, OTPType.OTP);
  }

  // Send otp or reset link via email
  async emailVerification(user: User, otpType: OTPType) {
    const token = await this.otpService.generateToken(user, otpType);

    if (otpType === OTPType.OTP) {
      const emailDto = {
        recipients: [user.email],
        subject: 'OTP for verification',
        html: `<p>Your OTP code is <strong>${token}</strong>. Provide this otp to verify your account.</p>`,
      };

      // Send OTP via email
      await this.emailService.sendEmail(emailDto);
    } else if (otpType === OTPType.RESET_LINK) {
      const resetLink = `${this.configService.get<string>('RESET_PASSWORD_URL')}?token=${token}`;
      const emailDto = {
        recipients: [user.email],
        subject: 'Password Reset Link',
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 1 hour.</p>`,
      };

      // Send reset link via email
      await this.emailService.sendEmail(emailDto);
    }
  }
  //   find by email
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  //   delete user
  // async deleteUser(userId: number): Promise<{ message: string }> {
  //   const user = await this.userRepository.findOne({ where: { id: userId } });
  //   if (!user) {
  //     throw new BadRequestException('User not found');
  //   }
  //   try {
  //     await this.userRepository.delete(userId);
  //     return {
  //       message: 'User deleted successfully',
  //     };
  //   } catch (error: unknown) {
  //     console.log(error);
  //     throw new InternalServerErrorException('Failed to delete user');
  //   }
  // }

  // Soft delete a user by ID
  async deleteUser(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    try {
      await this.userRepository.softDelete(userId);
      return { message: 'User soft-deleted successfully' };
    } catch {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  // Retrieve a single active user by ID, including todos
  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  // Retrieve a soft-deleted user
  async getDeletedUser(userId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      withDeleted: true,
    });
  }

  // Retrieve a user
  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch {
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  // Restore a soft-deleted user
  async restoreUser(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      withDeleted: true,
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (!user.deletedAt) {
      throw new BadRequestException('User is not deleted');
    }
    try {
      await this.userRepository.restore({ id: userId });
      return { message: 'User restored successfully' };
    } catch (error: unknown) {
      console.error('Error during restore:', error);
      throw new InternalServerErrorException('Failed to restore user');
    }
  }
}
