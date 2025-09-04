import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RequestTokenDto } from './dto/requestToken.dto';
import { OTPType } from '../otp/types/otpType';
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  //   Register a new user
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ description: 'User created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  async register(@Body() userDto: UserDto) {
    await this.userService.register(userDto);
    return { message: 'User created successfully and OTP sent to email.' };
  }

  // Request OTP for email
  @Post('request-otp')
  async requestOTP(@Body() dto: RequestTokenDto) {
    const { email } = dto;
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }
    // Send OTP
    await this.userService.emailVerification(user, OTPType.OTP);
    return { message: 'OTP sent successfully. Please check email' };
  }

  //   Delete a user by ID
  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiCreatedResponse({ description: 'User deleted successfully' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: Object,
  })
  @ApiResponse({ status: 400, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Failed to delete user' })
  async deleteUser(@Param('id', ParseIntPipe) userId: number): Promise<void> {
    await this.userService.deleteUser(userId);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotDto: RequestTokenDto) {
    const { email } = forgotDto;
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    await this.userService.emailVerification(user, OTPType.RESET_LINK);
    return {
      message: 'Password reset link has been sent. Please check your email.',
    };
  }
}
