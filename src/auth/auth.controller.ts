import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
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

  // User login
  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and generate access token' })
  @ApiOkResponse({
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid email or password' })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const result = await this.authService.login(dto);
    return {
      accessToken: result.accessToken ?? '',
      user: result.user ?? null,
      message: result.message,
    } as LoginResponseDto;
  }

  // Reset password
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password using a valid token' })
  @ApiCreatedResponse({
    description: 'Password reset successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Invalid or expired reset token' })
  async resetPassword(
    @Body() body: { token: string; password: string },
  ): Promise<{ message: string }> {
    const { token, password } = body;
    const result = await this.authService.resetPassword(token, password);
    return { message: result };
  }

  // Get profile (authenticated user)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiOkResponse({
    description: 'Returns authenticated user details',
    type: ProfileResponseDto,
  })
  getProfile(@Req() request: any): ProfileResponseDto {
    return {
      message: 'Welcome to your profile',
      user: request.user,
    };
  }

  // Logout
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout authenticated user' })
  @ApiCreatedResponse({ description: 'Logged out successfully' })
  @ApiBadRequestResponse({
    description: 'Authorization token missing or invalid',
  })
  async logout(@Req() request: any): Promise<{ message: string }> {
    const authHeader = request.headers.authorization;
    const token: string | undefined =
      typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;

    if (!token) {
      throw new BadRequestException('Authorization token not found');
    }

    await this.authService.logout(token);
    return { message: 'Logged out successfully' };
  }
}
