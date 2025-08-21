import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './entity/otp.entity';
import { Repository } from 'typeorm';
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

    const otpEntity = this.otpRepository.create({
      user,
      token: hashedOTP,
      type,
      createdAt: now,
      expiresAt,
    });

    await this.otpRepository.save(otpEntity);
    return otp;
  }
}
