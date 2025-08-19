import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  async login(dto: LoginDto) {
    try {
      const { email, password } = dto;
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new UnauthorizedException('Email doestnt exist');
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      //   generate JWT token
      const payload = { id: user.id, email: user.email };
      const accessToken = this.jwtService.sign(payload);
      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
        },
        message: 'Login successful',
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException('Login failed', message);
    }
  }

  async logout(token: string) {
    const decoded = this.jwtService.decode(token);
    if (!decoded?.exp) {
      throw new Error('Invalid token');
    }
    const exp = decoded.exp - Math.floor(Date.now() / 1000); // remaining seconds
    await this.tokenBlacklistService.blacklistToken(token, exp);
    return { message: 'Logged out successfully' };
  }
}
