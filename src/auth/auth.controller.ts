import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginResponseDto } from './dto/login-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ description: 'Successful login', type: LoginResponseDto })
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    const { token, password } = body;
    return this.authService.resetPassword(token, password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOkResponse({
    description: 'Returns the authenticated user profile',
    type: ProfileResponseDto,
  })
  getProfile(@Req() request: any) {
    return {
      message: 'Welcome to your profile',
      user: request.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logged out successfully' })
  @ApiCreatedResponse({ description: 'Logged out successfully' })
  @ApiBadRequestResponse({ description: 'Internal server error' })
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
