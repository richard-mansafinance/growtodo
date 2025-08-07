import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
// import { JwtAuthGuard } from './guards/jwt-auth.guard';
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  //   @UseGuards(JwtAuthGuard)
  @Get('profile ')
  getProfile(@Req() request: any) {
    return {
      message: 'Welcome to your profile',
      user: request.user,
    };
  }
}
