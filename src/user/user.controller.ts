import {
  Body,
  Controller,
  Delete,
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
    return { message: 'User registered successfully and OTP sent to email.' };
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

  //   @Post('forgot-password')
  //   async forgotPassword(@Body() forgotDto: RequestTokenDto) {
  //     const { email } = forgotDto;
  //     const user = await this.userService.findByEmail(email);
  //     if (!user) {
  //       throw new BadRequestException('User with this email does not exist');
  //     }

  //     // Logic to handle password reset token generation can be added here
  //   }
}
