import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() request: any) {
    return {
      message: 'Welcome to your profile',
      user: request.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() request: any) {
    const authHeader = request.headers.authorization;
    const token: string | undefined =
      typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;
    if (!token) {
      throw new Error('Authorization token not found');
    }
    await this.authService.logout(token);
    return { message: 'Logged out successfully' };
  }
}
