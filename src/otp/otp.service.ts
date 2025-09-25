import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './entity/otp.entity';
import { MoreThan, Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { OTPType } from './types/otpType';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface ResetTokenPayload {
  id: string | number; // Adjust based on your User ID type (string or number)
  email: string;
}
@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(user: User, type: OTPType): Promise<string> {
    if (type === OTPType.OTP) {
      // ✅ Correct OTP generation
      const otp = crypto.randomInt(100000, 999999).toString();

      const hashedOTP = await bcrypt.hash(otp, 10);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // OTP valid for 5 minutes

      // check if OTP already exists for that user
      const existingOTP = await this.otpRepository.findOne({
        where: {
          user: { id: user.id },
          type: type,
        },
      });

      if (existingOTP) {
        // update exisiting token
        existingOTP.token = hashedOTP;
        existingOTP.expiresAt = expiresAt;
        await this.otpRepository.save(existingOTP);
      } else {
        // Crrate OTP entity
        const otpEntity = this.otpRepository.create({
          user,
          token: hashedOTP,
          type,
          createdAt: now,
          expiresAt,
        });

        await this.otpRepository.save(otpEntity);
      }
      return otp;
    } else if (type === OTPType.RESET_LINK) {
      const resetToken = this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
        },
        {
          secret: this.configService.get<string>('JWT_RESET_PASSWORD_SECRET'),
          expiresIn: '15m',
        },
      );

      return resetToken;
    }
    // Ensure all code paths return a string
    throw new BadRequestException('Invalid OTP type provided.');
  }

  async validateOTP(userId: string, token: string): Promise<boolean> {
    const validToken = await this.otpRepository.findOne({
      where: {
        user: { id: userId },
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'], // if needed, depending on your entity setup
    });

    if (!validToken) {
      throw new BadRequestException(
        'OTP is expired or invalid, request a new one',
      );
    }

    const isMatch = await bcrypt.compare(token, validToken.token);

    if (!isMatch) {
      throw new BadRequestException('Invalid OTP provided. Please try again.');
    }

    return true;
  }

  // Validate reset password token
  validateResetPassword(token: string): Promise<string | number> {
    try {
      // Verify the JWT token and decode it
      const decoded = this.jwtService.verify<ResetTokenPayload>(token, {
        secret: this.configService.get<string>('JWT_RESET_PASSWORD_SECRET'),
      });

      // Return the user ID extracted from token
      return Promise.resolve(decoded.id);
    } catch (error: unknown) {
      // Handle expired token
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new BadRequestException(
          'The reset token has expired. Please request a new one.',
        );
      }
      throw new BadRequestException('Invalid or malformed reset token.');
    }
  }
}
