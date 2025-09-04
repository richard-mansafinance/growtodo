import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entity/otp.entity';
import { OtpService } from './otp.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Otp]), JwtModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
