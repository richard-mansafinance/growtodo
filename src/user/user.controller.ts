import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
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
import { User } from './entities/user.entity';
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

  // Get all users
  @Get('all')
  @ApiOperation({ summary: 'Get all active users' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'List of all active users',
    type: [User],
  })
  async getAllUsers() {
    const users = await this.userService.getAllUsers();
    return users;
  }

  // Get single user by ID
  @Get(':id')
  async getUserById(
    @Param('id', ParseIntPipe) userId: number,
    @Query('includeTodos') includeTodos: string | boolean = true,
  ) {
    const include =
      includeTodos === 'true' ||
      includeTodos === true ||
      includeTodos === undefined;
    return this.userService.getUserById(userId, include);
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

  // Get single deleted user by ID
  @Get('deleted:id')
  async getDeletedUserById(@Param('id', ParseIntPipe) userId: number) {
    const user = await this.userService.getDeletedUser(userId);
    return user;
  }

  // Restore a soft-deleted user by ID
  @Post('restore/:id')
  @ApiOperation({ summary: 'Restore a soft-deleted user by ID' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User restored successfully',
    type: Object,
  })
  @ApiResponse({ status: 400, description: 'User not found or not deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin access required' })
  @ApiResponse({ status: 500, description: 'Failed to restore user' })
  async restoreUser(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<{ message: string }> {
    return this.userService.restoreUser(userId);
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
