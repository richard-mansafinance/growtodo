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
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequestTokenDto } from './dto/requestToken.dto';
import { OTPType } from '../otp/types/otpType';
import { UserResponseDto } from './dto/userResponse.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // Register a new user
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({
    description: 'User created successfully',
    schema: {
      example: {
        message: 'User created successfully and OTP sent to email.',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  async register(@Body() userDto: UserDto) {
    await this.userService.register(userDto);
    return { message: 'User created successfully and OTP sent to email.' };
  }

  // Request OTP for email
  @Post('request-otp')
  @ApiOperation({ summary: 'Request OTP for email verification' })
  @ApiOkResponse({
    schema: {
      example: { message: 'OTP sent successfully. Please check email' },
    },
  })
  async requestOTP(@Body() dto: RequestTokenDto) {
    const { email } = dto;
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }
    await this.userService.emailVerification(user, OTPType.OTP);
    return { message: 'OTP sent successfully. Please check email' };
  }

  // Get all users
  @Get('all')
  @ApiOperation({ summary: 'Get all active users' })
  @ApiOkResponse({
    description: 'List of all active users',
    type: [UserResponseDto],
  })
  async getAllUsers(): Promise<UserResponseDto[]> {
    return this.userService.getAllUsers();
  }

  // Get single user by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  @ApiOkResponse({
    description: 'User found',
    type: UserResponseDto,
  })
  async getUserById(
    @Param('id', ParseIntPipe) userId: number,
    @Query('includeTodos') includeTodos: string | boolean = true,
  ): Promise<UserResponseDto> {
    const include =
      includeTodos === 'true' ||
      includeTodos === true ||
      includeTodos === undefined;
    return this.userService.getUserById(userId, include);
  }

  // Delete a user by ID
  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiOkResponse({
    description: 'User deleted successfully',
    schema: {
      example: { message: 'User deleted successfully' },
    },
  })
  @ApiBadRequestResponse({ description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Failed to delete user' })
  async deleteUser(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<{ message: string }> {
    await this.userService.deleteUser(userId);
    return { message: 'User deleted successfully' };
  }

  // Get single deleted user by ID
  @Get('deleted/:id')
  @ApiOperation({ summary: 'Get a deleted user by ID' })
  @ApiOkResponse({ type: UserResponseDto })
  async getDeletedUserById(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<UserResponseDto> {
    const user = await this.userService.getDeletedUser(userId);
    if (!user) {
      throw new NotFoundException('Deleted user not found');
    }
    return user;
  }

  // Restore a soft-deleted user by ID
  @Post('restore/:id')
  @ApiOperation({ summary: 'Restore a soft-deleted user by ID' })
  @ApiOkResponse({
    description: 'User restored successfully',
    schema: { example: { message: 'User restored successfully' } },
  })
  @ApiBadRequestResponse({ description: 'User not found or not deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin access required' })
  @ApiResponse({ status: 500, description: 'Failed to restore user' })
  async restoreUser(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<{ message: string }> {
    return this.userService.restoreUser(userId);
  }

  // Forgot password
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiOkResponse({
    schema: {
      example: {
        message: 'Password reset link has been sent. Please check your email.',
      },
    },
  })
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
