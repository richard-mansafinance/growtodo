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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
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
    const otp = await this.otpService.generateOTP(user, otpType);

    const emailDto = {
      recipients: [user.email],
      subject: 'OTP for verification',
      html: `<p>Your OTP code is <strong>${otp}</strong>. Provide this otp to verify your account.</p>`,
    };

    // Send OTP via email
    await this.emailService.sendEmail(emailDto);
  }
  //   find by email
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  //   delete user
  async deleteUser(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    try {
      await this.userRepository.delete(userId);
      return {
        message: 'User deleted successfully',
      };
    } catch (error: unknown) {
      console.log(error);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
