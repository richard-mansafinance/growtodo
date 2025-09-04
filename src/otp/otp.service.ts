import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './entity/otp.entity';
import { MoreThan, Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { OTPType } from './types/otpType';
import { User } from '../user/entities/user.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
  ) {}

  async generateOTP(user: User, type: OTPType): Promise<string> {
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
  }

  async validateOTP(userId: number, token: string): Promise<boolean> {
    const validToken = await this.otpRepository.findOne({
      where: {
        user: { id: Number(userId) },
        token: token,
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
}
